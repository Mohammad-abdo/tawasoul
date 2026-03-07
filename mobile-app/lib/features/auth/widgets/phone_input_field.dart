import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:form_builder_validators/form_builder_validators.dart';
import '../../../core/constants/app_colors.dart';

class PhoneInputField extends StatelessWidget {
  const PhoneInputField({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Country Code Selector
        Container(
          width: 120.w,
          height: 52.h,
          decoration: BoxDecoration(
            color: AppColors.white,
            border: Border.all(color: AppColors.borderLight),
            borderRadius: BorderRadius.circular(12.r),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Padding(
                padding: EdgeInsets.only(right: 16.w),
                child: Row(
                  children: [
                    // Egypt flag placeholder
                    Container(
                      width: 28.w,
                      height: 21.h,
                      decoration: BoxDecoration(
                        color: AppColors.gray200,
                        borderRadius: BorderRadius.circular(4.r),
                      ),
                    ),
                    SizedBox(width: 5.w),
                    Text(
                      '+20',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 16.sp,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.keyboard_arrow_down,
                size: 24.w,
                color: AppColors.textPlaceholder,
              ),
            ],
          ),
        ),
        SizedBox(width: 10.w),
        // Phone Number Input
        Expanded(
          child: Container(
            height: 52.h,
            decoration: BoxDecoration(
              color: AppColors.white,
              border: Border.all(color: AppColors.borderLight),
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: FormBuilderTextField(
              name: 'phone',
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                hintText: '01012804721',
                hintStyle: TextStyle(
                  fontFamily: 'MadaniArabic',
                  fontSize: 16.sp,
                  color: AppColors.textPlaceholder,
                ),
                prefixIcon: Icon(
                  Icons.phone_outlined,
                  size: 24.w,
                  color: AppColors.textPlaceholder,
                ),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 16.w,
                  vertical: 12.h,
                ),
              ),
              textDirection: TextDirection.ltr,
              validator: FormBuilderValidators.compose([
                FormBuilderValidators.required(
                  errorText: 'رقم الهاتف مطلوب',
                ),
                FormBuilderValidators.match(
                  RegExp(r'^[0-9]{10,11}$'),
                  errorText: 'رقم هاتف غير صحيح',
                ),
              ]),
            ),
          ),
        ),
      ],
    );
  }
}
