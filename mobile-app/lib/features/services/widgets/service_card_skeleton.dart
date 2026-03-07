import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../constants/services_theme.dart';

/// Skeleton loader for service card during loading.
class ServiceCardSkeleton extends StatelessWidget {
  const ServiceCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(18.w),
      decoration: BoxDecoration(
        color: ServicesTheme.cardBg,
        borderRadius: BorderRadius.circular(ServicesTheme.cardRadius),
        border: Border.all(color: ServicesTheme.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 56.w,
            height: 56.w,
            decoration: BoxDecoration(
              color: AppColors.gray100,
              borderRadius: BorderRadius.circular(16.r),
            ),
          ),
          SizedBox(height: 14.h),
          Container(
            height: 18.h,
            width: 120.w,
            decoration: BoxDecoration(
              color: AppColors.gray100,
              borderRadius: BorderRadius.circular(6.r),
            ),
          ),
          SizedBox(height: 8.h),
          Container(
            height: 14.h,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppColors.gray100,
              borderRadius: BorderRadius.circular(6.r),
            ),
          ),
          SizedBox(height: 6.h),
          Container(
            height: 14.h,
            width: 180.w,
            decoration: BoxDecoration(
              color: AppColors.gray100,
              borderRadius: BorderRadius.circular(6.r),
            ),
          ),
          SizedBox(height: 14.h),
          Container(
            height: 32.h,
            width: 140.w,
            decoration: BoxDecoration(
              color: AppColors.gray100,
              borderRadius: BorderRadius.circular(10.r),
            ),
          ),
          SizedBox(height: 14.h),
          Container(
            height: 44.h,
            decoration: BoxDecoration(
              color: AppColors.gray100,
              borderRadius: BorderRadius.circular(ServicesTheme.buttonRadius),
            ),
          ),
        ],
      ),
    );
  }
}
