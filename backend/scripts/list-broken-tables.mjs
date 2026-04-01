import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
try {
  const rows = await prisma.$queryRaw`
    SELECT TABLE_NAME, ENGINE, CREATE_OPTIONS, TABLE_COMMENT
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    ORDER BY TABLE_NAME
  `;
  const broken = rows.filter(
    (r) =>
      r.ENGINE == null ||
      (r.TABLE_COMMENT && String(r.TABLE_COMMENT).includes("doesn't exist in engine"))
  );
  console.log('Broken tables:', broken.length);
  console.log(broken.map((r) => r.TABLE_NAME).join('\n'));
} finally {
  await prisma.$disconnect();
}
