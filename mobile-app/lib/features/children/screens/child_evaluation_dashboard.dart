import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../../core/providers/assessment_provider.dart';
import '../../children/theme/child_profile_design.dart';
import '../../assessments/data/mock_assessments.dart';
import '../../assessments/models/category_score_model.dart';

/// Child Evaluation Dashboard – Progress rings, bar charts, 12 skill categories,
/// skill-level indicators, smart recommendations based on weak skills.
class ChildEvaluationDashboard extends StatefulWidget {
  final String childId;

  const ChildEvaluationDashboard({
    super.key,
    required this.childId,
  });

  @override
  State<ChildEvaluationDashboard> createState() => _ChildEvaluationDashboardState();
}

class _ChildEvaluationDashboardState extends State<ChildEvaluationDashboard> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AssessmentProvider>().loadCategoryProgress(widget.childId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ChildProfileDesign.profileBg,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'تقييم الطفل',
              leading: IconButton(
                icon: Icon(AppIcons.arrowBack, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: Consumer<AssessmentProvider>(
                builder: (context, provider, _) {
                  final scores = provider.childScores;
                  final byCategory = <String, CategoryScoreModel>{};
                  for (final s in scores) {
                    final existing = byCategory[s.categoryId];
                    if (existing == null || s.completedAt.isAfter(existing.completedAt)) {
                      byCategory[s.categoryId] = s;
                    }
                  }
                  final overallPercent = _overallPercent(byCategory);
                  final weakCategories = _weakCategories(byCategory);
                  final strongCategories = _strongCategories(byCategory);

                  return SingleChildScrollView(
                    padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _buildProgressRing(context, overallPercent),
                        SizedBox(height: 24.h),
                        Text(
                          'الفئات الـ ١٢ (الانتباه والمعرفي)',
                          style: AppTypography.headingM(context),
                          textAlign: TextAlign.right,
                        ),
                        SizedBox(height: 12.h),
                        _buildBarChart(context, byCategory),
                        SizedBox(height: 24.h),
                        if (weakCategories.isNotEmpty) ...[
                          Text(
                            'توصيات حسب نقاط التحسين',
                            style: AppTypography.headingM(context),
                            textAlign: TextAlign.right,
                          ),
                          SizedBox(height: 12.h),
                          _buildRecommendations(context, weakCategories),
                          SizedBox(height: 24.h),
                        ],
                        Text(
                          'الإنجازات الأخيرة',
                          style: AppTypography.headingM(context),
                          textAlign: TextAlign.right,
                        ),
                        SizedBox(height: 12.h),
                        _buildRecentScores(context, scores, strongCategories),
                      ],
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

  double _overallPercent(Map<String, CategoryScoreModel> byCategory) {
    if (byCategory.isEmpty) return 0;
    final sum = byCategory.values.fold<double>(0, (s, e) => s + e.scorePercent);
    return (sum / byCategory.length).clamp(0.0, 1.0);
  }

  List<MapEntry<String, CategoryScoreModel>> _weakCategories(
      Map<String, CategoryScoreModel> byCategory) {
    return byCategory.entries.where((e) => e.value.score <= 2).toList();
  }

  List<MapEntry<String, CategoryScoreModel>> _strongCategories(
      Map<String, CategoryScoreModel> byCategory) {
    return byCategory.entries.where((e) => e.value.score >= 4).toList();
  }

  String _categoryTitle(String categoryId) {
    try {
      final c = MockAssessmentsData.categories.firstWhere(
        (e) => e['id'] == categoryId,
        orElse: () => <String, dynamic>{'title': categoryId},
      );
      return c['title'] as String? ?? categoryId;
    } catch (_) {
      return categoryId;
    }
  }

  Widget _buildProgressRing(BuildContext context, double percent) {
    final color = percent >= 0.7
        ? ChildProfileDesign.statusActive
        : percent >= 0.4
            ? ChildProfileDesign.statusImproving
            : ChildProfileDesign.statusNeedsAttention;
    return Container(
      padding: ChildProfileDesign.cardPadding,
      decoration: BoxDecoration(
        color: ChildProfileDesign.profileCardBg,
        borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadius),
        border: Border.all(color: AppColors.border),
        boxShadow: ChildProfileDesign.cardShadowSoft(context),
      ),
      child: Column(
        children: [
          SizedBox(
            width: 140.w,
            height: 140.w,
            child: Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 140.w,
                  height: 140.w,
                  child: CircularProgressIndicator(
                    value: percent,
                    strokeWidth: 12.w,
                    backgroundColor: AppColors.gray200,
                    valueColor: AlwaysStoppedAnimation<Color>(color),
                  ),
                ),
                Text(
                  '${(percent * 100).toInt()}%',
                  style: TextStyle(
                    fontFamily: AppTypography.headingFont,
                    fontSize: 28.sp,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 12.h),
          Text(
            'التقييم الإجمالي',
            style: ChildProfileDesign.titleMedium(context),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildBarChart(
      BuildContext context, Map<String, CategoryScoreModel> byCategory) {
    final categories = MockAssessmentsData.categories;
    return Container(
      padding: ChildProfileDesign.cardPadding,
      decoration: BoxDecoration(
        color: ChildProfileDesign.profileCardBg,
        borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadius),
        border: Border.all(color: AppColors.border),
        boxShadow: ChildProfileDesign.cardShadowSoft(context),
      ),
      child: Column(
        children: categories.map((cat) {
          final id = cat['id'] as String;
          final scoreModel = byCategory[id];
          final value = scoreModel != null ? scoreModel.scorePercent : 0.0;
          final color = Color(cat['color'] as int);
          final title = cat['title'] as String;
          return Padding(
            padding: EdgeInsets.only(bottom: 12.h),
            child: Row(
              textDirection: TextDirection.rtl,
              children: [
                SizedBox(
                  width: 90.w,
                  child: Text(
                    title,
                    style: ChildProfileDesign.captionFriendly(context),
                    textAlign: TextAlign.right,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                SizedBox(width: 8.w),
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8.r),
                    child: LinearProgressIndicator(
                      value: value,
                      minHeight: 20.h,
                      backgroundColor: AppColors.gray200,
                      valueColor: AlwaysStoppedAnimation<Color>(color),
                    ),
                  ),
                ),
                SizedBox(width: 8.w),
                SizedBox(
                  width: 32.w,
                  child: Text(
                    scoreModel != null ? '${scoreModel.score}/5' : '—',
                    style: ChildProfileDesign.captionFriendly(context).copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildRecommendations(
      BuildContext context, List<MapEntry<String, CategoryScoreModel>> weak) {
    final messages = <String>[
      'ركز على التمارين الخاصة بكل فئة ضعيفة.',
      'جرب اختبارات قصيرة ومتكررة بدلاً من جلسة طويلة.',
      'احرص على تشجيع الطفل دون ضغط.',
    ];
    return Container(
      padding: ChildProfileDesign.cardPadding,
      decoration: BoxDecoration(
        color: ChildProfileDesign.profileCardBg,
        borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadius),
        border: Border.all(color: ChildProfileDesign.statusNeedsAttention.withOpacity(0.5)),
        boxShadow: ChildProfileDesign.cardShadowSoft(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ...weak.take(5).map((e) => Padding(
                padding: EdgeInsets.only(bottom: 8.h),
                child: Row(
                  textDirection: TextDirection.rtl,
                  children: [
                    Icon(
                      Icons.lightbulb_outline_rounded,
                      size: 20.sp,
                      color: ChildProfileDesign.statusNeedsAttention,
                    ),
                    SizedBox(width: 8.w),
                    Expanded(
                      child: Text(
                        _categoryTitle(e.key),
                        style: ChildProfileDesign.bodyFriendly(context),
                        textAlign: TextAlign.right,
                      ),
                    ),
                    Text(
                      '${e.value.score}/5',
                      style: ChildProfileDesign.captionFriendly(context),
                    ),
                  ],
                ),
              )),
          SizedBox(height: 8.h),
          ...messages.map((m) => Padding(
                padding: EdgeInsets.only(bottom: 6.h),
                child: Row(
                  textDirection: TextDirection.rtl,
                  children: [
                    Icon(Icons.check_circle_outline_rounded,
                        size: 18.sp, color: ChildProfileDesign.statusActive),
                    SizedBox(width: 8.w),
                    Expanded(
                      child: Text(
                        m,
                        style: ChildProfileDesign.captionFriendly(context),
                        textAlign: TextAlign.right,
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildRecentScores(
    BuildContext context,
    List<CategoryScoreModel> scores,
    List<MapEntry<String, CategoryScoreModel>> strong,
  ) {
    final recent = scores.toList()
      ..sort((a, b) => b.completedAt.compareTo(a.completedAt));
    final list = recent.take(8).toList();
    if (list.isEmpty) {
      return Container(
        padding: ChildProfileDesign.cardPadding,
        decoration: BoxDecoration(
          color: ChildProfileDesign.profileCardBg,
          borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadius),
          border: Border.all(color: AppColors.border),
        ),
        child: Text(
          'لم يكتمل أي اختبار بعد. ابدأ من فئات الاختبارات التقييمية.',
          style: ChildProfileDesign.bodyFriendly(context),
          textAlign: TextAlign.center,
        ),
      );
    }
    return Column(
      children: list.map((s) {
        final title = _categoryTitle(s.categoryId);
        final isStrong = s.score >= 4;
        return Padding(
          padding: EdgeInsets.only(bottom: 10.h),
          child: Container(
            padding: ChildProfileDesign.cardPaddingSmall,
            decoration: BoxDecoration(
              color: ChildProfileDesign.profileCardBg,
              borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadiusSmall),
              border: Border.all(
                color: isStrong
                    ? ChildProfileDesign.statusActive.withOpacity(0.5)
                    : AppColors.border,
              ),
              boxShadow: ChildProfileDesign.cardShadowSoft(context),
            ),
            child: Row(
              textDirection: TextDirection.rtl,
              children: [
                Icon(
                  isStrong ? Icons.star_rounded : Icons.radio_button_checked_rounded,
                  size: 22.sp,
                  color: isStrong
                      ? ChildProfileDesign.statusActive
                      : ChildProfileDesign.statusImproving,
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Text(
                    title,
                    style: ChildProfileDesign.bodyFriendly(context),
                    textAlign: TextAlign.right,
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                  decoration: BoxDecoration(
                    color: ChildProfileDesign.statusActive.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10.r),
                  ),
                  child: Text(
                    '${s.score}/5',
                    style: ChildProfileDesign.titleMedium(context).copyWith(
                      fontSize: 14.sp,
                      color: ChildProfileDesign.statusActive,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}
