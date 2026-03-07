import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_navigation_bar.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import 'package:go_router/go_router.dart';

/// Favorites Screen
/// List of favorite products, specialists, articles
class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Mock favorites data
    final favorites = [
      {
        'type': 'product',
        'id': 'prod_1',
        'name': 'مجموعة البطاقات التعليمية',
        'image': 'https://via.placeholder.com/80',
        'price': '85 ج.م',
      },
      {
        'type': 'specialist',
        'id': 'spec_1',
        'name': 'د/ سارة أحمد',
        'image': 'https://via.placeholder.com/80',
        'rating': 4.9,
      },
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            AppHeader(
              title: 'المفضلة',
              leading: IconButton(
                icon: Icon(
                  AppIcons.arrowBack,
                  size: 24.sp,
                  color: AppColors.textPrimary,
                ),
                onPressed: () => context.pop(),
              ),
            ),
            // Content
            Expanded(
              child: favorites.isEmpty
                  ? _buildEmptyState(context)
                  : ListView.builder(
                      padding: EdgeInsets.all(20.w),
                      itemCount: favorites.length,
                      itemBuilder: (context, index) {
                        return _buildFavoriteCard(context, favorites[index]);
                      },
                    ),
            ),
            // Bottom Navigation
            AppNavigationBar(
              currentIndex: 4,
              onTap: (index) {
                switch (index) {
                  case 0:
                    context.push('/home');
                    break;
                  case 1:
                    context.push('/appointments');
                    break;
                  case 2:
                    context.push('/assessments/categories?childId=mock_child_1');
                    break;
                  case 3:
                    context.push('/chat');
                    break;
                  case 4:
                    break; // Already on account section
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.favorite_border_rounded,
            size: 80.sp,
            color: AppColors.gray300,
          ),
          SizedBox(height: 16.h),
          Text(
            'لا توجد مفضلات',
            style: AppTypography.headingM(context).copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 8.h),
          Text(
            'أضف المنتجات والمختصين المفضلين لديك',
            style: AppTypography.bodyMedium(context).copyWith(
              color: AppColors.textTertiary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildFavoriteCard(BuildContext context, Map<String, dynamic> favorite) {
    final type = favorite['type'] as String;
    
    return Container(
      margin: EdgeInsets.only(bottom: 12.h),
      padding: EdgeInsets.all(16.w),
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
        children: [
          IconButton(
            icon: Icon(
              Icons.favorite_rounded,
              color: AppColors.error,
              size: 24.sp,
            ),
            onPressed: () {
              // TODO: Remove from favorites
            },
          ),
          SizedBox(width: 12.w),
          // Image
          Container(
            width: 80.w,
            height: 80.w,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12.r),
              border: Border.all(color: AppColors.border),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12.r),
              child: Image.network(
                favorite['image'] as String,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: AppColors.gray100,
                    child: Icon(
                      AppIcons.image,
                      size: 32.sp,
                      color: AppColors.gray400,
                    ),
                  );
                },
              ),
            ),
          ),
          SizedBox(width: 16.w),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  favorite['name'] as String,
                  style: AppTypography.headingS(context),
                  textAlign: TextAlign.right,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: 6.h),
                if (type == 'product')
                  Text(
                    favorite['price'] as String,
                    style: AppTypography.bodyMedium(context).copyWith(
                      color: AppColors.primary,
                      fontWeight: AppTypography.semiBold,
                    ),
                    textAlign: TextAlign.right,
                  )
                else if (type == 'specialist')
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        '${favorite['rating']}',
                        style: AppTypography.bodySmall(context),
                      ),
                      SizedBox(width: 4.w),
                      Icon(
                        Icons.star_rounded,
                        size: 16.sp,
                        color: AppColors.warning,
                      ),
                    ],
                  ),
              ],
            ),
          ),
          SizedBox(width: 12.w),
          Icon(
            AppIcons.arrowForward,
            size: 20.sp,
            color: AppColors.textTertiary,
          ),
        ],
      ),
    );
  }
}
