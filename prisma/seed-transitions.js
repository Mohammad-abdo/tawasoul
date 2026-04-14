import { PrismaClient } from '@prisma/client';
import fs from 'fs';

// قراءة ملف الانتقال
const transitionsData = JSON.parse(fs.readFileSync(new URL('./data/transitions.json', import.meta.url)));

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting VB-MAPP Transitions Seeding...');
  console.log(`📝 Found ${transitionsData.length} Transition Criteria to seed.`);

  for (const item of transitionsData) {
    // هنبحث برقم الترتيب (order) عشان نتأكد إننا مش بنكرر الداتا
    const existingCriteria = await prisma.vbMappTransitionCriteria.findFirst({
      where: { order: item.order }
    });

    if (existingCriteria) {
      // لو موجود، نعمل تحديث
      await prisma.vbMappTransitionCriteria.update({
        where: { id: existingCriteria.id },
        data: {
          nameAr: item.nameAr,
          descriptionAr: item.descriptionAr,
          order: item.order
        }
      });
    } else {
      // لو مش موجود، نعمل إنشاء جديد
      await prisma.vbMappTransitionCriteria.create({
        data: {
          nameAr: item.nameAr,
          descriptionAr: item.descriptionAr,
          order: item.order
        }
      });
    }
  }

  console.log('✅ Transitions seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });