import path from 'path';
import { config as loadEnv } from 'dotenv';

// Load the server's environment file from both source and compiled locations.
// dotenv does not override variables that are already set, so real system env normally wins —
// but an ambient PORT=0 (common in sandboxes/CI) is treated as "unset" in favor of .env below.
const dotenvParsed = loadEnv({ path: path.resolve(__dirname, '../../.env') });

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

} as const;

if (config.env === 'production') {
  const requiredProductionVars = [
    'DATABASE_URL',
    'CLIENT_URL',
    'JWT_SECRET',
    'PAYSTACK_SECRET_KEY',
    'RESEND_API_KEY',
    'ADMIN_EMAIL',
  ];
  const missing = requiredProductionVars.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
  if ((process.env.JWT_SECRET || '').length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters in production.');
  }
}
