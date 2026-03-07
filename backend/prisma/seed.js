import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for تواصل (Tawasoul)...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  try {
    await prisma.assessmentResult.deleteMany();
    await prisma.question.deleteMany();
    await prisma.test.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.productReview.deleteMany();
    await prisma.product.deleteMany();
    await prisma.userPackage.deleteMany();
    await prisma.package.deleteMany();
    await prisma.address.deleteMany();
    await prisma.otpCode.deleteMany();
    await prisma.child.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.report.deleteMany();
    await prisma.notificationTemplate.deleteMany();
    await prisma.emailTemplate.deleteMany();
    await prisma.pageContent.deleteMany();
    await prisma.staticPage.deleteMany();
    await prisma.onboarding.deleteMany();
    await prisma.supportReply.deleteMany();
    await prisma.supportTicket.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.withdrawal.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.article.deleteMany();
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.postInterest.deleteMany();
    await prisma.postTag.deleteMany();
    await prisma.post.deleteMany();
    await prisma.userInterest.deleteMany();
    await prisma.userCoupon.deleteMany();
    await prisma.doctorCoupon.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.sessionPrice.deleteMany();
    await prisma.education.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.experience.deleteMany();
    await prisma.doctorSpecialty.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.interest.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.section.deleteMany();
  } catch (err) {
    console.log('⚠️  Some tables could not be cleared (may not exist yet).');
  }

  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123456', 10);

  // ============================================
  // 0. SECTIONS
  // ============================================
  console.log('📑 Creating sections...');
  const sectionsData = [
    { nameAr: 'اضطرابات الكلام واللغه', nameEn: 'Speech and Language Disorders', type: 'SPECIALTY' },
    { nameAr: 'تعديل سلوك', nameEn: 'Behavior Modification', type: 'SPECIALTY' },
    { nameAr: 'صعوبات تعلم', nameEn: 'Learning Difficulties', type: 'SPECIALTY' },
    { nameAr: 'تنميه مهارات', nameEn: 'Skills Development', type: 'SPECIALTY' },
    { nameAr: 'اختبارات نفسيه', nameEn: 'Psychological Tests', type: 'SPECIALTY' },
    { nameAr: 'توحد', nameEn: 'Autism', type: 'SPECIALTY' },
    { nameAr: 'متلازمه دوان', nameEn: 'Down Syndrome', type: 'SPECIALTY' },
    { nameAr: 'زراعه قوقعه وضعف سمع', nameEn: 'Cochlear Implants and Hearing Impairment', type: 'SPECIALTY' },
    { nameAr: 'التقييم', nameEn: 'Evaluation', type: 'WORK_AREA' },
    { nameAr: 'الجلسات الفرديه', nameEn: 'Individual Sessions', type: 'WORK_AREA' },
  ];

  for (const section of sectionsData) {
    await prisma.section.create({ data: section });
  }

  // ============================================
  // 1. ADMINS
  // ============================================
  console.log('👑 Creating admins...');
  const superAdmin = await prisma.admin.create({
    data: {
      name: 'مدير النظام',
      email: 'admin@tawasoul.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });

  // ============================================
  // 2. USERS
  // ============================================
  console.log('👤 Creating users...');
  const users = [];
  const userNames = ['أحمد محمود', 'سارة علي', 'محمد حسن', 'فاطمة إبراهيم', 'ليلى خالد'];
  
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        fullName: userNames[i],
        username: `user${i + 1}`,
        email: `user${i + 1}@tawasoul.com`,
        phone: `+20100000000${i}`,
        password: hashedPassword,
        isActive: true,
        isApproved: true,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`
      }
    });
    users.push(user);
  }

  // ============================================
  // 3. DOCTORS
  // ============================================
  console.log('👨‍⚕️ Creating doctors...');
  const doctors = [];
  const doctorSpecs = ['تخاطب', 'تعديل سلوك', 'تنمية مهارات', 'نفسي'];
  const docNames = ['د. منى أحمد', 'د. كمال يوسف', 'د. هاني عادل', 'د. ريم سعيد'];

  for (let i = 0; i < 4; i++) {
    const doctor = await prisma.doctor.create({
      data: {
        name: docNames[i],
        email: `doctor${i + 1}@tawasoul.com`,
        phone: `+20110000000${i}`,
        password: hashedPassword,
        specialization: doctorSpecs[i % doctorSpecs.length],
        bio: `خبير في مجال ${doctorSpecs[i % doctorSpecs.length]} بخبرة تزيد عن 10 سنوات.`,
        isVerified: true,
        isApproved: true,
        isActive: true,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=doc${i}`,
        rating: 4.5 + (i * 0.1),
        totalSessions: 50 + (i * 10)
      }
    });
    doctors.push(doctor);

    // Availability
    for (let day = 0; day < 5; day++) {
      await prisma.availability.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: day,
          timeSlots: JSON.stringify(['09:00', '10:00', '11:00', '13:00', '14:00', '15:00']),
          isActive: true
        }
      });
    }

    // Session Prices
    await prisma.sessionPrice.createMany({
      data: [
        { doctorId: doctor.id, duration: 30, price: 150 },
        { doctorId: doctor.id, duration: 60, price: 250 }
      ]
    });
  }

  // ============================================
  // 4. CHILDREN
  // ============================================
  console.log('👶 Creating children...');
  const children = [];
  const childNames = ['ياسين', 'ليان', 'أسر', 'جنا', 'حمزة'];
  const caseHistories = [
    'تأخر في الكلام منذ الصغر، استجابة ضعيفة للمناداة بالاسم.',
    'صعوبة في الاندماج الاجتماعي، حركات تكرارية.',
    'تشتت انتباه وفرط حركة ملحوظ.',
    'ضعف في التواصل البصري وتأخر لغوي.',
    'صعوبات في التعلم الأكاديمي المبكر.'
  ];

  for (let i = 0; i < 5; i++) {
    const child = await prisma.child.create({
      data: {
        userId: users[i].id,
        name: childNames[i],
        age: 4 + i,
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
        status: i % 2 === 0 ? 'AUTISM' : 'SPEECH_DISORDER',
        ageGroup: 'UNDER_4',
        caseHistory: caseHistories[i],
        behavioralNotes: 'يحب الألعاب الملونة والموسيقى الهادئة.',
        caseDescription: 'حالة مستقرة تحتاج لمتابعة دورية لتنمية المهارات الاجتماعية.',
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=child${i}`
      }
    });
    children.push(child);
  }

  // ============================================
  // 5. ASSESSMENT ENGINE (فئات: سمعي/بصري — أنواع: تمييز الأصوات، النطق والتكرار، ربط الصوت بالصورة، التسلسل والترتيب)
  // ============================================
  console.log('🧪 Seeding Assessment Engine...');
  const auditoryTest = await prisma.test.create({
    data: {
      title: 'مقياس التطور اللغوي والسمعي',
      titleAr: 'تمييز الأصوات',
      category: 'AUDITORY',
      testType: 'SOUND_DISCRIMINATION',
      description: 'اختبار تمييز الأصوات: تقييم قدرة الطفل على تمييز الأصوات والكلمات.',
      questions: {
        create: [
          { orderIndex: 0, audioAssetPath: 'assets/audio/test/animal_sounds.mp3', scoringGuide: '0: لا يميز الصوت، 5: يميز بعض الأصوات، 10: تمييز كامل ودقيق.' },
          { orderIndex: 1, audioAssetPath: 'assets/audio/test/follow_commands.mp3', scoringGuide: '0: لا يتبع الأوامر، 5: يتبع أمراً واحداً، 10: يتبع سلسلة أوامر مركبة.' },
          { orderIndex: 2, audioAssetPath: 'assets/audio/test/word_repetition.mp3', scoringGuide: 'قيم دقة مخارج الحروف والقدرة على محاكاة الكلمات.' }
        ]
      }
    },
    include: { questions: true }
  });

  const auditoryPronounceTest = await prisma.test.create({
    data: {
      title: 'النطق والتكرار',
      titleAr: 'النطق والتكرار',
      category: 'AUDITORY',
      testType: 'PRONUNCIATION_REPETITION',
      description: 'تقييم النطق والقدرة على تكرار الكلمات والعبارات.',
      questions: {
        create: [
          { orderIndex: 0, audioAssetPath: 'assets/audio/test/word_repetition.mp3', scoringGuide: 'قيم وضوح النطق وتكرار الكلمة.' }
        ]
      }
    },
    include: { questions: true }
  });

  const soundImageTest = await prisma.test.create({
    data: {
      title: 'ربط الصوت بالصورة',
      titleAr: 'ربط الصوت بالصورة',
      category: 'AUDITORY',
      testType: 'SOUND_IMAGE_LINKING',
      description: 'تقييم قدرة الطفل على ربط الأصوات بالصور المناسبة.',
      questions: {
        create: [
          { orderIndex: 0, audioAssetPath: 'assets/audio/test/animal_sounds.mp3', imageAssetPath: 'assets/images/test/puzzle_shapes.png', scoringGuide: 'قيم اختيار الصورة الصحيحة للصوت.', choices: [{ text: 'صورة أ', isCorrect: true }, { text: 'صورة ب', isCorrect: false }] }
        ]
      }
    },
    include: { questions: true }
  });

  const visualTest = await prisma.test.create({
    data: {
      title: 'اختبار الإدراك البصري المكاني',
      titleAr: 'التسلسل والترتيب',
      category: 'VISUAL',
      testType: 'SEQUENCE_ORDER',
      description: 'تقييم قدرة الطفل على الترتيب والتسلسل البصري.',
      questions: {
        create: [
          { orderIndex: 0, imageAssetPath: 'assets/images/test/puzzle_shapes.png', scoringGuide: 'قيم سرعة ودقة مطابقة الأشكال الهندسية.' },
          { orderIndex: 1, imageAssetPath: 'assets/images/test/color_matching.png', scoringGuide: 'قيم القدرة على تصنيف الأشياء حسب اللون.' }
        ]
      }
    },
    include: { questions: true }
  });

  // Seed some historical assessment results
  for (let i = 0; i < 5; i++) {
    await prisma.assessmentResult.create({
      data: {
        childId: children[i].id,
        questionId: auditoryTest.questions[0].id,
        scoreGiven: 7,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    });
    await prisma.assessmentResult.create({
      data: {
        childId: children[i].id,
        questionId: visualTest.questions[0].id,
        scoreGiven: 9,
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // ============================================
  // 6. BOOKINGS
  // ============================================
  console.log('📅 Creating bookings...');
  for (let i = 0; i < 15; i++) {
    const status = i < 5 ? 'COMPLETED' : i < 10 ? 'CONFIRMED' : 'PENDING';
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + (i - 7)); // past and future

    await prisma.booking.create({
      data: {
        userId: users[i % 5].id,
        doctorId: doctors[i % 4].id,
        childId: children[i % 5].id,
        status: status,
        scheduledAt: scheduledAt,
        sessionType: 'VIDEO',
        price: 200,
        duration: 45,
        videoLink: 'https://meet.google.com/abc-defg-hij',
        notes: status === 'COMPLETED' ? 'تقدم ملحوظ في الاستجابة اللفظية.' : null,
        rating: status === 'COMPLETED' ? 5 : null,
        scheduledMonth: scheduledAt.getMonth() + 1,
        scheduledDay: scheduledAt.getDate(),
        scheduledTime: '10:00 AM'
      }
    });
  }

  // ============================================
  // 7. ARTICLES
  // ============================================
  console.log('📄 Creating doctor articles...');
  const articleTitles = [
    '5 طرق لتحسين التواصل البصري عند طفلك',
    'أهمية التشخيص المبكر لحالات التوحد',
    'كيف تنمي المهارات اللغوية في المنزل؟',
    'دور التغذية في تحسين سلوك الطفل'
  ];

  for (let i = 0; i < 4; i++) {
    await prisma.article.create({
      data: {
        title: articleTitles[i],
        content: `هذا المقال يشرح بالتفصيل ${articleTitles[i]}. يعتبر التواصل جزءاً أساسياً من نمو الطفل وتطوره الاجتماعي واللغوي.`,
        excerpt: `تعرف على أهم النصائح حول ${articleTitles[i]}`,
        authorId: doctors[i].id,
        views: 100 * (i + 1),
        likes: 10 * (i + 1),
        isFeatured: true
      }
    });
  }

  // ============================================
  // 8. WITHDRAWALS
  // ============================================
  console.log('💰 Creating withdrawals...');
  for (let i = 0; i < 4; i++) {
    await prisma.withdrawal.create({
      data: {
        doctorId: doctors[i].id,
        amount: 500,
        method: 'VODAFONE_CASH',
        status: i === 0 ? 'PENDING' : 'COMPLETED',
        accountDetails: '01000000000'
      }
    });
  }

  console.log('\n✅ Database seeding completed successfully!');
  console.log('   Admin Login: admin@tawasoul.com / admin123456');
  console.log('   Doctor Login: doctor1@tawasoul.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
