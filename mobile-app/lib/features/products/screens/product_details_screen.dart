import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:carousel_slider/carousel_slider.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/rating_widget.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../shared/mock_content.dart';
import 'package:go_router/go_router.dart';

/// Enhanced Product Details Screen
/// Clear images, title, price
/// Quantity selector
/// Add to cart button prominent
/// Reviews and ratings displayed clearly
class ProductDetailsScreen extends StatefulWidget {
  final String productId;

  const ProductDetailsScreen({
    super.key,
    required this.productId,
  });

  @override
  State<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  int _currentImageIndex = 0;
  int _quantity = 1;
  bool _isFavorite = false;

  @override
  Widget build(BuildContext context) {
    final product = MockContent.products.firstWhere(
      (p) => p['id'] == widget.productId,
      orElse: () => MockContent.products.first,
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            AppHeader(
              title: 'تفاصيل المنتج',
              leading: IconButton(
                icon: Icon(
                  AppIcons.arrowBack,
                  size: 24.sp,
                  color: AppColors.textPrimary,
                ),
                onPressed: () => context.pop(),
              ),
              actions: [
                IconButton(
                  icon: Icon(
                    _isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                    size: 24.sp,
                    color: _isFavorite ? AppColors.error : AppColors.textPrimary,
                  ),
                  onPressed: () {
                    setState(() {
                      _isFavorite = !_isFavorite;
                    });
                    // TODO: Add/remove from favorites
                  },
                ),
              ],
            ),
            // Content
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _buildImageSlider(context, product['images'] as List),
                    SizedBox(height: 24.h),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 20.w),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            product['name']?.toString() ?? '',
                            style: AppTypography.headingM(context),
                            textAlign: TextAlign.right,
                          ),
                          SizedBox(height: 8.h),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              GestureDetector(
                                onTap: () {
                                  context.push('/reviews?productId=${product['id']}');
                                },
                                child: Text(
                                  '(${product['reviewsCount']} تقييم)',
                                  style: AppTypography.bodyMedium(context).copyWith(
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                              SizedBox(width: 8.w),
                              RatingWidget(
                                rating: (product['rating'] as num?)?.toDouble() ?? 0.0,
                                size: 16.sp,
                              ),
                            ],
                          ),
                          SizedBox(height: 16.h),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              if (product['oldPrice'] != null) ...[
                                Text(
                                  product['oldPrice']?.toString() ?? '',
                                  style: AppTypography.bodyLarge(context).copyWith(
                                    color: AppColors.textTertiary,
                                    decoration: TextDecoration.lineThrough,
                                  ),
                                ),
                                SizedBox(width: 12.w),
                              ],
                              Text(
                                product['price']?.toString() ?? '',
                                style: AppTypography.headingXL(context).copyWith(
                                  color: AppColors.primary,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 24.h),
                          Text(
                            'الوصف',
                            style: AppTypography.headingS(context),
                            textAlign: TextAlign.right,
                          ),
                          SizedBox(height: 8.h),
                          Text(
                            product['description']?.toString() ?? '',
                            style: AppTypography.bodyMedium(context).copyWith(
                              height: AppTypography.lineHeightRelaxed,
                            ),
                            textAlign: TextAlign.right,
                          ),
                          SizedBox(height: 24.h),
                          // Reviews Section
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              TextButton(
                                onPressed: () {
                                  context.push('/reviews?productId=${product['id']}');
                                },
                                child: Text(
                                  'عرض جميع التقييمات',
                                  style: AppTypography.bodyMedium(context).copyWith(
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                              Text(
                                'التقييمات',
                                style: AppTypography.headingS(context),
                                textAlign: TextAlign.right,
                              ),
                            ],
                          ),
                          SizedBox(height: 16.h),
                          // Sample Review
                          _buildReviewCard(context),
                          SizedBox(height: 32.h),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Bottom Bar
            _buildBottomBar(context),
          ],
        ),
      ),
    );
  }

  Widget _buildImageSlider(BuildContext context, List images) {
    return Column(
      children: [
        CarouselSlider(
          options: CarouselOptions(
            height: 280.h,
            viewportFraction: 1.0,
            onPageChanged: (index, reason) => setState(() => _currentImageIndex = index),
          ),
          items: images.map((image) {
            return Container(
              width: double.infinity,
              decoration: BoxDecoration(color: AppColors.white),
              child: Image.network(
                image.toString(),
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: AppColors.gray100,
                    child: Icon(
                      AppIcons.image,
                      size: 48.sp,
                      color: AppColors.gray400,
                    ),
                  );
                },
              ),
            );
          }).toList(),
        ),
        SizedBox(height: 12.h),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            images.length,
            (index) => Container(
              width: 8.w,
              height: 8.w,
              margin: EdgeInsets.symmetric(horizontal: 4.w),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _currentImageIndex == index ? AppColors.primary : AppColors.gray300,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildReviewCard(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: List.generate(5, (index) {
                  return Icon(
                    Icons.star_rounded,
                    size: 16.sp,
                    color: AppColors.warning,
                  );
                }),
              ),
              Text(
                'أحمد محمد',
                style: AppTypography.headingS(context),
                textAlign: TextAlign.right,
              ),
            ],
          ),
          SizedBox(height: 8.h),
          Text(
            'منتج ممتاز جداً، مناسب للأطفال ويعزز مهاراتهم.',
            style: AppTypography.bodyMedium(context).copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.right,
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            offset: const Offset(0, -4),
            blurRadius: 10,
          ),
        ],
      ),
      child: Row(
        children: [
          // Quantity Selector
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: Icon(
                    Icons.remove_rounded,
                    size: 20.sp,
                    color: AppColors.primary,
                  ),
                  onPressed: () => setState(() => _quantity > 1 ? _quantity-- : null),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 16.w),
                  child: Text(
                    '$_quantity',
                    style: AppTypography.headingS(context),
                  ),
                ),
                IconButton(
                  icon: Icon(
                    Icons.add_rounded,
                    size: 20.sp,
                    color: AppColors.primary,
                  ),
                  onPressed: () => setState(() => _quantity++),
                ),
              ],
            ),
          ),
          SizedBox(width: 16.w),
          // Add to Cart Button
          Expanded(
            child: SizedBox(
              height: 52.h,
              child: ElevatedButton(
                onPressed: () {
                  // TODO: Add to cart
                  context.push('/cart');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16.r),
                  ),
                ),
                child: Text(
                  'أضف إلى السلة',
                  style: AppTypography.bodyLarge(context).copyWith(
                    color: AppColors.white,
                    fontWeight: AppTypography.semiBold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
