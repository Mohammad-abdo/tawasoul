import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_header.dart';
import '../../shared/mock_content.dart';

class ArticleDetailsScreen extends StatelessWidget {
  final String articleId;

  const ArticleDetailsScreen({super.key, required this.articleId});

  @override
  Widget build(BuildContext context) {
    final article = MockContent.articles.firstWhere(
      (item) => item['id'] == articleId,
      orElse: () => MockContent.articles.first,
    );
    final title = article['title']?.toString() ?? '';
    final content = article['content']?.toString() ?? '';
    final imageUrl = article['imageUrl']?.toString() ?? '';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'تفاصيل المقال',
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
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12.r),
                      child: Image.network(
                        imageUrl,
                        width: double.infinity,
                        height: 200.h,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          height: 200.h,
                          color: AppColors.gray100,
                          child: Icon(Icons.image, size: 60.sp, color: AppColors.textTertiary),
                        ),
                      ),
                    ),
                    SizedBox(height: 16.h),
                    Text(
                      title,
                      style: TextStyle(
                        fontFamily: 'MadaniArabic',
                        fontSize: 20.sp,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      content,
                      style: TextStyle(
                        fontFamily: 'MadaniArabic',
                        fontSize: 14.sp,
                        color: AppColors.textPrimary,
                        height: 1.7,
                      ),
                      textAlign: TextAlign.right,
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
