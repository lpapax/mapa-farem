// backend/src/routes/products.js
import { Router } from 'express';
import { prisma } from '../db/client.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const productsRouter = Router();

// GET /api/products?farmId=...
productsRouter.get('/', async (req, res, next) => {
  try {
    const { farmId, category, seasonal, search } = req.query;
    const where = {
      active: true,
      ...(farmId && { farmId }),
      ...(category && { category }),
      ...(seasonal !== undefined && { seasonal: seasonal === 'true' }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };
    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { farm: { select: { id: true, name: true, city: true } } },
    });
    res.json(products);
  } catch (err) { next(err); }
});

// POST /api/products — farmer adds product
productsRouter.post('/', requireAuth, requireRole('FARMER','ADMIN'), async (req, res, next) => {
  try {
    const farm = await prisma.farm.findUnique({ where: { ownerId: req.user.id } });
    if (!farm) return res.status(404).json({ error: 'Nemáte registrovanou farmu' });

    const { name, description, emoji, price, unit, stock, category, seasonal,
            seasonStart, seasonEnd } = req.body;

    const product = await prisma.product.create({
      data: {
        farmId: farm.id,
        name, description, emoji,
        price: Number(price),
        unit, category,
        stock: Number(stock) || 0,
        seasonal: Boolean(seasonal),
        seasonStart: seasonStart ? Number(seasonStart) : null,
        seasonEnd: seasonEnd ? Number(seasonEnd) : null,
      },
    });

    // Notify users who favorited this farm
    const favorites = await prisma.favorite.findMany({
      where: { farmId: farm.id },
      select: { userId: true },
    });
    if (favorites.length > 0) {
      await prisma.notification.createMany({
        data: favorites.map(f => ({
          userId: f.userId,
          type: 'NEW_PRODUCT',
          title: 'Nový produkt ve vaší oblíbené farmě',
          body: `${farm.name} přidala nový produkt: ${emoji} ${name}`,
          data: { farmId: farm.id, productId: product.id },
        })),
      });
    }

    res.status(201).json(product);
  } catch (err) { next(err); }
});

// PUT /api/products/:id
productsRouter.put('/:id', requireAuth, requireRole('FARMER','ADMIN'), async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { farm: true },
    });
    if (!product) return res.status(404).json({ error: 'Produkt nenalezen' });
    if (product.farm.ownerId !== req.user.id && req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Nemáte oprávnění' });

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/products/:id
productsRouter.delete('/:id', requireAuth, requireRole('FARMER','ADMIN'), async (req, res, next) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { active: false },
    });
    res.json({ message: 'Produkt deaktivován' });
  } catch (err) { next(err); }
});
