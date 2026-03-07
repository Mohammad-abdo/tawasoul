import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

/// Pastel, child-friendly theme for Test Categories page.
/// Bright but soft colors, rounded corners (16–24px), subtle gradients.
/// Professional yet playful for children; high contrast where needed.
class AssessmentCategoriesTheme {
  AssessmentCategoriesTheme._();

  // Backgrounds
  static const Color pageBg = Color(0xFFF5F7FA);
  static const Color cardBg = Color(0xFFFFFFFF);
  static const Color cardBorder = Color(0xFFE2E8F0);

  // Status colors (pastel, high contrast for accessibility)
  static const Color success = Color(0xFF059669);
  static const Color successSoft = Color(0xFFD1FAE5);
  static const Color inProgress = Color(0xFF2563EB);
  static const Color inProgressSoft = Color(0xFFDBEAFE);
  static const Color newTest = Color(0xFF7C3AED);
  static const Color newTestSoft = Color(0xFFEDE9FE);
  static const Color lockedMuted = Color(0xFF94A3B8);
  static const Color lockedSoft = Color(0xFFF1F5F9);

  // Text (high contrast)
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF475569);
  static const Color textTertiary = Color(0xFF64748B);

  // Radii: 16–24px range
  static double get cardRadius => 20.r.clamp(16.0, 24.0);
  static double get iconContainerRadius => 20.r.clamp(16.0, 24.0);
  static double get progressRingSize => 48.w;
  static double get headerIllustrationSize => 72.w;

  // Soft shadows
  static List<BoxShadow> cardShadow(bool isPressed) => [
        BoxShadow(
          color: Colors.black.withOpacity(isPressed ? 0.05 : 0.08),
          blurRadius: isPressed ? 6 : 16,
          offset: Offset(0, isPressed ? 2 : 6),
          spreadRadius: 0,
        ),
      ];

  /// Subtle gradient for header / hero area (very light).
  static LinearGradient get headerGradient => LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          const Color(0xFFE0E7FF).withOpacity(0.4),
          const Color(0xFFF5F7FA),
        ],
      );

  /// Very subtle card gradient (optional, for “new” or default state).
  static LinearGradient cardGradientSoft(Color base) => LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          base.withOpacity(0.06),
          base.withOpacity(0.02),
        ],
      );

  static const String mascotEmoji = '🌟';
  static const String emptyStateEmoji = '🎯';
}
