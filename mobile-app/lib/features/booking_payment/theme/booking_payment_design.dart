import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';

/// Booking Payment design tokens.
/// Trust, clarity, commitment, transparency.
/// Time-based services (sessions/appointments), not product purchases.
/// Calendar & clock icons, calm professional colors, service-focused language.
/// Arabic-first RTL, touch-friendly, accessibility-friendly.
class BookingPaymentDesign {
  BookingPaymentDesign._();

  // --- Card & Layout ---
  static double get cardRadius => 18.r;
  static double get cardRadiusSmall => 14.r;
  static double get buttonRadius => 14.r;
  static EdgeInsets get cardPadding => EdgeInsets.all(18.w);
  static EdgeInsets get cardPaddingSmall => EdgeInsets.all(14.w);

  static List<BoxShadow> cardShadow(BuildContext context) => [
        BoxShadow(
          color: Colors.black.withOpacity(0.05),
          blurRadius: 12,
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

  // --- Booking palette (trust, calm, professional) ---
  static const Color bookingBg = Color(0xFFF8FAFC);
  static const Color bookingCardBg = AppColors.white;
  static const Color bookingAccent = AppColors.primary;
  static const Color bookingAccentLight = Color(0xFFFCE7F0);
  static const Color bookingSuccess = Color(0xFF10B981);
  static const Color bookingWarning = Color(0xFFF59E0B);
  static const Color bookingError = AppColors.error;

  // --- Typography ---
  static TextStyle titleLarge(BuildContext context) => TextStyle(
        fontFamily: AppTypography.headingFont,
        fontSize: 20.sp,
        fontWeight: AppTypography.bold,
        color: AppColors.textPrimary,
        height: 1.3,
      );

  static TextStyle titleMedium(BuildContext context) => TextStyle(
        fontFamily: AppTypography.primaryFont,
        fontSize: 17.sp,
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
