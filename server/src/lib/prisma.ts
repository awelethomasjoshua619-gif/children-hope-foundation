import { PrismaClient } from '@prisma/client';

// PrismaClient singleton — attach to globalThis in dev so hot reloads reuse it.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma;
}
