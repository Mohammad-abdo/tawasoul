# 🏥 دليل صفحة حجز المواعيد مع الأطباء

## التاريخ: 29 يناير 2026

---

## ✨ **المميزات الجديدة**

تم إنشاء صفحة حجز احترافية وجميلة للمواعيد مع الأطباء تتضمن:

### 🎯 **النظام المتدرج (Step-by-Step)**

الصفحة مقسمة إلى **4 خطوات متدرجة**:

1. ✅ **اختيار الطفل** - اختر الطفل الذي سيحضر الجلسة
2. ✅ **اختيار التاريخ** - حدد اليوم المناسب للموعد
3. ✅ **اختيار الوقت** - اختر الوقت المناسب (صباحي/مسائي/ليلي)
4. ✅ **طريقة الدفع** - حدد طريقة الدفع (فوري أو محفظة إلكترونية)

---

## 📱 **التصميم والواجهة**

### 🎨 **Header (رأس الصفحة)**
- صورة الطبيب
- اسم الطبيب
- التخصص
- زر رجوع

### 📊 **Step Indicator (مؤشر التقدم)**
- 4 خطوات بصرية
- دوائر مرقمة
- خط يربط بين الخطوات
- يوضح الخطوة الحالية والمكتملة

### 💳 **طرق الدفع**
```dart
1. فوري (Fawry)
   - أيقونة: payment
   - لون: warning (برتقالي)
   - "ادفع بسهولة من أي فرع فوري"

2. المحفظة الإلكترونية
   - أيقونة: account_balance_wallet
   - لون: success (أخضر)
   - "ادفع من محفظتك الإلكترونية"
```

---

## 🔥 **الميزات التفاعلية**

### 1. **اختيار الطفل** 👶
```dart
- قائمة بجميع الأطفال المسجلين
- كارد لكل طفل مع:
  * صورة رمزية
  * اسم الطفل
  * العمر (محسوب من تاريخ الميلاد)
  * علامة اختيار (✓)
  * تأثير hover
  * shadow عند الاختيار
```

### 2. **اختيار التاريخ** 📅
```dart
- عرض الشهر والسنة
- أزرار للتنقل بين الأشهر
- قائمة أفقية للأيام (14 يوم قادم)
- كل يوم يعرض:
  * اسم اليوم
  * رقم اليوم
  * تدرج لوني عند الاختيار
  * shadow جميل
```

### 3. **اختيار الوقت** ⏰
```dart
مقسم إلى 3 فترات:

🌅 الفترة الصباحية:
   09:00 ص - 10:00 ص - 11:00 ص - 12:00 م

🌆 الفترة المسائية:
   02:00 م - 03:00 م - 04:00 م - 05:00 م

🌙 الفترة الليلية:
   07:00 م - 08:00 م - 09:00 م - 10:00 م

- أوقات متاحة: زر قابل للضغط
- أوقات محجوزة: خط يتوسط النص + أيقونة حظر
- حقل ملاحظات اختياري (200 حرف)
```

### 4. **طريقة الدفع** 💰
```dart
- كاردات كبيرة وواضحة
- تصميم مميز لكل طريقة
- علامة اختيار واضحة
- ملخص الحجز:
  * اسم الطبيب
  * التاريخ
  * الوقت
  * طريقة الدفع
  * السعر الإجمالي
```

---

## 🎨 **التفاصيل البصرية**

### الألوان المستخدمة:
```dart
- Primary: الأزرق الرئيسي
- Success: الأخضر (للمواعيد المتاحة والمحفظة)
- Warning: البرتقالي (فوري)
- Gray: للعناصر غير النشطة
- White: الخلفيات
```

### التأثيرات:
```dart
✅ Gradients (تدرجات لونية)
✅ Shadows (ظلال عميقة)
✅ Border Radius (زوايا دائرية)
✅ Animations (تحريكات سلسة)
✅ Hover Effects (تأثيرات عند التحويم)
```

---

## 🚀 **كيفية الاستخدام**

### المسار:
```dart
/doctor/book/:doctorId
```

### مثال:
```dart
context.push('/doctor/book/doc_1');
```

### من كارد الطبيب:
```dart
// في home_screen.dart أو doctors_list_screen.dart
GestureDetector(
  onTap: () => context.push('/doctor/book/${doctor['id']}'),
  child: DoctorCard(...),
)
```

---

## 📝 **الأزرار والتنقل**

### Footer (تذييل الصفحة):
```dart
1. زر "السابق":
   - يظهر من الخطوة الثانية
   - يرجع للخطوة السابقة
   - OutlinedButton

2. زر "التالي" / "تأكيد الحجز":
   - ينتقل للخطوة التالية
   - في الخطوة الأخيرة: يؤكد الحجز
   - ElevatedButton مع Gradient
   - يتحول لـ Loading عند التأكيد
   - معطل إذا لم تكتمل الخطوة
```

---

## 🎉 **Dialog النجاح**

عند تأكيد الحجز بنجاح:

```dart
✅ أيقونة نجاح كبيرة
✅ رسالة "تم الحجز بنجاح!"
✅ نص توضيحي
✅ زرين:
   - "الرئيسية": يرجع للصفحة الرئيسية
   - "مواعيدي": ينتقل لصفحة المواعيد
```

---

## 🔧 **الـ Providers المستخدمة**

```dart
1. DoctorsProvider
   - getDoctorById() - جلب بيانات الطبيب
   - getAvailableSlots() - جلب المواعيد المتاحة

2. ChildrenProvider
   - children - قائمة الأطفال

3. BookingsProvider
   - bookAppointment() - حجز الموعد
```

---

## 💻 **الكود الرئيسي**

### الملفات المعنية:
```
✅ doctor_booking_screen.dart (جديد)
✅ app_router.dart (محدث)
✅ children_provider.dart (محدث - إضافة birthDate)
✅ home_screen.dart (مصلح)
```

### التحديثات:
```dart
1. إضافة birthDate لـ Child class
2. إصلاح syntax error في home_screen
3. إضافة مسار جديد: /doctor/book/:doctorId
4. حساب العمر تلقائياً من birthDate
```

---

## 🎯 **Validation (التحقق)**

الصفحة تتحقق من:

```dart
✅ الخطوة 0: طفل محدد
✅ الخطوة 1: تاريخ محدد
✅ الخطوة 2: وقت محدد + ملاحظات اختيارية
✅ الخطوة 3: طريقة دفع محددة
✅ بيانات الطبيب موجودة
✅ عدم تكرار الحجز
```

---

## 📊 **حسابات العمر**

```dart
String _calculateAge(String birthDate) {
  try {
    final birth = DateTime.parse(birthDate);
    final today = DateTime.now();
    int years = today.year - birth.year;
    if (today.month < birth.month || 
        (today.month == birth.month && today.day < birth.day)) {
      years--;
    }
    return '$years سنة';
  } catch (e) {
    return 'غير محدد';
  }
}
```

---

## 🎨 **أمثلة التصميم**

### كارد الطفل:
```dart
Container(
  padding: 20.w,
  decoration: BoxDecoration(
    color: isSelected ? primary.opacity(0.08) : white,
    borderRadius: 20.r,
    border: Border.all(
      color: isSelected ? primary : border,
      width: isSelected ? 2 : 1,
    ),
    boxShadow: isSelected ? [...] : [],
  ),
  child: Row(
    children: [
      CheckCircle or Circle,
      Name + Age,
      ChildIcon,
    ],
  ),
)
```

### كارد التاريخ:
```dart
Container(
  width: 70.w,
  decoration: BoxDecoration(
    gradient: isSelected ? LinearGradient(...) : null,
    color: !isSelected ? gray50 : null,
    borderRadius: 16.r,
    boxShadow: isSelected ? [...] : [],
  ),
  child: Column(
    children: [
      DayName,
      DayNumber,
    ],
  ),
)
```

### كارد الوقت:
```dart
Container(
  width: 100.w,
  padding: vertical 14.h,
  decoration: BoxDecoration(
    color: !available ? gray100 : (selected ? primary : white),
    borderRadius: 12.r,
    border: Border.all(...),
  ),
  child: Row(
    children: [
      Icon (check/block),
      Time Text,
    ],
  ),
)
```

---

## 🔄 **تدفق البيانات**

```mermaid
User Selection → State Update → UI Refresh
     ↓                ↓              ↓
  Step 0         selectedChildId   Child Card
  Step 1         selectedDate      Date Grid
  Step 2         selectedTime      Time Slots
  Step 3         paymentMethod     Payment Cards
     ↓                ↓              ↓
Confirm Button → BookingProvider → Success Dialog
```

---

## 📱 **الاستجابة (Responsive)**

```dart
✅ استخدام ScreenUtil (.w, .h, .sp, .r)
✅ تصميم يتكيف مع جميع الشاشات
✅ قوائم أفقية scrollable
✅ Wrap للعناصر المتعددة
✅ SafeArea لجميع الأجهزة
```

---

## ⚡ **الأداء**

```dart
✅ Lazy loading للأطفال
✅ Caching لبيانات الطبيب
✅ Simulated delay للـ mock data
✅ Efficient state management
✅ Minimal rebuilds
```

---

## 🐛 **الأخطاء المصلحة**

### 1. Syntax Error في home_screen.dart:
```dart
❌ قبل:
children: [
  Icon(
      Icons.play_circle_filled_rounded,
      ...
    ),  // ❌ محاذاة خاطئة

✅ بعد:
children: [
  Icon(
    Icons.play_circle_filled_rounded,
    ...
  ),  // ✅ محاذاة صحيحة
```

### 2. birthDate مفقود في Child:
```dart
❌ قبل:
class Child {
  final String id;
  final String? name;
  // ❌ لا يوجد birthDate
}

✅ بعد:
class Child {
  final String id;
  final String? name;
  final String? birthDate;  // ✅ مضاف
}
```

---

## 📚 **الملخص التقني**

### الميزات:
- ✅ 4 خطوات متدرجة
- ✅ اختيار الطفل مع عرض العمر
- ✅ اختيار التاريخ (14 يوم قادم)
- ✅ اختيار الوقت (3 فترات)
- ✅ طريقتي دفع (فوري + محفظة)
- ✅ ملخص الحجز
- ✅ Dialog نجاح
- ✅ Loading states
- ✅ Error handling
- ✅ Validation

### التصميم:
- ✅ Modern & Clean
- ✅ Gradients & Shadows
- ✅ Smooth Animations
- ✅ Professional UI/UX
- ✅ Responsive Design

---

## 🎯 **كيفية التشغيل**

```bash
flutter run
```

### للوصول للصفحة:
1. سجل دخول
2. اذهب للصفحة الرئيسية
3. اختر طبيب من قائمة الأطباء
4. اضغط على "احجز الآن" (سيتم تحديثه قريباً)
5. أو استخدم: `context.push('/doctor/book/doc_1')`

---

## 🔜 **التحسينات المستقبلية**

- [ ] إضافة مواعيد محجوزة من الـ backend
- [ ] تكامل مع payment gateway حقيقي
- [ ] إضافة تقويم كامل
- [ ] تصفية حسب التخصص
- [ ] إضافة تقييمات للأطباء
- [ ] إشعارات push للمواعيد
- [ ] تذكير قبل الموعد

---

## ✨ **الخلاصة**

تم إنشاء صفحة حجز **احترافية وجميلة** مع:
- ✅ تصميم modern
- ✅ تجربة مستخدم ممتازة
- ✅ 4 خطوات واضحة
- ✅ طرق دفع متعددة
- ✅ validation كامل
- ✅ error handling
- ✅ success feedback

**جاهزة للاستخدام!** 🎉

---

**آخر تحديث:** 29 يناير 2026  
**الحالة:** ✅ جاهز 100%  
**الملف:** `doctor_booking_screen.dart`  
**المسار:** `/doctor/book/:doctorId`
