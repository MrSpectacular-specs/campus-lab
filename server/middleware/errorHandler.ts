import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[Express Server Error]', err);

  const errorObj = (err && typeof err === 'object' ? err : {}) as Record<string, unknown>;
  const status = typeof errorObj.status === 'number' ? errorObj.status : 500;
  const message = typeof errorObj.message === 'string' ? errorObj.message : 'Internal Server Error';

  res.status(status).json({
    error: message,
    details: process.env.NODE_ENV !== 'production' ? errorObj : undefined,
  });
}
