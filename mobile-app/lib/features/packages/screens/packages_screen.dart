import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_navigation_bar.dart';
import '../../../core/constants/app_colors.dart';
import 'package:go_router/go_router.dart';

class PackagesScreen extends StatelessWidget {
  const PackagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            AppHeader(
              title: 'الباقات',
              leading: IconButton(
                icon: Icon(
                  Icons.arrow_back_ios,
                  size: 24.sp,
                  color: AppColors.textPrimary,
                ),
                onPressed: () => context.pop(),
              ),
            ),
            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 23.w, vertical: 16.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Active Package Section
                    _buildActivePackageSection(context),
                    SizedBox(height: 16.h),
                    // Package Content Section
                    _buildPackageContentSection(context),
                    SizedBox(height: 20.h),
                    // Browse Other Packages Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          context.push('/packages/list');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          padding: EdgeInsets.symmetric(vertical: 10.h),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10.r),
                          ),
                        ),
                        child: Text(
                          'تصفح الباقات الاخري',
                          style: TextStyle(
                            fontFamily: 'MadaniArabic',
                            fontSize: 16.sp,
                            color: AppColors.white,
                            height: 1.5,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Bottom Navigation
            AppNavigationBar(
              currentIndex: 3,
              onTap: (index) {
                switch (index) {
                  case 0:
                    context.push('/home');
                    break;
                  case 1:
                    context.push('/appointments');
                    break;
                  case 2:
                    context.push('/chat');
                    break;
                  case 3:
                    // Already on account
                    break;
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivePackageSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'تغيير الباقة',
              style: TextStyle(
                fontFamily: 'MadaniArabic',
                fontSize: 16.sp,
                color: AppColors.primary,
                height: 1.5,
              ),
            ),
            Text(
              'الباقات',
              style: TextStyle(
                fontFamily: 'MadaniArabic',
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
                height: 1.5,
              ),
            ),
          ],
        ),
        SizedBox(height: 10.h),
        Container(
          padding: EdgeInsets.all(12.w),
          decoration: BoxDecoration(
            color: const Color(0xFFFBFBFB),
            borderRadius: BorderRadius.circular(10.r),
            border: Border.all(color: AppColors.gray200),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Check icon
                  Container(
                    width: 20.w,
                    height: 20.w,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.primary,
                    ),
                    child: Icon(
                      Icons.check,
                      size: 16.sp,
                      color: AppColors.white,
                    ),
                  ),
                  // Package name
                  Row(
                    children: [
                      Text(
                        'الباقة الأولي ',
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 14.sp,
                          color: const Color(0xFF0E0E0E),
                          height: 1.5,
                        ),
                      ),
                      Text(
                        '"مفعلة"',
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 14.sp,
                          color: AppColors.primary,
                          height: 1.5,
                        ),
                      ),
                      SizedBox(width: 8.w),
                      Container(
                        width: 28.w,
                        height: 28.w,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFFDCE2E1),
                          border: Border.all(
                            color: const Color(0xFFE8ECEB),
                            width: 4,
                          ),
                        ),
                        child: Icon(
                          Icons.card_giftcard,
                          size: 16.sp,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Divider(color: AppColors.border, height: 1),
              SizedBox(height: 12.h),
              // Package details
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'باقة الـ 8 جلسات/شهر',
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 16.sp,
                          color: const Color(0xFF0E0E0E),
                          height: 1.5,
                        ),
                        textAlign: TextAlign.right,
                      ),
                      SizedBox(height: 4.h),
                      Row(
                        children: [
                          Text(
                            '500ج.م',
                            style: TextStyle(
                              fontFamily: 'MadaniArabic',
                              fontSize: 22.sp,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                              height: 1.0,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              SizedBox(height: 12.h),
              // Remaining days with progress bar
              Row(
                children: [
                  Text(
                    'متبقي 4 ايام',
                    style: TextStyle(
                      fontFamily: 'MadaniArabic',
                      fontSize: 16.sp,
                      color: const Color(0xFF0E0E0E),
                      height: 1.5,
                    ),
                  ),
                  SizedBox(width: 17.w),
                  Expanded(
                    child: Container(
                      height: 4.h,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF4E8ED),
                        borderRadius: BorderRadius.circular(2.r),
                      ),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerRight,
                        widthFactor: 0.25, // 25% remaining (4 days out of ~16 days)
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(2.r),
                          ),
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
    );
  }

  Widget _buildPackageContentSection(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: const Color(0xFFFBFBFB),
        borderRadius: BorderRadius.circular(10.r),
        border: Border.all(color: AppColors.gray200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const SizedBox(width: 20),
              Text(
                'محتوي الباقة',
                style: TextStyle(
                  fontFamily: 'MadaniArabic',
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                  height: 1.5,
                ),
                textAlign: TextAlign.right,
              ),
            ],
          ),
          Divider(color: AppColors.border, height: 1),
          SizedBox(height: 12.h),
          ...List.generate(4, (index) {
            return Padding(
              padding: EdgeInsets.only(bottom: 6.h),
              child: Row(
                children: [
                  Icon(
                    Icons.check_circle,
                    size: 20.sp,
                    color: AppColors.success,
                  ),
                  SizedBox(width: 8.w),
                  Text(
                    'محتوي الباقي هنا',
                    style: TextStyle(
                      fontFamily: 'MadaniArabic',
                      fontSize: 16.sp,
                      color: const Color(0xFF0E0E0E),
                      height: 1.5,
                    ),
                    textAlign: TextAlign.right,
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
