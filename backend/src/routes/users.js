// backend/src/routes/users.js
import { Router } from 'express';
import { prisma } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';

export const usersRouter = Router();

// GET /api/users/favorites
usersRouter.get('/favorites', requireAuth, async (req, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        farm: {
          include: {
            products: { where: { active: true }, take: 4, select: { name: true, emoji: true, price: true, unit: true } },
            _count: { select: { reviews: true } },
            reviews: { select: { rating: true } },
            seasonalOffers: { where: { validTo: { gte: new Date() } }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = favorites.map(f => ({
      ...f.farm,
      favoritedAt: f.createdAt,
      avgRating: f.farm.reviews.length
        ? Math.round((f.farm.reviews.reduce((s, r) => s + r.rating, 0) / f.farm.reviews.length) * 10) / 10
        : null,
    }));

    res.json(result);
  } catch (err) { next(err); }
});

// GET /api/users/dashboard — farmer dashboard stats
usersRouter.get('/dashboard', requireAuth, async (req, res, next) => {
  try {
    const farm = await prisma.farm.findUnique({ where: { ownerId: req.user.id } });
    if (!farm) return res.status(404).json({ error: 'Farma nenalezena' });

    const [totalOrders, pendingOrders, totalRevenue, favCount, reviewCount, products] = await Promise.all([
      prisma.order.count({ where: { farmId: farm.id } }),
      prisma.order.count({ where: { farmId: farm.id, status: 'PENDING' } }),
      prisma.order.aggregate({ where: { farmId: farm.id, status: { not: 'CANCELLED' } }, _sum: { totalAmount: true } }),
      prisma.favorite.count({ where: { farmId: farm.id } }),
      prisma.review.count({ where: { farmId: farm.id } }),
      prisma.product.count({ where: { farmId: farm.id, active: true } }),
    ]);

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      where: { farmId: farm.id },
      include: { user: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      farm,
      stats: {
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        favCount,
        reviewCount,
        products,
      },
      recentOrders,
    });
  } catch (err) { next(err); }
});
