import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';
import '../../../core/providers/children_provider.dart';

/// شاشة تحديد حالة الطفل (استبيان بعد إنشاء الحساب).
/// يتم حفظ البيانات في ملف الطفل عبر API ثم عرض شاشة التأكيد.
/// When [fromOnboarding] is true, after success redirect to assessment summary instead of survey success.
class ChildProfileSelectionScreen extends StatefulWidget {
  const ChildProfileSelectionScreen({super.key, this.fromOnboarding = false});

  final bool fromOnboarding;

  @override
  State<ChildProfileSelectionScreen> createState() => _ChildProfileSelectionScreenState();
}

class _ChildProfileSelectionScreenState extends State<ChildProfileSelectionScreen> {
  String? _selectedStatus;
  String? _selectedAge;
  final TextEditingController _notesController = TextEditingController();
  int _characterCount = 0;
  bool _isSubmitting = false;

  final List<String> _statusOptions = ['تخاطب', 'توحد'];
  final List<String> _ageOptions = [
    'اقل من 4 سنوات',
    '4 سنوات الي 15 سنه',
    'اكبر من 15 سنه',
  ];

  @override
  void initState() {
    super.initState();
    _notesController.addListener(() {
      setState(() {
        _characterCount = _notesController.text.length;
      });
    });
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _onNext() async {
    if (_selectedStatus == null || _selectedAge == null || _isSubmitting) return;
    setState(() => _isSubmitting = true);

    final childrenProvider = context.read<ChildrenProvider>();
    final child = await childrenProvider.submitChildSurvey(
      status: _selectedStatus!,
      ageGroup: _selectedAge!,
      behavioralNotes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
    );

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (child != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(AppConfig.keyChildSurveyCompleted, true);
      final childId = child.id;
      if (!mounted) return;
      if (widget.fromOnboarding) {
        context.go('/assessment-onboarding/summary');
      } else {
        context.go('/children/survey/success${childId.isNotEmpty ? '?childId=$childId' : ''}');
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(childrenProvider.error ?? 'حدث خطأ في حفظ البيانات'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            AppHeader(
              subtitle: 'أهلاً بك معانا',
              userName: 'سارة محمد علي',
              userImage: null,
              onNotificationTap: () {
                context.push('/notifications');
              },
              onProfileTap: () {
                context.push('/account');
              },
            ),
            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 20.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    RichText(
                      textAlign: TextAlign.right,
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: 'تحديد ',
                            style: TextStyle(
                              fontFamily: 'ExpoArabic',
                              fontSize: 24.sp,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                              height: 1.5,
                            ),
                          ),
                          WidgetSpan(
                            child: Container(
                              decoration: const BoxDecoration(
                                border: Border(
                                  bottom: BorderSide(
                                    color: AppColors.yellow,
                                    width: 3,
                                  ),
                                ),
                              ),
                              child: Text(
                                'حالة الطفل',
                                style: TextStyle(
                                  fontFamily: 'ExpoArabic',
                                  fontSize: 24.sp,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primary,
                                  height: 1.5,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 30.h),
                    // Section 1: Child Status
                    Text(
                      '1. نوع حالة الطفل',
                      style: TextStyle(
                        fontFamily: 'MadaniArabic',
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                        height: 1.5,
                      ),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 10.h),
                    ..._statusOptions.map((status) {
                      return Padding(
                        padding: EdgeInsets.only(bottom: 10.h),
                        child: _buildRadioOption(
                          value: status,
                          groupValue: _selectedStatus,
                          onChanged: (value) {
                            setState(() {
                              _selectedStatus = value;
                            });
                          },
                        ),
                      );
                    }),
                    SizedBox(height: 20.h),
                    // Section 2: Child Age
                    Text(
                      '2. عمر الطفل',
                      style: TextStyle(
                        fontFamily: 'MadaniArabic',
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                        height: 1.5,
                      ),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 10.h),
                    ..._ageOptions.map((age) {
                      return Padding(
                        padding: EdgeInsets.only(bottom: 10.h),
                        child: _buildRadioOption(
                          value: age,
                          groupValue: _selectedAge,
                          onChanged: (value) {
                            setState(() {
                              _selectedAge = value;
                            });
                          },
                        ),
                      );
                    }),
                    SizedBox(height: 20.h),
                    // Section 3: Behavioral Notes
                    Text(
                      '3. سلوك الطفل وملاحظات عن الحالة',
                      style: TextStyle(
                        fontFamily: 'MadaniArabic',
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                        height: 1.5,
                      ),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 10.h),
                    Container(
                      height: 150.h,
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        border: Border.all(color: AppColors.borderLight),
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      child: TextField(
                        controller: _notesController,
                        maxLength: 250,
                        maxLines: null,
                        expands: true,
                        textDirection: TextDirection.rtl,
                        decoration: InputDecoration(
                          hintText: '',
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.all(16.w),
                          counterText: '$_characterCount/250',
                          counterStyle: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12.sp,
                            color: AppColors.textPlaceholder,
                          ),
                        ),
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 14.sp,
                          color: AppColors.textPrimary,
                          height: 1.5,
                        ),
                      ),
                    ),
                    SizedBox(height: 40.h),
                    // زر التالي: حفظ في ملف الطفل ثم الانتقال لشاشة التأكيد
                    SizedBox(
                      width: double.infinity,
                      height: 50.h,
                      child: ElevatedButton(
                        onPressed: (_selectedStatus != null && _selectedAge != null && !_isSubmitting)
                            ? _onNext
                            : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: AppColors.white,
                          disabledBackgroundColor: AppColors.buttonDisabled,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10.r),
                          ),
                        ),
                        child: _isSubmitting
                            ? SizedBox(
                                width: 24.w,
                                height: 24.h,
                                child: const CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.white),
                                ),
                              )
                            : Text(
                                'التالي',
                                style: TextStyle(
                                  fontFamily: 'MadaniArabic',
                                  fontSize: 16.sp,
                                  fontWeight: FontWeight.w400,
                                  height: 1.5,
                                ),
                              ),
                      ),
                    ),
                    SizedBox(height: 20.h),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRadioOption({
    required String value,
    required String? groupValue,
    required ValueChanged<String?> onChanged,
  }) {
    final isSelected = groupValue == value;
    return GestureDetector(
      onTap: () => onChanged(value),
      child: Container(
        height: 52.h,
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        decoration: BoxDecoration(
          color: AppColors.white,
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.borderLight,
            width: 1,
          ),
          borderRadius: BorderRadius.circular(12.r),
        ),
        child: Row(
          children: [
            Radio<String>(
              value: value,
              groupValue: groupValue,
              onChanged: onChanged,
              activeColor: AppColors.primary,
            ),
            Expanded(
              child: Text(
                value,
                style: TextStyle(
                  fontFamily: 'MadaniArabic',
                  fontSize: 16.sp,
                  color: AppColors.textPrimary,
                  height: 1.5,
                ),
                textAlign: TextAlign.right,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
