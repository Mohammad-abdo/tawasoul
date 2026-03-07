import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_header.dart';
import '../../shared/mock_content.dart';

class ArticlesListScreen extends StatelessWidget {
  const ArticlesListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final articles = MockContent.articles;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'المقالات',
              leading: IconButton(
                icon: Icon(Icons.arrow_back_ios, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: ListView.separated(
                padding: EdgeInsets.all(20.w),
                itemCount: articles.length,
                separatorBuilder: (_, __) => SizedBox(height: 12.h),
                itemBuilder: (context, index) {
                  final article = articles[index];
                  final articleId = article['id']?.toString() ?? '';
                  final title = article['title']?.toString() ?? '';
                  final description = article['description']?.toString() ?? '';
                  final imageUrl = article['imageUrl']?.toString() ?? '';
                  return InkWell(
                    onTap: () => context.push('/articles/$articleId'),
                    borderRadius: BorderRadius.circular(12.r),
                    child: Container(
                      padding: EdgeInsets.all(12.w),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(12.r),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.arrow_back_ios, size: 20.sp, color: AppColors.primary),
                          SizedBox(width: 12.w),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  title,
                                  style: TextStyle(
                                    fontFamily: 'MadaniArabic',
                                    fontSize: 16.sp,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textPrimary,
                                  ),
                                  textAlign: TextAlign.right,
                                ),
                                SizedBox(height: 6.h),
                                Text(
                                  description,
                                  style: TextStyle(
                                    fontFamily: 'MadaniArabic',
                                    fontSize: 12.sp,
                                    color: AppColors.textTertiary,
                                  ),
                                  textAlign: TextAlign.right,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          SizedBox(width: 12.w),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10.r),
                            child: Image.network(
                              imageUrl,
                              width: 72.w,
                              height: 72.w,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                width: 72.w,
                                height: 72.w,
                                color: AppColors.gray100,
                                child: Icon(Icons.image, color: AppColors.textTertiary),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
