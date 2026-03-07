import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_header.dart';
import '../../shared/mock_content.dart';

class NotificationDetailsScreen extends StatelessWidget {
  final String notificationId;

  const NotificationDetailsScreen({super.key, required this.notificationId});

  @override
  Widget build(BuildContext context) {
    final notification = MockContent.notifications.firstWhere(
      (item) => item['id'] == notificationId,
      orElse: () => MockContent.notifications.first,
    );
    final title = notification['title']?.toString() ?? '';
    final message = notification['message']?.toString() ?? '';
    final time = notification['time']?.toString() ?? '';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'تفاصيل الإشعار',
              leading: IconButton(
                icon: Icon(Icons.arrow_back_ios, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(20.w),
                child: Container(
                  width: double.infinity,
                  padding: EdgeInsets.all(16.w),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(12.r),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 18.sp,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                        textAlign: TextAlign.right,
                      ),
                      SizedBox(height: 6.h),
                      Text(
                        time,
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 12.sp,
                          color: AppColors.textTertiary,
                        ),
                        textAlign: TextAlign.right,
                      ),
                      SizedBox(height: 12.h),
                      Text(
                        message,
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 14.sp,
                          color: AppColors.textPrimary,
                          height: 1.6,
                        ),
                        textAlign: TextAlign.right,
                      ),
                      SizedBox(height: 20.h),
                      SizedBox(
                        width: double.infinity,
                        height: 46.h,
                        child: OutlinedButton(
                          onPressed: () => context.push('/appointments/app_1'),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: AppColors.primary),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10.r),
                            ),
                          ),
                          child: Text(
                            'فتح تفاصيل الموعد',
                            style: TextStyle(
                              fontFamily: 'MadaniArabic',
                              fontSize: 14.sp,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ),
                    ],
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
