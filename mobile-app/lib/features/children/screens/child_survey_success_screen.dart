import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';

/// شاشة تأكيد حفظ بيانات الاستبيان في ملف الطفل.
/// تظهر بعد إكمال "تحديد حالة الطفل" وتخزين البيانات بنجاح.
class ChildSurveySuccessScreen extends StatelessWidget {
  final String? childId;

  const ChildSurveySuccessScreen({super.key, this.childId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      body: SafeArea(
        child: Stack(
          children: [
            Padding(
              padding: EdgeInsets.all(32.w),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Spacer(),
                  // عنوان الشاشة
                  Text(
                    'تأكيد الحفظ',
                    style: TextStyle(
                      fontFamily: 'MadaniArabic',
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 24.h),
                  // أيقونة النجاح
                  Container(
                    width: 120.w,
                    height: 120.w,
                    decoration: BoxDecoration(
                      color: AppColors.success.withOpacity(0.15),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.success.withOpacity(0.2),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Container(
                        width: 80.w,
                        height: 80.w,
                        decoration: const BoxDecoration(
                          color: AppColors.success,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.check_rounded,
                          size: 48.sp,
                          color: AppColors.white,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 28.h),
                  // رسالة النجاح
                  Text(
                    'لقد تم حفظ البيانات في ملف الطفل بنجاح',
                    style: TextStyle(
                      fontFamily: 'MadaniArabic',
                      fontSize: 22.sp,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      height: 1.4,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 16.h),
                  // نص توضيحي
                  Text(
                    'تم تسجيل بيانات الطفل في ملفه. يمكنك متابعة المواعيد والتقييمات من صفحة ملف الطفل.',
                    style: TextStyle(
                      fontFamily: 'MadaniArabic',
                      fontSize: 14.sp,
                      color: AppColors.textSecondary,
                      height: 1.6,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const Spacer(),
                  // الزر الرئيسي: الذهاب إلى الرئيسية
                  SizedBox(
                    width: double.infinity,
                    height: 54.h,
                    child: ElevatedButton(
                      onPressed: () => context.go('/home'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                      ),
                      child: Text(
                        'الذهاب إلى الرئيسية',
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                          color: AppColors.white,
                        ),
                      ),
                    ),
                  ),
                  if (childId != null && childId!.isNotEmpty) ...[
                    SizedBox(height: 12.h),
                    SizedBox(
                      width: double.infinity,
                      height: 54.h,
                      child: ElevatedButton(
                        onPressed: () => context.go(
                          '/doctors?recommendedForChildId=${Uri.encodeComponent(childId!)}',
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary.withOpacity(0.9),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                        ),
                        child: Text(
                          'عرض المختصين المناسبين',
                          style: TextStyle(
                            fontFamily: 'MadaniArabic',
                            fontSize: 16.sp,
                            fontWeight: FontWeight.w600,
                            color: AppColors.white,
                          ),
                        ),
                      ),
                    ),
                    SizedBox(height: 12.h),
                    SizedBox(
                      width: double.infinity,
                      height: 54.h,
                      child: OutlinedButton(
                        onPressed: () => context.go('/children/$childId'),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.primary),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                        ),
                        child: Text(
                          'عرض ملف الطفل',
                          style: TextStyle(
                            fontFamily: 'MadaniArabic',
                            fontSize: 16.sp,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            // زر الإغلاق (X) أعلى اليمين
            Positioned(
              top: 8.h,
              right: 16.w,
              child: IconButton(
                onPressed: () => context.go('/home'),
                icon: Icon(
                  Icons.close,
                  size: 24.sp,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
