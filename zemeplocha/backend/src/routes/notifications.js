// backend/src/routes/notifications.js
import { Router } from 'express';
import { prisma } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';

export const notificationsRouter = Router();

// GET /api/notifications
notificationsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const { unread, page = 1, limit = 30 } = req.query;
    const where = {
      userId: req.user.id,
      ...(unread === 'true' && { read: false }),
    };
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.notification.count({ where: { userId: req.user.id, read: false } }),
    ]);
    res.json({ notifications, unreadCount });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/:id/read
notificationsRouter.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id, userId: req.user.id },
      data: { read: true },
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// PATCH /api/notifications/read-all
notificationsRouter.patch('/read-all', requireAuth, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
});
