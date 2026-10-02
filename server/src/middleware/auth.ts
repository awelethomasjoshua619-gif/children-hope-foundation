import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return next(createError('Authentication required', 401));
  }

  let decoded: { id: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
  } catch {
    return next(createError('Invalid or expired token', 401));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return next(createError('User not found', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuthenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();

  let decoded: { id: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
  } catch {
    return next(createError('Invalid or expired token', 401));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true },
    });
    if (user) req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(createError('Authentication required', 401));
  }
  if (req.user.role !== 'ADMIN') {
    return next(createError('Admin access required', 403));
  }
  next();
};
