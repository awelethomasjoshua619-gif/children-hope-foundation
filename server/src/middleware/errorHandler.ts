import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  statusCode: number;
  isOperational = true;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const createError = (message: string, statusCode: number): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const errorHandler = (
  err: ApiError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const validationError = err instanceof ZodError;
  const prismaError = err instanceof Prisma.PrismaClientKnownRequestError;
  const prismaStatus = prismaError
    ? err.code === 'P2002' || err.code === 'P2003' ? 409 : err.code === 'P2025' ? 404 : undefined
    : undefined;
  const statusCode = validationError
    ? 400
    : ('statusCode' in err ? err.statusCode : undefined) || prismaStatus || 500;
  const message = validationError
    ? err.issues[0]?.message || 'Invalid request'
    : prismaStatus
      ? 'The requested record conflicts with existing data.'
      : ('isOperational' in err && err.isOperational)
      ? err.message
      : 'Internal server error';

  if (!validationError && !prismaStatus && !('isOperational' in err && err.isOperational)) {
    console.error('💥 Unexpected error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
