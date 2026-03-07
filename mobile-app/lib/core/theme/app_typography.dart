import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants/app_colors.dart';

/// Complete Typography System
/// Standardized font sizes, weights, and spacing
/// Supports Arabic & English equally
class AppTypography {
  // Font Families
  static const String primaryFont = 'MadaniArabic'; // For Arabic text
  static const String headingFont = 'ExpoArabic'; // For large headings
  static const String numberFont = 'Inter'; // For numbers and technical text

  // ============================================
  // FONT SIZES (Standardized Scale)
  // ============================================
  
  // Large (Headlines)
  static double get sizeXL => 28.sp; // Main headlines
  static double get sizeL => 24.sp; // Section titles
  static double get sizeML => 20.sp; // Subsection titles
  
  // Medium (Section Titles)
  static double get sizeM => 18.sp; // Card titles, important labels
  static double get sizeMS => 16.sp; // Body text, buttons
  static double get sizeS => 14.sp; // Secondary text, descriptions
  
  // Small (Labels, Captions)
  static double get sizeXS => 12.sp; // Captions, metadata
  static double get sizeXXS => 11.sp; // Navigation labels, tiny text

  // ============================================
  // FONT WEIGHTS (Standardized)
  // ============================================
  
  static const FontWeight light = FontWeight.w300;
  static const FontWeight regular = FontWeight.w400;
  static const FontWeight medium = FontWeight.w500;
  static const FontWeight semiBold = FontWeight.w600;
  static const FontWeight bold = FontWeight.w700;

  // ============================================
  // LINE HEIGHTS (Readability)
  // ============================================
  
  static const double lineHeightTight = 1.2; // Headlines, single lines
  static const double lineHeightNormal = 1.5; // Body text, paragraphs
  static const double lineHeightRelaxed = 1.6; // Long paragraphs

  // ============================================
  // HEADINGS (Large Text)
  // ============================================
  
  /// Extra Large Heading (28sp, Bold)
  /// Use for: Main page titles, hero text
  static TextStyle headingXL(BuildContext context) => TextStyle(
        fontFamily: headingFont,
        fontSize: sizeXL,
        fontWeight: bold,
        color: AppColors.textPrimary,
        height: lineHeightTight,
        letterSpacing: 0,
      );

  /// Large Heading (24sp, Bold)
  /// Use for: Section headers, important titles
  static TextStyle headingL(BuildContext context) => TextStyle(
        fontFamily: headingFont,
        fontSize: sizeL,
        fontWeight: bold,
        color: AppColors.textPrimary,
        height: lineHeightTight,
        letterSpacing: 0,
      );

  /// Medium Large Heading (20sp, Bold)
  /// Use for: Subsection titles
  static TextStyle headingML(BuildContext context) => TextStyle(
        fontFamily: headingFont,
        fontSize: sizeML,
        fontWeight: bold,
        color: AppColors.textPrimary,
        height: lineHeightTight,
        letterSpacing: 0,
      );

  /// Medium Heading (18sp, SemiBold)
  /// Use for: Card titles, list headers
  static TextStyle headingM(BuildContext context) => TextStyle(
        fontFamily: primaryFont,
        fontSize: sizeM,
        fontWeight: semiBold,
        color: AppColors.textPrimary,
        height: lineHeightTight,
        letterSpacing: 0,
      );

  /// Small Heading (16sp, SemiBold)
  /// Use for: Button text, important labels
  static TextStyle headingS(BuildContext context) => TextStyle(
        fontFamily: primaryFont,
        fontSize: sizeMS,
        fontWeight: semiBold,
        color: AppColors.textPrimary,
        height: lineHeightNormal,
        letterSpacing: 0,
      );

  // ============================================
  // BODY TEXT (Medium Text)
  // ============================================
  
  /// Large Body (16sp, Regular)
  /// Use for: Primary body text, buttons
  static TextStyle bodyLarge(BuildContext context) => TextStyle(
        fontFamily: primaryFont,
        fontSize: sizeMS,
        fontWeight: regular,
        color: AppColors.textPrimary,
        height: lineHeightNormal,
        letterSpacing: 0,
      );

  /// Medium Body (14sp, Regular)
  /// Use for: Secondary text, descriptions
  static TextStyle bodyMedium(BuildContext context) => TextStyle(
        fontFamily: primaryFont,
        fontSize: sizeS,
        fontWeight: regular,
        color: AppColors.textPrimary,
        height: lineHeightNormal,
        letterSpacing: 0,
      );

  /// Small Body (12sp, Regular)
  /// Use for: Captions, metadata, helper text
  static TextStyle bodySmall(BuildContext context) => TextStyle(
        fontFamily: primaryFont,
        fontSize: sizeXS,
        fontWeight: regular,
        color: AppColors.textTertiary,
        height: lineHeightNormal,
        letterSpacing: 0,
      );

  // ============================================
  // LABELS (Small Text)
  // ============================================
  
  /// Large Label (16sp, Medium)
  /// Use for: Form labels, important labels
  static TextStyle labelLarge(BuildContext context) => TextStyle(
        fontFamily: primaryFont,
        fontSize: sizeMS,
        fontWeight: medium,
        color: AppColors.textPrimary,
        height: lineHeightNormal,
        letterSpacing: 0,
      );

  /// Medium Label (14sp, Medium)
  /// Use for: Standard labels
  static TextStyle labelMedium(BuildContext context) => TextStyle(
        fontFamily: primaryFont,
        fontSize: sizeS,
        fontWeight: medium,
        color: AppColors.textPrimary,
        height: lineHeightNormal,
        letterSpacing: 0,
      );

  /// Small Label (12sp, Medium)
  /// Use for: Small labels, tags
  static TextStyle labelSmall(BuildContext context) => TextStyle(
        fontFamily: primaryFont,
        fontSize: sizeXS,
        fontWeight: medium,
        color: AppColors.textSecondary,
        height: lineHeightTight,
        letterSpacing: 0,
      );

  /// Navigation Label (11sp, Regular/SemiBold)
  /// Use for: Bottom navigation labels
  static TextStyle navLabel(BuildContext context, {bool isActive = false}) => TextStyle(
        fontFamily: primaryFont,
        fontSize: sizeXXS,
        fontWeight: isActive ? semiBold : regular,
        color: isActive ? AppColors.primary : AppColors.textTertiary,
        height: lineHeightTight,
        letterSpacing: 0,
      );

  // ============================================
  // SPECIAL TEXT
  // ============================================
  
  /// Primary Color Text (16sp, Regular)
  /// Use for: Links, primary actions
  static TextStyle primaryText(BuildContext context) => TextStyle(
        fontFamily: primaryFont,
        fontSize: sizeMS,
        fontWeight: regular,
        color: AppColors.primary,
        height: lineHeightNormal,
        letterSpacing: 0,
      );

  /// Secondary Text (14sp, Regular)
  /// Use for: Secondary information
  static TextStyle secondaryText(BuildContext context) => TextStyle(
        fontFamily: primaryFont,
        fontSize: sizeS,
        fontWeight: regular,
        color: AppColors.textSecondary,
        height: lineHeightNormal,
        letterSpacing: 0,
      );

  /// Placeholder Text (16sp, Regular)
  /// Use for: Input placeholders
  static TextStyle placeholderText(BuildContext context) => TextStyle(
        fontFamily: primaryFont,
        fontSize: sizeMS,
        fontWeight: regular,
        color: AppColors.textPlaceholder,
        height: lineHeightNormal,
        letterSpacing: 0,
      );

  /// Number Text (12sp, Regular)
  /// Use for: Numbers, ratings, counts
  static TextStyle numberText(BuildContext context) => TextStyle(
        fontFamily: numberFont,
        fontSize: sizeXS,
        fontWeight: regular,
        color: AppColors.textSecondary,
        height: lineHeightTight,
        letterSpacing: 0,
      );

  /// Error Text (14sp, Regular)
  /// Use for: Error messages
  static TextStyle errorText(BuildContext context) => TextStyle(
        fontFamily: primaryFont,
        fontSize: sizeS,
        fontWeight: regular,
        color: AppColors.error,
        height: lineHeightNormal,
        letterSpacing: 0,
      );

  /// Success Text (14sp, Regular)
  /// Use for: Success messages
  static TextStyle successText(BuildContext context) => TextStyle(
        fontFamily: primaryFont,
        fontSize: sizeS,
        fontWeight: regular,
        color: AppColors.success,
        height: lineHeightNormal,
        letterSpacing: 0,
      );
}

/// Typography Usage Guidelines
/// 
/// DO:
/// - Use headingXL for main page titles
/// - Use headingM for card titles
/// - Use bodyLarge for primary content
/// - Use bodySmall for captions
/// - Use navLabel for bottom navigation
/// 
/// DON'T:
/// - Mix font sizes randomly
/// - Use bold for body text
/// - Use small sizes for important text
/// - Override line heights unnecessarily
/// - Mix font families incorrectly
