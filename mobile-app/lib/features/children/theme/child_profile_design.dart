import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';

/// Child Profile & Assessment design tokens.
/// Calm, child-friendly, professional educational UI.
/// Arabic-first RTL, high contrast, touch-friendly.
class ChildProfileDesign {
  ChildProfileDesign._();

  // --- Card & Layout ---
  static double get cardRadius => 20.r;
  static double get cardRadiusSmall => 14.r;
  static double get buttonRadius => 16.r;
  static EdgeInsets get cardPadding => EdgeInsets.all(20.w);
  static EdgeInsets get cardPaddingSmall => EdgeInsets.all(14.w);

  static List<BoxShadow> cardShadow(BuildContext context) => [
        BoxShadow(
          color: Colors.black.withOpacity(0.06),
          blurRadius: 14,
          offset: const Offset(0, 4),
        ),
      ];

  static List<BoxShadow> cardShadowSoft(BuildContext context) => [
        BoxShadow(
          color: Colors.black.withOpacity(0.04),
          blurRadius: 8,
          offset: const Offset(0, 2),
        ),
      ];

  // --- Status colors (child-friendly, clear) ---
  static const Color statusActive = Color(0xFF10B981); // green - نشط
  static const Color statusImproving = Color(0xFF3B82F6); // blue - يتحسن
  static const Color statusNeedsAttention = Color(0xFFF59E0B); // amber - يحتاج متابعة

  // --- Child profile palette (calm, trustworthy) ---
  static const Color profileBg = Color(0xFFF8FAFC);
  static const Color profileCardBg = AppColors.white;
  static const Color profileAccent = AppColors.primary;
  static const Color profileAccentLight = Color(0xFFFCE7F0);

  // --- Assessment palette ---
  static const Color assessmentSuccess = Color(0xFF10B981);
  static const Color assessmentProgress = Color(0xFF3B82F6);
  static const Color assessmentNeutral = Color(0xFF94A3B8);

  // --- Typography helpers ---
  static TextStyle titleLarge(BuildContext context) => TextStyle(
        fontFamily: AppTypography.headingFont,
        fontSize: 22.sp,
        fontWeight: AppTypography.bold,
        color: AppColors.textPrimary,
        height: 1.3,
      );

  static TextStyle titleMedium(BuildContext context) => TextStyle(
        fontFamily: AppTypography.primaryFont,
        fontSize: 18.sp,
        fontWeight: AppTypography.semiBold,
        color: AppColors.textPrimary,
        height: 1.4,
      );

  static TextStyle bodyFriendly(BuildContext context) => TextStyle(
        fontFamily: AppTypography.primaryFont,
        fontSize: 15.sp,
        fontWeight: AppTypography.regular,
        color: AppColors.textSecondary,
        height: 1.5,
      );

  static TextStyle captionFriendly(BuildContext context) => TextStyle(
        fontFamily: AppTypography.primaryFont,
        fontSize: 13.sp,
        fontWeight: AppTypography.regular,
        color: AppColors.textTertiary,
        height: 1.4,
      );
}
