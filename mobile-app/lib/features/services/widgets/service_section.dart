import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/constants/app_colors.dart';
import '../constants/services_theme.dart';

/// Reusable content section for service details: icon + title + body (widget or text).
class ServiceSection extends StatelessWidget {
  final IconData icon;
  final String title;
  final Widget? child;
  final String? bodyText;

  const ServiceSection({
    super.key,
    required this.icon,
    required this.title,
    this.child,
    this.bodyText,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(18.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(ServicesTheme.sectionRadius),
        border: Border.all(color: ServicesTheme.cardBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            textDirection: TextDirection.rtl,
            children: [
              Text(
                title,
                style: AppTypography.headingS(context).copyWith(
                  fontSize: 16.sp,
                  fontWeight: AppTypography.semiBold,
                  color: ServicesTheme.textPrimary,
                ),
                textAlign: TextAlign.right,
              ),
              SizedBox(width: 10.w),
              Container(
                padding: EdgeInsets.all(8.w),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: Icon(icon, size: 22.sp, color: AppColors.primary),
              ),
            ],
          ),
          SizedBox(height: 14.h),
          if (child != null)
            child!
          else if (bodyText != null && bodyText!.isNotEmpty)
            Text(
              bodyText!,
              style: AppTypography.bodyMedium(context).copyWith(
                fontSize: 14.sp,
                color: ServicesTheme.textSecondary,
                height: 1.55,
              ),
              textAlign: TextAlign.right,
            ),
        ],
      ),
    );
  }
}

/// Bullet list for benefits or steps.
class ServiceSectionBullets extends StatelessWidget {
  final List<String> items;

  const ServiceSectionBullets({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: items
          .map(
            (text) => Padding(
              padding: EdgeInsets.only(bottom: 10.h),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                textDirection: TextDirection.rtl,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      text,
                      style: AppTypography.bodyMedium(context).copyWith(
                        fontSize: 14.sp,
                        color: ServicesTheme.textSecondary,
                        height: 1.45,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  ),
                  SizedBox(width: 10.w),
                  Icon(Icons.check_circle_rounded, size: 20.sp, color: AppColors.primary),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}
