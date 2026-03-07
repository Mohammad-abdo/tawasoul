import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

/// Account/Profile page – modern, calm theme.
/// Rounded cards 16–24px, subtle shadows.
class AccountTheme {
  AccountTheme._();

  static const Color pageBg = Color(0xFFF5F7FA);
  static const Color cardBg = Color(0xFFFFFFFF);
  static const Color cardBorder = Color(0xFFE2E8F0);
  static const Color premium = Color(0xFFB8860B);
  static const Color premiumSoft = Color(0xFFFFF8E7);

  static double get cardRadius => 20.r;
  static double get badgeRadius => 12.r;

  static List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: Colors.black.withOpacity(0.06),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
      ];
}
