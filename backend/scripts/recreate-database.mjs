/**
 * Recreates an empty `tawasoul` schema from prisma/schema.prisma.
 * Use when MySQL shows error 1932 ("Table ... doesn't exist in engine") for many tables.
 */
import 'dotenv/config';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(__dirname, '..');

const baseUrl = process.env.DATABASE_URL;
if (!baseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const adminUrl = baseUrl.replace(/\/[^/]+\s*$/, '/mysql');

const prismaAdmin = new PrismaClient({
  datasources: { db: { url: adminUrl } }
});

const dbName = 'tawasoul';

try {
  console.log('Dropping and recreating database...');
  await prismaAdmin.$executeRawUnsafe(`DROP DATABASE IF EXISTS \`${dbName}\``);
  await prismaAdmin.$executeRawUnsafe(
    `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  console.log('Database recreated.');
} finally {
  await prismaAdmin.$disconnect();
}

console.log('Running prisma db push...');
execSync('npx prisma db push --accept-data-loss', {
  cwd: backendRoot,
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: baseUrl }
});

console.log('Done. Optional: npm run prisma:seed');
