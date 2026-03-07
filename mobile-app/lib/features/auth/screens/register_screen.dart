import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:form_builder_validators/form_builder_validators.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/providers/auth_provider.dart';
import '../widgets/phone_input_field.dart';
import '../widgets/relation_type_dropdown.dart';

/// Register – Create new account (name, phone, relation, OTP).
/// After success → New User → redirect to Child Assessment Setup Flow, not Home.
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormBuilderState>();
  bool _agreedToTerms = false;
  bool _isLoading = false;

  Future<void> _handleSubmit() async {
    if (_isLoading) return;
    if (_formKey.currentState?.saveAndValidate() ?? false) {
      if (!_agreedToTerms) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('يجب الموافقة على الشروط والأحكام')),
        );
        return;
      }
      final formData = _formKey.currentState!.value;
      final authProvider = context.read<AuthProvider>();
      setState(() => _isLoading = true);
      try {
        final success = await authProvider.sendOtp(
          fullName: formData['fullName'] as String,
          phone: formData['phone'] as String,
          relationType: formData['relationType'] as String,
          agreedToTerms: _agreedToTerms,
        );
        if (!mounted) return;
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('تم إرسال رمز التحقق بنجاح'), backgroundColor: AppColors.success),
          );
          context.push('/otp-verification?phone=${Uri.encodeComponent(formData['phone'] as String)}');
        } else {
          setState(() => _isLoading = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(authProvider.error ?? 'حدث خطأ'), backgroundColor: AppColors.error),
          );
        }
      } catch (e) {
        if (mounted) setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'إنشاء حساب',
              leading: IconButton(
                icon: Icon(Icons.arrow_back_ios_rounded, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 20.w),
                child: FormBuilder(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      SizedBox(height: 20.h),
                      Text(
                        'أضف رقم الهاتف والبيانات الأساسية',
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                          height: 1.5,
                        ),
                        textAlign: TextAlign.right,
                      ),
                      SizedBox(height: 20.h),
                      _input(
                        name: 'fullName',
                        hint: 'الاسم بالكامل',
                        icon: Icons.person_outline_rounded,
                        validator: FormBuilderValidators.required(errorText: 'الاسم مطلوب'),
                      ),
                      SizedBox(height: 13.h),
                      const PhoneInputField(),
                      SizedBox(height: 13.h),
                      const RelationTypeDropdown(),
                      SizedBox(height: 13.h),
                      _termsRow(),
                      SizedBox(height: 30.h),
                      SizedBox(
                        width: double.infinity,
                        height: 50.h,
                        child: ElevatedButton(
                          onPressed: (_agreedToTerms && !_isLoading) ? _handleSubmit : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _agreedToTerms ? AppColors.primary : AppColors.buttonDisabled,
                            foregroundColor: AppColors.white,
                            disabledBackgroundColor: AppColors.buttonDisabled,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.r)),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(AppColors.white)),
                                )
                              : Text('متابعة', style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 16.sp)),
                        ),
                      ),
                      SizedBox(height: 20.h),
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

  Widget _input({
    required String name,
    required String hint,
    required IconData icon,
    FormFieldValidator<String>? validator,
  }) {
    return Container(
      height: 52.h,
      decoration: BoxDecoration(
        color: AppColors.white,
        border: Border.all(color: AppColors.borderLight),
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: FormBuilderTextField(
        name: name,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(fontFamily: 'MadaniArabic', fontSize: 16.sp, color: AppColors.textPlaceholder),
          prefixIcon: Icon(icon, size: 24.w, color: AppColors.textPlaceholder),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
        ),
        textDirection: TextDirection.rtl,
        validator: validator,
      ),
    );
  }

  Widget _termsRow() {
    return Row(
      textDirection: TextDirection.rtl,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GestureDetector(
          onTap: () => setState(() => _agreedToTerms = !_agreedToTerms),
          child: Container(
            width: 24.w,
            height: 24.h,
            decoration: BoxDecoration(
              color: _agreedToTerms ? AppColors.primary : Colors.transparent,
              border: Border.all(color: _agreedToTerms ? AppColors.primary : AppColors.borderLight),
              borderRadius: BorderRadius.circular(4.r),
            ),
            child: _agreedToTerms ? Icon(Icons.check, size: 16.w, color: Colors.white) : null,
          ),
        ),
        SizedBox(width: 10.w),
        Expanded(
          child: RichText(
            textDirection: TextDirection.rtl,
            text: TextSpan(
              style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 12.sp, color: AppColors.textSecondary, height: 1.5),
              children: [
                const TextSpan(text: 'أوافق على '),
                TextSpan(text: 'اتفاقية المستخدم', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                const TextSpan(text: ' و '),
                TextSpan(text: 'سياسة الخصوصية', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                const TextSpan(text: '.'),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
