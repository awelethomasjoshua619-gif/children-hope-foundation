import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Express 4 does not catch rejected promises from async handlers — an thrown AppError
 * or ZodError would crash the process instead of returning a JSON error. This wrapper
 * forwards every rejection to next() so the global errorHandler handles it.
 */
export default function ah(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    void fn(req, res, next).catch(next);
  };
}
