import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:form_builder_validators/form_builder_validators.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_strings.dart';

class RelationTypeDropdown extends StatelessWidget {
  const RelationTypeDropdown({super.key});

  @override
  Widget build(BuildContext context) {
    final relationTypes = [
      'أب',
      'أم',
      'أخ',
      'أخت',
      'عم',
      'خال',
    ];

    return Container(
      height: 52.h,
      decoration: BoxDecoration(
        color: AppColors.white,
        border: Border.all(color: AppColors.borderLight),
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: FormBuilderDropdown<String>(
        name: 'relationType',
        decoration: InputDecoration(
          hintText: AppStrings.relationType,
          hintStyle: TextStyle(
            fontFamily: 'MadaniArabic',
            fontSize: 16.sp,
            color: AppColors.textPlaceholder,
          ),
          prefixIcon: Icon(
            Icons.arrow_drop_down,
            size: 24.w,
            color: AppColors.textPlaceholder,
          ),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(
            horizontal: 16.w,
            vertical: 12.h,
          ),
        ),
        items: relationTypes
            .map(
              (type) => DropdownMenuItem(
                value: type,
                child: Text(
                  type,
                  style: TextStyle(
                    fontFamily: 'MadaniArabic',
                    fontSize: 16.sp,
                    color: AppColors.textPrimary,
                  ),
                  textDirection: TextDirection.rtl,
                ),
              ),
            )
            .toList(),
        validator: FormBuilderValidators.required(
          errorText: 'صلة القرابة مطلوبة',
        ),
      ),
    );
  }
}

