// backend/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import { prisma } from '../db/client.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET env var is required in production');
  }
  // eslint-disable-next-line no-console
  console.warn('[SECURITY] JWT_SECRET not set — using insecure dev default. Set JWT_SECRET in .env');
}
const _JWT_SECRET = JWT_SECRET || 'dev-only-insecure-secret-do-not-use-in-prod';

// Optional: Supabase JWT secret for verifying frontend Supabase tokens.
// Found in Supabase dashboard → Settings → API → JWT Secret.
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

export function signToken(payload) {
  return jwt.sign(payload, _JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, _JWT_SECRET);
}

const USER_SELECT = { id: true, email: true, name: true, role: true };

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Přístup odepřen — chybí token' });
    }
    const token = header.slice(7);

    // Try custom JWT first (payload has { userId })
    try {
      const payload = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: USER_SELECT,
      });
      if (!user) return res.status(401).json({ error: 'Uživatel nenalezen' });
      req.user = user;
      return next();
    } catch {
      // Fall through to Supabase JWT verification below
    }

    // Try Supabase JWT (payload has { sub, email, user_metadata })
    if (!SUPABASE_JWT_SECRET) {
      return res.status(401).json({ error: 'Neplatný nebo expirovaný token' });
    }
    const payload = jwt.verify(token, SUPABASE_JWT_SECRET);
    const email = payload.email;
    if (!email) return res.status(401).json({ error: 'Neplatný token — chybí email' });

    const user = await prisma.user.findUnique({ where: { email }, select: USER_SELECT });
    if (!user) {
      return res.status(401).json({ error: 'Účet nenalezen — dokončete registraci' });
    }
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
