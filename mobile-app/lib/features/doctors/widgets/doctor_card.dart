import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../../core/widgets/rating_widget.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/constants/app_colors.dart';
import '../constants/doctors_theme.dart';

/// بطاقة الطبيب/المختص – تصميم عصري وأنيق.
/// صورة بارزة، اسم، تخصص، تقييم، خبرة، أزرار واضحة.
class DoctorCard extends StatefulWidget {
  final Map<String, dynamic> doctor;
  final String? specString;
  final String? priceString;
  final String? initials;

  const DoctorCard({
    super.key,
    required this.doctor,
    this.specString,
    this.priceString,
    this.initials,
  });

  @override
  State<DoctorCard> createState() => _DoctorCardState();
}

class _DoctorCardState extends State<DoctorCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 100),
      vsync: this,
    );
    _scaleAnim = Tween<double>(begin: 1.0, end: 0.97).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final name = widget.doctor['name']?.toString() ?? '';
    final spec = widget.specString ?? widget.doctor['specialty']?.toString() ?? '';
    final about = widget.doctor['about']?.toString() ?? '';
    final rating = (widget.doctor['rating'] as num?)?.toDouble() ?? 0.0;
    final reviewsCount = widget.doctor['reviewsCount'] ?? widget.doctor['totalSessions'] ?? 0;
    final experience = widget.doctor['experience']?.toString() ?? '';
    final imageUrl = widget.doctor['avatar'] ?? widget.doctor['image'];
    final price = widget.priceString ?? widget.doctor['price']?.toString() ?? '';
    final verified = widget.doctor['verified'] == true;
    final isOnline = widget.doctor['isOnline'] == true;

    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) => _controller.reverse(),
      onTapCancel: () => _controller.reverse(),
      onTap: () => context.push('/specialist/${widget.doctor['id']}'),
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          return Transform.scale(
            scale: _scaleAnim.value,
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(20.r),
                border: Border.all(color: AppColors.border, width: 1),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Stack(
                    children: [
                      Container(
                        height: 100.h,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topRight,
                            end: Alignment.bottomLeft,
                            colors: [
                              AppColors.primary.withOpacity(0.12),
                              AppColors.primary.withOpacity(0.04),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        top: 20.h,
                        right: 0,
                        left: 0,
                        child: Center(
                          child: Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Container(
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.primary.withOpacity(0.2),
                                      blurRadius: 12,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: AppNetworkImage(
                                  imageUrl: imageUrl?.toString(),
                                  width: 80.w,
                                  height: 80.w,
                                  fit: BoxFit.cover,
                                  borderRadius: BorderRadius.circular(80.w / 2),
                                  placeholderStyle: AppImagePlaceholderStyle.avatar,
                                  initials: widget.initials,
                                ),
                              ),
                              if (isOnline)
                                Positioned(
                                  bottom: 2,
                                  right: 2,
                                  child: Container(
                                    width: 16.w,
                                    height: 16.w,
                                    decoration: BoxDecoration(
                                      color: DoctorsTheme.success,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: AppColors.white, width: 2.5),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  Padding(
                    padding: EdgeInsets.fromLTRB(16.w, 48.h, 16.w, 16.w),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          textDirection: TextDirection.rtl,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (verified)
                              Padding(
                                padding: EdgeInsets.only(left: 4.w),
                                child: Icon(
                                  Icons.verified_rounded,
                                  size: 18.sp,
                                  color: DoctorsTheme.success,
                                ),
                              ),
                            Flexible(
                              child: Text(
                                name,
                                style: AppTypography.headingS(context).copyWith(
                                  fontSize: 17.sp,
                                  fontWeight: AppTypography.semiBold,
                                  color: AppColors.textPrimary,
                                ),
                                textAlign: TextAlign.center,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 8.h),
                        Center(
                          child: Container(
                            padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 5.h),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(10.r),
                            ),
                            child: Text(
                              spec,
                              style: TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 12.sp,
                                fontWeight: AppTypography.semiBold,
                                color: AppColors.primaryDark,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                        if (about.isNotEmpty) ...[
                          SizedBox(height: 8.h),
                          Text(
                            about,
                            style: AppTypography.bodySmall(context).copyWith(
                              fontSize: 12.sp,
                              color: AppColors.textSecondary,
                              height: 1.4,
                            ),
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                        SizedBox(height: 12.h),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            RatingWidget(rating: rating, size: 16.sp, showNumber: true),
                            SizedBox(width: 8.w),
                            Text(
                              '($reviewsCount)',
                              style: TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 12.sp,
                                color: AppColors.textTertiary,
                              ),
                            ),
                            if (experience.isNotEmpty) ...[
                              SizedBox(width: 12.w),
                              Icon(Icons.work_outline_rounded, size: 14.sp, color: AppColors.textTertiary),
                              SizedBox(width: 4.w),
                              Text(
                                experience,
                                style: TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 12.sp,
                                  color: AppColors.textTertiary,
                                ),
                              ),
                            ],
                          ],
                        ),
                        if (price.isNotEmpty) ...[
                          SizedBox(height: 10.h),
                          Text(
                            '$price ج.م / جلسة',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 14.sp,
                              color: AppColors.primary,
                              fontWeight: AppTypography.semiBold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                        SizedBox(height: 14.h),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () => context.push('/specialist/${widget.doctor['id']}'),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: AppColors.primary,
                                  side: BorderSide(color: AppColors.primary),
                                  padding: EdgeInsets.symmetric(vertical: 12.h),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12.r),
                                  ),
                                ),
                                child: Text(
                                  'الملف',
                                  style: TextStyle(
                                    fontFamily: AppTypography.primaryFont,
                                    fontSize: 14.sp,
                                    fontWeight: AppTypography.semiBold,
                                  ),
                                ),
                              ),
                            ),
                            SizedBox(width: 10.w),
                            Expanded(
                              flex: 2,
                              child: ElevatedButton.icon(
                                onPressed: () => context.push('/doctor/book/${widget.doctor['id']}'),
                                icon: Icon(Icons.calendar_today_rounded, size: 18.sp),
                                label: Text(
                                  'احجز الآن',
                                  style: TextStyle(
                                    fontFamily: AppTypography.primaryFont,
                                    fontSize: 14.sp,
                                    fontWeight: AppTypography.semiBold,
                                  ),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary,
                                  foregroundColor: Colors.white,
                                  padding: EdgeInsets.symmetric(vertical: 12.h),
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12.r),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
