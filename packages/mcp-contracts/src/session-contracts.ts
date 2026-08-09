import { z } from 'zod';

export const SessionHandshakeSchema = z.object({
  type: z.literal('SESSION_INIT'),
  sessionId: z.string().min(1),
  customerId: z.string().min(1),
  timestamp: z.string(),
});

export type SessionHandshake = z.infer<typeof SessionHandshakeSchema>;

export const SessionStatusSchema = z.object({
  type: z.literal('SESSION_STATUS'),
  sessionId: z.string(),
  connected: z.boolean(),
  mcpHandshakeConfirmed: z.boolean(),
  timestamp: z.string(),
});

export type SessionStatus = z.infer<typeof SessionStatusSchema>;
