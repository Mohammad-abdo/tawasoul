import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import 'package:go_router/go_router.dart';

class FaqScreen extends StatelessWidget {
  const FaqScreen({super.key});

  final List<Map<String, String>> _faqs = const [
    {
      'question': 'كيف يمكنني حجز موعد مع أخصائي؟',
      'answer': 'يمكنك حجز موعد من خلال الصفحة الرئيسية بالضغط على زر "حجز موعد" واختيار الأخصائي والوقت المناسب.',
    },
    {
      'question': 'ما هي باقات الاشتراك المتاحة؟',
      'answer': 'نقدم باقات متنوعة تشمل الباقة الأساسية والباقة المتقدمة، يمكنك الاطلاع عليها في قسم الباقات من حسابك.',
    },
    {
      'question': 'كيف يمكنني إجراء الاختبارات التقييمية؟',
      'answer': 'من خلال ملف الطفل، اضغط على زر "الاختبارات التقييمية" لبدء التقييم السمعي أو البصري.',
    },
    {
      'question': 'هل يمكنني إلغاء الحجز؟',
      'answer': 'نعم، يمكنك إلغاء الحجز من قائمة "حجوزاتي" قبل الموعد بـ 24 ساعة على الأقل.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'الأسئلة الشائعة',
              leading: IconButton(
                icon: Icon(Icons.arrow_back_ios, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: ListView.separated(
                padding: EdgeInsets.all(20.w),
                itemCount: _faqs.length,
                separatorBuilder: (_, __) => SizedBox(height: 12.h),
                itemBuilder: (context, index) => _buildFaqItem(_faqs[index]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFaqItem(Map<String, String> faq) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Theme(
        data: ThemeData(dividerColor: Colors.transparent),
        child: ExpansionTile(
          title: Text(
            faq['question']!,
            textAlign: TextAlign.right,
            style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 15.sp, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
          ),
          children: [
            Padding(
              padding: EdgeInsets.only(left: 16.w, right: 16.w, bottom: 16.h),
              child: Text(
                faq['answer']!,
                textAlign: TextAlign.right,
                style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 14.sp, color: AppColors.textSecondary, height: 1.6),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
