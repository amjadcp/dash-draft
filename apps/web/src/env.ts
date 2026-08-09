import { z } from 'zod';

export const EnvSchema = z.object({
  VITE_RELAY_URL: z.string().url().default('http://localhost:3001'),
  VITE_RELAY_WS_URL: z.string().default('ws://localhost:3001/ws/session'),
});

export type Env = z.infer<typeof EnvSchema>;

export function getEnv(): Env {
  const result = EnvSchema.safeParse({
    VITE_RELAY_URL: import.meta.env.VITE_RELAY_URL,
    VITE_RELAY_WS_URL: import.meta.env.VITE_RELAY_WS_URL,
  });

  if (!result.success) {
    console.error('Invalid frontend environment configuration:', result.error.format());
    return {
      VITE_RELAY_URL: 'http://localhost:3001',
      VITE_RELAY_WS_URL: 'ws://localhost:3001/ws/session',
    };
  }
  return result.data;
}
