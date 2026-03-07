# تحديث اسم التطبيق والأيقونة

## ✅ التغييرات المكتملة

### 1. إصلاح خطأ AppIcons.money ✅
**الموقع:** `lib/core/theme/app_icons.dart`

**التغيير:**
- ✅ إضافة `static const IconData money = Icons.attach_money_rounded;`

---

### 2. تغيير اسم التطبيق إلى "تواصل" ✅

#### Android
**الموقع:** `android/app/src/main/AndroidManifest.xml`
- ✅ تغيير `android:label` من "Tawasoul" إلى "تواصل"

#### iOS
**الموقع:** `ios/Runner/Info.plist`
- ✅ تغيير `CFBundleDisplayName` من "Tawasoul" إلى "تواصل"
- ✅ تغيير `CFBundleName` من "Tawasoul" إلى "تواصل"

#### pubspec.yaml
**الموقع:** `pubspec.yaml`
- ✅ تغيير `description` إلى "تواصل - تطبيق تأهيل الأطفال"

---

### 3. تغيير الأيقونة 📱

**ملاحظة:** لتغيير أيقونة التطبيق، يجب استبدال ملفات الأيقونة في المجلدات التالية:

#### Android:
```
android/app/src/main/res/
├── mipmap-hdpi/ic_launcher.png
├── mipmap-mdpi/ic_launcher.png
├── mipmap-xhdpi/ic_launcher.png
├── mipmap-xxhdpi/ic_launcher.png
└── mipmap-xxxhdpi/ic_launcher.png
```

**الأحجام المطلوبة:**
- mipmap-mdpi: 48x48 px
- mipmap-hdpi: 72x72 px
- mipmap-xhdpi: 96x96 px
- mipmap-xxhdpi: 144x144 px
- mipmap-xxxhdpi: 192x192 px

#### iOS:
```
ios/Runner/Assets.xcassets/AppIcon.appiconset/
```

**الأحجام المطلوبة:**
- 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

---

## 🔧 كيفية تغيير الأيقونة

### الطريقة 1: استخدام أداة Flutter Launcher Icons (موصى به)

1. إضافة الحزمة إلى `pubspec.yaml`:
```yaml
dev_dependencies:
  flutter_launcher_icons: ^0.13.1
```

2. إضافة الإعدادات:
```yaml
flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/icons/app_icon.png"  # مسار الأيقونة
```

3. تشغيل الأمر:
```bash
flutter pub get
flutter pub run flutter_launcher_icons
```

### الطريقة 2: استبدال يدوي

1. إنشاء أيقونة بحجم 1024x1024 px
2. استخدام أداة مثل [App Icon Generator](https://appicon.co/) لإنشاء جميع الأحجام
3. استبدال الملفات في المجلدات المذكورة أعلاه

---

## ✅ Checklist

- [x] إصلاح خطأ AppIcons.money
- [x] تغيير اسم التطبيق في AndroidManifest.xml
- [x] تغيير اسم التطبيق في Info.plist
- [x] تغيير description في pubspec.yaml
- [ ] استبدال أيقونة التطبيق (يتطلب ملفات صور)

---

## 🚀 النتيجة

- ✅ اسم التطبيق الآن: **"تواصل"**
- ✅ لا توجد أخطاء في الكود
- ⚠️ الأيقونة: يجب استبدال ملفات الأيقونة يدوياً أو باستخدام أداة

---

## 📝 ملاحظات

- بعد تغيير الأيقونة، يجب إعادة بناء التطبيق:
  ```bash
  flutter clean
  flutter pub get
  flutter run
  ```

- للتأكد من تغيير الاسم، يمكن فحصه في:
  - Android: إعدادات الجهاز > التطبيقات
  - iOS: الشاشة الرئيسية
