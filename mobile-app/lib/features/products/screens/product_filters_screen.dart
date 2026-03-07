import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import 'package:go_router/go_router.dart';

/// Product Filters Screen
/// Category, price, rating, availability filters
/// Horizontal scroll for categories
/// Large, touch-friendly toggle buttons
class ProductFiltersScreen extends StatefulWidget {
  final Map<String, dynamic>? initialFilters;
  final Function(Map<String, dynamic>) onApplyFilters;

  const ProductFiltersScreen({
    super.key,
    this.initialFilters,
    required this.onApplyFilters,
  });

  @override
  State<ProductFiltersScreen> createState() => _ProductFiltersScreenState();
}

class _ProductFiltersScreenState extends State<ProductFiltersScreen> {
  // Filter state
  String? _selectedCategory;
  double _minPrice = 0;
  double _maxPrice = 1000;
  int _minRating = 0;
  bool _inStockOnly = false;

  final List<String> _categories = [
    'الكل',
    'ألعاب تعليمية',
    'كتب',
    'بطاقات',
    'أدوات',
    'ألعاب تفاعلية',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialFilters != null) {
      _selectedCategory = widget.initialFilters!['category'];
      _minPrice = widget.initialFilters!['minPrice'] ?? 0;
      _maxPrice = widget.initialFilters!['maxPrice'] ?? 1000;
      _minRating = widget.initialFilters!['minRating'] ?? 0;
      _inStockOnly = widget.initialFilters!['inStockOnly'] ?? false;
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
              title: 'تصفية المنتجات',
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
              child: SingleChildScrollView(
                padding: EdgeInsets.all(20.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Categories Section
                    _buildSectionTitle('الفئات'),
                    SizedBox(height: 16.h),
                    _buildCategoriesFilter(),
                    SizedBox(height: 32.h),
                    // Price Range Section
                    _buildSectionTitle('نطاق السعر'),
                    SizedBox(height: 16.h),
                    _buildPriceRangeFilter(),
                    SizedBox(height: 32.h),
                    // Rating Section
                    _buildSectionTitle('التقييم'),
                    SizedBox(height: 16.h),
                    _buildRatingFilter(),
                    SizedBox(height: 32.h),
                    // Availability Section
                    _buildSectionTitle('التوفر'),
                    SizedBox(height: 16.h),
                    _buildAvailabilityFilter(),
                    SizedBox(height: 40.h),
                  ],
                ),
              ),
            ),
            // Footer Actions
            Container(
              padding: EdgeInsets.all(20.w),
              decoration: BoxDecoration(
                color: AppColors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    offset: const Offset(0, -2),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _resetFilters,
                      style: OutlinedButton.styleFrom(
                        padding: EdgeInsets.symmetric(vertical: 16.h),
                        side: const BorderSide(color: AppColors.border),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16.r),
                        ),
                      ),
                      child: Text(
                        'إعادة تعيين',
                        style: AppTypography.bodyLarge(context).copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 16.w),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: _applyFilters,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: EdgeInsets.symmetric(vertical: 16.h),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16.r),
                        ),
                      ),
                      child: Text(
                        'تطبيق التصفية',
                        style: AppTypography.bodyLarge(context).copyWith(
                          color: AppColors.white,
                          fontWeight: AppTypography.semiBold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTypography.headingM(context),
      textAlign: TextAlign.right,
    );
  }

  Widget _buildCategoriesFilter() {
    return SizedBox(
      height: 50.h,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        reverse: true,
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final category = _categories[index];
          final isSelected = _selectedCategory == category;
          
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedCategory = isSelected ? null : category;
              });
            },
            child: Container(
              margin: EdgeInsets.only(left: 12.w),
              padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : AppColors.white,
                borderRadius: BorderRadius.circular(25.r),
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.border,
                  width: 2,
                ),
              ),
              child: Center(
                child: Text(
                  category,
                  style: AppTypography.bodyMedium(context).copyWith(
                    color: isSelected ? AppColors.white : AppColors.textPrimary,
                    fontWeight: isSelected ? AppTypography.semiBold : AppTypography.regular,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPriceRangeFilter() {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${_maxPrice.toInt()} ج.م',
                style: AppTypography.headingS(context).copyWith(
                  color: AppColors.primary,
                ),
              ),
              Text(
                '${_minPrice.toInt()} ج.م',
                style: AppTypography.headingS(context).copyWith(
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          SizedBox(height: 16.h),
          RangeSlider(
            values: RangeValues(_minPrice, _maxPrice),
            min: 0,
            max: 1000,
            divisions: 20,
            activeColor: AppColors.primary,
            inactiveColor: AppColors.gray200,
            onChanged: (values) {
              setState(() {
                _minPrice = values.start;
                _maxPrice = values.end;
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildRatingFilter() {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: List.generate(5, (index) {
          final rating = 5 - index;
          final isSelected = _minRating == rating;
          
          return GestureDetector(
            onTap: () {
              setState(() {
                _minRating = isSelected ? 0 : rating;
              });
            },
            child: Container(
              margin: EdgeInsets.only(bottom: index < 4 ? 12.h : 0),
              padding: EdgeInsets.all(16.w),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary.withOpacity(0.1) : Colors.transparent,
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.border,
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Icon(
                    isSelected ? Icons.check_circle_rounded : Icons.circle_outlined,
                    color: isSelected ? AppColors.primary : AppColors.gray400,
                    size: 24.sp,
                  ),
                  Row(
                    children: List.generate(5, (starIndex) {
                      return Icon(
                        starIndex < rating ? Icons.star_rounded : Icons.star_border_rounded,
                        size: 20.sp,
                        color: starIndex < rating ? AppColors.warning : AppColors.gray300,
                      );
                    }),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildAvailabilityFilter() {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Switch(
            value: _inStockOnly,
            onChanged: (value) {
              setState(() {
                _inStockOnly = value;
              });
            },
            activeColor: AppColors.primary,
          ),
          Text(
            'متوفر فقط',
            style: AppTypography.bodyLarge(context),
            textAlign: TextAlign.right,
          ),
        ],
      ),
    );
  }

  void _resetFilters() {
    setState(() {
      _selectedCategory = null;
      _minPrice = 0;
      _maxPrice = 1000;
      _minRating = 0;
      _inStockOnly = false;
    });
  }

  void _applyFilters() {
    final filters = <String, dynamic>{
      'category': _selectedCategory,
      'minPrice': _minPrice,
      'maxPrice': _maxPrice,
      'minRating': _minRating,
      'inStockOnly': _inStockOnly,
    };
    widget.onApplyFilters(filters);
  }
}
