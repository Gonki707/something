import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../config/db.js';
import { adminUsers } from '../db/schema.js';
import { signToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    if (!user) return res.status(401).json({ error: 'Невалиден е-маил или лозинка' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Невалиден е-маил или лозинка' });
    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 86400000 });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    next(e);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', requireAdmin, (req, res) => {
  res.json({ user: req.user });
});

export default router;
