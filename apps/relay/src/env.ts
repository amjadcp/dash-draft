import { z } from 'zod';

export const EnvSchema = z.object({
  PORT: z
    .string()
    .default('3001')
    .transform((val) => parseInt(val, 10)),
  RELAY_OAUTH_CLIENT_ID: z.string().default('dd_client_default'),
  RELAY_OAUTH_CLIENT_SECRET: z.string().default('dd_secret_default'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof EnvSchema>;

export function getEnv(): Env {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables for apps/relay:', result.error.format());
    throw new Error('Invalid environment configuration for apps/relay');
  }
  return result.data;
}
