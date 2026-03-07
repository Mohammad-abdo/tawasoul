import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../constants/account_theme.dart';

/// Package card for recommended slider: name, description, benefits icons, price, CTA.
/// Optional highlight (glow/badge) for recommended.
class PackageCard extends StatelessWidget {
  final Map<String, dynamic> package;
  final bool isRecommended;

  const PackageCard({
    super.key,
    required this.package,
    this.isRecommended = false,
  });

  @override
  Widget build(BuildContext context) {
    final id = package['id']?.toString() ?? '';
    final title = package['title']?.toString() ?? '';
    final price = package['price']?.toString() ?? '';
    final duration = package['duration']?.toString() ?? '';
    final features = package['features'];
    final featuresList = features is List
        ? (features as List).map((e) => e.toString()).where((s) => s.isNotEmpty).toList()
        : <String>[];

    return Container(
      width: 280.w,
      padding: EdgeInsets.all(18.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AccountTheme.cardRadius),
        border: Border.all(
          color: isRecommended ? AppColors.primary : AccountTheme.cardBorder,
          width: isRecommended ? 2 : 1,
        ),
        boxShadow: [
          ...AccountTheme.cardShadow,
          if (isRecommended)
            BoxShadow(
              color: AppColors.primary.withOpacity(0.2),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (isRecommended)
            Padding(
              padding: EdgeInsets.only(bottom: 10.h),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                    child: Text(
                      'موصى بها',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 11.sp,
                        fontWeight: AppTypography.semiBold,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          Text(
            title,
            style: AppTypography.headingS(context).copyWith(
              fontSize: 17.sp,
              fontWeight: AppTypography.bold,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.right,
          ),
          if (duration.isNotEmpty) ...[
            SizedBox(height: 4.h),
            Text(
              duration,
              style: AppTypography.bodySmall(context).copyWith(
                color: AppColors.textSecondary,
                fontSize: 12.sp,
              ),
              textAlign: TextAlign.right,
            ),
          ],
          if (featuresList.isNotEmpty) ...[
            SizedBox(height: 12.h),
            ...featuresList.take(3).map(
                  (f) => Padding(
                    padding: EdgeInsets.only(bottom: 6.h),
                    child: Row(
                      textDirection: TextDirection.rtl,
                      children: [
                        Icon(Icons.check_circle_rounded, size: 16.sp, color: AppColors.success),
                        SizedBox(width: 8.w),
                        Expanded(
                          child: Text(
                            f,
                            style: AppTypography.bodySmall(context).copyWith(
                              fontSize: 12.sp,
                              color: AppColors.textSecondary,
                            ),
                            textAlign: TextAlign.right,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
          ],
          SizedBox(height: 14.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            textDirection: TextDirection.rtl,
            children: [
              Text(
                price,
                style: AppTypography.headingS(context).copyWith(
                  color: AppColors.primary,
                  fontWeight: AppTypography.bold,
                  fontSize: 18.sp,
                ),
              ),
              SizedBox(
                height: 40.h,
                child: ElevatedButton(
                  onPressed: () => context.push('/packages/$id'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: AppColors.white,
                    padding: EdgeInsets.symmetric(horizontal: 16.w),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                  ),
                  child: Text(
                    'ترقية',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 13.sp,
                      fontWeight: AppTypography.semiBold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
