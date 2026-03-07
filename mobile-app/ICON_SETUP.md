# إعداد أيقونة التطبيق

## ✅ التغييرات المكتملة

### 1. إضافة flutter_launcher_icons ✅
**الموقع:** `pubspec.yaml`

**التغييرات:**
- ✅ إضافة `flutter_launcher_icons: ^0.13.1` في dev_dependencies
- ✅ إضافة إعدادات `flutter_launcher_icons`:
  - استخدام `assets/icons/logoqeema.png` كأيقونة
  - خلفية بيضاء (`#FFFFFF`)
  - دعم Android و iOS
  - padding مناسب تلقائياً

---

## 🚀 خطوات التطبيق

### 1. تثبيت الحزمة
```bash
flutter pub get
```

### 2. توليد الأيقونات
```bash
flutter pub run flutter_launcher_icons
```

هذا الأمر سيقوم بـ:
- إنشاء جميع أحجام الأيقونات المطلوبة لـ Android
- إنشاء جميع أحجام الأيقونات المطلوبة لـ iOS
- إضافة padding مناسب تلقائياً
- استخدام خلفية بيضاء

---

## 📱 الأيقونات المولدة

### Android:
سيتم إنشاء الأيقونات في:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `android/app/src/main/res/mipmap-*/ic_launcher_foreground.png`
- `android/app/src/main/res/mipmap-*/ic_launcher_background.png`

### iOS:
سيتم إنشاء الأيقونات في:
- `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

---

## ⚙️ الإعدادات الحالية

```yaml
flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/icons/logoqeema.png"
  adaptive_icon_background: "#FFFFFF"
  adaptive_icon_foreground: "assets/icons/logoqeema.png"
  min_sdk_android: 21
  remove_alpha_ios: true
```

**الميزات:**
- ✅ خلفية بيضاء (`#FFFFFF`)
- ✅ padding مناسب تلقائياً
- ✅ دعم Adaptive Icons لـ Android
- ✅ إزالة الشفافية لـ iOS

---

## 🔄 بعد التوليد

بعد تشغيل الأمر، قم بـ:
```bash
flutter clean
flutter pub get
flutter run
```

---

## 📝 ملاحظات

- اللوجو يجب أن يكون بحجم 1024x1024 px للحصول على أفضل النتائج
- الأداة ستقوم تلقائياً بإنشاء جميع الأحجام المطلوبة
- Padding سيتم حسابه تلقائياً لضمان ظهور اللوجو بشكل جيد

---

## ✅ Checklist

- [x] إضافة flutter_launcher_icons package
- [x] إعداد pubspec.yaml
- [ ] تشغيل `flutter pub get`
- [ ] تشغيل `flutter pub run flutter_launcher_icons`
- [ ] إعادة بناء التطبيق
