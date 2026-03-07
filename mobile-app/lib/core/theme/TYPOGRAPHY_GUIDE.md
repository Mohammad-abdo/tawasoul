# Typography System Guide

## 📋 Complete Typography Scale

### Font Sizes

| Size | Value | Usage |
|------|-------|-------|
| **XL** | 28sp | Main headlines, hero text |
| **L** | 24sp | Section titles, important headers |
| **ML** | 20sp | Subsection titles |
| **M** | 18sp | Card titles, list headers |
| **MS** | 16sp | Body text, buttons, primary content |
| **S** | 14sp | Secondary text, descriptions |
| **XS** | 12sp | Captions, metadata, helper text |
| **XXS** | 11sp | Navigation labels, tiny text |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| **Light** | 300 | Rarely used |
| **Regular** | 400 | Body text, standard content |
| **Medium** | 500 | Labels, emphasis |
| **SemiBold** | 600 | Headings, important text |
| **Bold** | 700 | Large headings, hero text |

### Line Heights

| Height | Value | Usage |
|--------|-------|-------|
| **Tight** | 1.2 | Headlines, single lines |
| **Normal** | 1.5 | Body text, paragraphs |
| **Relaxed** | 1.6 | Long paragraphs |

---

## 🎯 Usage Examples

### Headings

```dart
// Main page title
Text('الرئيسية', style: AppTypography.headingXL(context))

// Section header
Text('الحجوزات القادمة', style: AppTypography.headingM(context))

// Card title
Text('اسم الاختصاصي', style: AppTypography.headingS(context))
```

### Body Text

```dart
// Primary content
Text('هذا هو النص الرئيسي', style: AppTypography.bodyLarge(context))

// Description
Text('وصف تفصيلي للخدمة', style: AppTypography.bodyMedium(context))

// Caption
Text('منذ 5 دقائق', style: AppTypography.bodySmall(context))
```

### Labels

```dart
// Form label
Text('الاسم الكامل', style: AppTypography.labelLarge(context))

// Navigation label
Text('الرئيسية', style: AppTypography.navLabel(context, isActive: true))
```

### Special Text

```dart
// Link
Text('المزيد', style: AppTypography.primaryText(context))

// Secondary info
Text('وصف ثانوي', style: AppTypography.secondaryText(context))

// Placeholder
Text('أدخل النص هنا', style: AppTypography.placeholderText(context))

// Number
Text('4.9', style: AppTypography.numberText(context))
```

---

## ✅ DO's

1. **Use standardized sizes**
   - Always use AppTypography methods
   - Don't create custom font sizes

2. **Maintain hierarchy**
   - Headings must be larger than body
   - Important text must stand out

3. **Consistent weights**
   - Body text: Regular (400)
   - Headings: SemiBold (600) or Bold (700)
   - Labels: Medium (500)

4. **Proper line heights**
   - Headlines: 1.2
   - Body text: 1.5
   - Long paragraphs: 1.6

5. **Font families**
   - Arabic text: MadaniArabic
   - Large headings: ExpoArabic
   - Numbers: Inter

---

## ❌ DON'Ts

1. **Don't mix font sizes randomly**
   ```dart
   // ❌ BAD
   Text('Title', style: TextStyle(fontSize: 17.sp))
   
   // ✅ GOOD
   Text('Title', style: AppTypography.headingM(context))
   ```

2. **Don't use bold for body text**
   ```dart
   // ❌ BAD
   Text('Body', style: TextStyle(fontWeight: FontWeight.bold))
   
   // ✅ GOOD
   Text('Body', style: AppTypography.bodyLarge(context))
   ```

3. **Don't use small sizes for important text**
   ```dart
   // ❌ BAD
   Text('Important!', style: TextStyle(fontSize: 12.sp))
   
   // ✅ GOOD
   Text('Important!', style: AppTypography.headingS(context))
   ```

4. **Don't override line heights unnecessarily**
   ```dart
   // ❌ BAD
   Text('Text', style: TextStyle(height: 2.0))
   
   // ✅ GOOD
   Text('Text', style: AppTypography.bodyLarge(context))
   ```

5. **Don't mix font families incorrectly**
   ```dart
   // ❌ BAD
   Text('Arabic', style: TextStyle(fontFamily: 'Inter'))
   
   // ✅ GOOD
   Text('Arabic', style: AppTypography.bodyLarge(context))
   ```

---

## 📱 Screen-Specific Guidelines

### Bottom Navigation
- **Icon**: 26sp
- **Label**: 11sp, Regular/SemiBold
- **Active**: Primary color, SemiBold
- **Inactive**: Tertiary color, Regular

### Headers
- **Title**: 18sp, SemiBold
- **Subtitle**: 14sp, Regular

### Cards
- **Title**: 16sp, SemiBold
- **Description**: 14sp, Regular
- **Metadata**: 12sp, Regular

### Buttons
- **Primary**: 16sp, Regular
- **Secondary**: 14sp, Regular

### Forms
- **Label**: 16sp, Medium
- **Input**: 16sp, Regular
- **Helper**: 12sp, Regular
- **Error**: 14sp, Regular

---

## 🌍 RTL Support

All typography styles support RTL automatically:
- Text alignment handled by parent widget
- Letter spacing: 0 (no issues with RTL)
- Line heights work for both directions

---

## 📊 Typography Hierarchy

```
XL (28sp, Bold)     → Main headlines
L (24sp, Bold)      → Section titles
ML (20sp, Bold)     → Subsection titles
M (18sp, SemiBold)  → Card titles
MS (16sp, Regular)  → Body text, buttons
S (14sp, Regular)   → Secondary text
XS (12sp, Regular)  → Captions
XXS (11sp, Regular) → Navigation labels
```

---

## 🎨 Visual Examples

### Page Header
```
[XL Heading] Main Title
[S Body]     Subtitle or description
```

### Card
```
[M Heading]  Card Title
[S Body]     Card description text
[XS Body]    Metadata or timestamp
```

### Navigation
```
[Icon 26sp]
[XXS Label]  Navigation Item
```

---

## 🔧 Implementation

All typography is centralized in:
- `lib/core/theme/app_typography.dart`

Use throughout the app:
```dart
import 'package:your_app/core/theme/app_typography.dart';

Text('Hello', style: AppTypography.bodyLarge(context))
```

---

## 📝 Notes

- All sizes use `.sp` (ScreenUtil) for responsiveness
- Line heights are unitless (multipliers)
- Letter spacing is always 0
- Font families support Arabic & English equally
- Maximum 2 font families used (MadaniArabic + ExpoArabic/Inter)
