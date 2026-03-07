import 'package:flutter/material.dart';

/// Global-friendly, accessible color palette for Mahara Kids activities
/// Designed for children 2-6 years with high contrast and color-blind safety
class MaharaColors {
  // Primary - Soft, friendly blue (color-blind safe)
  static const Color primary = Color(0xFF5B9BD5); // Accessible blue
  static const Color primaryLight = Color(0xFF8BB5E3);
  static const Color primaryDark = Color(0xFF3A7AB8);
  
  // Success - Green (not red-green color-blind issue with this shade)
  static const Color success = Color(0xFF4CAF50);
  static const Color successLight = Color(0xFF81C784);
  
  // Background - Very light, calm gradient
  static const Color backgroundLight = Color(0xFFF8FAFC);
  static const Color backgroundMid = Color(0xFFF0F4F8);
  static const Color backgroundCard = Color(0xFFFFFFFF);
  
  // Neutral grays - High contrast
  static const Color gray100 = Color(0xFFF5F7FA);
  static const Color gray200 = Color(0xFFE4E7EB);
  static const Color gray300 = Color(0xFFCBD2D9);
  static const Color gray400 = Color(0xFF9AA5B1);
  static const Color gray500 = Color(0xFF7B8794);
  static const Color gray600 = Color(0xFF616E7C);
  static const Color gray700 = Color(0xFF52606D);
  static const Color gray800 = Color(0xFF3E4C59);
  static const Color gray900 = Color(0xFF323F4B);
  
  // Text - High contrast for readability
  static const Color textPrimary = Color(0xFF1F2933);
  static const Color textSecondary = Color(0xFF52606D);
  static const Color textTertiary = Color(0xFF7B8794);
  
  // Interactive states
  static const Color interactive = Color(0xFF5B9BD5);
  static const Color interactiveHover = Color(0xFF4A8BC5);
  static const Color interactivePressed = Color(0xFF3A7AB8);
  static const Color interactiveDisabled = Color(0xFFCBD2D9);
  
  // Feedback colors (not color-only meaning)
  static const Color feedbackPositive = Color(0xFF4CAF50);
  static const Color feedbackNegative = Color(0xFFEF5350);
  static const Color feedbackNeutral = Color(0xFF9AA5B1);
  
  // Shadow - Subtle, soft
  static Color shadowLight = Colors.black.withOpacity(0.08);
  static Color shadowMedium = Colors.black.withOpacity(0.12);
  static Color shadowHeavy = Colors.black.withOpacity(0.16);
}
