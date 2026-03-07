import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../constants/doctors_theme.dart';

/// Skeleton loader for doctor card during loading.
/// Uses app colors and subtle pulse for loading feedback.
class DoctorCardSkeleton extends StatefulWidget {
  const DoctorCardSkeleton({super.key});

  @override
  State<DoctorCardSkeleton> createState() => _DoctorCardSkeletonState();
}

class _DoctorCardSkeletonState extends State<DoctorCardSkeleton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _opacity = Tween<double>(begin: 0.4, end: 0.75).animate(
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
    return AnimatedBuilder(
      animation: _opacity,
      builder: (context, child) {
        return Opacity(
          opacity: _opacity.value,
          child: Container(
            padding: EdgeInsets.all(16.w),
            decoration: BoxDecoration(
              color: DoctorsTheme.cardBg,
              borderRadius: BorderRadius.circular(DoctorsTheme.cardRadius),
              border: Border.all(color: DoctorsTheme.cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  textDirection: TextDirection.rtl,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _shimmer(80.w, 18.h),
                          SizedBox(height: 8.h),
                          _shimmer(100.w, 24.h),
                          SizedBox(height: 10.h),
                          _shimmer(double.infinity, 14.h),
                          SizedBox(height: 6.h),
                          _shimmer(double.infinity, 14.h),
                        ],
                      ),
                    ),
                    SizedBox(width: 12.w),
                    _shimmer(72.w, 72.w),
                  ],
                ),
                SizedBox(height: 14.h),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _shimmer(70.w, 16.h),
                    _shimmer(50.w, 16.h),
                  ],
                ),
                SizedBox(height: 14.h),
                Row(
                  children: [
                    Expanded(child: _shimmer(double.infinity, 40.h)),
                    SizedBox(width: 8.w),
                    Expanded(child: _shimmer(double.infinity, 40.h)),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _shimmer(double width, double height) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.gray100,
        borderRadius: BorderRadius.circular(6.r),
      ),
    );
  }
}
