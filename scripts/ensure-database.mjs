import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const baseUrl = process.env.DATABASE_URL;
const adminUrl = baseUrl.replace(/\/[^/]+\s*$/, '/mysql');
const dbName = 'tawasoul';

const prisma = new PrismaClient({ datasources: { db: { url: adminUrl } } });
try {
  await prisma.$executeRawUnsafe(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  console.log('Database', dbName, 'ready.');
} finally {
  await prisma.$disconnect();
}
