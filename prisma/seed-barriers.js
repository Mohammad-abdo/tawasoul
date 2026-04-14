import { PrismaClient } from '@prisma/client';
import fs from 'fs';

// قراءة ملف العقبات
const barriersData = JSON.parse(fs.readFileSync(new URL('./data/barriers.json', import.meta.url)));

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting VB-MAPP Barriers Seeding...');
  console.log(`📝 Found ${barriersData.length} Barriers to seed.`);

  for (const item of barriersData) {
    // بما إن جدول العقبات مفيش فيه حقل Unique غير الـ ID، 
    // هنبحث برقم الترتيب (order) عشان نتأكد إننا مش بنكرر الداتا
    const existingBarrier = await prisma.vbMappBarrier.findFirst({
      where: { order: item.order }
    });

    if (existingBarrier) {
      // لو موجود، نعمل تحديث للبيانات
      await prisma.vbMappBarrier.update({
        where: { id: existingBarrier.id },
        data: {
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          order: item.order
        }
      });
    } else {
      // لو مش موجود، نعمل إنشاء جديد
      await prisma.vbMappBarrier.create({
        data: {
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          order: item.order
        }
      });
    }
  }

  console.log('✅ Barriers seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });