/**
 * Drops every table in the current DATABASE_URL schema (fixes broken InnoDB state
 * before prisma db push when DROP DATABASE fails on Windows).
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
  const rows = await prisma.$queryRaw`SHOW TABLES`;
  const key = Object.keys(rows[0] || {})[0];
  if (!key) {
    console.log('No tables to drop.');
  } else {
    for (const row of rows) {
      const name = row[key];
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`${String(name).replace(/`/g, '``')}\``);
      console.log('Dropped:', name);
    }
  }
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
  console.log('All tables dropped.');
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
