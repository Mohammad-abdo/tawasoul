import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const now = new Date();
const plusDays = (n) => new Date(now.getTime() + n * 86400000);
const plusMonths = (n) => {
  const d = new Date(now);
  d.setMonth(d.getMonth() + n);
  return d;
};
const j = JSON.stringify;
const seedAvailabilitySlots = ['09:00', '10:00', '11:00', '14:00', '15:00'];

const formatSeedTime = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(now);
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const buildSeedSlotDate = ({ dayOfWeek, time, direction = 'future', extraWeeks = 0 }) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(now);
  date.setHours(hours, minutes, 0, 0);

  let diff = dayOfWeek - date.getDay();
  if (direction === 'future') {
    if (diff < 0 || (diff === 0 && date <= now)) diff += 7;
    diff += extraWeeks * 7;
  } else {
    if (diff >= 0) diff -= 7;
    diff -= extraWeeks * 7;
  }

  date.setDate(date.getDate() + diff);
  return date;
};

async function clearDb() {
  const tables = [
    'childActivityProgress', 'activitySequenceItem', 'activityMatchPair', 'activityAudio', 'activityImage', 'activity',
    'skillGroup', 'activityCategory',
    'q_VisualMemory_Answer', 'q_VisualMemory', 'q_VisualMemory_Batch',
    'q_AuditoryMemory_Answer', 'q_AuditoryMemory',
    'q_Analogy_Answer', 'q_Analogy',
    'q_CARS_Answer', 'q_CARS',
    'helpEvaluation', 'helpAssessment', 'helpSkill',
    'assessmentResult', 'question', 'test', 'testCategory',
    'orderItem', 'order', 'cartItem', 'productReview', 'product', 'userPackage', 'package', 'address', 'otpCode',
    'fAQ', 'homeArticle', 'homeService', 'homeSlider', 'staticPage', 'onboarding', 'appSettings',
    'notificationTemplate', 'activityLog', 'emailTemplate', 'userCoupon', 'coupon',
    'report', 'pageContent', 'supportReply', 'supportTicket', 'notification', 'message',
    'payment', 'withdrawal', 'booking', 'article',
    'availability', 'sessionPrice', 'education', 'certificate',
    'experience', 'doctorSpecialty', 'child', 'doctor', 'user', 'admin', 'section'
  ];
  for (const table of tables) await prisma[table].deleteMany();
}

async function createActivity({ skillGroupId, type, levelOrder, imagePaths = [], audioPaths = [], correctImageIndex = null, matching = false, sequence = false }) {
  const activity = await prisma.activity.create({ data: { skillGroupId, type, levelOrder } });
  const images = [];
  const audios = [];
  for (let i = 0; i < imagePaths.length; i += 1) {
    images.push(await prisma.activityImage.create({ data: { activityId: activity.id, assetPath: imagePaths[i], sortOrder: i } }));
  }
  for (let i = 0; i < audioPaths.length; i += 1) {
    audios.push(await prisma.activityAudio.create({ data: { activityId: activity.id, assetPath: audioPaths[i], sortOrder: i } }));
  }
  if (correctImageIndex !== null && images[correctImageIndex]) {
    await prisma.activity.update({ where: { id: activity.id }, data: { correctImageId: images[correctImageIndex].id } });
  }
  if (matching) {
    for (let i = 0; i < Math.min(images.length, audios.length); i += 1) {
      await prisma.activityMatchPair.create({ data: { activityId: activity.id, imageId: images[i].id, audioId: audios[i].id } });
    }
  }
  if (sequence) {
    for (let i = 0; i < images.length; i += 1) {
      await prisma.activitySequenceItem.create({ data: { activityId: activity.id, imageId: images[i].id, position: i + 1 } });
    }
  }
  return activity;
}

async function main() {
  console.log('Starting extended Tawasoul seed...');
  await clearDb();

  const userPass = await bcrypt.hash('password123', 10);
  const adminPass = await bcrypt.hash('admin123456', 10);
  const doctorPass = await bcrypt.hash('doctor123456', 10);

  const admins = {
    super: await prisma.admin.create({ data: { name: 'Super Admin', email: 'admin@tawasoul.com', password: adminPass, role: 'SUPER_ADMIN' } }),
    content: await prisma.admin.create({ data: { name: 'Content Admin', email: 'content@tawasoul.com', password: adminPass, role: 'ADMIN' } }),
    support: await prisma.admin.create({ data: { name: 'Support Admin', email: 'support@tawasoul.com', password: adminPass, role: 'SUPPORT' } })
  };

  await prisma.appSettings.create({ data: {
    appName: 'تواصل', appNameEn: 'Tawasoul', logo: '/uploads/logo.png', logoMobile: '/uploads/logo-mobile.png',
    favicon: '/uploads/favicon.ico', primaryFont: 'Cairo', secondaryFont: 'Tajawal', primaryColor: '#14b8a6',
    secondaryColor: '#0f172a', allowedFileTypes: j(['jpg', 'png', 'pdf', 'mp3', 'mp4']), paymentGateway: 'Manual', emailService: 'SMTP'
  } });

  for (const [nameAr, nameEn, type] of [
    ['اضطرابات الكلام واللغة', 'Speech and Language Disorders', 'SPECIALTY'],
    ['تعديل السلوك', 'Behavior Modification', 'SPECIALTY'],
    ['صعوبات التعلم', 'Learning Difficulties', 'SPECIALTY'],
    ['تنمية المهارات', 'Skills Development', 'SPECIALTY'],
    ['اختبارات نفسية', 'Psychological Tests', 'SPECIALTY'],
    ['التقييم', 'Evaluation', 'WORK_AREA'],
    ['الجلسات الفردية', 'Individual Sessions', 'WORK_AREA'],
    ['الجلسات الجماعية', 'Group Sessions', 'WORK_AREA']
  ]) await prisma.section.create({ data: { nameAr, nameEn, type, image: `/uploads/sections/${nameEn.toLowerCase().replace(/\s+/g, '-')}.png` } });


  for (const type of ['WELCOME', 'VERIFICATION', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PASSWORD_RESET', 'PAYMENT_RECEIVED', 'WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED', 'DOCTOR_APPROVED', 'DOCTOR_REJECTED', 'SUPPORT_REPLY', 'ANNOUNCEMENT']) {
    await prisma.emailTemplate.create({ data: {
      name: `${type.toLowerCase()} template`, type, subject: `${type} Subject`, subjectAr: `عنوان ${type}`,
      body: `Hello {{name}} from ${type}.`, bodyAr: `مرحباً {{name}} من ${type}.`, variables: j(['name', 'email', 'link'])
    } });
  }

  await prisma.helpSkill.createMany({
    data: [
      { domain: 'COGNITIVE', skillNumber: '1', description: 'Matches two identical objects.', ageRange: '3.0-3.6' },
      { domain: 'FINE_MOTOR', skillNumber: '2', description: 'Uses pincer grasp to pick up small items.', ageRange: '3.0-3.6' },
      { domain: 'GROSS_MOTOR', skillNumber: '3', description: 'Jumps forward with both feet together.', ageRange: '3.6-4.0' },
      { domain: 'SOCIAL', skillNumber: '4', description: 'Initiates simple social interaction with peers.', ageRange: '4.0-4.6' }
    ]
  });

  for (const data of [
    { name: 'booking-confirmed', type: 'BOOKING_CONFIRMED', title: 'Booking confirmed', message: 'Your session is confirmed.' },
    { name: 'booking-cancelled', type: 'BOOKING_CANCELLED', title: 'Booking cancelled', message: 'Your session was cancelled.' },
    { name: 'new-message', type: 'NEW_MESSAGE', title: 'New message', message: 'You received a new message.' },
    { name: 'payment-received', type: 'PAYMENT_RECEIVED', title: 'Payment received', message: 'We received your payment.' }
  ]) await prisma.notificationTemplate.create({ data: { ...data, variables: j(['doctorName', 'senderName', 'orderNumber']) } });

  const users = [];
  const userSeeds = [
    ['Ahmed Mahmoud', 'ahmed.m', 'ahmed@tawasoul.com', '+201000000001', 'FATHER', 'ar'],
    ['Sara Ali', 'sara.ali', 'sara@tawasoul.com', '+201000000002', 'MOTHER', 'ar'],
    ['Mohamed Hassan', 'mohamed.h', 'mohamed@tawasoul.com', '+201000000003', 'UNCLE', 'en'],
    ['Fatma Ibrahim', 'fatma.i', 'fatma@tawasoul.com', '+201000000004', 'AUNT', 'ar'],
    ['Layla Khaled', 'layla.k', 'layla@tawasoul.com', '+201000000005', 'SISTER', 'en'],
    ['Youssef Adel', 'youssef.a', 'youssef@tawasoul.com', '+201000000006', 'BROTHER', 'ar']
  ];
  for (let i = 0; i < userSeeds.length; i += 1) {
    const [fullName, username, email, phone, relationType, language] = userSeeds[i];
    const user = await prisma.user.create({ data: {
      fullName, username, email, phone, password: userPass, relationType, language,
      allowPrivateMsg: i % 2 === 0, isAnonymous: i === 4, isPhoneVerified: i !== 5, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user-${i + 1}`
    } });
    users.push(user);
    await prisma.address.createMany({ data: [
      { userId: user.id, label: 'Home', fullAddress: `${10 + i} Family Street, Cairo, Egypt`, latitude: 30.04 + i * 0.01, longitude: 31.23 + i * 0.01, city: 'Cairo', country: 'Egypt', isDefault: true },
      { userId: user.id, label: 'Work', fullAddress: `${20 + i} Office Avenue, Giza, Egypt`, latitude: 30 + i * 0.01, longitude: 31.18 + i * 0.01, city: 'Giza', country: 'Egypt', isDefault: false }
    ] });
    await prisma.otpCode.createMany({ data: [
      { userId: user.id, phone, code: '12345', isUsed: true, expiresAt: plusDays(1) },
      { userId: user.id, phone, code: `90${i + 10}`, isUsed: false, expiresAt: plusDays(2) }
    ] });
  }

  const doctors = [];
  const doctorSeeds = [
    ['Dr. Mona Ahmed', 'mona@tawasoul.com', '+201100000001', 'Speech Therapy', 'Specialist in speech development.', true, true],
    ['Dr. Kareem Youssef', 'kareem@tawasoul.com', '+201100000002', 'Behavior Modification', 'Supports routines and regulation.', true, true],
    ['Dr. Reem Saeed', 'reem@tawasoul.com', '+201100000003', 'Skills Development', 'Builds learning readiness.', true, true],
    ['Dr. Hany Adel', 'hany@tawasoul.com', '+201100000004', 'Child Psychology', 'Offers assessments and counseling.', false, true]
  ];
  for (let i = 0; i < doctorSeeds.length; i += 1) {
    const [name, email, phone, specialization, bio, isFeatured, isVerified] = doctorSeeds[i];
    const doctor = await prisma.doctor.create({ data: {
      name, email, phone, password: doctorPass, specialization, bio, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=doctor-${i + 1}`,
      rating: 4.4 + i * 0.1, totalSessions: 30 + i * 15, totalRatings: 14 + i * 3, isVerified, isActive: true,
      isApproved: true, isFeatured, featuredOrder: isFeatured ? i + 1 : null, approvalNotes: 'Approved during seed setup.'
    } });
    doctors.push(doctor);
    await prisma.doctorSpecialty.createMany({ data: [
      { doctorId: doctor.id, specialty: specialization },
      { doctorId: doctor.id, specialty: i % 2 === 0 ? 'Online Sessions' : 'Parent Coaching' }
    ] });
    await prisma.education.create({ data: { doctorId: doctor.id, degree: i % 2 === 0 ? 'Master of Special Education' : 'Bachelor of Psychology', institution: i % 2 === 0 ? 'Cairo University' : 'Ain Shams University', startDate: new Date('2012-09-01'), endDate: new Date('2016-06-01') } });
    await prisma.experience.create({ data: { doctorId: doctor.id, title: 'Senior Therapist', workplace: i % 2 === 0 ? 'Tawasoul Center' : 'Hope Clinic', startDate: new Date('2018-01-01'), endDate: null, proofFile: `/uploads/doctors/experience-${i + 1}.pdf` } });
    await prisma.certificate.create({ data: { doctorId: doctor.id, title: 'Child Therapy Certification', issuer: 'Arab Board of Child Development', startDate: new Date('2019-03-01'), endDate: new Date('2024-03-01'), certificateLink: `https://example.com/certificates/${i + 1}` } });
    await prisma.sessionPrice.create({ data: {
      doctorId: doctor.id,
      duration: 60,
      price: 300 + i * 10
    } });
    for (let day = 0; day < 5; day += 1) await prisma.availability.create({ data: { doctorId: doctor.id, dayOfWeek: day, timeSlots: j(seedAvailabilitySlots), isActive: true } });
  }

  const children = [];
  for (const [i, seed] of [
    ['Yaseen', 'MALE', 4, 'AUTISM', 'UNDER_4'],
    ['Layan', 'FEMALE', 6, 'SPEECH_DISORDER', 'BETWEEN_5_15'],
    ['Omar', 'MALE', 7, 'LEARNING_DIFFICULTIES', 'BETWEEN_5_15'],
    ['Jana', 'FEMALE', 5, 'SKILLS_DEVELOPMENT', 'BETWEEN_5_15'],
    ['Hamza', 'MALE', 9, 'BEHAVIOR_MODIFICATION', 'BETWEEN_5_15'],
    ['Mariam', 'FEMALE', 3, 'OTHER', 'UNDER_4']
  ].entries()) {
    const [name, gender, age, status, ageGroup] = seed;
    children.push(await prisma.child.create({ data: {
      userId: users[i % users.length].id, name, gender, age, status, ageGroup,
      behavioralNotes: 'Responds best to visual prompts.', caseDescription: 'Needs structured practice.', caseHistory: 'Family reported early concerns.', profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=child-${i + 1}`
    } }));
  }

  for (const pageType of ['PRIVACY_POLICY', 'TERMS_AND_CONDITIONS', 'ABOUT_APP', 'COMMUNITY_GUIDELINES', 'HELP_CENTER']) {
    await prisma.pageContent.create({ data: { pageType, titleAr: `عنوان ${pageType}`, titleEn: pageType.replace(/_/g, ' '), contentAr: `محتوى ${pageType}.`, contentEn: `${pageType} content.`, lastUpdatedBy: admins.content.id } });
  }
  for (const [pageType, titleAr, titleEn] of [
    ['HOME_PAGE_1', 'الصفحة الرئيسية الأولى', 'Home Page 1'],
    ['HOME_PAGE_2', 'الصفحة الرئيسية الثانية', 'Home Page 2'],
    ['ABOUT_APP', 'عن التطبيق', 'About App'],
    ['FAQ', 'الأسئلة الشائعة', 'FAQ'],
    ['PRIVACY_POLICY', 'سياسة الخصوصية', 'Privacy Policy'],
    ['TERMS_AND_CONDITIONS', 'الشروط والأحكام', 'Terms and Conditions'],
    ['COMPANY_SECTOR', 'قطاع الشركة', 'Company Sector']
  ]) await prisma.staticPage.create({ data: {
    pageType, titleAr, titleEn, contentAr: `هذا محتوى ${titleAr}.`, contentEn: `This is ${titleEn}.`, image: `/uploads/pages/${pageType.toLowerCase()}.png`,
    sliderItems: j([{ title: `${titleEn} slide 1`, image: `/uploads/slides/${pageType.toLowerCase()}-1.png` }, { title: `${titleEn} slide 2`, image: `/uploads/slides/${pageType.toLowerCase()}-2.png` }])
  } });
  for (const [title, titleAr, platform, order] of [['Welcome to Tawasoul', 'مرحباً بك في تواصل', 'ALL', 1], ['Track your child progress', 'تابع تطور طفلك', 'MOBILE', 2], ['Book trusted specialists', 'احجز مع مختصين موثوقين', 'ALL', 3]]) {
    await prisma.onboarding.create({ data: { title, titleAr, description: `${title} description.`, descriptionAr: `وصف ${titleAr}.`, image: `/uploads/onboarding/${order}.png`, order, platform } });
  }
  for (const [index, [titleAr, titleEn]] of [['ابدأ الرحلة العلاجية', 'Start the journey'], ['جلسات مع أفضل المختصين', 'Top specialists'], ['أنشطة تعليمية تفاعلية', 'Interactive activities']].entries()) {
    await prisma.homeSlider.create({ data: { titleAr, titleEn, descriptionAr: `وصف ${titleAr}.`, descriptionEn: `${titleEn} description.`, image: `/uploads/home-slider/${index + 1}.png`, buttonText: 'Explore', buttonLink: '/services', order: index + 1 } });
  }
  for (const [index, [titleAr, titleEn]] of [['جلسات التخاطب', 'Speech sessions'], ['تعديل السلوك', 'Behavior support'], ['تقييمات الطفل', 'Child assessments']].entries()) {
    await prisma.homeService.create({ data: { titleAr, titleEn, descriptionAr: `وصف ${titleAr}.`, descriptionEn: `${titleEn} description.`, image: `/uploads/home-service/${index + 1}.png`, link: '/content', order: index + 1 } });
  }
  for (const [index, [titleAr, titleEn]] of [['نصائح للأهل', 'Tips for parents'], ['أنشطة منزلية', 'Home activities'], ['متى تحتاج إلى تقييم؟', 'When to assess?']].entries()) {
    await prisma.homeArticle.create({ data: { titleAr, titleEn, descriptionAr: `وصف ${titleAr}.`, descriptionEn: `${titleEn} description.`, image: `/uploads/home-article/${index + 1}.png`, link: '/content', order: index + 1 } });
  }
  for (const [questionAr, questionEn, order] of [['كيف أبدأ باستخدام التطبيق؟', 'How do I start using the app?', 1], ['كيف أحجز جلسة؟', 'How do I book a session?', 2], ['هل يمكنني تغيير الموعد؟', 'Can I reschedule?', 3], ['كيف أتابع تقدم طفلي؟', 'How do I track progress?', 4]]) {
    await prisma.fAQ.create({ data: { questionAr, questionEn, answerAr: `إجابة ${questionAr}`, answerEn: `Answer for ${questionEn}`, category: order <= 2 ? 'booking' : 'care', order } });
  }

  const packages = [];
  for (const data of [
    { name: 'Starter Package', nameAr: 'الباقة المبدئية', price: 900, sessionsCount: 4, durationMonths: 1, isFeatured: false },
    { name: 'Growth Package', nameAr: 'باقة التطور', price: 2400, sessionsCount: 12, durationMonths: 3, isFeatured: true },
    { name: 'Family Support Package', nameAr: 'باقة دعم الأسرة', price: 4200, sessionsCount: 24, durationMonths: 6, isFeatured: true }
  ]) packages.push(await prisma.package.create({ data: { ...data, description: `${data.name} for therapy.`, descriptionAr: `${data.nameAr} للجلسات.`, content: j({ sessions: data.sessionsCount, support: 'chat', reports: true }) } }));
  await prisma.userPackage.createMany({ data: [
    { userId: users[0].id, packageId: packages[1].id, status: 'ACTIVE', sessionsUsed: 3, sessionsRemaining: 9, startDate: plusDays(-20), endDate: plusMonths(2) },
    { userId: users[1].id, packageId: packages[0].id, status: 'EXPIRED', sessionsUsed: 4, sessionsRemaining: 0, startDate: plusDays(-80), endDate: plusDays(-10) },
    { userId: users[2].id, packageId: packages[2].id, status: 'ACTIVE', sessionsUsed: 6, sessionsRemaining: 18, startDate: plusDays(-15), endDate: plusMonths(5) }
  ] });

  const coupons = {
    all: await prisma.coupon.create({ data: { code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minAmount: 500, maxDiscount: 150, usageLimit: 200, usageLimitPerUser: 1, validFrom: plusDays(-7), validUntil: plusDays(60) } }),
    doctor: await prisma.coupon.create({ data: { code: 'DRMONA20', type: 'PERCENTAGE', value: 20, minAmount: 300, maxDiscount: 200, usageLimit: 100, usageLimitPerUser: 2, validFrom: plusDays(-5), validUntil: plusDays(45) } }),
    user: await prisma.coupon.create({ data: { code: 'VIP200', type: 'FIXED_AMOUNT', value: 200, minAmount: 800, usageLimit: 20, usageLimitPerUser: 1, validFrom: plusDays(-1), validUntil: plusDays(20) } })
  };
  await prisma.userCoupon.createMany({ data: [{ couponId: coupons.user.id, userId: users[0].id }, { couponId: coupons.user.id, userId: users[2].id }, { couponId: coupons.all.id, userId: users[1].id }] });

  const products = [];
  for (const data of [
    ['Sensory Flash Cards', 'بطاقات حسية', 'learning', 180, 220, 18, 40, true],
    ['Speech Practice Mirror', 'مرآة التخاطب', 'speech', 260, 320, 18, 25, true],
    ['Routine Planner Board', 'لوحة الروتين اليومي', 'behavior', 310, 360, 14, 15, false],
    ['Fine Motor Kit', 'حقيبة المهارات الدقيقة', 'skills', 420, null, null, 20, true]
  ]) {
    const [name, nameAr, category, price, before, discount, stock, featured] = data;
    products.push(await prisma.product.create({ data: {
      name, nameAr, category, price, priceBeforeDiscount: before, discount, stock, isFeatured: featured,
      description: `${name} helps children practice at home.`, descriptionAr: `${nameAr} يساعد الطفل على التدريب في المنزل.`,
      images: j([`/uploads/products/${name.toLowerCase().replace(/\s+/g, '-')}-1.png`, `/uploads/products/${name.toLowerCase().replace(/\s+/g, '-')}-2.png`]),
      rating: 4.5, totalRatings: 8
    } }));
  }
  await prisma.productReview.createMany({ data: [
    { productId: products[0].id, userId: users[0].id, rating: 5, comment: 'Very useful for quick exercises.' },
    { productId: products[1].id, userId: users[1].id, rating: 4, comment: 'Good quality and easy to use.' },
    { productId: products[2].id, userId: users[2].id, rating: 5, comment: 'Helped with daily routine practice.' },
    { productId: products[3].id, userId: users[3].id, rating: 4, comment: 'My child enjoyed the activities.' }
  ] });
  await prisma.cartItem.createMany({ data: [
    { userId: users[0].id, productId: products[0].id, quantity: 2 },
    { userId: users[0].id, productId: products[2].id, quantity: 1 },
    { userId: users[1].id, productId: products[1].id, quantity: 1 },
    { userId: users[2].id, productId: products[3].id, quantity: 1 }
  ] });

  const addresses = await prisma.address.findMany({ where: { isDefault: true }, orderBy: { createdAt: 'asc' } });
  for (let i = 0; i < 3; i += 1) {
    const productA = products[i];
    const productB = products[(i + 1) % products.length];
    const subtotal = productA.price + productB.price;
    const order = await prisma.order.create({ data: {
      userId: users[i].id, addressId: addresses[i].id, orderNumber: `ORD-2026-00${i + 1}`, subtotal, total: subtotal - 50,
      status: i === 0 ? 'DELIVERED' : i === 1 ? 'PROCESSING' : 'PENDING', paymentMethod: i === 2 ? 'FAWRY' : 'INSTAPAY',
      paymentStatus: i === 0 ? 'COMPLETED' : 'PENDING', transactionId: i === 0 ? `txn-order-${i + 1}` : null
    } });
    await prisma.orderItem.createMany({ data: [
      { orderId: order.id, productId: productA.id, quantity: 1, price: productA.price },
      { orderId: order.id, productId: productB.id, quantity: 1, price: productB.price }
    ] });
  }

  const testCategories = {
    auditory: await prisma.testCategory.create({ data: { name: 'Auditory Assessments', nameAr: 'اختبارات سمعية' } }),
    visual: await prisma.testCategory.create({ data: { name: 'Visual Assessments', nameAr: 'اختبارات بصرية' } }),
    speech: await prisma.testCategory.create({ data: { name: 'Speech Practice', nameAr: 'اختبارات النطق' } }),
    developmental: await prisma.testCategory.create({ data: { name: 'Developmental Assessments', nameAr: 'التقييمات النمائية' } })
  };
  const tests = [
    await prisma.test.create({ data: { title: 'Sound Discrimination', titleAr: 'تمييز الأصوات', testCategoryId: testCategories.auditory.id, type: 'AUDITORY', testType: 'SOUND_DISCRIMINATION', description: 'Evaluate sound recognition.', questions: { create: [
      { orderIndex: 1, audioAssetPath: 'assets/audio/tests/bird.mp3', imageAssetPath: 'assets/images/tests/bird.png', choices: [{ text: 'Bird', isCorrect: true }, { text: 'Car', isCorrect: false }], scoringGuide: 'Score for correct sound match.', maxScore: 10 },
      { orderIndex: 2, audioAssetPath: 'assets/audio/tests/doorbell.mp3', imageAssetPath: 'assets/images/tests/doorbell.png', choices: [{ text: 'Doorbell', isCorrect: true }, { text: 'Drum', isCorrect: false }], scoringGuide: 'Score for speed and accuracy.', maxScore: 10 }
    ] } }, include: { questions: true } }),
    await prisma.test.create({ data: { title: 'Pronunciation and Repetition', titleAr: 'النطق والتكرار', testCategoryId: testCategories.speech.id, type: 'AUDITORY', testType: 'PRONUNCIATION_REPETITION', description: 'Observe pronunciation.', questions: { create: [
      { orderIndex: 1, audioAssetPath: 'assets/audio/tests/banana.mp3', scoringGuide: 'Assess articulation.', maxScore: 10 },
      { orderIndex: 2, audioAssetPath: 'assets/audio/tests/sentence.mp3', scoringGuide: 'Assess clarity.', maxScore: 10 }
    ] } }, include: { questions: true } }),
    await prisma.test.create({ data: { title: 'Sound and Image Linking', titleAr: 'ربط الصوت بالصورة', testCategoryId: testCategories.auditory.id, type: 'AUDITORY', testType: 'SOUND_IMAGE_LINKING', description: 'Match sounds to images.', questions: { create: [
      { orderIndex: 1, audioAssetPath: 'assets/audio/tests/cat.mp3', imageAssetPath: 'assets/images/tests/cat.png', choices: [{ text: 'Cat', imagePath: 'assets/images/tests/cat.png', isCorrect: true }, { text: 'Dog', imagePath: 'assets/images/tests/dog.png', isCorrect: false }], scoringGuide: 'Choose the matching image.', maxScore: 10 }
    ] } }, include: { questions: true } }),
    await prisma.test.create({ data: { title: 'Visual Sequence Ordering', titleAr: 'التسلسل والترتيب', testCategoryId: testCategories.visual.id, type: 'VISUAL', testType: 'SEQUENCE_ORDER', description: 'Arrange story cards.', questions: { create: [
      { orderIndex: 1, imageAssetPath: 'assets/images/tests/sequence-1.png', scoringGuide: 'Score sequence correctness.', maxScore: 10 },
      { orderIndex: 2, imageAssetPath: 'assets/images/tests/sequence-2.png', scoringGuide: 'Observe attention and ordering.', maxScore: 10 }
    ] } }, include: { questions: true } }),
    await prisma.test.create({ data: { title: 'HELP Developmental Assessment', titleAr: 'تقييم HELP النمائي', testCategoryId: testCategories.developmental.id, type: 'VISUAL', testType: 'HELP', description: 'Doctor-led developmental assessment using HELP skills.' } })
  ];
  for (let i = 0; i < children.length; i += 1) {
    for (let t = 0; t < tests.length; t += 1) {
      if (!tests[t].questions?.length) continue;
      await prisma.assessmentResult.create({ data: { childId: children[i].id, questionId: tests[t].questions[0].id, scoreGiven: 6 + ((i + t) % 5), sessionId: `assessment-${i + 1}-${t + 1}`, timestamp: plusDays(-(3 + i + t)) } });
    }
  }

  const activityCategories = {
    listening: await prisma.activityCategory.create({ data: { name: 'Listening Skills' } }),
    sequencing: await prisma.activityCategory.create({ data: { name: 'Sequencing Skills' } })
  };
  const skillGroups = {
    animals: await prisma.skillGroup.create({ data: { categoryId: activityCategories.listening.id, name: 'Animal Sounds' } }),
    routine: await prisma.skillGroup.create({ data: { categoryId: activityCategories.sequencing.id, name: 'Daily Routine' } }),
    words: await prisma.skillGroup.create({ data: { categoryId: activityCategories.listening.id, name: 'Word Matching' } })
  };
  const activities = [
    await createActivity({ skillGroupId: skillGroups.animals.id, type: 'LISTEN_CHOOSE_IMAGE', levelOrder: 1, imagePaths: ['assets/mahara/animals/cat.png', 'assets/mahara/animals/dog.png', 'assets/mahara/animals/bird.png'], audioPaths: ['assets/mahara/animals/cat.mp3'], correctImageIndex: 0 }),
    await createActivity({ skillGroupId: skillGroups.words.id, type: 'MATCHING', levelOrder: 1, imagePaths: ['assets/mahara/objects/apple.png', 'assets/mahara/objects/car.png', 'assets/mahara/objects/ball.png'], audioPaths: ['assets/mahara/objects/apple.mp3', 'assets/mahara/objects/car.mp3', 'assets/mahara/objects/ball.mp3'], matching: true }),
    await createActivity({ skillGroupId: skillGroups.routine.id, type: 'SEQUENCE_ORDER', levelOrder: 1, imagePaths: ['assets/mahara/routine/wake-up.png', 'assets/mahara/routine/brush.png', 'assets/mahara/routine/breakfast.png'], sequence: true }),
    await createActivity({ skillGroupId: skillGroups.animals.id, type: 'LISTEN_WATCH', levelOrder: 2, imagePaths: ['assets/mahara/animals/horse.png'], audioPaths: ['assets/mahara/animals/horse.mp3'], correctImageIndex: 0 }),
    await createActivity({ skillGroupId: skillGroups.words.id, type: 'AUDIO_ASSOCIATION', levelOrder: 2, imagePaths: ['assets/mahara/association/red.png', 'assets/mahara/association/blue.png'], audioPaths: ['assets/mahara/association/red.mp3', 'assets/mahara/association/blue.mp3'], matching: true })
  ];
  for (let i = 0; i < children.length; i += 1) {
    for (let a = 0; a < activities.length; a += 1) {
      await prisma.childActivityProgress.create({ data: { childId: children[i].id, activityId: activities[a].id, completed: (i + a) % 2 === 0, completedAt: (i + a) % 2 === 0 ? plusDays(-(i + a)) : null } });
    }
  }

  const bookings = [];
  for (let i = 0; i < 12; i += 1) {
    const status = i < 4 ? 'COMPLETED' : i < 8 ? 'CONFIRMED' : i < 10 ? 'PENDING' : 'CANCELLED';
    const slotTime = seedAvailabilitySlots[i % seedAvailabilitySlots.length];
    const scheduledAt = buildSeedSlotDate({
      dayOfWeek: i % 5,
      time: slotTime,
      direction: status === 'COMPLETED' ? 'past' : 'future',
      extraWeeks: Math.floor(i / 5)
    });
    bookings.push(await prisma.booking.create({ data: {
      userId: users[i % users.length].id, doctorId: doctors[i % doctors.length].id, childId: children[i % children.length].id,
      sessionType: i % 3 === 0 ? 'VIDEO' : i % 3 === 1 ? 'AUDIO' : 'TEXT', category: i % 4 === 0 ? 'EVALUATION' : 'INDIVIDUAL',
      duration: 60, price: 300 + (i % doctors.length) * 10, status, scheduledAt, scheduledMonth: scheduledAt.getMonth() + 1,
      scheduledDay: scheduledAt.getDate(), scheduledTime: formatSeedTime(slotTime), notes: 'Seeded booking for testing.',
      completedAt: status === 'COMPLETED' ? new Date(scheduledAt.getTime() + 60 * 60000) : null, cancelledAt: status === 'CANCELLED' ? plusDays(-1) : null,
      cancellationReason: status === 'CANCELLED' ? 'Family requested a new schedule.' : null, rating: status === 'COMPLETED' ? 4 + (i % 2) : null,
      review: status === 'COMPLETED' ? 'Supportive session with clear guidance.' : null, videoLink: i % 3 !== 2 ? `https://meet.google.com/room-${i + 1}` : null
    } }));
  }
  for (const booking of bookings.slice(0, 8).filter((b) => b.status !== 'CANCELLED')) {
    await prisma.payment.create({ data: { bookingId: booking.id, doctorId: booking.doctorId, amount: booking.price, method: booking.status === 'COMPLETED' ? 'INSTAPAY' : 'FAWRY', status: booking.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING', transactionId: booking.status === 'COMPLETED' ? `txn-booking-${booking.id.slice(0, 8)}` : null } });
  }
  for (let i = 0; i < doctors.length; i += 1) {
    await prisma.withdrawal.create({ data: {
      doctorId: doctors[i].id, amount: 800 + i * 150, method: i % 2 === 0 ? 'VODAFONE_CASH' : 'BANK_ACCOUNT',
      accountDetails: i % 2 === 0 ? '01055550000' : j({ bank: 'Banque Misr', iban: `EG00BANK${i + 100}` }),
      status: i === 0 ? 'PENDING' : i === 1 ? 'PROCESSING' : i === 2 ? 'COMPLETED' : 'REJECTED',
      processedAt: i >= 2 ? plusDays(-i) : null
    } });
    await prisma.article.create({ data: {
      title: `Practical advice article ${i + 1}`, content: 'This seeded article helps test listings and details.', excerpt: 'Short article summary.', authorId: doctors[i].id,
      views: 120 + i * 40, likes: 18 + i * 5, comments: 6 + i, isRecommended: i % 2 === 0, isFeatured: i < 2, featuredOrder: i < 2 ? i + 1 : null
    } });
  }

  await prisma.message.createMany({ data: [
    { senderId: users[0].id, receiverId: users[1].id, content: 'Have you tried the new sensory cards yet?', messageType: 'TEXT', isRead: true },
    { senderId: users[1].id, receiverId: users[0].id, content: 'Yes, they worked well during practice time.', messageType: 'TEXT', isRead: true },
    { senderId: users[2].id, receiverId: users[3].id, imageUrl: '/uploads/messages/example-image.png', messageType: 'IMAGE', isRead: false },
    { senderId: users[4].id, receiverId: users[5].id, voiceUrl: '/uploads/messages/example-voice.mp3', voiceDuration: 22, messageType: 'VOICE', isRead: false }
  ] });
  for (const [i, user] of users.entries()) {
    await prisma.notification.createMany({ data: [
      { userId: user.id, type: 'BOOKING_CONFIRMED', title: 'Booking confirmed', message: 'Your upcoming session has been confirmed.', isRead: i % 2 === 0, data: j({ bookingId: bookings[i].id }) },
      { userId: user.id, type: 'NEW_MESSAGE', title: 'New message', message: 'You have a new message in your inbox.', isRead: false, data: j({ conversationWith: users[(i + 1) % users.length].id }) }
    ] });
  }

  const supportTickets = [
    await prisma.supportTicket.create({ data: { userId: users[0].id, subject: 'Need help with rescheduling', message: 'I need to move the booking to another day.', status: 'IN_PROGRESS', priority: 'HIGH', assignedTo: admins.support.id } }),
    await prisma.supportTicket.create({ data: { doctorId: doctors[1].id, subject: 'Withdrawal delay inquiry', message: 'Please review my payout request status.', status: 'OPEN', priority: 'MEDIUM', assignedTo: admins.support.id } }),
    await prisma.supportTicket.create({ data: { userId: users[3].id, subject: 'Package sessions not updated', message: 'My remaining sessions count looks incorrect.', status: 'RESOLVED', priority: 'URGENT', assignedTo: admins.support.id } })
  ];
  await prisma.supportReply.createMany({ data: [
    { ticketId: supportTickets[0].id, adminId: admins.support.id, message: 'We are checking available slots.', isInternal: false },
    { ticketId: supportTickets[1].id, doctorId: doctors[1].id, message: 'I attached the payout reference in the dashboard.', isInternal: false },
    { ticketId: supportTickets[2].id, adminId: admins.support.id, message: 'Sessions have been recalculated and corrected.', isInternal: true }
  ] });
  await prisma.report.createMany({ data: [
    { type: 'BOOKINGS', name: 'Weekly bookings overview', description: 'Snapshot of booking performance.', format: 'JSON', filters: j({ from: plusDays(-7), to: now }), generatedBy: admins.super.id, filePath: '/reports/bookings-weekly.json', fileUrl: 'https://example.com/reports/bookings-weekly.json', status: 'COMPLETED', startedAt: plusDays(-1), completedAt: now },
    { type: 'REVENUE', name: 'Revenue export', description: 'Monthly revenue report.', format: 'CSV', filters: j({ month: '2026-03' }), generatedBy: admins.super.id, filePath: '/reports/revenue-march.csv', fileUrl: 'https://example.com/reports/revenue-march.csv', status: 'PROCESSING', startedAt: plusDays(-2) },
    { type: 'SUPPORT_TICKETS', name: 'Support queue audit', description: 'Support response time review.', format: 'PDF', filters: j({ priority: 'HIGH' }), generatedBy: admins.content.id, status: 'FAILED', startedAt: plusDays(-3), error: 'Source export was interrupted.' }
  ] });
  await prisma.activityLog.createMany({ data: [
    { adminId: admins.super.id, action: 'CREATE', entityType: 'Doctor', entityId: doctors[0].id, description: 'Created initial featured doctor profile.', changes: j({ created: true }), ipAddress: '127.0.0.1', userAgent: 'seed-script' },
    { adminId: admins.content.id, action: 'UPDATE', entityType: 'PageContent', entityId: null, description: 'Updated onboarding and FAQ content.', changes: j({ sections: ['onboarding', 'faq'] }), ipAddress: '127.0.0.1', userAgent: 'seed-script' },
    { adminId: admins.support.id, action: 'ASSIGN', entityType: 'SupportTicket', entityId: supportTickets[0].id, description: 'Assigned support ticket to support queue.', changes: j({ assignedTo: admins.support.id }), ipAddress: '127.0.0.1', userAgent: 'seed-script' },
    { adminId: admins.super.id, action: 'GENERATE', entityType: 'Report', entityId: null, description: 'Triggered revenue report generation.', changes: j({ report: 'Revenue export' }), ipAddress: '127.0.0.1', userAgent: 'seed-script' }
  ] });

  console.log('Seed completed.');
  console.log('Admin login: admin@tawasoul.com / admin123456');
  console.log('Doctor login: mona@tawasoul.com / doctor123456');
  console.log('User login: ahmed@tawasoul.com / password123');
}

main().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
