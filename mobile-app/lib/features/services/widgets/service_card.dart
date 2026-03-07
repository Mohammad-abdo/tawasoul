import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../constants/services_theme.dart';

/// Reusable service card: icon, name, description, benefit highlight, CTA.
/// Lift + scale on tap; rounded corners; soft shadow.
class ServiceCard extends StatefulWidget {
  final Map<String, dynamic> service;

  const ServiceCard({super.key, required this.service});

  @override
  State<ServiceCard> createState() => _ServiceCardState();
}

class _ServiceCardState extends State<ServiceCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _liftAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 120),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.98).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    _liftAnimation = Tween<double>(begin: 0.0, end: -4.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  static IconData _iconFrom(String? name) {
    switch (name) {
      case 'record_voice_over':
        return Icons.record_voice_over_rounded;
      case 'psychology':
        return Icons.psychology_rounded;
      case 'assignment':
        return Icons.assignment_rounded;
      default:
        return Icons.miscellaneous_services_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final id = widget.service['id']?.toString() ?? '';
    final title = widget.service['title']?.toString() ?? '';
    final description = widget.service['description']?.toString() ?? '';
    final benefit = widget.service['benefit']?.toString();
    final iconName = widget.service['icon']?.toString();

    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) => _controller.reverse(),
      onTapCancel: () => _controller.reverse(),
      onTap: () => context.push('/services/$id'),
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          final pressed = _controller.value > 0 || _controller.isAnimating;
          return Transform.translate(
            offset: Offset(0, _liftAnimation.value),
            child: Transform.scale(
              scale: _scaleAnimation.value,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 12.h),
                decoration: BoxDecoration(
                  color: ServicesTheme.cardBg,
                  borderRadius: BorderRadius.circular(ServicesTheme.cardRadius),
                  border: Border.all(color: ServicesTheme.cardBorder),
                  boxShadow: ServicesTheme.cardShadow(pressed),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 48.w,
                      height: 48.w,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(14.r),
                      ),
                      child: Icon(
                        _iconFrom(iconName),
                        size: 24.sp,
                        color: AppColors.primary,
                      ),
                    ),
                    SizedBox(height: 10.h),
                    Text(
                      title,
                      style: AppTypography.headingS(context).copyWith(
                        fontSize: 15.sp,
                        fontWeight: AppTypography.semiBold,
                        color: ServicesTheme.textPrimary,
                      ),
                      textAlign: TextAlign.right,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 4.h),
                    Text(
                      description,
                      style: AppTypography.bodySmall(context).copyWith(
                        fontSize: 12.sp,
                        color: ServicesTheme.textSecondary,
                        height: 1.3,
                      ),
                      textAlign: TextAlign.right,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (benefit != null && benefit.isNotEmpty) ...[
                      SizedBox(height: 8.h),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 5.h),
                        decoration: BoxDecoration(
                          color: ServicesTheme.primarySoft,
                          borderRadius: BorderRadius.circular(8.r),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Flexible(
                              child: Text(
                                benefit,
                                style: TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 11.sp,
                                  fontWeight: AppTypography.medium,
                                  color: AppColors.primary,
                                ),
                                textAlign: TextAlign.right,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            SizedBox(width: 4.w),
                            Icon(Icons.check_circle_rounded, size: 14.sp, color: AppColors.primary),
                          ],
                        ),
                      ),
                    ],
                    SizedBox(height: 10.h),
                    OutlinedButton.icon(
                      onPressed: () => context.push('/services/$id'),
                      icon: Icon(AppIcons.arrowBack, size: 16.sp, color: AppColors.primary),
                      label: Text(
                        'عرض التفاصيل',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 12.sp,
                          fontWeight: AppTypography.semiBold,
                          color: AppColors.primary,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: BorderSide(color: AppColors.primary),
                        padding: EdgeInsets.symmetric(vertical: 8.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(ServicesTheme.buttonRadius),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
