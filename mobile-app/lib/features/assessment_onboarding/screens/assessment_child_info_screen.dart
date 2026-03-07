import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';

/// Child Assessment Setup – Child basic info.
/// Name, age group. Then go to condition selection (survey).
class AssessmentChildInfoScreen extends StatefulWidget {
  const AssessmentChildInfoScreen({super.key});

  @override
  State<AssessmentChildInfoScreen> createState() => _AssessmentChildInfoScreenState();
}

class _AssessmentChildInfoScreenState extends State<AssessmentChildInfoScreen> {
  final _nameController = TextEditingController();
  String? _selectedAge;

  final _ageOptions = [
    'أقل من 4 سنوات',
    '4 سنوات إلى 15 سنة',
    'أكبر من 15 سنة',
  ];

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 24.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'معلومات الطفل الأساسية',
                style: AppTypography.headingL(context),
                textAlign: TextAlign.right,
              ),
              SizedBox(height: 8.h),
              Text(
                'سيُستخدم هذا للتقارير والتقييمات فقط.',
                style: AppTypography.bodyMedium(context).copyWith(color: AppColors.textSecondary),
                textAlign: TextAlign.right,
              ),
              SizedBox(height: 28.h),
              _input(
                controller: _nameController,
                hint: 'اسم الطفل (اختياري)',
                icon: Icons.child_care_rounded,
              ),
              SizedBox(height: 20.h),
              Text(
                'الفئة العمرية',
                style: AppTypography.headingS(context),
                textAlign: TextAlign.right,
              ),
              SizedBox(height: 12.h),
              ..._ageOptions.map((opt) => Padding(
                    padding: EdgeInsets.only(bottom: 10.h),
                    child: _ageChip(opt),
                  )),
              SizedBox(height: 40.h),
              SizedBox(
                width: double.infinity,
                height: 52.h,
                child: ElevatedButton(
                  onPressed: _selectedAge == null
                      ? null
                      : () => context.push('/children/survey?fromOnboarding=1'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    disabledBackgroundColor: AppColors.buttonDisabled,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                  ),
                  child: Text(
                    'التالي',
                    style: AppTypography.bodyLarge(context).copyWith(
                      color: Colors.white,
                      fontWeight: AppTypography.semiBold,
                    ),
                  ),
                ),
              ),
              SizedBox(height: 24.h),
            ],
          ),
        ),
      ),
    );
  }

  Widget _input({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: AppColors.border),
      ),
      child: TextField(
        controller: controller,
        textDirection: TextDirection.rtl,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(fontFamily: AppTypography.primaryFont, fontSize: 15.sp, color: AppColors.textPlaceholder),
          prefixIcon: Icon(icon, size: 22.sp, color: AppColors.textTertiary),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
        ),
        style: TextStyle(fontFamily: AppTypography.primaryFont, fontSize: 15.sp, color: AppColors.textPrimary),
      ),
    );
  }

  Widget _ageChip(String value) {
    final selected = _selectedAge == value;
    return GestureDetector(
      onTap: () => setState(() => _selectedAge = value),
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(horizontal: 18.w, vertical: 16.h),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary.withOpacity(0.1) : AppColors.white,
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.border,
            width: selected ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          textDirection: TextDirection.rtl,
          children: [
            Text(
              value,
              style: AppTypography.bodyMedium(context).copyWith(
                fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                color: selected ? AppColors.primary : AppColors.textPrimary,
              ),
              textAlign: TextAlign.right,
            ),
            if (selected) Icon(Icons.check_circle_rounded, size: 22.sp, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}
