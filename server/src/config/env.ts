import path from 'path';
import { config as loadEnv } from 'dotenv';

// Load the root monorepo .env (from server/src/config via tsx, or server/dist/config after build).
// dotenv does not override variables that are already set, so real system env normally wins —
// but an ambient PORT=0 (common in sandboxes/CI) is treated as "unset" in favor of .env below.
const dotenvParsed = loadEnv({ path: path.resolve(__dirname, '../../../.env') });

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.warn(`⚠ Missing env var ${name} — using a placeholder. Set it before production.`);
    return `unset-${name.toLowerCase()}`;
  }
  return v;
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  // Prefer a real system PORT; ignore the meaningless PORT=0; else use .env; else 4000.
  port:
    parseInt(
      process.env.PORT && process.env.PORT !== '0'
        ? process.env.PORT
        : (dotenvParsed.parsed?.PORT ?? '4000'),
      10,
    ) || 4000,
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',

  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as string,

  paystackSecretKey: required('PAYSTACK_SECRET_KEY'),
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY ?? '',

  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.MAIL_FROM ?? 'Children Hope Foundation <no-reply@childrenhope.org>',
    adminAlertEmail: process.env.ADMIN_ALERT_EMAIL ?? 'admin@childrenhope.org',
  },
} as const;
