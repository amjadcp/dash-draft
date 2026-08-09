import type { Request, Response, NextFunction } from 'express';
import { createErrorEnvelope } from '@repo/mcp-contracts';

export class RelayError extends Error {
  constructor(
    public readonly code:
      | 'INVALID_SESSION'
      | 'UNAUTHORIZED'
      | 'QUERY_REJECTED'
      | 'INVALID_INPUT'
      | 'INTERNAL_ERROR'
      | 'RATE_LIMITED',
    message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'RelayError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof RelayError) {
    res.status(err.statusCode).json(createErrorEnvelope(err.code, err.message));
    return;
  }

  const message = err instanceof Error ? err.message : 'Internal Server Error';
  console.error('[Relay Error]', message);
  res.status(500).json(createErrorEnvelope('INTERNAL_ERROR', 'An unexpected error occurred'));
}
