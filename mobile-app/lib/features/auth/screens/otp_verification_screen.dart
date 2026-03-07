import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/providers/auth_provider.dart';

class OtpVerificationScreen extends StatefulWidget {
  final String phone;

  const OtpVerificationScreen({
    super.key,
    required this.phone,
  });

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final TextEditingController _otpController = TextEditingController();
  Timer? _resendTimer;
  int _resendCountdown = 200; // 3:20 in seconds
  bool _canResend = false;
  bool _isVerifying = false;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  @override
  void dispose() {
    _resendTimer?.cancel();
    _otpController.dispose();
    super.dispose();
  }

  void _startResendTimer() {
    _canResend = false;
    _resendCountdown = 200;
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendCountdown > 0) {
        setState(() {
          _resendCountdown--;
        });
      } else {
        setState(() {
          _canResend = true;
        });
        timer.cancel();
      }
    });
  }

  String _formatCountdown(int seconds) {
    final minutes = seconds ~/ 60;
    final secs = seconds % 60;
    return '${minutes}:${secs.toString().padLeft(2, '0')}';
  }

  Future<void> _handleVerify() async {
    if (_isVerifying) return;
    
    if (_otpController.text.length != 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('يرجى إدخال رمز التحقق كاملاً'),
        ),
      );
      return;
    }

    setState(() {
      _isVerifying = true;
    });

    try {
      final authProvider = context.read<AuthProvider>();
      final success = await authProvider.verifyOtp(
        phone: widget.phone,
        otp: _otpController.text,
      );

      if (!mounted) return;

      if (success) {
        context.go('/assessment-onboarding/intro');
      } else {
        setState(() {
          _isVerifying = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.error ?? 'رمز التحقق غير صحيح'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isVerifying = false;
        });
      }
    }
  }

  Future<void> _handleResend() async {
    if (!_canResend) return;

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.resendOtp(widget.phone);

    if (mounted) {
      if (success) {
        _startResendTimer();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('تم إعادة إرسال رمز التحقق'),
            backgroundColor: AppColors.success,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.error ?? 'فشل إعادة الإرسال'),
            backgroundColor: AppColors.error,
          ),
        );
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
            // Header
            AppHeader(
              title: 'رمز المصادقة',
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
                padding: EdgeInsets.symmetric(horizontal: 20.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: 20.h),
                    // Main instruction
                    Text(
                      'ادخل رمز المصادة المرسل علي رقم الجوال',
                      style: TextStyle(
                        fontFamily: 'MadaniArabic',
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                        height: 1.5,
                      ),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 10.h),
                    // Sub instruction
                    Text(
                      'ادخل رمز التحقيق المرسل علي جوالك :',
                      style: TextStyle(
                        fontFamily: 'MadaniArabic',
                        fontSize: 14.sp,
                        color: AppColors.textTertiary,
                        height: 1.5,
                      ),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 32.h),
                    // OTP Input - 5 digits
                    PinCodeTextField(
                      appContext: context,
                      length: 5,
                      controller: _otpController,
                      pinTheme: PinTheme(
                        shape: PinCodeFieldShape.box,
                        borderRadius: BorderRadius.circular(8.r),
                        fieldHeight: 50.h,
                        fieldWidth: 50.w,
                        activeFillColor: AppColors.white,
                        inactiveFillColor: AppColors.white,
                        selectedFillColor: AppColors.white,
                        activeColor: AppColors.primary,
                        inactiveColor: AppColors.borderLight,
                        selectedColor: AppColors.primary,
                        borderWidth: 1,
                      ),
                      enableActiveFill: true,
                      keyboardType: TextInputType.number,
                      textStyle: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 20.sp,
                        fontWeight: FontWeight.w400,
                        color: AppColors.textPrimary,
                      ),
                      onCompleted: (value) {
                        _handleVerify();
                      },
                    ),
                    SizedBox(height: 20.h),
                    // Resend timer or button
                    Center(
                      child: _canResend
                          ? TextButton(
                              onPressed: _handleResend,
                              child: Text(
                                'إعادة إرسال الرمز',
                                style: TextStyle(
                                  fontFamily: 'MadaniArabic',
                                  fontSize: 14.sp,
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w500,
                                  height: 1.5,
                                ),
                              ),
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'إعادة الإرسال بعد',
                                  style: TextStyle(
                                    fontFamily: 'MadaniArabic',
                                    fontSize: 14.sp,
                                    color: AppColors.textTertiary,
                                    height: 1.5,
                                  ),
                                ),
                                SizedBox(width: 8.w),
                                Text(
                                  _formatCountdown(_resendCountdown),
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 14.sp,
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w500,
                                    height: 1.5,
                                  ),
                                ),
                              ],
                            ),
                    ),
                    SizedBox(height: 40.h),
                    // Continue Button
                    SizedBox(
                      width: double.infinity,
                      height: 50.h,
                      child: ElevatedButton(
                        onPressed: _isVerifying ? null : _handleVerify,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: AppColors.white,
                          disabledBackgroundColor: AppColors.buttonDisabled,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10.r),
                          ),
                        ),
                        child: _isVerifying
                            ? SizedBox(
                                width: 20.w,
                                height: 20.h,
                                child: const CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.white),
                                ),
                              )
                            : Text(
                                'متابعة',
                                style: TextStyle(
                                  fontFamily: 'MadaniArabic',
                                  fontSize: 16.sp,
                                  fontWeight: FontWeight.w400,
                                  height: 1.5,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
