import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../../core/widgets/app_header.dart';
import '../../shared/mock_content.dart';
import '../constants/services_theme.dart';
import '../widgets/service_card.dart';
import '../widgets/service_card_skeleton.dart';

/// Services listing – modern, clean design.
/// Header (title + subtitle), responsive grid, ServiceCard, skeleton, empty state.
class ServicesListScreen extends StatefulWidget {
  const ServicesListScreen({super.key});

  @override
  State<ServicesListScreen> createState() => _ServicesListScreenState();
}

class _ServicesListScreenState extends State<ServicesListScreen> {
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Simulate brief load for skeleton demo; remove when using real API
    Future.delayed(const Duration(milliseconds: 400), () {
      if (mounted) setState(() => _isLoading = false);
    });
  }

  int _crossAxisCount(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    if (width > 900) return 4;
    if (width > 600) return 3;
    return 2;
  }

  @override
  Widget build(BuildContext context) {
    final services = MockContent.services;
    final isLoading = _isLoading && services.isEmpty;
    final hasServices = services.isNotEmpty;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'الخدمات',
              leading: IconButton(
                icon: Icon(AppIcons.arrowBack, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _HeaderSection(),
                    SizedBox(height: 24.h),
                    if (isLoading)
                      _buildSkeletonGrid(context)
                    else if (!hasServices)
                      _EmptyState()
                    else
                      LayoutBuilder(
                        builder: (context, constraints) {
                          final crossAxisCount = _crossAxisCount(context);
                          return GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            padding: EdgeInsets.zero,
                            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: crossAxisCount,
                              mainAxisSpacing: 16.h,
                              crossAxisSpacing: 16.w,
                              childAspectRatio: 0.68,
                            ),
                            itemCount: services.length,
                            itemBuilder: (context, index) {
                              final service = services[index];
                              return ServiceCard(service: service);
                            },
                          );
                        },
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

  Widget _buildSkeletonGrid(BuildContext context) {
    final crossAxisCount = _crossAxisCount(context);
    final count = crossAxisCount * 2;
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: EdgeInsets.zero,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        mainAxisSpacing: 16.h,
        crossAxisSpacing: 16.w,
        childAspectRatio: 0.68,
      ),
      itemCount: count,
      itemBuilder: (_, __) => ServiceCardSkeleton(),
    );
  }
}

/// Page header: title + short subtitle. Minimal, modern.
class _HeaderSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 20.h),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(ServicesTheme.cardRadius),
        border: Border.all(color: ServicesTheme.cardBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'خدماتنا',
            style: AppTypography.headingL(context).copyWith(
              fontSize: 24.sp,
              color: ServicesTheme.textPrimary,
              fontWeight: AppTypography.bold,
            ),
            textAlign: TextAlign.right,
          ),
          SizedBox(height: 8.h),
          Text(
            'اختر الخدمة المناسبة لطفلك واحجز جلسة مع مختصينا.',
            style: AppTypography.bodyMedium(context).copyWith(
              fontSize: 14.sp,
              color: ServicesTheme.textSecondary,
              height: 1.45,
            ),
            textAlign: TextAlign.right,
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 48.h),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: EdgeInsets.all(24.w),
            decoration: BoxDecoration(
              color: AppColors.gray50,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.miscellaneous_services_rounded,
              size: 64.sp,
              color: AppColors.textTertiary,
            ),
          ),
          SizedBox(height: 24.h),
          Text(
            'لا توجد خدمات حالياً',
            style: AppTypography.headingM(context).copyWith(color: ServicesTheme.textPrimary),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 10.h),
          Text(
            'سيتم إضافة الخدمات قريباً.',
            style: AppTypography.bodyMedium(context).copyWith(
              color: ServicesTheme.textSecondary,
              fontSize: 14.sp,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
