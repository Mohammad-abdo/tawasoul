import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';

/// Child Assessment Setup – Intro.
/// Why assessment matters. CTA "ابدأ".
/// No back; user must complete flow to reach Home.
class AssessmentIntroScreen extends StatelessWidget {
  const AssessmentIntroScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 28.w, vertical: 32.h),
          child: Column(
            children: [
              SizedBox(height: 32.h),
              Icon(
                Icons.psychology_rounded,
                size: 80.sp,
                color: AppColors.primary,
              ),
              SizedBox(height: 32.h),
              Text(
                'لماذا التقييم الأولي مهم؟',
                style: AppTypography.headingL(context),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 20.h),
              Text(
                'يساعدنا التقييم على فهم احتياجات طفلك وتحديد خطة مناسبة لمتابعته. نراعي مراعاة كاملة خصوصية العائلة والطفل.',
                style: AppTypography.bodyMedium(context).copyWith(
                  color: AppColors.textSecondary,
                  height: 1.6,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 16.h),
              Text(
                'سنطلب منك معلومات أساسية عن الطفل، ثم تحديد نوع الحالة، واختياراً اختباراً تقييمياً أولياً. بعد الانتهاء ستتمكن من استخدام التطبيق بالكامل.',
                style: AppTypography.bodySmall(context).copyWith(
                  color: AppColors.textTertiary,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 54.h,
                child: ElevatedButton(
                  onPressed: () => context.push('/assessment-onboarding/child-info'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14.r)),
                  ),
                  child: Text(
                    'ابدأ',
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
}
