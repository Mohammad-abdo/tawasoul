import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';

/// Services & Service Details – modern, clean theme.
/// Soft gradients, neutral backgrounds, 16–24px radii.
class ServicesTheme {
  ServicesTheme._();

  static const Color pageBg = Color(0xFFF5F7FA);
  static const Color cardBg = Color(0xFFFFFFFF);
  static const Color cardBorder = Color(0xFFE2E8F0);
  static const Color primary = Color(0xFF90194D);
  static const Color primarySoft = Color(0xFFFCE8F1);
  static const Color textPrimary = Color(0xFF191D23);
  static const Color textSecondary = Color(0xFF36383B);
  static const Color textTertiary = Color(0xFF74797F);

  static double get cardRadius => 20.r;
  static double get buttonRadius => 14.r;
  static double get sectionRadius => 16.r;

  static List<BoxShadow> cardShadow(bool pressed) => [
        BoxShadow(
          color: Colors.black.withOpacity(pressed ? 0.05 : 0.08),
          blurRadius: pressed ? 8 : 16,
          offset: Offset(0, pressed ? 2 : 6),
        ),
      ];
}
