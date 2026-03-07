import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';
import '../../../core/theme/app_typography.dart';

/// Child Assessment Setup – Final summary.
/// "أتممت إعداد الملف". CTA "الذهاب للرئيسية" → set assessment completed, go Home.
class AssessmentSummaryScreen extends StatelessWidget {
  const AssessmentSummaryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 28.w, vertical: 32.h),
          child: Column(
            children: [
              SizedBox(height: 48.h),
              Container(
                width: 100.w,
                height: 100.w,
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.check_circle_rounded, size: 56.sp, color: AppColors.success),
              ),
              SizedBox(height: 32.h),
              Text(
                'أتممت إعداد الملف',
                style: AppTypography.headingL(context),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 16.h),
              Text(
                'تم تسجيل بيانات الطفل وحالته. يمكنك الآن استخدام التطبيق بالكامل وحجز الجلسات ومتابعة التقييمات.',
                style: AppTypography.bodyMedium(context).copyWith(
                  color: AppColors.textSecondary,
                  height: 1.6,
                ),
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 54.h,
                child: ElevatedButton(
                  onPressed: () => _goHome(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14.r)),
                  ),
                  child: Text(
                    'الذهاب للرئيسية',
                    style: AppTypography.bodyLarge(context).copyWith(
                      color: Colors.white,
                      fontWeight: AppTypography.semiBold,
                      fontSize: 17.sp,
                    ),
                  ),
                ),
              ),
              SizedBox(height: 24.h),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _goHome(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConfig.keyAssessmentOnboardingCompleted, true);
    await prefs.setBool(AppConfig.keyChildSurveyCompleted, true);
    if (context.mounted) {
      context.go('/home');
    }
  }
}
