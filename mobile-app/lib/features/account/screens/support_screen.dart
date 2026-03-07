import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import 'package:go_router/go_router.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  final _messageController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'الدعم الفني',
              leading: IconButton(
                icon: Icon(Icons.arrow_back_ios, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(20.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'تواصل معنا',
                      style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 20.sp, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      'هل لديك أي استفسار أو مشكلة؟ يسعدنا مساعدتك.',
                      style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 14.sp, color: AppColors.textSecondary),
                    ),
                    SizedBox(height: 32.h),
                    _buildContactCard(Icons.email_outlined, 'البريد الإلكتروني', 'support@tawasoul.com'),
                    SizedBox(height: 12.h),
                    _buildContactCard(Icons.phone_outlined, 'رقم الهاتف', '0501234567'),
                    SizedBox(height: 12.h),
                    _buildContactCard(Icons.chat_bubble_outline, 'واتساب', '+966 50 123 4567'),
                    SizedBox(height: 40.h),
                    Text(
                      'أرسل لنا رسالة',
                      style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 16.sp, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                    ),
                    SizedBox(height: 12.h),
                    _buildMessageField(),
                    SizedBox(height: 24.h),
                    SizedBox(
                      width: double.infinity,
                      height: 54.h,
                      child: ElevatedButton(
                        onPressed: () {
                          // TODO: Send message
                          _messageController.clear();
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('تم إرسال رسالتك بنجاح. سنرد عليك قريباً.')),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                        ),
                        child: const Text('إرسال الرسالة'),
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

  Widget _buildContactCard(IconData icon, String label, String value) {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(label, style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 12.sp, color: AppColors.textTertiary)),
                SizedBox(height: 4.h),
                Text(value, style: TextStyle(fontFamily: 'Inter', fontSize: 15.sp, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              ],
            ),
          ),
          SizedBox(width: 16.w),
          Container(
            padding: EdgeInsets.all(10.w),
            decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), shape: BoxShape.circle),
            child: Icon(icon, color: AppColors.primary, size: 24.sp),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageField() {
    return TextField(
      controller: _messageController,
      maxLines: 5,
      textAlign: TextAlign.right,
      decoration: InputDecoration(
        hintText: 'اكتب رسالتك هنا...',
        hintStyle: TextStyle(fontFamily: 'MadaniArabic', fontSize: 14.sp, color: AppColors.textPlaceholder),
        filled: true,
        fillColor: AppColors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r), borderSide: BorderSide(color: AppColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r), borderSide: BorderSide(color: AppColors.border)),
      ),
    );
  }
}
