import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_navigation_bar.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../shared/mock_content.dart';
import 'package:go_router/go_router.dart';

/// Redesigned Packages List Screen
/// Clear package cards with features
/// Easy purchase flow
class PackagesListScreen extends StatelessWidget {
  const PackagesListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final packages = MockContent.packages;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            AppHeader(
              title: 'الباقات والاشتراكات',
              leading: IconButton(
                icon: Icon(
                  AppIcons.arrowBack,
                  size: 24.sp,
                  color: AppColors.textPrimary,
                ),
                onPressed: () => context.pop(),
              ),
            ),
            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(20.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'اختر الباقة المناسبة لطفلك',
                      style: AppTypography.headingM(context),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 24.h),
                    ...packages.map((package) {
                      return Padding(
                        padding: EdgeInsets.only(bottom: 16.h),
                        child: _buildPackageCard(context, package),
                      );
                    }),
                  ],
                ),
              ),
            ),
            // Bottom Navigation
            AppNavigationBar(
              currentIndex: 4,
              onTap: (index) {
                switch (index) {
                  case 0:
                    context.push('/home');
                    break;
                  case 1:
                    context.push('/appointments');
                    break;
                  case 2:
                    context.push('/assessments/categories?childId=mock_child_1');
                    break;
                  case 3:
                    context.push('/chat');
                    break;
                  case 4:
                    break; // Already on account section
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPackageCard(BuildContext context, Map<String, dynamic> package) {
    final isPopular = package['isPopular'] == true;
    
    return GestureDetector(
      onTap: () => context.push('/packages/${package['id']}'),
      child: Container(
        padding: EdgeInsets.all(24.w),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(24.r),
          border: Border.all(
            color: isPopular ? AppColors.primary : AppColors.border,
            width: isPopular ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (isPopular)
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.star_rounded,
                          size: 14.sp,
                          color: AppColors.primary,
                        ),
                        SizedBox(width: 4.w),
                        Text(
                          'الأكثر طلباً',
                          style: AppTypography.bodySmall(context).copyWith(
                            color: AppColors.primary,
                            fontWeight: AppTypography.semiBold,
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  const SizedBox.shrink(),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      package['title']?.toString() ?? '',
                      style: AppTypography.headingM(context),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 4.h),
                    Text(
                      package['duration']?.toString() ?? '',
                      style: AppTypography.bodyMedium(context).copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  ],
                ),
              ],
            ),
            SizedBox(height: 20.h),
            // Price
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  '/${package['duration']}',
                  style: AppTypography.bodyMedium(context).copyWith(
                    color: AppColors.textTertiary,
                  ),
                ),
                SizedBox(width: 4.w),
                Text(
                  package['price']?.toString() ?? '',
                  style: AppTypography.headingXL(context).copyWith(
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
            SizedBox(height: 20.h),
            // Features Preview
            if (package['features'] != null)
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: (package['features'] as List).take(3).map((feature) {
                  return Padding(
                    padding: EdgeInsets.only(bottom: 8.h),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Expanded(
                          child: Text(
                            feature.toString(),
                            style: AppTypography.bodySmall(context).copyWith(
                              color: AppColors.textSecondary,
                            ),
                            textAlign: TextAlign.right,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        SizedBox(width: 8.w),
                        Icon(
                          Icons.check_circle_rounded,
                          size: 16.sp,
                          color: AppColors.success,
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            SizedBox(height: 20.h),
            // View Details Button
            SizedBox(
              width: double.infinity,
              height: 48.h,
              child: OutlinedButton(
                onPressed: () => context.push('/packages/${package['id']}'),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(
                    color: isPopular ? AppColors.primary : AppColors.border,
                    width: isPopular ? 2 : 1,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16.r),
                  ),
                ),
                child: Text(
                  'عرض التفاصيل',
                  style: AppTypography.bodyLarge(context).copyWith(
                    color: isPopular ? AppColors.primary : AppColors.textPrimary,
                    fontWeight: AppTypography.semiBold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
