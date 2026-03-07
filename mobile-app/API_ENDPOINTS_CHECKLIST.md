# قائمة سريعة للـ API Endpoints
## Tawasoul Mobile App - Quick Checklist

**Base URL:** `http://YOUR_SERVER_IP:3000/api`

---

## ✅ Authentication & User Management

- [ ] `POST /user/auth/send-otp` - إرسال OTP
- [ ] `POST /user/auth/verify-otp` - التحقق من OTP
- [ ] `POST /user/auth/resend-otp` - إعادة إرسال OTP
- [ ] `POST /user/auth/logout` - تسجيل الخروج
- [ ] `GET /user/auth/me` - الحصول على بيانات المستخدم
- [ ] `PUT /user/auth/profile` - تحديث بيانات المستخدم
- [ ] `DELETE /user/auth/account` - حذف الحساب

---

## ✅ Public Endpoints (لا تحتاج Authentication)

- [ ] `GET /public/onboarding-slides` - شرائح Onboarding
- [ ] `GET /public/static-pages` - الصفحات الثابتة (Terms, Privacy, etc.)
- [ ] `GET /public/home-data` - بيانات الصفحة الرئيسية
- [ ] `GET /public/faqs` - الأسئلة الشائعة

---

## ✅ Children Management

- [ ] `POST /user/children` - إنشاء ملف طفل
- [ ] `POST /user/children/survey` - استبيان الطفل (بعد التسجيل)
- [ ] `GET /user/children` - قائمة الأطفال
- [ ] `GET /user/children/:childId` - بيانات طفل معين
- [ ] `PUT /user/children/:childId` - تحديث بيانات طفل
- [ ] `DELETE /user/children/:childId` - حذف ملف طفل
- [ ] `GET /user/children/:childId/statistics` - إحصائيات الطفل

---

## ✅ Doctors & Specialists

- [ ] `GET /user/doctors` - قائمة الأطباء/المختصين
  - يدعم: `?recommendedForChildId=xxx` للحصول على ترشيحات
- [ ] `GET /user/doctors/:doctorId` - بيانات طبيب معين
- [ ] `GET /user/doctors/:doctorId/available-slots` - المواعيد المتاحة

---

## ✅ Mahara Activities (الألعاب التعليمية)

- [ ] `GET /user/mahara/activities` - قائمة جميع الأنشطة
- [ ] `GET /user/mahara/activities/current?childId=xxx` - النشاط الحالي للطفل
- [ ] `POST /user/mahara/activities/submit` - إرسال تفاعل مع النشاط
- [ ] `GET /user/mahara/activities/history?childId=xxx` - تاريخ الأنشطة

---

## ✅ Appointments & Bookings

- [ ] `POST /user/appointments/book` - حجز موعد جديد
- [ ] `GET /user/appointments` - قائمة المواعيد
- [ ] `GET /user/appointments/:appointmentId` - تفاصيل موعد
- [ ] `PUT /user/appointments/:appointmentId/cancel` - إلغاء موعد
- [ ] `PUT /user/appointments/:appointmentId/reschedule` - إعادة جدولة موعد
- [ ] `POST /user/appointments/:appointmentId/review` - تقييم الجلسة

---

## ✅ Assessments & Tests

- [ ] `GET /user/assessments/tests` - قائمة الاختبارات المتاحة
- [ ] `POST /user/assessments/tests/:testId/start` - بدء اختبار
- [ ] `POST /user/assessments/sessions/:sessionId/answer` - إرسال إجابة
- [ ] `POST /user/assessments/sessions/:sessionId/complete` - إنهاء الاختبار
- [ ] `GET /user/assessments/results` - تاريخ النتائج

---

## ✅ Notifications

- [ ] `GET /user/notifications` - قائمة الإشعارات
- [ ] `PUT /user/notifications/:notificationId/read` - تحديد كمقروء

---

## ✅ Packages & Subscriptions

- [ ] `GET /user/packages` - الباقات المتاحة
- [ ] `POST /user/packages/:packageId/purchase` - شراء باقة

---

## ✅ Favorites

- [ ] `POST /user/favorites` - إضافة للمفضلة
- [ ] `GET /user/favorites` - قائمة المفضلة
- [ ] `DELETE /user/favorites/:favoriteId` - حذف من المفضلة

---

## ✅ File Upload

- [ ] `POST /user/upload/image` - رفع صورة

---

## 📊 Enums المطلوبة في الـ Backend

### ChildStatus
```
AUTISM
SPEECH_DISORDER
DOWN_SYNDROME
LEARNING_DISABILITY
ADHD
OTHER
```

### ChildAgeGroup
```
UNDER_4
BETWEEN_4_AND_15
OVER_15
```

### SessionType
```
ONLINE
IN_PERSON
```

### DoctorSpecialty
```
SPEECH_THERAPY
BEHAVIOR_MODIFICATION
AUTISM_SPECIALIST
OCCUPATIONAL_THERAPY
PSYCHOLOGIST
```

### AppointmentStatus
```
PENDING_PAYMENT
CONFIRMED
IN_PROGRESS
COMPLETED
CANCELLED
RESCHEDULED
```

### ActivityType
```
MEMORY_MATCH
SEQUENCE
MATCHING
SOUND_RECOGNITION
IMAGE_SELECTION
PUZZLE
```

### AssessmentCategory
```
HEARING
PSYCHOLOGICAL
VISUAL
BEHAVIORAL
GILLIAM
```

---

## 🔥 أولويات التنفيذ

### Phase 1 - Critical (يجب تنفيذها أولاً)
1. Authentication endpoints (7 endpoints)
2. Public endpoints (4 endpoints)
3. Children basic CRUD (4 endpoints)

**Total:** 15 endpoints

### Phase 2 - High Priority
4. Doctors endpoints (3 endpoints)
5. Mahara activities (4 endpoints)
6. Appointments basic (3 endpoints)

**Total:** 10 endpoints

### Phase 3 - Medium Priority
7. Appointments advanced (3 endpoints)
8. Notifications (2 endpoints)
9. File upload (1 endpoint)

**Total:** 6 endpoints

### Phase 4 - Nice to Have
10. Assessments (5 endpoints)
11. Packages (2 endpoints)
12. Favorites (3 endpoints)
13. Statistics (1 endpoint)

**Total:** 11 endpoints

---

## 📝 ملاحظات مهمة للـ Backend Team

1. **Authentication:**
   - استخدام JWT Tokens
   - OTP افتراضي في التطوير: `123456`
   - مدة صلاحية OTP: 5 دقائق

2. **Pagination:**
   - معظم endpoints تحتاج pagination
   - Default: `page=1&limit=20`
   - Max limit: 100

3. **Language Support:**
   - دعم العربية والإنجليزية
   - عبر query parameter: `?language=ar`
   - أو Header: `Accept-Language: ar`

4. **Image Upload:**
   - Max size: 5MB
   - Formats: JPG, PNG, WEBP
   - Return URL after upload

5. **Error Format:**
   ```json
   {
     "success": false,
     "error": {
       "code": "ERROR_CODE",
       "message": "رسالة الخطأ",
       "details": {}
     }
   }
   ```

6. **Success Format:**
   ```json
   {
     "success": true,
     "message": "رسالة النجاح",
     "data": {}
   }
   ```

---

## الإجمالي

- **Total Endpoints:** 42 endpoint
- **Critical:** 15 endpoints
- **High Priority:** 10 endpoints
- **Medium Priority:** 6 endpoints
- **Nice to Have:** 11 endpoints

---

**تم الإنشاء:** 27 يناير 2026  
**المرجع الكامل:** انظر ملف `API_ENDPOINTS_REQUIREMENTS.md`
