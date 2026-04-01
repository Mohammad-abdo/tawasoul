import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const fks = await prisma.$queryRaw`
    SELECT TABLE_NAME, CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
      AND REFERENCED_TABLE_NAME = 'doctors'
  `;
  console.log('Foreign keys referencing doctors:', JSON.stringify(fks, null, 2));

  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS `doctors`');
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Dropped broken doctors table.');
} catch (e) {
  console.error('Failed:', e.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
