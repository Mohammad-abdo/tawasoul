# 🌐 Language Switching & Backend Connection - Implementation Guide

## ✅ Completed

### 1. Language Provider Created
- `mobile-app/lib/core/providers/language_provider.dart`
- Manages language state (Arabic/English)
- Saves preference to SharedPreferences
- Notifies listeners when language changes

### 2. Home Data Provider Created
- `mobile-app/lib/core/providers/home_data_provider.dart`
- Fetches sliders, services, and articles from backend
- Handles loading and error states

### 3. FAQ Provider Created
- `mobile-app/lib/core/providers/faq_provider.dart`
- Fetches FAQs from backend

### 4. Main App Updated
- Added LanguageProvider, HomeDataProvider, FAQProvider to MultiProvider
- App now uses Consumer to react to language changes
- Locale is dynamically set from LanguageProvider

### 5. Backend Endpoints Ready
- `GET /api/public/home-data` - Returns sliders, services, articles
- `GET /api/public/faqs` - Returns FAQs
- All data supports Arabic and English

## 📝 Remaining Tasks

### 1. Update Home Screen (`home_screen.dart`)
Need to update these methods to use backend data:

```dart
// Current: Hardcoded data
_buildQuickBookBanner(context)
_buildServicesSection(context)  
_buildArticlesSection(context)

// Should be:
_buildQuickBookBanner(context, sliderData, isArabic)
_buildServicesSection(context, servicesList, isArabic)
_buildArticlesSection(context, articlesList, isArabic)
```

### 2. Update FAQ Screen (`faq_screen.dart`)
Replace hardcoded FAQs with:
```dart
Consumer<FAQProvider>(
  builder: (context, faqProvider, child) {
    // Use faqProvider.faqs
  }
)
```

### 3. Update Profile Update Screen
Language dropdown should use LanguageProvider (partially done)

### 4. Update All Screens with Static Data
Check these screens for hardcoded text:
- Login screen
- OTP verification
- Child profile selection
- Appointment booking
- Chat screens
- Account screen
- Products screen
- Cart screen
- Checkout screen

## 🔧 How Language Switching Works

1. User selects language in Profile Update screen
2. LanguageProvider.setLanguage() is called
3. Language is saved to SharedPreferences
4. LanguageProvider notifies listeners
5. MaterialApp.router rebuilds with new locale
6. All Consumer widgets rebuild with new language

## 📡 Backend Data Structure

### Home Data Response:
```json
{
  "success": true,
  "data": {
    "sliders": [
      {
        "id": "...",
        "title": "احجز الآن",
        "description": "مع أمهر المتخصصين",
        "imageUrl": "http://...",
        "buttonText": "حجز",
        "buttonLink": "/appointments/booking"
      }
    ],
    "services": [
      {
        "id": "...",
        "title": "حجز استشارة جديدة",
        "description": "...",
        "imageUrl": "...",
        "link": "/appointments/booking"
      }
    ],
    "articles": [
      {
        "id": "...",
        "title": "التواصل والتخاطب",
        "description": "اكتر من 200 مقالة و سؤال",
        "imageUrl": "...",
        "link": "..."
      }
    ]
  }
}
```

### FAQ Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "question": "ما هو تطبيق تواصل؟",
      "answer": "...",
      "category": null
    }
  ]
}
```

## 🚀 Next Steps

1. **Update Home Screen Methods:**
   - Modify `_buildQuickBookBanner` to accept slider data
   - Modify `_buildServicesSection` to accept services list
   - Modify `_buildArticlesSection` to accept articles list
   - Use language code to show Arabic or English text

2. **Update FAQ Screen:**
   - Replace hardcoded FAQs with FAQProvider
   - Add loading and error states

3. **Test Language Switching:**
   - Verify language persists after app restart
   - Verify all screens update when language changes

4. **Add More Backend Endpoints:**
   - Static pages (About, Privacy Policy, Terms)
   - App settings
   - Notification templates

---

**Status: ✅ Core Infrastructure Complete - Screen Updates Pending**


