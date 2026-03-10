// backend/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import { prisma } from '../db/client.js';

const JWT_SECRET = process.env.JWT_SECRET || 'zemeplocha-secret-change-in-prod';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Přístup odepřen — chybí token' });
    }
    const token = header.slice(7);
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) return res.status(401).json({ error: 'Uživatel nenalezen' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Neplatný nebo expirovaný token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Nepřihlášen' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    next();
  };
}
