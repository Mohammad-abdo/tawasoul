# Flutter Image Loading Error - Fix Guide

## Problem
The Flutter app is trying to load images from `via.placeholder.com` as fallbacks when images are missing. When the device can't reach this external service (network/DNS issues), the app crashes with:
```
Failed host lookup: 'via.placeholder.com'
```

## Solution

### Option 1: Quick Fix (Recommended)
Replace all `via.placeholder.com` URLs with null or empty strings. The app should handle null images gracefully.

### Option 2: Use ImageHelper (Best Practice)
I've created `lib/core/utils/image_helper.dart` which provides robust image loading with local fallbacks.

## Files to Update

### 1. home_screen.dart (Lines 127, 250, 459, 548)
**Before:**
```dart
final imageUrl = slider['imageUrl'] ?? 'https://via.placeholder.com/350x153';
```

**After:**
```dart
import 'package:mobile_app/core/utils/image_helper.dart';

// Use the helper:
ImageHelper.buildNetworkImage(
  imageUrl: slider['imageUrl'],
  width: 350,
  height: 153,
  fit: BoxFit.cover,
)

// OR simple fix:
final imageUrl = slider['imageUrl'] ?? '';
// Then add error handling to the Image.network widget
```

### 2. Quick Find & Replace Solution

Run these replacements across all Dart files:

**Find:** `'https://via.placeholder.com/`
**Replace:** `''   // Empty string`

Then ensure all `Image.network()` widgets have `errorBuilder`:

```dart
Image.network(
  imageUrl,
  errorBuilder: (context, error, stackTrace) {
    return Container(
      color: Colors.grey[200],
      child: Icon(Icons.image, color: Colors.grey[400]),
    );
  },
)
```

## Files Affected (24 instances)
- ✅ home_screen.dart (4 instances)
- ✅ appointments_list_screen.dart (3 instances)
- ✅ notifications_screen.dart (4 instances)
- ✅ chat_list_screen.dart (2 instances)
- ✅ chat_conversation_screen.dart (1 instance)
- ✅ products_list_screen.dart (1 instance)
- ✅ product_details_screen.dart (3 instances)
- ✅ checkout_screen.dart (3 instances)
- ✅ cart_screen.dart (1 instance)
- ✅ profile_update_screen.dart (1 instance)
- ✅ account_screen.dart (1 instance)

## Automated Fix Script

I can create a script to automatically replace all these instances. Would you like me to do that?

## Alternative: Network Image with Cached Fallback

Use the `cached_network_image` package which handles errors better:

```yaml
# pubspec.yaml
dependencies:
  cached_network_image: ^3.3.0
```

```dart
CachedNetworkImage(
  imageUrl: imageUrl ?? '',
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
)
```

## Recommendation

**For now (quickest fix):**
1. Remove all `via.placeholder.com` fallback URLs
2. Use empty strings or null
3. Add error handlers to Image.network widgets

**For long term:**
Use the `ImageHelper` class I created for consistent error handling across the app.
