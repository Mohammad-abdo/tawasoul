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
    'q_SequenceOrder_Answer', 'q_SequenceOrder_Image', 'q_SequenceOrder',
    'q_Analogy_Answer', 'q_Analogy',
    'q_CARS_Answer', 'q_CARS',
    'helpEvaluation', 'helpAssessment', 'helpSkill',
    'assessmentResult', 'question', 'test',
    'orderItem', 'order', 'cartItem', 'productReview', 'product', 'productCategory', 'userPackage', 'package', 'address', 'otpCode',
    'fAQ', 'homeArticle', 'homeService', 'homeSlider', 'staticPage', 'onboarding', 'appSettings',
    'notificationTemplate', 'emailTemplate', 'userCoupon', 'coupon',
    'report', 'pageContent', 'supportReply', 'supportTicket', 'notification', 'message',
    'payment', 'withdrawal', 'booking', 'article',
    'availability', 'education', 'certificate',
    'experience', 'doctorSpecialty', 'child', 'doctor', 'user', 'admin'
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

  for (const type of ['WELCOME', 'VERIFICATION', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PASSWORD_RESET', 'PAYMENT_RECEIVED', 'WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED', 'DOCTOR_APPROVED', 'DOCTOR_REJECTED', 'SUPPORT_REPLY', 'ANNOUNCEMENT']) {
    await prisma.emailTemplate.create({ data: {
      name: `${type.toLowerCase()} template`, type, subject: `${type} Subject`, subjectAr: `عنوان ${type}`,
      body: `Hello {{name}} from ${type}.`, bodyAr: `مرحباً {{name}} من ${type}.`, variables: j(['name', 'email', 'link'])
    } });
  }

  const helpSkills = [];
  for (const data of [
    { domain: 'COGNITIVE', skillNumber: '1', description: 'Matches two identical objects.', ageRange: '3.0-3.6' },
    { domain: 'COGNITIVE', skillNumber: '2', description: 'Points to named pictures in a book.', ageRange: '3.0-3.6' },
    { domain: 'COGNITIVE', skillNumber: '3', description: 'Sorts objects by color or shape.', ageRange: '3.6-4.0' },
    { domain: 'FINE_MOTOR', skillNumber: '4', description: 'Uses pincer grasp to pick up small items.', ageRange: '3.0-3.6' },
    { domain: 'FINE_MOTOR', skillNumber: '5', description: 'Strings large beads onto a lace.', ageRange: '3.6-4.0' },
    { domain: 'GROSS_MOTOR', skillNumber: '6', description: 'Jumps forward with both feet together.', ageRange: '3.6-4.0' },
    { domain: 'GROSS_MOTOR', skillNumber: '7', description: 'Stands on one foot for 3 seconds.', ageRange: '4.0-4.6' },
    { domain: 'SOCIAL', skillNumber: '8', description: 'Initiates simple social interaction with peers.', ageRange: '4.0-4.6' },
    { domain: 'SOCIAL', skillNumber: '9', description: 'Takes turns in a simple game with adult support.', ageRange: '3.6-4.0' }
  ]) {
    helpSkills.push(await prisma.helpSkill.create({ data }));
  }

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
      name, email, phone, password: doctorPass, bio, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=doctor-${i + 1}`,
      rating: 4.4 + i * 0.1, totalSessions: 30 + i * 15, totalRatings: 14 + i * 3, isVerified, isActive: true,
      isApproved: true, isFeatured, featuredOrder: isFeatured ? i + 1 : 10 + i, approvalNotes: 'Approved during seed setup.'
    } });
    doctors.push(doctor);
    await prisma.doctorSpecialty.createMany({ data: [
      { doctorId: doctor.id, specialty: specialization },
      { doctorId: doctor.id, specialty: i % 2 === 0 ? 'Online Sessions' : 'Parent Coaching' }
    ] });
    await prisma.education.create({ data: { doctorId: doctor.id, degree: i % 2 === 0 ? 'Master of Special Education' : 'Bachelor of Psychology', institution: i % 2 === 0 ? 'Cairo University' : 'Ain Shams University', startDate: new Date('2012-09-01'), endDate: new Date('2016-06-01') } });
    await prisma.experience.create({ data: { doctorId: doctor.id, title: 'Senior Therapist', workplace: i % 2 === 0 ? 'Tawasoul Center' : 'Hope Clinic', startDate: new Date('2018-01-01'), endDate: new Date(`202${2 + i}-12-31`), proofFile: `/uploads/doctors/experience-${i + 1}.pdf` } });
    await prisma.certificate.create({ data: { doctorId: doctor.id, title: 'Child Therapy Certification', issuer: 'Arab Board of Child Development', startDate: new Date('2019-03-01'), endDate: new Date('2024-03-01'), certificateLink: `https://media.tawasoul.app/certificates/doctor-${i + 1}.pdf` } });
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

  const productCategories = {
    learning: await prisma.productCategory.create({ data: { name: 'learning', nameAr: 'Learning' } }),
    speech: await prisma.productCategory.create({ data: { name: 'speech', nameAr: 'Speech' } }),
    behavior: await prisma.productCategory.create({ data: { name: 'behavior', nameAr: 'Behavior' } }),
    skills: await prisma.productCategory.create({ data: { name: 'skills', nameAr: 'Skills' } })
  };

  const products = [];
  for (const data of [
    ['Sensory Flash Cards', 'بطاقات حسية', 'learning', 180, 220, 18, 40, true],
    ['Speech Practice Mirror', 'مرآة التخاطب', 'speech', 260, 320, 18, 25, true],
    ['Routine Planner Board', 'لوحة الروتين اليومي', 'behavior', 310, 360, 14, 15, false],
    ['Fine Motor Kit', 'حقيبة المهارات الدقيقة', 'skills', 420, 495, 15, 20, true]
  ]) {
    const [name, nameAr, category, price, before, discount, stock, featured] = data;
    products.push(await prisma.product.create({ data: {
      name, nameAr, categoryId: productCategories[category].id, price, priceBeforeDiscount: before, discount, stock, isFeatured: featured,
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
      paymentStatus: i === 0 ? 'COMPLETED' : 'PENDING', transactionId: i === 0 ? `txn-order-${i + 1}` : `txn-order-init-${i + 1}`
    } });
    await prisma.orderItem.createMany({ data: [
      { orderId: order.id, productId: productA.id, quantity: 1, price: productA.price },
      { orderId: order.id, productId: productB.id, quantity: 1, price: productB.price }
    ] });
  }

  // ─── Tests ────────────────────────────────────────────────────────────────────
  const tests = [
    await prisma.test.create({ data: { title: 'HELP Developmental Assessment', titleAr: 'HELP Developmental Assessment', type: 'VISUAL', testType: 'HELP', description: 'Doctor-led developmental assessment using HELP skills.' } }),
    await prisma.test.create({ data: { title: 'CARS Autism Rating Scale', titleAr: 'CARS Autism Rating Scale', type: 'VISUAL', testType: 'CARS', description: 'Childhood Autism Rating Scale assessment.' } }),
    await prisma.test.create({ data: { title: 'Visual Analogy Test', titleAr: 'Visual Analogy Test', type: 'VISUAL', testType: 'ANALOGY', description: 'Assess visual reasoning through analogies.' } }),
    await prisma.test.create({ data: { title: 'Visual Memory Assessment', titleAr: 'Visual Memory Assessment', type: 'VISUAL', testType: 'VISUAL_MEMORY', description: 'Evaluate short-term visual memory.' } }),
    await prisma.test.create({ data: { title: 'Auditory Memory Assessment', titleAr: 'Auditory Memory Assessment', type: 'AUDITORY', testType: 'AUDITORY_MEMORY', description: 'Evaluate auditory recall and sequence memory.' } }),
    await prisma.test.create({ data: { title: 'Image Sequence Order Assessment', titleAr: 'Image Sequence Order Assessment', type: 'VISUAL', testType: 'IMAGE_SEQUENCE_ORDER', description: 'Arrange image cards into the correct order.' } })
  ];

  const helpTest = tests.find((test) => test.testType === 'HELP');
  const carsTest = tests.find((test) => test.testType === 'CARS');
  const analogyTest = tests.find((test) => test.testType === 'ANALOGY');
  const visualMemoryTest = tests.find((test) => test.testType === 'VISUAL_MEMORY');
  const auditoryMemoryTest = tests.find((test) => test.testType === 'AUDITORY_MEMORY');
  const imageSequenceOrderTest = tests.find((test) => test.testType === 'IMAGE_SEQUENCE_ORDER');

  // Q_CARS
  const carsQuestions = [];
  const carsQuestionSeeds = [
    {
      order: 1,
      questionText: { ar: 'العلاقات مع الناس', en: 'Relating to People' },
      choices: [
        { score: 1, ar: 'لا توجد صعوبة', en: 'No difficulty' },
        { score: 2, ar: 'صعوبة خفيفة', en: 'Mild difficulty' },
        { score: 3, ar: 'صعوبة متوسطة', en: 'Moderate difficulty' },
        { score: 4, ar: 'صعوبة شديدة', en: 'Severe difficulty' }
      ]
    },
    {
      order: 2,
      questionText: { ar: 'التقليد', en: 'Imitation' },
      choices: [
        { score: 1, ar: 'تقليد مناسب للعمر', en: 'Age-appropriate imitation' },
        { score: 2, ar: 'تقليد خفيف القصور', en: 'Mildly abnormal imitation' },
        { score: 3, ar: 'تقليد متوسط القصور', en: 'Moderately abnormal imitation' },
        { score: 4, ar: 'تقليد شديد القصور', en: 'Severely abnormal imitation' }
      ]
    },
    {
      order: 3,
      questionText: { ar: 'الاستجابة العاطفية', en: 'Emotional Response' },
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
    }
  ];
  for (const seed of carsQuestionSeeds) {
    carsQuestions.push(await prisma.q_CARS.create({ data: { testId: carsTest.id, order: seed.order, questionText: seed.questionText, choices: seed.choices } }));
  }

  // AssessmentResults for CARS + answers
  for (let i = 0; i < 3; i += 1) {
    const carsResult = await prisma.assessmentResult.create({ data: {
      childId: children[i].id, testId: carsTest.id,
      totalScore: 18 + i * 3, maxScore: 60,
      sessionId: `cars-session-${i + 1}`, timestamp: plusDays(-(5 + i))
    } });
    for (const q of carsQuestions) {
      const chosenIndex = (i + q.order) % 4;
      await prisma.q_CARS_Answer.create({ data: {
        resultId: carsResult.id, questionId: q.id,
        chosenIndex, score: chosenIndex + 1
      } });
    }
  }

  // ─── Q_Analogy ────────────────────────────────────────────────────────────────
  const analogyQuestions = [];
  const analogySeeds = [
    {
      order: 1,
      questionImageUrl: 'assets/images/analogy/q1-stem.png',
      correctIndex: 2,
      choices: [
        { imagePath: 'assets/images/analogy/q1-choice-0.png' },
        { imagePath: 'assets/images/analogy/q1-choice-1.png' },
        { imagePath: 'assets/images/analogy/q1-choice-2.png' },
        { imagePath: 'assets/images/analogy/q1-choice-3.png' }
      ]
    },
    {
      order: 2,
      questionImageUrl: 'assets/images/analogy/q2-stem.png',
      correctIndex: 0,
      choices: [
        { imagePath: 'assets/images/analogy/q2-choice-0.png' },
        { imagePath: 'assets/images/analogy/q2-choice-1.png' },
        { imagePath: 'assets/images/analogy/q2-choice-2.png' },
        { imagePath: 'assets/images/analogy/q2-choice-3.png' }
      ]
    },
    {
      order: 3,
      questionImageUrl: 'assets/images/analogy/q3-stem.png',
      correctIndex: 1,
      choices: [
        { imagePath: 'assets/images/analogy/q3-choice-0.png' },
        { imagePath: 'assets/images/analogy/q3-choice-1.png' },
        { imagePath: 'assets/images/analogy/q3-choice-2.png' },
        { imagePath: 'assets/images/analogy/q3-choice-3.png' }
      ]
    }
  ];
  for (const seed of analogySeeds) {
    analogyQuestions.push(await prisma.q_Analogy.create({ data: {
      testId: analogyTest.id, order: seed.order,
      questionImageUrl: seed.questionImageUrl, choices: seed.choices, correctIndex: seed.correctIndex
    } }));
  }

  // AssessmentResults for Analogy + answers
  for (let i = 0; i < 3; i += 1) {
    const analogyResult = await prisma.assessmentResult.create({ data: {
      childId: children[i + 1].id, testId: analogyTest.id,
      totalScore: 2 + i, maxScore: analogyQuestions.length,
      sessionId: `analogy-session-${i + 1}`, timestamp: plusDays(-(4 + i))
    } });
    for (const q of analogyQuestions) {
      const chosenIndex = (i + q.order - 1) % 4;
      const isCorrect = chosenIndex === q.correctIndex;
      await prisma.q_Analogy_Answer.create({ data: {
        resultId: analogyResult.id, questionId: q.id,
        chosenIndex, score: isCorrect ? 1 : 0
      } });
    }
  }

  // ─── Q_VisualMemory ───────────────────────────────────────────────────────────
  const visualMemoryBatches = [];

  const vmBatchSeeds = [
    { order: 1, imageUrl: 'assets/images/visual-memory/scene-1.png', displaySeconds: 5 },
    { order: 2, imageUrl: 'assets/images/visual-memory/scene-2.png', displaySeconds: 5 }
  ];
  for (const batchSeed of vmBatchSeeds) {
    const batch = await prisma.q_VisualMemory_Batch.create({ data: { testId: visualMemoryTest.id, ...batchSeed } });
    // Each batch gets 2 questions: one YES_NO and one MCQ
    await prisma.q_VisualMemory.create({ data: {
      batchId: batch.id, order: 1,
      questionText: { ar: 'هل كان هناك قطة في الصورة؟', en: 'Was there a cat in the image?' },
      questionType: 'YES_NO', correctBool: batchSeed.order === 1
    } });
    await prisma.q_VisualMemory.create({ data: {
      batchId: batch.id, order: 2,
      questionText: { ar: 'كم عدد الأشياء التي رأيتها؟', en: 'How many objects did you see?' },
      questionType: 'MCQ',
      choices: [{ text: '2' }, { text: '3' }, { text: '4' }, { text: '5' }],
      correctIndex: batchSeed.order === 1 ? 1 : 2
    } });
    visualMemoryBatches.push(batch);
  }

  // AssessmentResults for Visual Memory + answers
  for (let i = 0; i < 2; i += 1) {
    const vmResult = await prisma.assessmentResult.create({ data: {
      childId: children[i].id, testId: visualMemoryTest.id,
      totalScore: 3 + i, maxScore: 4,
      sessionId: `vm-session-${i + 1}`, timestamp: plusDays(-(6 + i))
    } });
    for (const batch of visualMemoryBatches) {
      const vmQuestions = await prisma.q_VisualMemory.findMany({ where: { batchId: batch.id } });
      for (const vmQ of vmQuestions) {
        if (vmQ.questionType === 'YES_NO') {
          const answerBool = i % 2 === 0 ? vmQ.correctBool : !vmQ.correctBool;
          await prisma.q_VisualMemory_Answer.create({ data: {
            resultId: vmResult.id, questionId: vmQ.id,
            answerBool, score: answerBool === vmQ.correctBool ? 1 : 0
          } });
        } else {
          const chosenIndex = i === 0 ? vmQ.correctIndex : (vmQ.correctIndex + 1) % 4;
          await prisma.q_VisualMemory_Answer.create({ data: {
            resultId: vmResult.id, questionId: vmQ.id,
            chosenIndex, score: chosenIndex === vmQ.correctIndex ? 1 : 0
          } });
        }
      }
    }
  }

  // ─── Q_AuditoryMemory ─────────────────────────────────────────────────────────
  const auditoryMemoryQuestions = [];

  const amSeeds = [
    {
      order: 1,
      audioClipUrl: 'assets/audio/memory/sequence-1.mp3',
      questionText: { ar: 'ما هي الكلمات التي سمعتها؟', en: 'What words did you hear?' },
      modelAnswer: { items: ['apple', 'car', 'ball'], order: true }
    },
    {
      order: 2,
      audioClipUrl: 'assets/audio/memory/sequence-2.mp3',
      questionText: { ar: 'رتّب ما سمعته بالترتيب الصحيح', en: 'Arrange what you heard in order' },
      modelAnswer: { items: ['cat', 'tree', 'house', 'moon'], order: true }
    },
    {
      order: 3,
      audioClipUrl: 'assets/audio/memory/sequence-3.mp3',
      questionText: { ar: 'اذكر الأرقام التي سمعتها', en: 'Recall the numbers you heard' },
      modelAnswer: { items: ['3', '7', '1', '9', '5'], order: false }
    }
  ];
  for (const seed of amSeeds) {
    auditoryMemoryQuestions.push(await prisma.q_AuditoryMemory.create({ data: {
      testId: auditoryMemoryTest.id, order: seed.order,
      audioClipUrl: seed.audioClipUrl, questionText: seed.questionText, modelAnswer: seed.modelAnswer
    } }));
  }

  // AssessmentResults for Auditory Memory + answers
  for (let i = 0; i < 3; i += 1) {
    const amResult = await prisma.assessmentResult.create({ data: {
      childId: children[i + 2].id, testId: auditoryMemoryTest.id,
      totalScore: 5 + i, maxScore: auditoryMemoryQuestions.length * 3,
      sessionId: `am-session-${i + 1}`, timestamp: plusDays(-(7 + i))
    } });
    for (const amQ of auditoryMemoryQuestions) {
      const modelItems = amQ.modelAnswer.items;
      // Simulate child recalling some items correctly
      const recalledItems = modelItems.slice(0, Math.max(1, modelItems.length - i));
      const itemScores = modelItems.map((item) => ({ item, recalled: recalledItems.includes(item), score: recalledItems.includes(item) ? 1 : 0 }));
      const totalItemScore = itemScores.reduce((sum, s) => sum + s.score, 0);
      await prisma.q_AuditoryMemory_Answer.create({ data: {
        resultId: amResult.id, questionId: amQ.id,
        recalledItems, itemScores, score: totalItemScore
      } });
    }
  }

  // ─── HelpAssessment + HelpEvaluation ─────────────────────────────────────────
  // Q_SequenceOrder
  const sequenceOrderQuestions = [];
  const sequenceOrderSeeds = [
    {
      order: 1,
      images: [
        { assetPath: 'assets/images/sequence-order/routine-1.png', position: 1 },
        { assetPath: 'assets/images/sequence-order/routine-2.png', position: 2 },
        { assetPath: 'assets/images/sequence-order/routine-3.png', position: 3 }
      ]
    },
    {
      order: 2,
      images: [
        { assetPath: 'assets/images/sequence-order/plant-1.png', position: 1 },
        { assetPath: 'assets/images/sequence-order/plant-2.png', position: 2 },
        { assetPath: 'assets/images/sequence-order/plant-3.png', position: 3 },
        { assetPath: 'assets/images/sequence-order/plant-4.png', position: 4 }
      ]
    }
  ];

  for (const seed of sequenceOrderSeeds) {
    sequenceOrderQuestions.push(await prisma.q_SequenceOrder.create({
      data: {
        testId: imageSequenceOrderTest.id,
        order: seed.order,
        images: {
          create: seed.images
        }
      },
      include: {
        images: {
          orderBy: [{ position: 'asc' }, { id: 'asc' }]
        }
      }
    }));
  }

  for (let i = 0; i < 2; i += 1) {
    let totalScore = 0;
    let maxScore = 0;
    const answerRows = [];

    for (const question of sequenceOrderQuestions) {
      const submittedOrder = question.images.map((image) => ({
        imageId: image.id,
        submittedPosition: i === 0 ? image.position : ((image.position % question.images.length) + 1)
      }));
      const itemScores = submittedOrder.map((item) => {
        const image = question.images.find((candidate) => candidate.id === item.imageId);
        const score = item.submittedPosition === image.position ? 1 : 0;

        return {
          imageId: item.imageId,
          correctPosition: image.position,
          submittedPosition: item.submittedPosition,
          score
        };
      });
      const score = itemScores.reduce((sum, item) => sum + item.score, 0);

      totalScore += score;
      maxScore += question.images.length;
      answerRows.push({
        questionId: question.id,
        submittedOrder,
        itemScores,
        score
      });
    }

    const result = await prisma.assessmentResult.create({
      data: {
        childId: children[i].id,
        testId: imageSequenceOrderTest.id,
        totalScore,
        maxScore,
        scoreGiven: totalScore,
        sessionId: `sequence-order-session-${i + 1}`,
        timestamp: plusDays(-(8 + i))
      }
    });

    await prisma.q_SequenceOrder_Answer.createMany({
      data: answerRows.map((answer) => ({
        resultId: result.id,
        questionId: answer.questionId,
        submittedOrder: answer.submittedOrder,
        itemScores: answer.itemScores,
        score: answer.score
      }))
    });
  }
  for (let i = 0; i < doctors.length; i += 1) {
    const targetChild = children[i % children.length];
    const helpAssessment = await prisma.helpAssessment.create({ data: {
      childId: targetChild.id,
      doctorId: doctors[i].id,
      sessionId: `help-session-${i + 1}`,
      developmentalAge: `${3 + i}.${i * 2}-${3 + i}.${i * 2 + 6}`
    } });
    // Evaluate all helpSkills for this assessment
    for (const [si, skill] of helpSkills.entries()) {
      const scoreOptions = ['NOT_SUITABLE', 'NOT_PRESENT', 'INITIAL_ATTEMPTS', 'PARTIAL_LEVEL', 'SUCCESSFUL'];
      await prisma.helpEvaluation.create({ data: {
        assessmentId: helpAssessment.id,
        skillId: skill.id,
        score: scoreOptions[(i + si) % scoreOptions.length],
        doctorNotes: `Notes from ${doctors[i].name} on skill ${skill.skillNumber}: observed during session.`
      } });
    }
  }

  // ─── Activities ───────────────────────────────────────────────────────────────
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

  // ─── Bookings ─────────────────────────────────────────────────────────────────
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
      category: i % 4 === 0 ? 'EVALUATION' : 'INDIVIDUAL',
      duration: 60, price: 300 + (i % doctors.length) * 10, status, scheduledAt, scheduledMonth: scheduledAt.getMonth() + 1,
      scheduledDay: scheduledAt.getDate(), scheduledTime: formatSeedTime(slotTime), notes: 'Seeded booking for testing.',
      completedAt: status === 'COMPLETED' ? new Date(scheduledAt.getTime() + 60 * 60000) : null, cancelledAt: status === 'CANCELLED' ? plusDays(-1) : null,
      cancellationReason: status === 'CANCELLED' ? 'Family requested a new schedule.' : null, rating: status === 'COMPLETED' ? 4 + (i % 2) : null,
      review: status === 'COMPLETED' ? 'Supportive session with clear guidance.' : null, videoLink: i % 3 !== 2 ? `https://meet.google.com/room-${i + 1}` : `https://meet.google.com/followup-room-${i + 1}`
    } }));
  }
  for (const booking of bookings.slice(0, 8).filter((b) => b.status !== 'CANCELLED')) {
    await prisma.payment.create({ data: { bookingId: booking.id, doctorId: booking.doctorId, amount: booking.price, method: booking.status === 'COMPLETED' ? 'INSTAPAY' : 'FAWRY', status: booking.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING', transactionId: booking.status === 'COMPLETED' ? `txn-booking-${booking.id.slice(0, 8)}` : `txn-booking-init-${booking.id.slice(0, 8)}` } });
  }
  // Q_SequenceOrder
  const sequenceOrderQuestions = [];
  const sequenceOrderSeeds = [
    {
      order: 1,
      images: [
        { assetPath: 'assets/images/sequence-order/routine-1.png', position: 1 },
        { assetPath: 'assets/images/sequence-order/routine-2.png', position: 2 },
        { assetPath: 'assets/images/sequence-order/routine-3.png', position: 3 }
      ]
    },
    {
      order: 2,
      images: [
        { assetPath: 'assets/images/sequence-order/plant-1.png', position: 1 },
        { assetPath: 'assets/images/sequence-order/plant-2.png', position: 2 },
        { assetPath: 'assets/images/sequence-order/plant-3.png', position: 3 },
        { assetPath: 'assets/images/sequence-order/plant-4.png', position: 4 }
      ]
    }
  ];

  for (const seed of sequenceOrderSeeds) {
    sequenceOrderQuestions.push(await prisma.q_SequenceOrder.create({
      data: {
        testId: imageSequenceOrderTest.id,
        order: seed.order,
        images: {
          create: seed.images
        }
      },
      include: {
        images: {
          orderBy: [{ position: 'asc' }, { id: 'asc' }]
        }
      }
    }));
  }

  for (let i = 0; i < 2; i += 1) {
    let totalScore = 0;
    let maxScore = 0;
    const answerRows = [];

    for (const question of sequenceOrderQuestions) {
      const submittedOrder = question.images.map((image) => ({
        imageId: image.id,
        submittedPosition: i === 0 ? image.position : ((image.position % question.images.length) + 1)
      }));
      const itemScores = submittedOrder.map((item) => {
        const image = question.images.find((candidate) => candidate.id === item.imageId);
        const score = item.submittedPosition === image.position ? 1 : 0;

        return {
          imageId: item.imageId,
          correctPosition: image.position,
          submittedPosition: item.submittedPosition,
          score
        };
      });
      const score = itemScores.reduce((sum, item) => sum + item.score, 0);

      totalScore += score;
      maxScore += question.images.length;
      answerRows.push({
        questionId: question.id,
        submittedOrder,
        itemScores,
        score
      });
    }

    const result = await prisma.assessmentResult.create({
      data: {
        childId: children[i].id,
        testId: imageSequenceOrderTest.id,
        totalScore,
        maxScore,
        scoreGiven: totalScore,
        sessionId: `sequence-order-session-${i + 1}`,
        timestamp: plusDays(-(8 + i))
      }
    });

    await prisma.q_SequenceOrder_Answer.createMany({
      data: answerRows.map((answer) => ({
        resultId: result.id,
        questionId: answer.questionId,
        submittedOrder: answer.submittedOrder,
        itemScores: answer.itemScores,
        score: answer.score
      }))
    });
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
      views: 120 + i * 40, likes: 18 + i * 5, comments: 6 + i, isRecommended: i % 2 === 0, isFeatured: i < 2, featuredOrder: i < 2 ? i + 1 : 10 + i
    } });
  }

  await prisma.message.createMany({ data: [
    { senderId: users[0].id, receiverId: users[1].id, content: 'Have you tried the new sensory cards yet?', messageType: 'TEXT', isRead: true },
    { senderId: users[1].id, receiverId: users[0].id, content: 'Yes, they worked well during practice time.', messageType: 'TEXT', isRead: true },
    { senderId: users[2].id, receiverId: users[3].id, imageUrl: '/uploads/messages/therapy-tools-share.png', messageType: 'IMAGE', isRead: false },
    { senderId: users[4].id, receiverId: users[5].id, voiceUrl: '/uploads/messages/progress-update-voice.mp3', voiceDuration: 22, messageType: 'VOICE', isRead: false }
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
    { type: 'BOOKINGS', name: 'Weekly bookings overview', description: 'Snapshot of booking performance.', format: 'JSON', filters: j({ from: plusDays(-7), to: now }), generatedBy: admins.super.id, filePath: '/reports/bookings-weekly.json', fileUrl: 'https://media.tawasoul.app/reports/bookings-weekly.json', status: 'COMPLETED', startedAt: plusDays(-1), completedAt: now },
    { type: 'REVENUE', name: 'Revenue export', description: 'Monthly revenue report.', format: 'CSV', filters: j({ month: '2026-03' }), generatedBy: admins.super.id, filePath: '/reports/revenue-march.csv', fileUrl: 'https://media.tawasoul.app/reports/revenue-march.csv', status: 'PROCESSING', startedAt: plusDays(-2) },
    { type: 'SUPPORT_TICKETS', name: 'Support queue audit', description: 'Support response time review.', format: 'PDF', filters: j({ priority: 'HIGH' }), generatedBy: admins.content.id, status: 'FAILED', startedAt: plusDays(-3), error: 'Source export was interrupted.' }
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


