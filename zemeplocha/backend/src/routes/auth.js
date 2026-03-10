// backend/src/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/client.js';
import { signToken, requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'CUSTOMER' } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Vyplňte všechna povinná pole' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Heslo musí mít alespoň 8 znaků' });
    if (!['CUSTOMER', 'FARMER'].includes(role))
      return res.status(400).json({ error: 'Neplatná role' });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return res.status(409).json({ error: 'Tento e-mail je již registrován' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = signToken({ userId: user.id });
    res.status(201).json({ user, token });
  } catch (err) { next(err); }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Zadejte e-mail a heslo' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ error: 'Nesprávný e-mail nebo heslo' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ error: 'Nesprávný e-mail nebo heslo' });

    const token = signToken({ userId: user.id });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) { next(err); }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true, avatar: true, createdAt: true,
        farm: { select: { id: true, name: true, verified: true } },
        _count: { select: { favorites: true, orders: true } },
      },
    });
    res.json(user);
  } catch (err) { next(err); }
});

// PUT /api/auth/me
authRouter.put('/me', requireAuth, async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { ...(name && { name }), ...(avatar && { avatar }) },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });
    res.json(user);
  } catch (err) { next(err); }
});

// POST /api/auth/change-password
authRouter.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Vyplňte obě hesla' });
    if (newPassword.length < 8)
      return res.status(400).json({ error: 'Nové heslo musí mít alespoň 8 znaků' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid)
      return res.status(401).json({ error: 'Současné heslo je nesprávné' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    res.json({ message: 'Heslo bylo změněno' });
  } catch (err) { next(err); }
});
