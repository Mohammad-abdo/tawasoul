import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
try {
  const tables = await prisma.$queryRaw`SHOW TABLE STATUS FROM tawasoul LIKE 'doctors'`;
  console.log('doctors table status:', JSON.stringify(tables, null, 2));
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await prisma.$disconnect();
}
