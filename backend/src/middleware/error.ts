import type { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  details?: unknown;
}

function toHttpError(err: unknown): HttpError {
  if (err instanceof Error) return err as HttpError;
  return Object.assign(new Error(String(err)), { status: 500 });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const e = toHttpError(err);
  console.error('[error]', e);
  const status = e.status ?? e.statusCode ?? 500;
  res.status(status).json({
    error: e.message || 'Internal server error',
    details: e.details,
  });
}
