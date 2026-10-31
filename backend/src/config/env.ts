import { z } from 'zod';

try {
  process.loadEnvFile?.();
} catch {
  // Ignore when .env file is absent
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  MAIL_FROM: z.string().default('noreply@example.com'),
  APP_URL: z.string().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);

