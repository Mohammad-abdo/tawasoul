# دليل الهجرة - Migration Guide

## المشكلة / Problem
عند محاولة تشغيل الهجرة، تظهر تحذيرات حول القيد الفريد (unique constraint) على عمود `phone` بسبب وجود قيم مكررة أو NULL في قاعدة البيانات.

## الحل / Solution

### الخطوة 1: تنظيف البيانات الموجودة

قبل تشغيل الهجرة، يجب تنظيف البيانات:

#### الطريقة 1: تنظيف يدوي (موصى به)

1. الاتصال بقاعدة البيانات:
```bash
mysql -u root -p tawasoul
```

2. التحقق من الأرقام المكررة:
```sql
SELECT phone, COUNT(*) as count 
FROM users 
WHERE phone IS NOT NULL AND phone != ''
GROUP BY phone 
HAVING count > 1;
```

3. إذا وُجدت أرقام مكررة، قم بتحديثها:
```sql
-- هذا سيبقي أول رقم ويضيف suffix للباقي
UPDATE users u1
INNER JOIN (
    SELECT phone, MIN(id) as min_id
    FROM users
    WHERE phone IS NOT NULL AND phone != ''
    GROUP BY phone
    HAVING COUNT(*) > 1
) u2 ON u1.phone = u2.phone AND u1.id != u2.min_id
SET u1.phone = CONCAT(u1.phone, '_', SUBSTRING(u1.id, 1, 8));
```

4. تعيين قيم مؤقتة للأرقام الفارغة:
```sql
UPDATE users 
SET phone = CONCAT('temp_', id, '_', UNIX_TIMESTAMP()) 
WHERE phone IS NULL OR phone = '';
```

#### الطريقة 2: استخدام سكريبت التنظيف

قم بتشغيل ملف التنظيف:
```bash
mysql -u root -p tawasoul < prisma/migrations/cleanup_phone.sql
```

#### الطريقة 3: إعادة تعيين الجدول (إذا لم تكن هناك بيانات مهمة)

إذا لم يكن لديك بيانات مستخدمين مهمة:
```sql
TRUNCATE TABLE users;
```

### الخطوة 2: تشغيل الهجرة

بعد تنظيف البيانات، قم بتشغيل الهجرة:

```bash
npx prisma migrate dev --name add_mobile_app_features
```

### الخطوة 3: تحديث البيانات الموجودة

بعد نجاح الهجرة، يجب تحديث المستخدمين الموجودين:

```sql
-- تحديث المستخدمين الذين لديهم phone مؤقت
UPDATE users 
SET fullName = COALESCE(fullName, username, 'User'),
    phone = NULL  -- سيتم تحديثه عند تسجيل الدخول بالـ OTP
WHERE phone LIKE 'temp_%';
```

### الخطوة 4: جعل phone مطلوباً (اختياري)

إذا أردت جعل phone مطلوباً بعد الهجرة:

1. تحديث الـ schema:
```prisma
phone String @unique // Required for OTP auth
```

2. إنشاء هجرة جديدة:
```bash
npx prisma migrate dev --name make_phone_required
```

---

## ملاحظات مهمة / Important Notes

- ⚠️ **احفظ نسخة احتياطية** من قاعدة البيانات قبل تشغيل أي سكريبت
- ✅ تأكد من عدم وجود أرقام مكررة قبل إضافة القيد الفريد
- 📝 المستخدمون الجدد سيستخدمون OTP للتحقق من رقم الهاتف
- 🔄 المستخدمون الموجودون سيحتاجون لتسجيل الدخول بالـ OTP لتحديث رقم الهاتف

---

## Troubleshooting

### خطأ: Duplicate entry for key 'phone'
- تأكد من تشغيل سكريبت التنظيف أولاً
- تحقق من عدم وجود أرقام مكررة

### خطأ: Cannot add foreign key constraint
- تأكد من تشغيل جميع الهجرات السابقة
- تحقق من وجود الجداول المطلوبة

### خطأ: Column 'phone' cannot be null
- قم بتعيين قيم مؤقتة للأرقام الفارغة
- أو اجعل phone nullable مؤقتاً في الـ schema

