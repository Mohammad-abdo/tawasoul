import { PrismaClient } from '@prisma/client';
import fs from 'fs';

// قراءة ملف الـ JSON بالطريقة المتوافقة مع ES Modules
const milestonesData = JSON.parse(fs.readFileSync(new URL('./data/milestones.json', import.meta.url)));

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting VB-MAPP Milestones Seeding...');

  // 1. استخراج المجالات الفريدة عشان ننشئها الأول
  const uniqueAreas = Array.from(new Set(milestonesData.map(m => m.skillAreaCode)));
  const areasMap = new Map();

  console.log(`📦 Found ${uniqueAreas.length} unique Skill Areas. Upserting them...`);

  let orderCounter = 1;
  for (const code of uniqueAreas) {
    const sample = milestonesData.find(m => m.skillAreaCode === code);
    
    const area = await prisma.vbMappSkillArea.upsert({
      where: { code: code },
      update: {}, 
      create: {
        code: code,
        nameAr: sample?.nameAr || code,
        nameEn: code, 
        level: 'LEVEL_1', // المستوى الافتراضي (تقدر تعدله بعدين)
        order: orderCounter++,
      },
    });
    
    areasMap.set(code, area.id);
  }

  // 2. إدخال الأسئلة
  console.log(`📝 Upserting ${milestonesData.length} Milestones...`);

  for (const item of milestonesData) {
    const skillAreaId = areasMap.get(item.skillAreaCode);

    if (!skillAreaId) continue;

    await prisma.vbMappMilestone.upsert({
      where: {
        skillAreaId_milestoneNumber_level: {
          skillAreaId: skillAreaId,
          milestoneNumber: item.milestoneNumber,
          level: item.level,
        }
      },
      update: {
        descriptionAr: item.descriptionAr,
        assessmentMethod: item.assessmentMethod,
        order: item.milestoneNumber,
      },
      create: {
        skillAreaId: skillAreaId,
        milestoneNumber: item.milestoneNumber,
        level: item.level,
        descriptionAr: item.descriptionAr,
        assessmentMethod: item.assessmentMethod,
        order: item.milestoneNumber, 
      },
    });
  }

  console.log('✅ Milestones seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });