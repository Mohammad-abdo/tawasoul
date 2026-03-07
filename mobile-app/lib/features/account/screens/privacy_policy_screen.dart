import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import 'package:go_router/go_router.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'سياسة الخصوصية',
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
                    _buildSection('مقدمة', 'نحن نلتزم بحماية خصوصيتك وبيانات طفلك. هذه السياسة توضح كيفية جمعنا واستخدامنا للمعلومات.'),
                    _buildSection('جمع المعلومات', 'نجمع المعلومات التي تقدمها لنا عند التسجيل مثل الاسم ورقم الهاتف، ومعلومات طفلك الضرورية لعمل التقييمات والجلسات.'),
                    _buildSection('استخدام المعلومات', 'نستخدم المعلومات لتحسين خدماتنا، وتخصيص الخطة العلاجية لطفلك، والتواصل معك بشأن المواعيد والتحديثات.'),
                    _buildSection('حماية البيانات', 'نتخذ إجراءات أمنية مشددة لحماية بياناتك من الوصول غير المصرح به أو التغيير أو الإفصاح.'),
                    _buildSection('مشاركة المعلومات', 'لا نقوم ببيع أو تأجير معلوماتك الشخصية لأطراف ثالثة. نشارك المعلومات فقط مع الأخصائيين المباشرين لحالة طفلك.'),
                    SizedBox(height: 20.h),
                    Center(
                      child: Text(
                        'آخر تحديث: 1 يناير 2026',
                        style: TextStyle(fontFamily: 'Inter', fontSize: 12.sp, color: AppColors.textTertiary),
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

  Widget _buildSection(String title, String content) {
    return Padding(
      padding: EdgeInsets.only(bottom: 24.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            title,
            style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 18.sp, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
          ),
          SizedBox(height: 10.h),
          Text(
            content,
            textAlign: TextAlign.right,
            style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 14.sp, color: AppColors.textSecondary, height: 1.6),
          ),
        ],
      ),
    );
  }
}
