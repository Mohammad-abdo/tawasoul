# Font Setup Instructions

## Current Status

The font references in `pubspec.yaml` are currently **commented out** because the font files are not yet present in the `assets/fonts/` directory.

## What This Means

- ✅ The app **will run** without the custom fonts
- ⚠️ Flutter will use **system default fonts** as fallback
- 📝 All font references in the code (`fontFamily: 'ExpoArabic'`, etc.) will be ignored

## To Enable Custom Fonts

1. **Add font files** to `assets/fonts/`:
   ```
   assets/fonts/
   ├── ExpoArabic-Regular.ttf
   ├── ExpoArabic-Bold.ttf
   ├── MadaniArabic-Regular.ttf
   ├── MadaniArabic-Medium.ttf
   ├── MadaniArabic-SemiBold.ttf
   └── Inter-Regular.ttf
   ```

2. **Uncomment the fonts section** in `pubspec.yaml`:
   ```yaml
   fonts:
     - family: ExpoArabic
       fonts:
         - asset: assets/fonts/ExpoArabic-Regular.ttf
         - asset: assets/fonts/ExpoArabic-Bold.ttf
           weight: 700
     - family: MadaniArabic
       fonts:
         - asset: assets/fonts/MadaniArabic-Regular.ttf
         - asset: assets/fonts/MadaniArabic-Medium.ttf
           weight: 500
         - asset: assets/fonts/MadaniArabic-SemiBold.ttf
           weight: 600
     - family: Inter
       fonts:
         - asset: assets/fonts/Inter-Regular.ttf
   ```

3. **Run**:
   ```bash
   flutter pub get
   ```

4. **Restart** the app

## Font Usage in Code

The app uses these fonts throughout:
- **ExpoArabic**: For headings (ExpoArabic-Regular, ExpoArabic-Bold)
- **MadaniArabic**: For body text (MadaniArabic-Regular, MadaniArabic-Medium, MadaniArabic-SemiBold)
- **Inter**: For numbers and technical text (Inter-Regular)

All font references in the code will automatically work once the fonts are added and uncommented in `pubspec.yaml`.


