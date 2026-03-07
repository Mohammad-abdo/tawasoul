# 📚 دليل استخدام ملفات الـ API Documentation

تم إنشاء **3 ملفات شاملة** تحتوي على جميع الـ API endpoints المطلوبة من فريق الـ Backend لربط تطبيق Tawasoul.

---

## 📁 الملفات المُنشأة

### 1️⃣ **API_ENDPOINTS_REQUIREMENTS.md**
**الوصف:** وثيقة شاملة ومفصلة تحتوي على:
- شرح كامل لكل endpoint
- أمثلة على Request/Response
- التفاصيل الكاملة لكل API
- الـ Enums والـ Data Types
- ملاحظات مهمة وأولويات التنفيذ

**متى تستخدمه:**
- عند الحاجة لفهم تفاصيل أي endpoint
- لمشاركته مع فريق الـ Backend كمرجع كامل
- للرجوع إليه أثناء التطوير

---

### 2️⃣ **API_ENDPOINTS_CHECKLIST.md**
**الوصف:** قائمة سريعة ومختصرة على شكل Checklist تحتوي على:
- قائمة بجميع الـ endpoints
- تقسيم حسب الأولويات
- Enums المطلوبة
- ملاحظات مختصرة

**متى تستخدمه:**
- لمتابعة تقدم التنفيذ
- للتأكد من اكتمال جميع الـ endpoints
- كمرجع سريع أثناء الاجتماعات

**كيفية الاستخدام:**
```markdown
ضع علامة ✅ بجانب كل endpoint تم تنفيذه:
- [x] POST /user/auth/send-otp
- [x] POST /user/auth/verify-otp
- [ ] POST /user/auth/resend-otp
```

---

### 3️⃣ **Tawasoul_API_Collection.postman_collection.json**
**الوصف:** ملف Postman Collection جاهز للاستيراد يحتوي على:
- جميع الـ endpoints منظمة
- أمثلة Request Body لكل endpoint
- متغيرات للـ Base URL والـ Token
- جاهز للاختبار مباشرة

**كيفية الاستخدام:**

#### الخطوة 1: استيراد الملف إلى Postman
1. افتح تطبيق Postman
2. اضغط على **Import** (أعلى يسار النافذة)
3. اسحب ملف `Tawasoul_API_Collection.postman_collection.json` إلى النافذة
4. اضغط **Import**

#### الخطوة 2: إعداد المتغيرات (Variables)
1. بعد الاستيراد، اذهب إلى الـ Collection
2. اضغط على زر **Variables**
3. قم بتعديل المتغيرات:
   - `baseUrl`: ضع عنوان الـ Backend (مثال: `http://192.168.1.14:3000/api`)
   - `token`: سيتم تعبئته تلقائياً بعد تسجيل الدخول

#### الخطوة 3: اختبار الـ Endpoints
1. ابدأ بـ **1. Authentication & User Management**
2. اختبر endpoint **1.2 Verify OTP** (سيعطيك token)
3. انسخ الـ token من الـ Response وضعه في متغير `token`
4. الآن يمكنك اختبار باقي الـ endpoints المحمية

---

## 🎯 خطة العمل الموصى بها

### للمطورين (Frontend/Mobile)

1. **اقرأ ملف `API_ENDPOINTS_REQUIREMENTS.md`** لفهم البنية الكاملة
2. **استخدم ملف `API_ENDPOINTS_CHECKLIST.md`** لمتابعة التقدم
3. **استورد ملف Postman** لاختبار الـ APIs أثناء التطوير

### لفريق الـ Backend

1. **استلم ملف `API_ENDPOINTS_REQUIREMENTS.md`** كمرجع للتنفيذ
2. **اتبع أولويات التنفيذ** المذكورة في الملف:
   - **المرحلة 1:** Authentication + Public Endpoints + Children (15 endpoint)
   - **المرحلة 2:** Doctors + Activities + Appointments basic (10 endpoints)
   - **المرحلة 3:** Appointments advanced + Notifications (6 endpoints)
   - **المرحلة 4:** Assessments + Extras (11 endpoints)

3. **استخدم Postman Collection** لاختبار كل endpoint بعد تنفيذه

---

## 📊 إحصائيات الـ API

- **إجمالي الـ Endpoints:** 42 endpoint
- **Critical (المرحلة 1):** 15 endpoints
- **High Priority (المرحلة 2):** 10 endpoints
- **Medium Priority (المرحلة 3):** 6 endpoints
- **Nice to Have (المرحلة 4):** 11 endpoints

---

## 🔗 المجموعات الرئيسية

### 1. Authentication & User Management (7 endpoints)
- إرسال OTP، التحقق، تسجيل الخروج، إدارة الحساب

### 2. Public Endpoints (4 endpoints)
- Onboarding، Static Pages، Home Data، FAQs

### 3. Children Management (7 endpoints)
- إنشاء، تعديل، حذف، إحصائيات الأطفال

### 4. Doctors & Specialists (3 endpoints)
- قائمة الأطباء، التفاصيل، المواعيد المتاحة

### 5. Mahara Activities (4 endpoints)
- الأنشطة التعليمية والألعاب

### 6. Appointments & Bookings (6 endpoints)
- حجز، إلغاء، تعديل، تقييم المواعيد

### 7. Assessments & Tests (5 endpoints)
- الاختبارات والتقييمات

### 8. Additional Features (6 endpoints)
- الإشعارات، الباقات، المفضلة، رفع الصور

---

## 🛠️ ملاحظات تقنية مهمة

### Authentication
```
جميع endpoints تحت /user/* تحتاج إلى:
Authorization: Bearer {token}
```

### Date & Time Format
```
التاريخ: YYYY-MM-DD (مثال: 2026-01-27)
الوقت: HH:MM (مثال: 09:00)
التاريخ والوقت: ISO 8601 (مثال: 2026-01-27T10:00:00Z)
```

### Response Format
```json
// Success
{
  "success": true,
  "message": "رسالة النجاح",
  "data": {}
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "رسالة الخطأ"
  }
}
```

### Pagination
```
معظم الـ endpoints تدعم:
?page=1&limit=20
```

---

## 📞 للتواصل والاستفسارات

إذا كان لديك أي استفسار أو تحتاج لتوضيحات إضافية:

1. راجع ملف `API_ENDPOINTS_REQUIREMENTS.md` للتفاصيل الكاملة
2. استخدم Postman Collection للاختبار
3. تواصل مع فريق التطوير للتنسيق

---

## ✅ Checklist للبدء

- [ ] قراءة ملف `API_ENDPOINTS_REQUIREMENTS.md`
- [ ] مشاركة الملف مع فريق الـ Backend
- [ ] استيراد Postman Collection
- [ ] إعداد متغيرات Postman (baseUrl)
- [ ] اختبار Authentication endpoints
- [ ] متابعة التقدم عبر `API_ENDPOINTS_CHECKLIST.md`
- [ ] البدء في تطوير Frontend بناءً على الـ APIs الجاهزة

---

**تم الإنشاء بواسطة:** Antigravity AI  
**التاريخ:** 27 يناير 2026  
**المشروع:** Tawasoul Mobile App

---

## 🎉 نصائح إضافية

### للحصول على أفضل النتائج:

1. **ابدأ بالأولويات العالية:** Authentication → Public → Children
2. **اختبر كل endpoint بعد تنفيذه** باستخدام Postman
3. **احتفظ بالتوثيق محدثاً** مع أي تغييرات
4. **استخدم Git للتعاون** بين الـ Frontend والـ Backend
5. **راجع الـ Enums بعناية** لضمان التوافق

---

## 📖 مراجع إضافية

- **ملف المشروع الرئيسي:** `README.md`
- **إعدادات الاتصال:** `CONNECTION_SETUP.md`
- **دليل الاختبار:** `TESTING_GUIDE.md`

---

**Good Luck! 🚀**
