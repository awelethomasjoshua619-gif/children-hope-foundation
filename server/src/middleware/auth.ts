import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'DONOR' | 'ADMIN';
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

const COOKIE_NAME = 'chf_token';

export function signToken(user: AuthUser): string {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
  });
}

/** Require a valid JWT; attaches req.user. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[COOKIE_NAME] ?? (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);
  if (!token) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }
  try {
    req.user = jwt.verify(token, config.jwtSecret) as AuthUser;
    next();
  } catch {
    res.status(401).json({ message: 'Session expired — please log in again' });
  }
}

/** Require an authenticated admin. */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }
    next();
  });
}
