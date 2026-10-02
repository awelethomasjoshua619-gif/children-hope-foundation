import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
    email: z.string().trim().email('Invalid email address').transform((email) => email.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
});

const loginSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(1, 'Password required'),
});

const signToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
};

const setCookieToken = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createError(parsed.error.errors[0].message, 400));
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return next(createError('Email already registered', 409));
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const token = signToken(user.id);
    setCookieToken(res, token);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createError('Invalid email or password', 400));
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(createError('Invalid email or password', 401));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return next(createError('Invalid email or password', 401));
    }

    const token = signToken(user.id);
    setCookieToken(res, token);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) return next(createError('User not found', 404));

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
