import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';

/// Doctors & Specialists – theme aligned with app (AppColors).
/// Uses project dominant color (primary) instead of blue.
class DoctorsTheme {
  DoctorsTheme._();

  // Use app-wide colors for consistency
  static const Color pageBg = Color(0xFFF3F3F3); // AppColors.background
  static const Color cardBg = Color(0xFFFFFFFF); // AppColors.cardBackground
  static const Color cardBorder = Color(0xFFE8ECF4); // AppColors.border

  // Project dominant color (primary) – not blue
  static const Color primary = AppColors.primary;
  static const Color primaryDark = AppColors.primaryDark;
  static const Color success = Color(0xFF10B981); // verified, online
  static const Color successSoft = Color(0xFFD1FAE5);
  static const Color neutralSoft = Color(0xFFF1F5F9);

  // Text: use app colors for readability and contrast
  static const Color textPrimary = Color(0xFF191D23); // AppColors.textPrimary
  static const Color textSecondary = Color(0xFF36383B); // AppColors.textSecondary
  static const Color textTertiary = Color(0xFF74797F); // AppColors.textTertiary

  static double get cardRadius => 20.r;
  static double get buttonRadius => 12.r;

  static List<BoxShadow> cardShadow(bool pressed) => [
        BoxShadow(
          color: Colors.black.withOpacity(pressed ? 0.06 : 0.08),
          blurRadius: pressed ? 8 : 14,
          offset: Offset(0, pressed ? 2 : 4),
        ),
      ];
}
