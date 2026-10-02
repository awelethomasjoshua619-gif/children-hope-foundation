import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const configuredAdminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!configuredAdminPassword || configuredAdminPassword.length < 12) {
    throw new Error('Set SEED_ADMIN_PASSWORD to a value of at least 12 characters before seeding.');
  }

  await prisma.user.upsert({
    where: { email: 'admin@childrenhope.org' },
    update: {},
    create: {
      email: 'admin@childrenhope.org',
      password: await bcrypt.hash(configuredAdminPassword, 12),
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  console.log('Admin account is ready. Add real campaigns and impact records through the admin area.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
