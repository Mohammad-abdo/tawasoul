import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_navigation_bar.dart';
import '../../../core/widgets/rating_widget.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../shared/mock_content.dart';

/// صفحة المنتجات — تصميم احترافي مع تصنيفات وبطاقات منتجات محسّنة
class ProductsListScreen extends StatefulWidget {
  const ProductsListScreen({super.key});

  @override
  State<ProductsListScreen> createState() => _ProductsListScreenState();
}

class _ProductsListScreenState extends State<ProductsListScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Map<String, dynamic>> _filteredProducts = List.from(MockContent.products);
  Map<String, dynamic>? _appliedFilters;
  String _selectedCategory = 'الكل';

  static const List<Map<String, String>> _categories = [
    {'id': 'الكل', 'label': 'الكل'},
    {'id': 'تعليمي', 'label': 'تعليمي'},
    {'id': 'ألعاب', 'label': 'ألعاب'},
    {'id': 'كتب', 'label': 'كتب'},
  ];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
  }

  void _onSearchChanged() {
    _applyFiltersAndSearch();
  }

  void _applyFiltersAndSearch() {
    final query = _searchController.text.toLowerCase().trim();
    setState(() {
      _filteredProducts = MockContent.products.where((product) {
        final name = (product['name']?.toString() ?? '').toLowerCase();
        final cat = product['category']?.toString() ?? '';
        if (query.isNotEmpty && !name.contains(query)) return false;
        if (_selectedCategory != 'الكل' && cat != _selectedCategory) return false;
        return _matchesFilters(product);
      }).toList();
    });
  }

  bool _matchesFilters(Map<String, dynamic> product) {
    if (_appliedFilters == null) return true;
    final cat = _appliedFilters!['category'] as String?;
    if (cat != null && cat != 'الكل') {
      final pCat = product['category']?.toString() ?? '';
      final match = pCat == cat ||
          (cat == 'ألعاب تعليمية' && pCat == 'تعليمي') ||
          ((cat == 'ألعاب تفاعلية' || cat == 'ألعاب') && pCat == 'ألعاب');
      if (!match) return false;
    }
    final minP = (_appliedFilters!['minPrice'] as num?)?.toDouble() ?? 0;
    final maxP = (_appliedFilters!['maxPrice'] as num?)?.toDouble() ?? 1000;
    final price = _parsePrice(product['price']?.toString());
    if (price != null && (price < minP || price > maxP)) return false;
    final minR = _appliedFilters!['minRating'] as int? ?? 0;
    final rating = (product['rating'] as num?)?.toDouble() ?? 0;
    if (rating < minR) return false;
    if (_appliedFilters!['inStockOnly'] == true) {
      if (product['inStock'] != true) return false;
    }
    return true;
  }

  static double? _parsePrice(String? s) {
    if (s == null || s.isEmpty) return null;
    final n = RegExp(r'[\d.]+').firstMatch(s);
    return n != null ? double.tryParse(n.group(0) ?? '') : null;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _openFilters() async {
    final result = await context.push<Map<String, dynamic>>(
      '/products/filters',
      extra: _appliedFilters,
    );
    if (result != null && mounted) {
      setState(() {
        _appliedFilters = result;
        _applyFiltersAndSearch();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'المنتجات',
              leading: IconButton(
                icon: Icon(AppIcons.arrowBack, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
              trailing: IconButton(
                icon: Icon(AppIcons.filter, size: 24.sp, color: AppColors.textPrimary),
                onPressed: _openFilters,
              ),
            ),
            // Hero section
            Container(
              width: double.infinity,
              padding: EdgeInsets.fromLTRB(20.w, 12.h, 20.w, 20.h),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.primary.withOpacity(0.08),
                    AppColors.primary.withOpacity(0.02),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'منتجات تعليمية لأطفالك',
                    style: AppTypography.headingM(context).copyWith(
                      fontWeight: AppTypography.bold,
                      color: AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.right,
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    'ألعاب وكتب وبطاقات لتنمية المهارات',
                    style: AppTypography.bodyMedium(context).copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.right,
                  ),
                  SizedBox(height: 16.h),
                  // Search
                  TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'ابحث عن منتج...',
                      hintStyle: AppTypography.bodyMedium(context).copyWith(
                        color: AppColors.textTertiary,
                      ),
                      prefixIcon: Icon(
                        AppIcons.search,
                        size: 22.sp,
                        color: AppColors.textTertiary,
                      ),
                      filled: true,
                      fillColor: AppColors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16.r),
                        borderSide: BorderSide.none,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16.r),
                        borderSide: BorderSide(color: AppColors.border),
                      ),
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 16.w,
                        vertical: 14.h,
                      ),
                    ),
                    textDirection: TextDirection.rtl,
                  ),
                  SizedBox(height: 16.h),
                  // Category chips
                  SizedBox(
                    height: 40.h,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      reverse: true,
                      children: _categories.map((c) {
                        final isSelected = _selectedCategory == c['id'];
                        return Padding(
                          padding: EdgeInsets.only(left: 10.w),
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                _selectedCategory = c['id']!;
                                _applyFiltersAndSearch();
                              });
                            },
                            child: Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 18.w,
                                vertical: 10.h,
                              ),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.primary
                                    : AppColors.white,
                                borderRadius: BorderRadius.circular(20.r),
                                border: Border.all(
                                  color: isSelected
                                      ? AppColors.primary
                                      : AppColors.border,
                                  width: isSelected ? 2 : 1,
                                ),
                                boxShadow: isSelected
                                    ? [
                                        BoxShadow(
                                          color: AppColors.primary.withOpacity(0.2),
                                          blurRadius: 8,
                                          offset: const Offset(0, 2),
                                        ),
                                      ]
                                    : [],
                              ),
                              child: Center(
                                child: Text(
                                  c['label']!,
                                  style: AppTypography.bodyMedium(context).copyWith(
                                    color: isSelected
                                        ? AppColors.white
                                        : AppColors.textPrimary,
                                    fontWeight: isSelected
                                        ? AppTypography.semiBold
                                        : AppTypography.regular,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: _filteredProducts.isEmpty
                  ? _buildEmptyOrNoResults(context)
                  : ListView.builder(
                      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
                      itemCount: _filteredProducts.length,
                      itemBuilder: (context, index) {
                        return Padding(
                          padding: EdgeInsets.only(bottom: 16.h),
                          child: _buildProductCard(
                            context,
                            _filteredProducts[index],
                          ),
                        );
                      },
                    ),
            ),
            AppNavigationBar(
              currentIndex: 0,
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
                    context.push('/account');
                    break;
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyOrNoResults(BuildContext context) {
    final hasFilters = _appliedFilters != null ||
        _selectedCategory != 'الكل' ||
        _searchController.text.trim().isNotEmpty;
    return Center(
      child: Padding(
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.shopping_bag_outlined,
              size: 80.sp,
              color: AppColors.gray300,
            ),
            SizedBox(height: 20.h),
            Text(
              hasFilters
                  ? 'لا توجد منتجات تطابق التصفية أو البحث'
                  : 'لا توجد منتجات',
              style: AppTypography.headingS(context).copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            if (hasFilters) ...[
              SizedBox(height: 20.h),
              TextButton.icon(
                onPressed: () {
                  setState(() {
                    _appliedFilters = null;
                    _selectedCategory = 'الكل';
                    _searchController.clear();
                    _applyFiltersAndSearch();
                  });
                },
                icon: Icon(Icons.filter_alt_off_rounded, size: 20.sp),
                label: const Text('مسح التصفية'),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primary,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildProductCard(BuildContext context, Map<String, dynamic> product) {
    final images = product['images'];
    final firstImage = (images is List && images.isNotEmpty)
        ? images.first.toString()
        : null;
    final category = product['category']?.toString() ?? '';
    final hasDiscount = product['oldPrice'] != null;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => context.push('/products/${product['id']}'),
        borderRadius: BorderRadius.circular(20.r),
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(20.r),
            border: Border.all(color: AppColors.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Image with category badge
              Stack(
                alignment: Alignment.topRight,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(20.r),
                    ),
                    child: SizedBox(
                      height: 180.h,
                      width: double.infinity,
                      child: AppNetworkImage(
                        imageUrl: firstImage,
                        fit: BoxFit.cover,
                        borderRadius: BorderRadius.zero,
                        placeholderStyle: AppImagePlaceholderStyle.generic,
                      ),
                    ),
                  ),
                  if (category.isNotEmpty)
                    Padding(
                      padding: EdgeInsets.all(12.w),
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 12.w,
                          vertical: 6.h,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        child: Text(
                          category,
                          style: AppTypography.bodySmall(context).copyWith(
                            color: AppColors.white,
                            fontWeight: AppTypography.semiBold,
                          ),
                        ),
                      ),
                    ),
                  if (hasDiscount)
                    Positioned(
                      top: 12.h,
                      left: 12.w,
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 10.w,
                          vertical: 4.h,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.error,
                          borderRadius: BorderRadius.circular(10.r),
                        ),
                        child: Text(
                          'خصم',
                          style: AppTypography.bodySmall(context).copyWith(
                            color: AppColors.white,
                            fontWeight: AppTypography.semiBold,
                            fontSize: 11.sp,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              // Content
              Padding(
                padding: EdgeInsets.all(16.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      product['name']?.toString() ?? '',
                      style: AppTypography.headingS(context).copyWith(
                        fontWeight: AppTypography.semiBold,
                        color: AppColors.textPrimary,
                      ),
                      textAlign: TextAlign.right,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 10.h),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            RatingWidget(
                              rating: (product['rating'] as num?)?.toDouble() ?? 0.0,
                              size: 16.sp,
                            ),
                            SizedBox(width: 6.w),
                            Text(
                              '(${product['reviewsCount'] ?? 0})',
                              style: AppTypography.bodySmall(context).copyWith(
                                color: AppColors.textTertiary,
                              ),
                            ),
                          ],
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (product['oldPrice'] != null) ...[
                              Text(
                                product['oldPrice']?.toString() ?? '',
                                style: AppTypography.bodySmall(context).copyWith(
                                  color: AppColors.textTertiary,
                                  decoration: TextDecoration.lineThrough,
                                ),
                              ),
                              SizedBox(width: 8.w),
                            ],
                            Text(
                              product['price']?.toString() ?? '',
                              style: AppTypography.headingS(context).copyWith(
                                color: AppColors.primary,
                                fontWeight: AppTypography.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
