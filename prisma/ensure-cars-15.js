import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

const carsQuestionSeeds = [
  {
    order: 1,
    questionText: { ar: 'إقامة العلاقة مع الناس', en: 'Relating to People' },
    choices: [
      { score: 1, ar: 'لا توجد صعوبة', en: 'No difficulty' },
      { score: 2, ar: 'صعوبة خفيفة', en: 'Mild difficulty' },
      { score: 3, ar: 'صعوبة متوسطة', en: 'Moderate difficulty' },
      { score: 4, ar: 'صعوبة شديدة', en: 'Severe difficulty' }
    ]
  },
  {
    order: 2,
    questionText: { ar: 'القدرة على التقليد والمحاكاة', en: 'Imitation' },
    choices: [
      { score: 1, ar: 'تقليد مناسب للعمر', en: 'Age-appropriate imitation' },
      { score: 2, ar: 'تقليد خفيف القصور', en: 'Mildly abnormal imitation' },
      { score: 3, ar: 'تقليد متوسط القصور', en: 'Moderately abnormal imitation' },
      { score: 4, ar: 'تقليد شديد القصور', en: 'Severely abnormal imitation' }
    ]
  },
  {
    order: 3,
    questionText: { ar: 'الاستجابة الانفعالية (العاطفية)', en: 'Emotional Response' },
    choices: [
      { score: 1, ar: 'استجابة عاطفية مناسبة', en: 'Age-appropriate emotional response' },
      { score: 2, ar: 'استجابة خفيفة القصور', en: 'Mildly abnormal emotional response' },
      { score: 3, ar: 'استجابة متوسطة القصور', en: 'Moderately abnormal emotional response' },
      { score: 4, ar: 'استجابة شديدة القصور', en: 'Severely abnormal emotional response' }
    ]
  },
  {
    order: 4,
    questionText: { ar: 'استخدام الجسم', en: 'Body Use' },
    choices: [
      { score: 1, ar: 'مناسب للعمر', en: 'Age-appropriate' },
      { score: 2, ar: 'خفيف القصور', en: 'Mildly abnormal' },
      { score: 3, ar: 'متوسط القصور', en: 'Moderately abnormal' },
      { score: 4, ar: 'شديد القصور', en: 'Severely abnormal' }
    ]
  },
  {
    order: 5,
    questionText: { ar: 'استخدام الأشياء', en: 'Object Use' },
    choices: [
      { score: 1, ar: 'استخدام مناسب للعمر', en: 'Age-appropriate use' },
      { score: 2, ar: 'استخدام خفيف القصور', en: 'Mildly abnormal use' },
      { score: 3, ar: 'استخدام متوسط القصور', en: 'Moderately abnormal use' },
      { score: 4, ar: 'استخدام شديد القصور', en: 'Severely abnormal use' }
    ]
  },
  {
    order: 6,
    questionText: { ar: 'التكيف مع التغير (الروتين)', en: 'Adaptation to Change' },
    choices: [
      { score: 1, ar: 'يتكيف بسهولة مع التغير', en: 'Adapts easily to change' },
      { score: 2, ar: 'صعوبة خفيفة مع التغير', en: 'Mild difficulty with change' },
      { score: 3, ar: 'صعوبة متوسطة مع التغير', en: 'Moderate difficulty with change' },
      { score: 4, ar: 'صعوبة شديدة مع التغير', en: 'Severe difficulty with change' }
    ]
  },
  {
    order: 7,
    questionText: { ar: 'الاستجابة البصرية', en: 'Visual Response' },
    choices: [
      { score: 1, ar: 'استجابة بصرية مناسبة', en: 'Age-appropriate visual response' },
      { score: 2, ar: 'استجابة بصرية خفيفة القصور', en: 'Mildly abnormal visual response' },
      { score: 3, ar: 'استجابة بصرية متوسطة القصور', en: 'Moderately abnormal visual response' },
      { score: 4, ar: 'استجابة بصرية شديدة القصور', en: 'Severely abnormal visual response' }
    ]
  },
  {
    order: 8,
    questionText: { ar: 'الاستجابة السمعية', en: 'Auditory Response' },
    choices: [
      { score: 1, ar: 'استجابة سمعية مناسبة', en: 'Age-appropriate auditory response' },
      { score: 2, ar: 'استجابة سمعية خفيفة القصور', en: 'Mildly abnormal auditory response' },
      { score: 3, ar: 'استجابة سمعية متوسطة القصور', en: 'Moderately abnormal auditory response' },
      { score: 4, ar: 'استجابة سمعية شديدة القصور', en: 'Severely abnormal auditory response' }
    ]
  },
  {
    order: 9,
    questionText: { ar: 'استخدام التذوق والشم واللمس', en: 'Taste, Smell, and Touch Response and Use' },
    choices: [
      { score: 1, ar: 'استجابات حسية مناسبة', en: 'Age-appropriate sensory responses' },
      { score: 2, ar: 'استجابات حسية خفيفة القصور', en: 'Mildly abnormal sensory responses' },
      { score: 3, ar: 'استجابات حسية متوسطة القصور', en: 'Moderately abnormal sensory responses' },
      { score: 4, ar: 'استجابات حسية شديدة القصور', en: 'Severely abnormal sensory responses' }
    ]
  },
  {
    order: 10,
    questionText: { ar: 'الخوف أو القلق', en: 'Fear or Nervousness' },
    choices: [
      { score: 1, ar: 'خوف/قلق مناسب للموقف', en: 'Appropriate fear/nervousness' },
      { score: 2, ar: 'خوف/قلق خفيف غير مناسب', en: 'Mildly inappropriate fear/nervousness' },
      { score: 3, ar: 'خوف/قلق متوسط غير مناسب', en: 'Moderately inappropriate fear/nervousness' },
      { score: 4, ar: 'خوف/قلق شديد غير مناسب', en: 'Severely inappropriate fear/nervousness' }
    ]
  },
  {
    order: 11,
    questionText: { ar: 'التواصل اللفظي', en: 'Verbal Communication' },
    choices: [
      { score: 1, ar: 'تواصل لفظي مناسب', en: 'Age-appropriate verbal communication' },
      { score: 2, ar: 'تواصل لفظي خفيف القصور', en: 'Mildly abnormal verbal communication' },
      { score: 3, ar: 'تواصل لفظي متوسط القصور', en: 'Moderately abnormal verbal communication' },
      { score: 4, ar: 'تواصل لفظي شديد القصور', en: 'Severely abnormal verbal communication' }
    ]
  },
  {
    order: 12,
    questionText: { ar: 'التواصل غير اللفظي', en: 'Nonverbal Communication' },
    choices: [
      { score: 1, ar: 'تواصل غير لفظي مناسب', en: 'Age-appropriate nonverbal communication' },
      { score: 2, ar: 'تواصل غير لفظي خفيف القصور', en: 'Mildly abnormal nonverbal communication' },
      { score: 3, ar: 'تواصل غير لفظي متوسط القصور', en: 'Moderately abnormal nonverbal communication' },
      { score: 4, ar: 'تواصل غير لفظي شديد القصور', en: 'Severely abnormal nonverbal communication' }
    ]
  },
  {
    order: 13,
    questionText: { ar: 'مستوى النشاط', en: 'Activity Level' },
    choices: [
      { score: 1, ar: 'نشاط مناسب للعمر', en: 'Age-appropriate activity level' },
      { score: 2, ar: 'نشاط خفيف غير مناسب', en: 'Mildly abnormal activity level' },
      { score: 3, ar: 'نشاط متوسط غير مناسب', en: 'Moderately abnormal activity level' },
      { score: 4, ar: 'نشاط شديد غير مناسب', en: 'Severely abnormal activity level' }
    ]
  },
  {
    order: 14,
    questionText: { ar: 'مستوى واتساق الأداء الذهني', en: 'Level and Consistency of Intellectual Response' },
    choices: [
      { score: 1, ar: 'أداء ذهني مناسب ومتسق', en: 'Age-appropriate and consistent intellectual response' },
      { score: 2, ar: 'قصور خفيف أو تذبذب بسيط', en: 'Mildly abnormal or mildly inconsistent response' },
      { score: 3, ar: 'قصور متوسط أو تذبذب واضح', en: 'Moderately abnormal or inconsistent response' },
      { score: 4, ar: 'قصور شديد أو تذبذب شديد', en: 'Severely abnormal or highly inconsistent response' }
    ]
  },
  {
    order: 15,
    questionText: { ar: 'الانطباع العام (التقييم الكلي للتوحد)', en: 'General Impressions' },
    choices: [
      { score: 1, ar: 'انطباع عام ضمن الطبيعي', en: 'General impression within normal limits' },
      { score: 2, ar: 'انطباع عام يشير لصعوبة خفيفة', en: 'General impression suggests mild difficulty' },
      { score: 3, ar: 'انطباع عام يشير لصعوبة متوسطة', en: 'General impression suggests moderate difficulty' },
      { score: 4, ar: 'انطباع عام يشير لصعوبة شديدة', en: 'General impression suggests severe difficulty' }
    ]
  }
];

async function main() {
  const carsTest = await prisma.test.findFirst({
    where: { testType: 'CARS' },
    orderBy: { createdAt: 'asc' }
  });

  if (!carsTest) {
    throw new Error('No CARS test found in database.');
  }

  const existing = await prisma.q_CARS.findMany({
    where: { testId: carsTest.id },
    select: { id: true, order: true }
  });

  const existingOrders = new Set(existing.map((q) => q.order));
  const missing = carsQuestionSeeds.filter((seed) => !existingOrders.has(seed.order));

  if (missing.length === 0) {
    console.log(`CARS test already has ${existing.length} questions. Nothing to add.`);
    return;
  }

  for (const seed of missing) {
    await prisma.q_CARS.create({
      data: {
        testId: carsTest.id,
        order: seed.order,
        questionText: seed.questionText,
        choices: seed.choices
      }
    });
  }

  const finalCount = await prisma.q_CARS.count({ where: { testId: carsTest.id } });
  console.log(`Added ${missing.length} questions. Final CARS question count: ${finalCount}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

