import { z } from 'zod';

export const BridgeRequestSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('MCP_TOOL_CALL'),
  sessionId: z.string(),
  ciphertext: z.string(), // Opaque WebCrypto AES-GCM ciphertext (base64 string)
  iv: z.string(), // Base64 Initialization Vector
  timestamp: z.string(),
});

export type BridgeRequest = z.infer<typeof BridgeRequestSchema>;

export const BridgeResponseSchema = z.discriminatedUnion('status', [
  z.object({
    id: z.string().uuid(),
    type: z.literal('MCP_TOOL_RESULT'),
    status: z.literal('success'),
    ciphertext: z.string(), // Opaque WebCrypto ciphertext result
    iv: z.string(),
    timestamp: z.string(),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal('MCP_TOOL_RESULT'),
    status: z.literal('error'),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.string(), z.unknown()).optional(),
    }),
    timestamp: z.string(),
  }),
]);

export type BridgeResponse = z.infer<typeof BridgeResponseSchema>;
