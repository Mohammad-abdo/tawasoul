import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import 'package:go_router/go_router.dart';

/// Ratings/Reviews List Screen
/// List of reviews with user info, rating, comment, date
/// Scrollable list
/// Proper spacing
/// Highlight top reviews
/// Consistent typography and colors
class ReviewsListScreen extends StatelessWidget {
  final String? specialistId;
  final String? serviceId;

  const ReviewsListScreen({
    super.key,
    this.specialistId,
    this.serviceId,
  });

  @override
  Widget build(BuildContext context) {
    final reviews = _getMockReviews();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            AppHeader(
              title: 'التقييمات والمراجعات',
              leading: IconButton(
                icon: Icon(
                  AppIcons.arrowBack,
                  size: 24.sp,
                  color: AppColors.textPrimary,
                ),
                onPressed: () => context.pop(),
              ),
            ),
            // Summary Card
            Container(
              margin: EdgeInsets.all(20.w),
              padding: EdgeInsets.all(20.w),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(20.r),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      Text(
                        '4.9',
                        style: AppTypography.headingXL(context).copyWith(
                          color: AppColors.primary,
                        ),
                      ),
                      SizedBox(height: 4.h),
                      Row(
                        children: List.generate(5, (index) {
                          return Icon(
                            Icons.star_rounded,
                            size: 20.sp,
                            color: AppColors.warning,
                          );
                        }),
                      ),
                    ],
                  ),
                  Container(
                    width: 1,
                    height: 50.h,
                    color: AppColors.border,
                  ),
                  Column(
                    children: [
                      Text(
                        '150',
                        style: AppTypography.headingM(context),
                      ),
                      SizedBox(height: 4.h),
                      Text(
                        'مراجعة',
                        style: AppTypography.bodyMedium(context).copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Reviews List
            Expanded(
              child: ListView.builder(
                padding: EdgeInsets.symmetric(horizontal: 20.w),
                itemCount: reviews.length,
                itemBuilder: (context, index) {
                  final review = reviews[index];
                  return Padding(
                    padding: EdgeInsets.only(bottom: 16.h),
                    child: _buildReviewCard(context, review),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewCard(BuildContext context, Map<String, dynamic> review) {
    final isTopReview = review['isTop'] as bool? ?? false;

    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(
          color: isTopReview ? AppColors.warning : AppColors.border,
          width: isTopReview ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: User info + Rating
          Row(
            children: [
              // User Avatar
              Container(
                width: 48.w,
                height: 48.w,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.border),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24.r),
                  child: Image.network(
                    review['userImage'] as String,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Icon(
                        AppIcons.person,
                        size: 24.sp,
                        color: AppColors.gray400,
                      );
                    },
                  ),
                ),
              ),
              SizedBox(width: 12.w),
              // User Name & Date
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        if (isTopReview)
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                            decoration: BoxDecoration(
                              color: AppColors.warning.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8.r),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.star_rounded,
                                  size: 12.sp,
                                  color: AppColors.warning,
                                ),
                                SizedBox(width: 4.w),
                                Text(
                                  'مميز',
                                  style: AppTypography.bodySmall(context).copyWith(
                                    color: AppColors.warning,
                                    fontWeight: AppTypography.semiBold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        if (isTopReview) SizedBox(width: 8.w),
                        Text(
                          review['userName'] as String,
                          style: AppTypography.headingS(context),
                          textAlign: TextAlign.right,
                        ),
                      ],
                    ),
                    SizedBox(height: 4.h),
                    Text(
                      review['date'] as String,
                      style: AppTypography.bodySmall(context).copyWith(
                        color: AppColors.textTertiary,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  ],
                ),
              ),
              SizedBox(width: 12.w),
              // Rating Stars
              Column(
                children: [
                  Row(
                    children: List.generate(5, (index) {
                      final rating = review['rating'] as int;
                      return Icon(
                        index < rating ? Icons.star_rounded : Icons.star_border_rounded,
                        size: 16.sp,
                        color: index < rating ? AppColors.warning : AppColors.gray300,
                      );
                    }),
                  ),
                ],
              ),
            ],
          ),
          SizedBox(height: 16.h),
          // Comment
          Text(
            review['comment'] as String,
            style: AppTypography.bodyMedium(context).copyWith(
              height: AppTypography.lineHeightRelaxed,
            ),
            textAlign: TextAlign.right,
          ),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _getMockReviews() {
    return [
      {
        'id': 'rev_1',
        'userName': 'أحمد محمد',
        'userImage': 'https://via.placeholder.com/48',
        'rating': 5,
        'comment': 'جلسة ممتازة جداً، الأخصائي محترف ومتعاون. لاحظت تحسن واضح في نطق طفلي بعد الجلسات.',
        'date': 'منذ 3 أيام',
        'isTop': true,
      },
      {
        'id': 'rev_2',
        'userName': 'فاطمة علي',
        'userImage': 'https://via.placeholder.com/48',
        'rating': 5,
        'comment': 'خدمة رائعة ومتابعة مستمرة. أنصح بها بشدة.',
        'date': 'منذ أسبوع',
        'isTop': false,
      },
      {
        'id': 'rev_3',
        'userName': 'خالد حسن',
        'userImage': 'https://via.placeholder.com/48',
        'rating': 4,
        'comment': 'تجربة جيدة بشكل عام، لكن أتمنى المزيد من التفاصيل في التقارير.',
        'date': 'منذ أسبوعين',
        'isTop': false,
      },
      {
        'id': 'rev_4',
        'userName': 'نورا سعيد',
        'userImage': 'https://via.placeholder.com/48',
        'rating': 5,
        'comment': 'الأخصائي صبور جداً مع الأطفال. طريقة التعامل ممتازة.',
        'date': 'منذ شهر',
        'isTop': true,
      },
    ];
  }
}
