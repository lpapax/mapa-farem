// backend/src/routes/orders.js
import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../db/client.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
export const ordersRouter = Router();

// POST /api/orders — create order + payment intent
ordersRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const { farmId, items, deliveryType, deliveryAddress, note } = req.body;

    if (!items?.length)
      return res.status(400).json({ error: 'Objednávka musí obsahovat alespoň jeden produkt' });

    // Validate products & compute total
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, farmId, active: true },
    });

    if (products.length !== items.length)
      return res.status(400).json({ error: 'Některé produkty nejsou dostupné' });

    let totalAmount = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const total = product.price * item.quantity;
      totalAmount += total;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        total,
      };
    });

    // Create Stripe Payment Intent
    let stripePaymentId = null;
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // haléře
        currency: 'czk',
        metadata: { farmId, userId: req.user.id },
      });
      stripePaymentId = paymentIntent.client_secret;
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        farmId,
        totalAmount,
        deliveryType,
        deliveryAddress: deliveryAddress || null,
        note: note || null,
        stripePaymentId,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: { select: { name: true, emoji: true } } } },
        farm: { select: { name: true, phone: true } },
      },
    });

    // Create notification for farmer
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (farm) {
      await prisma.notification.create({
        data: {
          userId: farm.ownerId,
          type: 'ORDER_STATUS',
          title: 'Nová objednávka',
          body: `Nová objednávka od zákazníka. Celkem: ${totalAmount.toFixed(0)} Kč`,
          data: { orderId: order.id },
        },
      });
    }

    res.status(201).json({
      order,
      clientSecret: stripePaymentId,
    });
  } catch (err) { next(err); }
});

// GET /api/orders — my orders
ordersRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {
      ...(req.user.role === 'FARMER'
        ? { farm: { ownerId: req.user.id } }
        : { userId: req.user.id }),
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { product: { select: { name: true, emoji: true } } } },
          farm: { select: { id: true, name: true, coverImage: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, pagination: { total, page: Number(page) } });
  } catch (err) { next(err); }
});

// GET /api/orders/:id
ordersRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { product: true } },
        farm: { select: { id: true, name: true, phone: true, address: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Objednávka nenalezena' });

    const isOwner = order.userId === req.user.id;
    const isFarmer = await prisma.farm.findFirst({
      where: { id: order.farmId, ownerId: req.user.id },
    });
    if (!isOwner && !isFarmer && req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Nemáte přístup k této objednávce' });

    res.json(order);
  } catch (err) { next(err); }
});

// PATCH /api/orders/:id/status — farmer updates status
ordersRouter.patch('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['CONFIRMED','PREPARING','READY','DELIVERED','CANCELLED'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: 'Neplatný stav objednávky' });

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Objednávka nenalezena' });

    const farm = await prisma.farm.findFirst({ where: { id: order.farmId, ownerId: req.user.id } });
    if (!farm && req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Nemáte oprávnění' });

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    // Notify customer
    const statusLabels = {
      CONFIRMED: 'potvrzena', PREPARING: 'připravována',
      READY: 'připravena k vyzvednutí', DELIVERED: 'doručena', CANCELLED: 'zrušena',
    };
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'ORDER_STATUS',
        title: 'Stav objednávky se změnil',
        body: `Vaše objednávka z farmy ${farm?.name} byla ${statusLabels[status]}.`,
        data: { orderId: order.id, status },
      },
    });

    res.json(updated);
  } catch (err) { next(err); }
});
