import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants/app_colors.dart';

enum AppointmentStatus {
  upcoming,
  completed,
  cancelled,
}

class StatusBadge extends StatelessWidget {
  final AppointmentStatus status;
  final String text;

  const StatusBadge({
    super.key,
    required this.status,
    required this.text,
  });

  Color get _backgroundColor {
    switch (status) {
      case AppointmentStatus.upcoming:
        return const Color(0xFF1B763B); // Green
      case AppointmentStatus.completed:
        return AppColors.primary;
      case AppointmentStatus.cancelled:
        return AppColors.error;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
      decoration: BoxDecoration(
        color: _backgroundColor,
        borderRadius: BorderRadius.circular(6.r),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontFamily: 'MadaniArabic',
          fontSize: 12.sp,
          color: AppColors.white,
          height: 1.5,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
}


