# دليل شامل لـ API Endpoints المطلوبة من الـ Backend
## Tawasoul Mobile App - Backend API Requirements

**تاريخ الإنشاء:** 2026-01-27  
**Base URL:** `http://YOUR_SERVER_IP:3000/api`

---

## 📋 جدول المحتويات

1. [Authentication & User Management](#1-authentication--user-management)
2. [Public Endpoints](#2-public-endpoints)
3. [Children Management](#3-children-management)
4. [Doctors & Specialists](#4-doctors--specialists)
5. [Mahara Activities (Games)](#5-mahara-activities-games)
6. [Appointments & Bookings](#6-appointments--bookings)
7. [Assessments & Tests](#7-assessments--tests)
8. [Additional Features](#8-additional-features)

---

## 1. Authentication & User Management

### 1.1 إرسال OTP للتسجيل/تسجيل الدخول
**Endpoint:** `POST /user/auth/send-otp`

**Request Body:**
```json
{
  "fullName": "أحمد محمد",
  "phone": "01234567890",
  "relationType": "أب",
  "agreedToTerms": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إرسال رمز التحقق بنجاح",
  "data": {
    "otpSent": true,
    "expiresIn": 300
  }
}
```

**Notes:**
- رقم الهاتف يجب أن يكون أرقام فقط (بدون مسافات أو رموز)
- OTP يجب أن يكون 5 أرقام
- OTP صالح لمدة 5 دقائق
- في بيئة التطوير، OTP الافتراضي هو `123456`

---

### 1.2 التحقق من OTP
**Endpoint:** `POST /user/auth/verify-otp`

**Request Body:**
```json
{
  "phone": "01234567890",
  "otp": "12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم التحقق بنجاح",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "fullName": "أحمد محمد",
      "phone": "01234567890",
      "relationType": "أب",
      "createdAt": "2026-01-27T10:00:00Z"
    }
  }
}
```

**Notes:**
- يتم حفظ الـ token في Local Storage
- الـ token يُستخدم في جميع الطلبات المحمية عبر Header: `Authorization: Bearer {token}`

---

### 1.3 إعادة إرسال OTP
**Endpoint:** `POST /user/auth/resend-otp`

**Request Body:**
```json
{
  "phone": "01234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إعادة إرسال رمز التحقق",
  "data": {
    "otpSent": true,
    "expiresIn": 300
  }
}
```

---

### 1.4 تسجيل الخروج
**Endpoint:** `POST /user/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح"
}
```

---

### 1.5 الحصول على بيانات المستخدم الحالي
**Endpoint:** `GET /user/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "fullName": "أحمد محمد",
    "phone": "01234567890",
    "relationType": "أب",
    "profileImageUrl": "https://...",
    "createdAt": "2026-01-27T10:00:00Z"
  }
}
```

---

### 1.6 تحديث بيانات المستخدم
**Endpoint:** `PUT /user/auth/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "fullName": "أحمد محمد علي",
  "profileImageUrl": "https://...",
  "email": "ahmed@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تحديث البيانات بنجاح",
  "data": {
    "id": "user_123",
    "fullName": "أحمد محمد علي",
    "phone": "01234567890",
    "email": "ahmed@example.com",
    "profileImageUrl": "https://..."
  }
}
```

---

### 1.7 حذف الحساب
**Endpoint:** `DELETE /user/auth/account`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "تم حذف الحساب بنجاح"
}
```

---

## 2. Public Endpoints

### 2.1 الحصول على شرائح الـ Onboarding
**Endpoint:** `GET /public/onboarding-slides`

**Query Parameters:**
- `language` (optional): `ar` or `en` (default: `ar`)

**Response:**
```json
{
  "success": true,
  "data": {
    "slides": [
      {
        "id": "1",
        "imageUrl": "https://...",
        "title": "مرحباً بك في تواصل",
        "titleEn": "Welcome to Tawasoul",
        "description": "منصة متخصصة لمساعدة الأطفال",
        "descriptionEn": "Specialized platform for children",
        "order": 1
      },
      {
        "id": "2",
        "imageUrl": "https://...",
        "title": "استشارات متخصصة",
        "titleEn": "Expert Consultations",
        "description": "احصل على استشارات مع أفضل المتخصصين",
        "descriptionEn": "Get consultations with top specialists",
        "order": 2
      }
    ]
  }
}
```

---

### 2.2 الحصول على الصفحات الثابتة
**Endpoint:** `GET /public/static-pages`

**Query Parameters:**
- `slug` (optional): `terms`, `privacy`, `about`, `contact`

**Response:**
```json
{
  "success": true,
  "data": {
    "pages": [
      {
        "id": "1",
        "slug": "terms",
        "title": "الشروط والأحكام",
        "titleEn": "Terms and Conditions",
        "content": "المحتوى الكامل...",
        "contentEn": "Full content..."
      },
      {
        "id": "2",
        "slug": "privacy",
        "title": "سياسة الخصوصية",
        "titleEn": "Privacy Policy",
        "content": "المحتوى الكامل...",
        "contentEn": "Full content..."
      }
    ]
  }
}
```

---

### 2.3 بيانات الصفحة الرئيسية
**Endpoint:** `GET /public/home-data`

**Query Parameters:**
- `language` (optional): `ar` or `en` (default: `ar`)

**Response:**
```json
{
  "success": true,
  "data": {
    "sliders": [
      {
        "id": "1",
        "title": "احجز جلستك الأولى الآن",
        "description": "نحن هنا لمساعدة طفلك على التميز",
        "imageUrl": "https://...",
        "buttonText": "احجز الآن",
        "buttonLink": "/appointments/booking"
      }
    ],
    "services": [
      {
        "id": "1",
        "title": "جلسات التخاطب",
        "description": "تحسين مهارات النطق واللغة",
        "imageUrl": "https://...",
        "link": "/services/speech_therapy"
      },
      {
        "id": "2",
        "title": "تعديل السلوك",
        "description": "برامج متخصصة لتعديل سلوك الأطفال",
        "imageUrl": "https://...",
        "link": "/services/behavior_modification"
      }
    ],
    "articles": [
      {
        "id": "1",
        "title": "تأخر النطق عند الأطفال",
        "description": "علامات وأعراض تأخر النطق",
        "imageUrl": "https://...",
        "link": "/articles/art_1"
      }
    ]
  }
}
```

---

### 2.4 الأسئلة الشائعة (FAQs)
**Endpoint:** `GET /public/faqs`

**Query Parameters:**
- `category` (optional): التصنيف المطلوب
- `language` (optional): `ar` or `en`

**Response:**
```json
{
  "success": true,
  "data": {
    "faqs": [
      {
        "id": "1",
        "question": "كيف يمكنني حجز جلسة؟",
        "questionEn": "How can I book a session?",
        "answer": "يمكنك حجز جلسة من خلال...",
        "answerEn": "You can book a session through...",
        "category": "booking",
        "order": 1
      }
    ],
    "categories": [
      {
        "id": "cat1",
        "name": "الحجز",
        "nameEn": "Booking",
        "slug": "booking"
      }
    ]
  }
}
```

---

## 3. Children Management

### 3.1 إنشاء ملف طفل
**Endpoint:** `POST /user/children`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "محمد أحمد",
  "status": "AUTISM",
  "ageGroup": "BETWEEN_4_AND_15",
  "birthDate": "2020-05-15",
  "behavioralNotes": "ملاحظات سلوكية...",
  "profileImageUrl": "https://..."
}
```

**Enums:**
- **status**: `AUTISM`, `SPEECH_DISORDER`, `DOWN_SYNDROME`, `LEARNING_DISABILITY`, `ADHD`, `OTHER`
- **ageGroup**: `UNDER_4`, `BETWEEN_4_AND_15`, `OVER_15`

**Response:**
```json
{
  "success": true,
  "message": "تم إنشاء ملف الطفل بنجاح",
  "data": {
    "child": {
      "id": "child_123",
      "name": "محمد أحمد",
      "status": "AUTISM",
      "ageGroup": "BETWEEN_4_AND_15",
      "birthDate": "2020-05-15",
      "behavioralNotes": "ملاحظات سلوكية...",
      "profileImageUrl": "https://...",
      "userId": "user_123",
      "createdAt": "2026-01-27T10:00:00Z"
    }
  }
}
```

---

### 3.2 استبيان الطفل (Child Survey)
**Endpoint:** `POST /user/children/survey`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "توحد",
  "ageGroup": "من 4 إلى 15 سنة",
  "behavioralNotes": "الطفل يحب الألعاب..."
}
```

**Notes:**
- يقبل القيم بالعربية
- يتم تحويلها تلقائياً للقيم الإنجليزية في الـ backend

**Response:**
```json
{
  "success": true,
  "data": {
    "child": {
      "id": "child_123",
      "status": "AUTISM",
      "ageGroup": "BETWEEN_4_AND_15",
      "behavioralNotes": "الطفل يحب الألعاب..."
    }
  }
}
```

---

### 3.3 الحصول على قائمة الأطفال
**Endpoint:** `GET /user/children`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "children": [
      {
        "id": "child_123",
        "name": "محمد أحمد",
        "status": "AUTISM",
        "ageGroup": "BETWEEN_4_AND_15",
        "birthDate": "2020-05-15",
        "profileImageUrl": "https://...",
        "createdAt": "2026-01-27T10:00:00Z"
      }
    ]
  }
}
```

---

### 3.4 الحصول على بيانات طفل معين
**Endpoint:** `GET /user/children/:childId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "child_123",
    "name": "محمد أحمد",
    "status": "AUTISM",
    "ageGroup": "BETWEEN_4_AND_15",
    "birthDate": "2020-05-15",
    "behavioralNotes": "ملاحظات...",
    "profileImageUrl": "https://...",
    "progress": {
      "completedActivities": 15,
      "totalActivities": 50,
      "lastActivityDate": "2026-01-26T14:30:00Z"
    }
  }
}
```

---

### 3.5 تحديث بيانات طفل
**Endpoint:** `PUT /user/children/:childId`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "محمد أحمد علي",
  "behavioralNotes": "ملاحظات محدثة...",
  "profileImageUrl": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تحديث بيانات الطفل بنجاح",
  "data": {
    "child": {
      "id": "child_123",
      "name": "محمد أحمد علي",
      "status": "AUTISM",
      "ageGroup": "BETWEEN_4_AND_15",
      "behavioralNotes": "ملاحظات محدثة..."
    }
  }
}
```

---

### 3.6 حذف ملف طفل
**Endpoint:** `DELETE /user/children/:childId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "تم حذف ملف الطفل بنجاح"
}
```

---

## 4. Doctors & Specialists

### 4.1 الحصول على قائمة الأطباء/المختصين
**Endpoint:** `GET /user/doctors`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): رقم الصفحة (default: 1)
- `limit` (optional): عدد النتائج (default: 20)
- `recommendedForChildId` (optional): ID الطفل للحصول على المختصين الموصى بهم
- `search` (optional): البحث بالاسم
- `specialty` (optional): التخصص (SPEECH_THERAPY, BEHAVIOR_MODIFICATION, AUTISM_SPECIALIST, etc.)
- `rating` (optional): الحد الأدنى للتقييم
- `availability` (optional): `AVAILABLE`, `BUSY`

**Response:**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "doctor_123",
        "fullName": "د. سارة محمد",
        "specialty": "SPEECH_THERAPY",
        "specialtyAr": "التخاطب",
        "bio": "خبرة 10 سنوات في التخاطب...",
        "rating": 4.8,
        "reviewsCount": 42,
        "profileImageUrl": "https://...",
        "yearsOfExperience": 10,
        "certifications": ["شهادة 1", "شهادة 2"],
        "availability": "AVAILABLE",
        "sessionPrice": 200,
        "currency": "EGP",
        "languages": ["العربية", "الإنجليزية"]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalDoctors": 98,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**Notes:**
- عند تمرير `recommendedForChildId`، يتم فلترة الأطباء حسب حالة الطفل (status)
- مثلاً: طفل بحالة `AUTISM` سيحصل على ترشيحات لأطباء متخصصين في التوحد

---

### 4.2 الحصول على بيانات طبيب معين
**Endpoint:** `GET /user/doctors/:doctorId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doctor_123",
    "fullName": "د. سارة محمد",
    "specialty": "SPEECH_THERAPY",
    "bio": "خبرة 10 سنوات...",
    "rating": 4.8,
    "reviewsCount": 42,
    "profileImageUrl": "https://...",
    "yearsOfExperience": 10,
    "certifications": ["شهادة 1", "شهادة 2"],
    "availability": "AVAILABLE",
    "sessionPrice": 200,
    "currency": "EGP",
    "languages": ["العربية", "الإنجليزية"],
    "schedule": {
      "monday": [
        {"start": "09:00", "end": "12:00"},
        {"start": "14:00", "end": "17:00"}
      ],
      "tuesday": [
        {"start": "09:00", "end": "12:00"}
      ]
    },
    "reviews": [
      {
        "id": "review_1",
        "userName": "أحمد م.",
        "rating": 5,
        "comment": "طبيبة ممتازة...",
        "createdAt": "2026-01-20T10:00:00Z"
      }
    ]
  }
}
```

---

### 4.3 الحصول على مواعيد الطبيب المتاحة
**Endpoint:** `GET /user/doctors/:doctorId/available-slots`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `date`: التاريخ المطلوب (format: `YYYY-MM-DD`)
- `duration` (optional): مدة الجلسة بالدقائق (default: 60)

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2026-01-28",
    "availableSlots": [
      {
        "start": "09:00",
        "end": "10:00",
        "available": true
      },
      {
        "start": "10:00",
        "end": "11:00",
        "available": false
      },
      {
        "start": "11:00",
        "end": "12:00",
        "available": true
      }
    ]
  }
}
```

---

## 5. Mahara Activities (Games)

### 5.1 الحصول على النشاط الحالي للطفل
**Endpoint:** `GET /user/mahara/activities/current`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `childId`: معرف الطفل (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "activity_123",
    "type": "MEMORY_MATCH",
    "title": "لعبة الذاكرة",
    "description": "اعثر على الصور المتطابقة",
    "difficulty": "EASY",
    "ageGroup": "BETWEEN_4_AND_15",
    "images": [
      {
        "id": "img_1",
        "url": "https://...",
        "label": "تفاحة"
      },
      {
        "id": "img_2",
        "url": "https://...",
        "label": "موز"
      }
    ],
    "instructions": "انقر على البطاقات لإيجاد الأزواج المتطابقة",
    "timeLimit": 120,
    "targetScore": 100
  }
}
```

**Notes:**
- يتم تحديد النشاط بناءً على مستوى الطفل وتقدمه
- أنواع الأنشطة المدعومة:
  - `MEMORY_MATCH`: لعبة الذاكرة
  - `SEQUENCE`: الترتيب
  - `MATCHING`: المطابقة
  - `SOUND_RECOGNITION`: التعرف على الأصوات
  - `IMAGE_SELECTION`: اختيار الصورة الصحيحة

---

### 5.2 إرسال تفاعل مع النشاط
**Endpoint:** `POST /user/mahara/activities/submit`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "childId": "child_123",
  "activityId": "activity_123",
  "event": "CARD_FLIP",
  "selectedImageId": "img_1",
  "matches": [
    {"image1": "img_1", "image2": "img_2"}
  ],
  "sequence": ["img_1", "img_3", "img_2"],
  "timeSpent": 45,
  "score": 85,
  "completed": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تسجيل التفاعل بنجاح",
  "data": {
    "points": 10,
    "streak": 3,
    "nextActivity": {
      "id": "activity_124",
      "type": "SEQUENCE",
      "title": "لعبة الترتيب"
    }
  }
}
```

---

### 5.3 الحصول على تاريخ أنشطة الطفل
**Endpoint:** `GET /user/mahara/activities/history`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `childId`: معرف الطفل (required)
- `page` (optional): رقم الصفحة
- `limit` (optional): عدد النتائج

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity_123",
        "type": "MEMORY_MATCH",
        "title": "لعبة الذاكرة",
        "completedAt": "2026-01-25T10:00:00Z",
        "score": 85,
        "timeSpent": 120,
        "attempts": 1,
        "performance": "EXCELLENT"
      }
    ],
    "stats": {
      "totalActivitiesCompleted": 25,
      "averageScore": 82,
      "totalTimeSpent": 3600,
      "favoriteActivityType": "MEMORY_MATCH"
    }
  }
}
```

---

### 5.4 الحصول على قائمة جميع الأنشطة المتاحة
**Endpoint:** `GET /user/mahara/activities`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `ageGroup` (optional): `UNDER_4`, `BETWEEN_4_AND_15`, `OVER_15`
- `difficulty` (optional): `EASY`, `MEDIUM`, `HARD`
- `type` (optional): نوع النشاط

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity_123",
        "type": "MEMORY_MATCH",
        "title": "لعبة الذاكرة",
        "description": "اعثر على الصور المتطابقة",
        "difficulty": "EASY",
        "ageGroup": "BETWEEN_4_AND_15",
        "thumbnailUrl": "https://...",
        "estimatedDuration": 120
      }
    ]
  }
}
```

---

## 6. Appointments & Bookings

### 6.1 حجز موعد جديد
**Endpoint:** `POST /user/appointments/book`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "doctorId": "doctor_123",
  "childId": "child_123",
  "date": "2026-01-28",
  "startTime": "09:00",
  "endTime": "10:00",
  "sessionType": "ONLINE",
  "notes": "ملاحظات إضافية..."
}
```

**Enums:**
- **sessionType**: `ONLINE`, `IN_PERSON`

**Response:**
```json
{
  "success": true,
  "message": "تم حجز الموعد بنجاح",
  "data": {
    "appointment": {
      "id": "appointment_123",
      "doctorId": "doctor_123",
      "doctorName": "د. سارة محمد",
      "childId": "child_123",
      "childName": "محمد أحمد",
      "date": "2026-01-28",
      "startTime": "09:00",
      "endTime": "10:00",
      "sessionType": "ONLINE",
      "status": "PENDING_PAYMENT",
      "price": 200,
      "currency": "EGP",
      "notes": "ملاحظات...",
      "createdAt": "2026-01-27T10:00:00Z"
    },
    "paymentRequired": true,
    "paymentUrl": "https://payment-gateway.com/pay/xxx"
  }
}
```

---

### 6.2 الحصول على قائمة المواعيد
**Endpoint:** `GET /user/appointments`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): `PENDING_PAYMENT`, `CONFIRMED`, `COMPLETED`, `CANCELLED`
- `childId` (optional): تصفية حسب الطفل
- `page` (optional): رقم الصفحة
- `limit` (optional): عدد النتائج

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "appointment_123",
        "doctorId": "doctor_123",
        "doctorName": "د. سارة محمد",
        "doctorImageUrl": "https://...",
        "childId": "child_123",
        "childName": "محمد أحمد",
        "date": "2026-01-28",
        "startTime": "09:00",
        "endTime": "10:00",
        "sessionType": "ONLINE",
        "status": "CONFIRMED",
        "price": 200,
        "currency": "EGP",
        "meetingLink": "https://zoom.us/j/xxx",
        "canCancel": true,
        "canReschedule": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalAppointments": 15
    }
  }
}
```

---

### 6.3 الحصول على تفاصيل موعد معين
**Endpoint:** `GET /user/appointments/:appointmentId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "appointment_123",
    "doctor": {
      "id": "doctor_123",
      "fullName": "د. سارة محمد",
      "specialty": "SPEECH_THERAPY",
      "profileImageUrl": "https://..."
    },
    "child": {
      "id": "child_123",
      "name": "محمد أحمد",
      "status": "AUTISM"
    },
    "date": "2026-01-28",
    "startTime": "09:00",
    "endTime": "10:00",
    "sessionType": "ONLINE",
    "status": "CONFIRMED",
    "price": 200,
    "currency": "EGP",
    "meetingLink": "https://zoom.us/j/xxx",
    "notes": "ملاحظات...",
    "prescription": null,
    "report": null,
    "createdAt": "2026-01-27T10:00:00Z"
  }
}
```

---

### 6.4 إلغاء موعد
**Endpoint:** `PUT /user/appointments/:appointmentId/cancel`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "reason": "ظروف طارئة"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إلغاء الموعد بنجاح",
  "data": {
    "refundAmount": 200,
    "refundStatus": "PENDING"
  }
}
```

---

### 6.5 إعادة جدولة موعد
**Endpoint:** `PUT /user/appointments/:appointmentId/reschedule`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "newDate": "2026-01-29",
  "newStartTime": "10:00",
  "newEndTime": "11:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تغيير موعد الجلسة بنجاح",
  "data": {
    "appointment": {
      "id": "appointment_123",
      "date": "2026-01-29",
      "startTime": "10:00",
      "endTime": "11:00",
      "status": "CONFIRMED"
    }
  }
}
```

---

### 6.6 تقييم الجلسة
**Endpoint:** `POST /user/appointments/:appointmentId/review`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "جلسة ممتازة، الطبيبة كانت رائعة مع الطفل"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إضافة التقييم بنجاح",
  "data": {
    "review": {
      "id": "review_123",
      "appointmentId": "appointment_123",
      "doctorId": "doctor_123",
      "rating": 5,
      "comment": "جلسة ممتازة...",
      "createdAt": "2026-01-27T10:00:00Z"
    }
  }
}
```

---

## 7. Assessments & Tests

### 7.1 الحصول على قائمة الاختبارات المتاحة
**Endpoint:** `GET /user/assessments/tests`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `ageGroup` (optional): الفئة العمرية
- `category` (optional): `HEARING`, `PSYCHOLOGICAL`, `VISUAL`, `BEHAVIORAL`, `GILLIAM`

**Response:**
```json
{
  "success": true,
  "data": {
    "tests": [
      {
        "id": "test_123",
        "name": "اختبار الذاكرة السمعية",
        "nameEn": "Auditory Memory Test",
        "description": "اختبار لقياس قدرة الطفل على التذكر السمعي",
        "category": "HEARING",
        "ageGroup": "BETWEEN_4_AND_15",
        "duration": 15,
        "questionsCount": 20,
        "thumbnailUrl": "https://..."
      }
    ]
  }
}
```

---

### 7.2 بدء اختبار جديد
**Endpoint:** `POST /user/assessments/tests/:testId/start`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "childId": "child_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_123",
    "test": {
      "id": "test_123",
      "name": "اختبار الذاكرة السمعية",
      "duration": 15
    },
    "questions": [
      {
        "id": "q_1",
        "type": "MULTIPLE_CHOICE",
        "question": "ما هي الصورة التي تمثل الكلمة المسموعة؟",
        "audioUrl": "https://...",
        "options": [
          {
            "id": "opt_1",
            "imageUrl": "https://...",
            "label": "تفاحة"
          },
          {
            "id": "opt_2",
            "imageUrl": "https://...",
            "label": "موز"
          }
        ],
        "order": 1
      }
    ],
    "startedAt": "2026-01-27T10:00:00Z"
  }
}
```

---

### 7.3 إرسال إجابة سؤال
**Endpoint:** `POST /user/assessments/sessions/:sessionId/answer`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "questionId": "q_1",
  "selectedOptionId": "opt_1",
  "timeSpent": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "correct": true,
    "score": 5,
    "explanation": "إجابة صحيحة!",
    "nextQuestion": {
      "id": "q_2",
      "type": "MULTIPLE_CHOICE",
      "question": "..."
    }
  }
}
```

---

### 7.4 إنهاء الاختبار والحصول على النتائج
**Endpoint:** `POST /user/assessments/sessions/:sessionId/complete`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_123",
    "testId": "test_123",
    "childId": "child_123",
    "totalQuestions": 20,
    "correctAnswers": 16,
    "score": 80,
    "grade": "ممتاز",
    "percentile": 85,
    "strengths": [
      "الذاكرة قصيرة المدى",
      "التعرف على الأصوات"
    ],
    "weaknesses": [
      "الذاكرة طويلة المدى"
    ],
    "recommendations": [
      "ممارسة ألعاب الذاكرة يومياً",
      "الاستماع للقصص الصوتية"
    ],
    "completedAt": "2026-01-27T10:15:00Z",
    "certificateUrl": "https://..."
  }
}
```

---

### 7.5 الحصول على تاريخ نتائج الاختبارات
**Endpoint:** `GET /user/assessments/results`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `childId` (optional): معرف الطفل
- `testId` (optional): معرف الاختبار

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "sessionId": "session_123",
        "testName": "اختبار الذاكرة السمعية",
        "childName": "محمد أحمد",
        "score": 80,
        "grade": "ممتاز",
        "completedAt": "2026-01-27T10:15:00Z",
        "certificateUrl": "https://..."
      }
    ]
  }
}
```

---

## 8. Additional Features

### 8.1 الإشعارات
**Endpoint:** `GET /user/notifications`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `read` (optional): `true` or `false`
- `page` (optional): رقم الصفحة

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "APPOINTMENT_REMINDER",
        "title": "تذكير بموعد الجلسة",
        "message": "لديك جلسة مع د. سارة محمد غداً الساعة 9 صباحاً",
        "read": false,
        "createdAt": "2026-01-27T10:00:00Z",
        "data": {
          "appointmentId": "appointment_123"
        }
      }
    ],
    "unreadCount": 5
  }
}
```

---

### 8.2 تحديد الإشعار كمقروء
**Endpoint:** `PUT /user/notifications/:notificationId/read`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تحديد الإشعار كمقروء"
}
```

---

### 8.3 رفع صورة
**Endpoint:** `POST /user/upload/image`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:**
```
file: [binary image data]
type: "profile" | "child_profile" | "report"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://storage.example.com/uploads/xxx.jpg",
    "thumbnailUrl": "https://storage.example.com/uploads/xxx_thumb.jpg"
  }
}
```

---

### 8.4 الباقات المتاحة
**Endpoint:** `GET /user/packages`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "id": "pkg_123",
        "name": "باقة البداية",
        "description": "5 جلسات شهرياً",
        "price": 800,
        "currency": "EGP",
        "sessionsCount": 5,
        "validityDays": 30,
        "features": [
          "5 جلسات اون لاين",
          "متابعة اسبوعية",
          "تقارير شهرية"
        ]
      }
    ]
  }
}
```

---

### 8.5 شراء باقة
**Endpoint:** `POST /user/packages/:packageId/purchase`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "تم شراء الباقة بنجاح",
  "data": {
    "subscription": {
      "id": "sub_123",
      "packageId": "pkg_123",
      "startDate": "2026-01-27",
      "endDate": "2026-02-26",
      "remainingSessions": 5,
      "status": "ACTIVE"
    },
    "paymentUrl": "https://payment-gateway.com/pay/xxx"
  }
}
```

---

### 8.6 المفضلة (Favorites)
**Endpoint:** `POST /user/favorites`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "itemType": "DOCTOR",
  "itemId": "doctor_123"
}
```

**Enums:**
- **itemType**: `DOCTOR`, `ARTICLE`, `ACTIVITY`

**Response:**
```json
{
  "success": true,
  "message": "تمت الإضافة للمفضلة"
}
```

---

### 8.7 الحصول على قائمة المفضلة
**Endpoint:** `GET /user/favorites`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `itemType` (optional): `DOCTOR`, `ARTICLE`, `ACTIVITY`

**Response:**
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": "fav_123",
        "itemType": "DOCTOR",
        "itemId": "doctor_123",
        "item": {
          "id": "doctor_123",
          "fullName": "د. سارة محمد",
          "specialty": "SPEECH_THERAPY",
          "profileImageUrl": "https://..."
        },
        "createdAt": "2026-01-27T10:00:00Z"
      }
    ]
  }
}
```

---

### 8.8 إحصائيات الطفل
**Endpoint:** `GET /user/children/:childId/statistics`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "childId": "child_123",
    "totalActivitiesCompleted": 45,
    "totalSessionsAttended": 12,
    "totalAssessmentsTaken": 5,
    "averageActivityScore": 82,
    "averageSessionRating": 4.8,
    "progressTrend": "IMPROVING",
    "activityBreakdown": {
      "MEMORY_MATCH": 20,
      "SEQUENCE": 15,
      "MATCHING": 10
    },
    "monthlyProgress": [
      {
        "month": "2026-01",
        "activitiesCompleted": 15,
        "averageScore": 85
      }
    ]
  }
}
```

---

## 🔐 Authentication & Error Handling

### Authentication
جميع الـ endpoints تحت `/user/*` تحتاج إلى JWT Token في الـ Header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Error Response Format
جميع الأخطاء يجب أن تتبع هذا الشكل:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {}
  }
}
```

### Error Codes
- `UNAUTHORIZED`: مشكلة في الـ token
- `VALIDATION_ERROR`: خطأ في البيانات المرسلة
- `NOT_FOUND`: العنصر المطلوب غير موجود
- `ALREADY_EXISTS`: العنصر موجود بالفعل
- `FORBIDDEN`: ليس لديك صلاحية
- `SERVER_ERROR`: خطأ في السيرفر

---

## 📊 Data Types & Enums

### Child Status
```
AUTISM
SPEECH_DISORDER
DOWN_SYNDROME
LEARNING_DISABILITY
ADHD
OTHER
```

### Age Group
```
UNDER_4
BETWEEN_4_AND_15
OVER_15
```

### Session Type
```
ONLINE
IN_PERSON
```

### Doctor Specialty
```
SPEECH_THERAPY
BEHAVIOR_MODIFICATION
AUTISM_SPECIALIST
OCCUPATIONAL_THERAPY
PSYCHOLOGIST
```

### Appointment Status
```
PENDING_PAYMENT
CONFIRMED
IN_PROGRESS
COMPLETED
CANCELLED
RESCHEDULED
```

### Activity Type
```
MEMORY_MATCH
SEQUENCE
MATCHING
SOUND_RECOGNITION
IMAGE_SELECTION
PUZZLE
```

### Assessment Category
```
HEARING
PSYCHOLOGICAL
VISUAL
BEHAVIORAL
GILLIAM
```

---

## 📝 ملاحظات إضافية

### Pagination
معظم الـ endpoints التي تعيد قوائم تدعم pagination:
- `page`: رقم الصفحة (default: 1)
- `limit`: عدد النتائج (default: 20, max: 100)

### Date & Time Format
- **التاريخ**: `YYYY-MM-DD` (مثال: `2026-01-27`)
- **الوقت**: `HH:MM` بصيغة 24 ساعة (مثال: `09:00`)
- **التاريخ والوقت معاً**: ISO 8601 format (مثال: `2026-01-27T10:00:00Z`)

### Language Support
معظم الـ endpoints تدعم اللغة العربية والإنجليزية عبر:
- Query Parameter: `?language=ar` or `?language=en`
- أو Header: `Accept-Language: ar` or `Accept-Language: en`

### Images & Files
- الصور يجب أن تكون بصيغة: `JPG`, `PNG`, `WEBP`
- الحد الأقصى لحجم الصورة: `5MB`
- يُفضل رفع الصور عبر endpoint `/user/upload/image` أولاً ثم استخدام الـ URL

### Rate Limiting
- **Public Endpoints**: 100 requests/minute
- **Authenticated Endpoints**: 300 requests/minute
- يتم إرجاع headers:
  - `X-RateLimit-Limit`: الحد الأقصى
  - `X-RateLimit-Remaining`: المتبقي
  - `X-RateLimit-Reset`: وقت إعادة الضبط

---

## ✅ أولويات التنفيذ

### المرحلة الأولى (High Priority)
1. ✅ Authentication (1.1, 1.2, 1.3)
2. ✅ Public Endpoints (2.1, 2.2, 2.3)
3. ✅ Children Management (3.1, 3.2, 3.3)

### المرحلة الثانية (Medium Priority)
4. ✅ Doctors (4.1, 4.2)
5. ✅ Mahara Activities (5.1, 5.2)
6. ✅ Appointments (6.1, 6.2, 6.3)

### المرحلة الثالثة (Low Priority)
7. ⏳ Assessments (7.1, 7.2, 7.3, 7.4)
8. ⏳ Additional Features (8.1, 8.2, 8.6, 8.7)

---

## 📞 Contact & Support

لأي استفسارات أو توضيحات إضافية، يرجى التواصل مع فريق التطبيق.

**تم إنشاء هذا المستند بواسطة:** Antigravity AI  
**التاريخ:** 27 يناير 2026
