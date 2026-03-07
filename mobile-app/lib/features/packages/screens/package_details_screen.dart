import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../shared/mock_content.dart';

/// Enhanced Package Details Screen
/// Clear features list
/// Prominent purchase button
/// Child selection
class PackageDetailsScreen extends StatefulWidget {
  final String packageId;

  const PackageDetailsScreen({super.key, required this.packageId});

  @override
  State<PackageDetailsScreen> createState() => _PackageDetailsScreenState();
}

class _PackageDetailsScreenState extends State<PackageDetailsScreen> {
  String? _selectedChildId;

  @override
  Widget build(BuildContext context) {
    final package = MockContent.packages.firstWhere(
      (pkg) => pkg['id'] == widget.packageId,
      orElse: () => MockContent.packages.first,
    );

    // Mock children
    final children = [
      {'id': 'child_1', 'name': 'عمر'},
      {'id': 'child_2', 'name': 'سارة'},
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            AppHeader(
              title: 'تفاصيل الباقة',
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
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    // Package Header Card
                    _buildPackageHeaderCard(context, package),
                    SizedBox(height: 24.h),
                    // Child Selection
                    Text(
                      'اختر الطفل',
                      style: AppTypography.headingS(context),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 12.h),
                    ...children.map((child) {
                      return Padding(
                        padding: EdgeInsets.only(bottom: 12.h),
                        child: _buildChildSelector(context, child),
                      );
                    }),
                    SizedBox(height: 24.h),
                    // Features
                    Text(
                      'ماذا تشمل الباقة؟',
                      style: AppTypography.headingS(context),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 16.h),
                    Container(
                      padding: EdgeInsets.all(20.w),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(20.r),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: (package['features'] as List).map((feature) {
                          return Padding(
                            padding: EdgeInsets.only(bottom: 12.h),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Expanded(
                                  child: Text(
                                    feature.toString(),
                                    style: AppTypography.bodyMedium(context),
                                    textAlign: TextAlign.right,
                                  ),
                                ),
                                SizedBox(width: 12.w),
                                Container(
                                  width: 24.w,
                                  height: 24.w,
                                  decoration: BoxDecoration(
                                    color: AppColors.success.withOpacity(0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    Icons.check_rounded,
                                    size: 16.sp,
                                    color: AppColors.success,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    SizedBox(height: 32.h),
                  ],
                ),
              ),
            ),
            // Purchase Button
            Container(
              padding: EdgeInsets.all(20.w),
              decoration: BoxDecoration(
                color: AppColors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    offset: const Offset(0, -2),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 52.h,
                    child: ElevatedButton(
                      onPressed: _selectedChildId == null
                          ? null
                          : () {
                              // Navigate to checkout with package
                              context.push('/checkout?packageId=${package['id']}&childId=$_selectedChildId');
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        disabledBackgroundColor: AppColors.gray300,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16.r),
                        ),
                      ),
                      child: Text(
                        'اشتراك الآن',
                        style: AppTypography.bodyLarge(context).copyWith(
                          color: AppColors.white,
                          fontWeight: AppTypography.semiBold,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 12.h),
                  Center(
                    child: Text(
                      'إلغاء الاشتراك متاح في أي وقت',
                      style: AppTypography.bodySmall(context).copyWith(
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPackageHeaderCard(BuildContext context, Map<String, dynamic> package) {
    final isPopular = package['isPopular'] == true;
    
    return Container(
      padding: EdgeInsets.all(24.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
          colors: isPopular
              ? [AppColors.primary, AppColors.primary.withOpacity(0.8)]
              : [AppColors.gray600, AppColors.gray700],
        ),
        borderRadius: BorderRadius.circular(24.r),
        boxShadow: [
          BoxShadow(
            color: (isPopular ? AppColors.primary : AppColors.gray600).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          if (isPopular)
            Container(
              padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
              margin: EdgeInsets.only(bottom: 12.h),
              decoration: BoxDecoration(
                color: AppColors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12.r),
              ),
              child: Text(
                'الأكثر طلباً',
                style: AppTypography.bodySmall(context).copyWith(
                  color: AppColors.white,
                  fontWeight: AppTypography.semiBold,
                ),
              ),
            ),
          Text(
            package['title']?.toString() ?? '',
            style: AppTypography.headingXL(context).copyWith(
              color: AppColors.white,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 12.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '/${package['duration']}',
                style: AppTypography.bodyLarge(context).copyWith(
                  color: AppColors.white.withOpacity(0.9),
                ),
              ),
              SizedBox(width: 4.w),
              Text(
                package['price']?.toString() ?? '',
                style: AppTypography.headingXL(context).copyWith(
                  color: AppColors.white,
                  fontSize: 36.sp,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChildSelector(BuildContext context, Map<String, dynamic> child) {
    final isSelected = _selectedChildId == child['id'];
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedChildId = isSelected ? null : child['id'] as String;
        });
      },
      child: Container(
        padding: EdgeInsets.all(20.w),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.radio_button_checked_rounded : Icons.radio_button_unchecked_rounded,
              color: isSelected ? AppColors.primary : AppColors.gray400,
              size: 24.sp,
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: Text(
                child['name'] as String,
                style: AppTypography.headingS(context),
                textAlign: TextAlign.right,
              ),
            ),
            SizedBox(width: 16.w),
            Container(
              width: 48.w,
              height: 48.w,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.child_care_rounded,
                size: 24.sp,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
