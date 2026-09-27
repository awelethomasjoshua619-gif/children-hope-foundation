import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { signToken, setAuthCookie, clearAuthCookie } from '../middleware/auth';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

function toPublicUser(user: { id: string; name: string; email: string; role: 'DONOR' | 'ADMIN' }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function register(req: Request, res: Response): Promise<void> {
  const body = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    throw new AppError(409, 'An account with that email already exists — try logging in.');
  }

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash: await bcrypt.hash(body.password, 10),
      role: 'DONOR',
    },
  });

  setAuthCookie(res, signToken(toPublicUser(user)));
  res.status(201).json({ user: toPublicUser(user) });
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) throw new AppError(401, 'Invalid email or password');

  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) throw new AppError(401, 'Invalid email or password');

  setAuthCookie(res, signToken(toPublicUser(user)));
  res.json({ user: toPublicUser(user) });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
  res.json({ ok: true });
}

export async function me(req: Request, res: Response): Promise<void> {
  // requireAuth guarantees req.user is set
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    clearAuthCookie(res);
    throw new AppError(401, 'Account no longer exists');
  }
  res.json({ user: toPublicUser(user) });
}
