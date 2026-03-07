import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_navigation_bar.dart';
import '../../../core/theme/app_typography.dart';
import '../../children/theme/child_profile_design.dart';
import '../../../core/providers/assessment_provider.dart';
import '../data/mock_assessments.dart';
import '../constants/assessment_categories_theme.dart';
import '../widgets/category_card.dart';

/// Test Categories page – full redesign.
/// Header (friendly title, subtitle, mascot), grid (2/3/4 cols), category cards with states and animations.
/// Keeps existing routing and test logic.
class AssessmentCategoriesScreen extends StatefulWidget {
  final String childId;

  const AssessmentCategoriesScreen({
    super.key,
    required this.childId,
  });

  @override
  State<AssessmentCategoriesScreen> createState() => _AssessmentCategoriesScreenState();
}

class _AssessmentCategoriesScreenState extends State<AssessmentCategoriesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AssessmentProvider>().loadCategoryProgress(widget.childId);
    });
  }

  int _crossAxisCount(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    if (width > 900) return 4;
    if (width > 600) return 3;
    return 2;
  }

  double _categoryProgress(AssessmentProvider provider, String categoryId) {
    return provider.getCategoryProgress(categoryId);
  }

  CategoryCardStatus _status(double progress, {bool locked = false}) {
    if (locked) return CategoryCardStatus.locked;
    if (progress >= 1.0) return CategoryCardStatus.completed;
    if (progress > 0) return CategoryCardStatus.inProgress;
    return CategoryCardStatus.newTest;
  }

  @override
  Widget build(BuildContext context) {
    final categories = MockAssessmentsData.categories;
    final provider = context.watch<AssessmentProvider>();
    final crossAxisCount = _crossAxisCount(context);
    final hasCategories = categories.isNotEmpty;

    return Scaffold(
      backgroundColor: AssessmentCategoriesTheme.pageBg,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AppHeader(
              title: 'اختبارات المهارات',
              leading: IconButton(
                icon: Icon(
                  Icons.arrow_back_ios_rounded,
                  size: 24.sp,
                  color: AssessmentCategoriesTheme.textPrimary,
                ),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _HeaderSection(hasCategories: hasCategories),
                    SizedBox(height: 28.h),
                    if (!hasCategories)
                      _EmptyFirstTimeState()
                    else
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        padding: EdgeInsets.zero,
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: crossAxisCount,
                          mainAxisSpacing: 16.h,
                          crossAxisSpacing: 16.w,
                          childAspectRatio: 0.72,
                        ),
                        itemCount: categories.length,
                        itemBuilder: (context, index) {
                          final category = categories[index];
                          final categoryId = category['id'] as String;
                          final progress = _categoryProgress(provider, categoryId);
                          final status = _status(progress);
                          return CategoryCard(
                            category: category,
                            progress: progress,
                            status: status,
                            onTap: () => context.push(
                              '/assessments/category/$categoryId?childId=${widget.childId}',
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ),
            AppNavigationBar(
              currentIndex: 2,
              onTap: (index) {
                switch (index) {
                  case 0:
                    context.push('/home');
                    break;
                  case 1:
                    context.push('/appointments');
                    break;
                  case 2:
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
}

/// Header: friendly title, short subtitle, optional mascot/illustration.
class _HeaderSection extends StatelessWidget {
  final bool hasCategories;

  const _HeaderSection({required this.hasCategories});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 20.h),
      decoration: BoxDecoration(
        gradient: AssessmentCategoriesTheme.headerGradient,
        borderRadius: BorderRadius.circular(AssessmentCategoriesTheme.cardRadius),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Mascot / illustration
          Text(
            AssessmentCategoriesTheme.mascotEmoji,
            style: TextStyle(fontSize: AssessmentCategoriesTheme.headerIllustrationSize),
          ),
          SizedBox(height: 12.h),
          // Friendly title (large, readable)
          Text(
            'اختر اختبار المهارة',
            style: AppTypography.headingL(context).copyWith(
              fontSize: 24.sp,
              fontWeight: AppTypography.bold,
              color: AssessmentCategoriesTheme.textPrimary,
              height: 1.25,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 8.h),
          // Simple-language subtitle
          Text(
            hasCategories
                ? 'اختر فئة ثم اختبار لقياس مهاراتك في الانتباه والتفكير'
                : 'ستظهر هنا فئات الاختبارات عندما تكون جاهزة',
            style: ChildProfileDesign.bodyFriendly(context).copyWith(
              fontSize: 15.sp,
              color: AssessmentCategoriesTheme.textSecondary,
              height: 1.45,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

/// Empty or first-time state with friendly guidance.
class _EmptyFirstTimeState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 48.h, horizontal: 24.w),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: EdgeInsets.all(24.w),
            decoration: BoxDecoration(
              color: AssessmentCategoriesTheme.lockedSoft,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AssessmentCategoriesTheme.textTertiary.withOpacity(0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Text(
              AssessmentCategoriesTheme.emptyStateEmoji,
              style: TextStyle(fontSize: 64.sp),
            ),
          ),
          SizedBox(height: 28.h),
          Text(
            'لا توجد فئات حتى الآن',
            style: AppTypography.headingM(context).copyWith(
              fontSize: 20.sp,
              color: AssessmentCategoriesTheme.textPrimary,
              fontWeight: AppTypography.semiBold,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 12.h),
          Text(
            'سيتم إضافة اختبارات المهارات قريباً. عد لاحقاً أو اسأل معلمك.',
            style: ChildProfileDesign.bodyFriendly(context).copyWith(
              color: AssessmentCategoriesTheme.textSecondary,
              fontSize: 15.sp,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
