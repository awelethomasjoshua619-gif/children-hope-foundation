import path from 'path';
import { config as loadEnv } from 'dotenv';

// Load the root monorepo .env so PrismaClient sees DATABASE_URL
loadEnv({ path: path.resolve(__dirname, '../../.env') });

import { PrismaClient, CampaignCategory, CampaignStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type SeedCampaign = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: CampaignCategory;
  status: CampaignStatus;
  targetAmount: number;
  country: string;
  coverImage: string;
};

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=1200&fit=crop`;

const CAMPAIGNS: SeedCampaign[] = [
  {
    coverImage: unsplash('1509062522246-3755977927d7'),
    title: 'Classrooms for Kibera',
    slug: 'classrooms-for-kibera',
    summary: 'Build two new classrooms and a library corner for 200+ children in Kibera, Nairobi.',
    description:
      "Kibera is one of Africa's largest urban informal settlements, and its schools are overflowing. " +
      'Your gift furnishes two new classrooms, trains two teachers, stocks a reading corner with age-appropriate books, ' +
      'and provides exercise books and uniforms so no child is turned away.\n\n' +
      '₦25,000 provides a full set of exercise books and pencils for one child for a whole term.',
    category: 'EDUCATION',
    status: 'ACTIVE',
    targetAmount: 4500000, // ₦4.5m
    country: 'Kenya',
  },
  {
    coverImage: unsplash('1576091160399-112ba8d25d1d'),
    title: 'Malaria Treatment Fund',
    slug: 'malaria-treatment-fund',
    summary: 'Free malaria testing and treatment for children under five across three rural clinics.',
    description:
      'Malaria remains a leading cause of death for children under five in sub-Saharan Africa. ' +
      'This fund supplies rapid diagnostic tests, ACT treatments and insecticide-treated nets to three partner clinics.\n\n' +
      '₦3,500 buys a test-and-treat visit. ₦7,000 protects a family with a treated net for two years.',
    category: 'HEALTHCARE',
    status: 'ACTIVE',
    targetAmount: 3000000,
    country: 'Kenya',
  },
  {
    coverImage: unsplash('1504674900247-0877df9cc836'),
    title: 'School Meals for Garissa',
    slug: 'school-meals-for-garissa',
    summary: 'A hot, nutritious lunch every school day for 500 children in Garissa County.',
    description:
      'Hunger is the biggest reason children drop out of school in drought-affected Garissa. ' +
      'This campaign funds a daily school meal — maize, beans and vegetables sourced from local farmers — for a full academic year.\n\n' +
      '₦1,800 feeds one child for a week. ₦70,000 feeds a classroom for a term.',
    category: 'FOOD',
    status: 'ACTIVE',
    targetAmount: 6000000,
    country: 'Kenya',
  },
  {
    coverImage: unsplash('1523362628745-0c100150b504'),
    title: 'Clean Borehole for Makueni',
    slug: 'clean-borehole-for-makueni',
    summary: 'Drill and maintain a solar-powered borehole serving a school and 1,200 residents.',
    description:
      'Girls in Makueni miss school walking hours for water. A solar-powered borehole with a raised tank and ' +
      'community taps gives the school safe drinking water and frees children — especially girls — to stay in class.\n\n' +
      'The project covers drilling, solar pumping equipment, water-quality testing and one year of maintenance.',
    category: 'WATER',
    status: 'ACTIVE',
    targetAmount: 5200000,
    country: 'Kenya',
  },
  {
    coverImage: unsplash('1503454537195-1dcabb73ffb9'),
    title: 'Girls’ Sanitary Kits & Dignity',
    slug: 'girls-sanitary-kits-dignity',
    summary: 'Menstrual health kits and education so girls never miss school because of their period.',
    description:
      'Period poverty keeps thousands of girls out of classroom each month. This campaign provides reusable sanitary kits, ' +
      'underwear and soap, alongside school nurse-led menstrual health education for 800 girls.\n\n' +
      '₦6,500 funds one girl’s kit and education session for a year.',
    category: 'EDUCATION',
    status: 'ACTIVE',
    targetAmount: 2000000,
    country: 'Kenya',
  },
  {
    coverImage: unsplash('1593113598332-cd288d649433'),
    title: 'Emergency Drought Response',
    slug: 'emergency-drought-response',
    summary: 'Rapid food, water and medical outreach for families hit by the Horn of Africa drought.',
    description:
      'When drought strikes, children are the first to suffer — malnutrition, skipped school, untreated illness. ' +
      'This flexible emergency fund lets our field teams deliver food parcels, water trucking and mobile clinics ' +
      'within 72 hours of an assessed need.\n\n' +
      'Gifts here are deployed where the need is greatest and reported transparently.',
    category: 'EMERGENCY',
    status: 'ACTIVE',
    targetAmount: 8000000,
    country: 'Somalia',
  },
  {
    coverImage: unsplash('1497633762265-9d179a990aa6'),
    title: 'Completed: Books for Kisumu',
    slug: 'books-for-kisumu',
    summary: 'A finished 2024 campaign that stocked 12 school libraries around Kisumu.',
    description:
      'Thanks to 431 donors, this completed campaign placed 18,000 storybooks and textbooks in 12 schools around Kisumu, ' +
      'with reading corners staffed by trained volunteers. Kept here for transparency so donors can see what their gifts achieved.',
    category: 'EDUCATION',
    status: 'COMPLETED',
    targetAmount: 1500000,
    country: 'Kenya',
  },
];

async function seed() {
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const donorPassword = await bcrypt.hash('Donor123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@childrenhope.org' },
    update: {},
    create: {
      name: 'Foundation Admin',
      email: 'admin@childrenhope.org',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const donor = await prisma.user.upsert({
    where: { email: 'donor@example.com' },
    update: {},
    create: {
      name: 'Ada Donor',
      email: 'donor@example.com',
      passwordHash: donorPassword,
      role: 'DONOR',
    },
  });

  for (const c of CAMPAIGNS) {
    await prisma.campaign.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        summary: c.summary,
        description: c.description,
        category: c.category,
        status: c.status,
        targetAmount: c.targetAmount,
        country: c.country,
        coverImage: c.coverImage,
      },
      create: c,
    });
  }

  const IMPACT_STATS = [
    { key: 'wells', label: 'Clean Water Wells', value: 12, icon: 'Droplets', sortOrder: 1 },
    { key: 'students', label: 'Students Supported', value: 1650, icon: 'BookOpen', sortOrder: 2 },
    { key: 'meals', label: 'Meals Served', value: 320000, icon: 'Utensils', sortOrder: 3 },
    { key: 'patients', label: 'Medical Patients', value: 45000, icon: 'Users', sortOrder: 4 },
  ];
  for (const s of IMPACT_STATS) {
    await prisma.impactStat.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  const SITE_SETTINGS = [
    { key: 'hero_headline_badge', value: 'Empowering Communities Across Africa' },
    { key: 'hero_headline', value: 'Every Child Deserves Hope, Education & Clean Water.' },
  ];
  for (const s of SITE_SETTINGS) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  console.log('Seed complete:');
  console.log('  admin → admin@childrenhope.org / Admin123!');
  console.log('  donor → donor@example.com / Donor123!');
  console.log(`  campaigns → ${CAMPAIGNS.length}`);
  console.log('  admin id:', admin.id, '| donor id:', donor.id);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
