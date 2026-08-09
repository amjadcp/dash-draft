import { z } from 'zod';

export const ErrorCodeSchema = z.enum([
  'INVALID_SESSION',
  'SESSION_EXPIRED',
  'UNAUTHORIZED',
  'QUERY_REJECTED',
  'QUERY_FAILED',
  'INVALID_INPUT',
  'INTERNAL_ERROR',
  'CRYPTO_ERROR',
  'RATE_LIMITED',
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ErrorEnvelopeSchema = z.object({
  code: ErrorCodeSchema,
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string(),
});

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

export function createErrorEnvelope(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): ErrorEnvelope {
  return {
    code,
    message,
    ...(details ? { details } : {}),
    timestamp: new Date().toISOString(),
  };
}
