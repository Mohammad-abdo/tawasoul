import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../children/theme/child_profile_design.dart';
import '../data/mock_assessments.dart';

/// Category Tests – List with difficulty, status, score preview.
/// Status: not_started | in_progress | completed.
/// Child-friendly, RTL, touch-friendly.
class CategoryTestsScreen extends StatelessWidget {
  final String categoryId;
  final String childId;

  const CategoryTestsScreen({
    super.key,
    required this.categoryId,
    required this.childId,
  });

  // Mock per-test: difficulty, status, score
  static String _testStatus(String testId) {
    if (testId == 'test_sound_animals') return 'completed';
    if (testId == 'test_sound_daily') return 'in_progress';
    return 'not_started';
  }

  static String _testDifficulty(String testId) {
    final easy = ['test_sound_animals', 'test_pronounce_words'];
    final hard = ['test_sequence_story', 'test_sequence_daily'];
    if (easy.contains(testId)) return 'easy';
    if (hard.contains(testId)) return 'hard';
    return 'medium';
  }

  static int? _testScore(String testId) {
    if (testId == 'test_sound_animals') return 85;
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final category = MockAssessmentsData.categories.firstWhere(
          (c) => c['id'] == categoryId,
          orElse: () => <String, dynamic>{'id': '', 'title': 'الاختبارات'},
        );
    final tests = MockAssessmentsData.tests.where((t) => t['categoryId'] == categoryId).toList();

    return Scaffold(
      backgroundColor: ChildProfileDesign.profileBg,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: category['title'] as String? ?? 'الاختبارات',
              leading: IconButton(
                icon: Icon(Icons.arrow_back_ios_rounded, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: tests.isEmpty
                  ? _buildEmpty(context)
                  : ListView.builder(
                      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
                      itemCount: tests.length,
                      itemBuilder: (context, index) {
                        final test = tests[index];
                        final id = test['id'] as String;
                        final status = _testStatus(id);
                        final difficulty = _testDifficulty(id);
                        final score = _testScore(id);
                        final isLocked = status == 'not_started' && index > 0 && _testStatus(tests[index - 1]['id'] as String) != 'completed';
                        return Padding(
                          padding: EdgeInsets.only(bottom: 12.h),
                          child: _TestCard(
                            test: test,
                            status: status,
                            difficulty: difficulty,
                            score: score,
                            childId: childId,
                            isLocked: isLocked,
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

  Widget _buildEmpty(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(40.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined, size: 80.sp, color: AppColors.textTertiary),
            SizedBox(height: 16.h),
            Text(
              'لا توجد اختبارات في هذه الفئة',
              style: ChildProfileDesign.bodyFriendly(context),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _TestCard extends StatelessWidget {
  final Map<String, dynamic> test;
  final String status;
  final String difficulty;
  final int? score;
  final String childId;
  final bool isLocked;

  const _TestCard({
    required this.test,
    required this.status,
    required this.difficulty,
    required this.score,
    required this.childId,
    required this.isLocked,
  });

  IconData _icon(String? name) {
    switch (name) {
      case 'visibility':
        return Icons.visibility_rounded;
      case 'hearing':
        return Icons.hearing_rounded;
      case 'psychology':
        return Icons.psychology_rounded;
      case 'bolt':
        return Icons.bolt_rounded;
      case 'sports_esports':
        return Icons.sports_esports_rounded;
      case 'lightbulb':
        return Icons.lightbulb_rounded;
      case 'list_alt':
        return Icons.list_alt_rounded;
      case 'swap_horiz':
        return Icons.swap_horiz_rounded;
      case 'self_improvement':
        return Icons.self_improvement_rounded;
      case 'favorite':
        return Icons.favorite_rounded;
      case 'image':
        return Icons.image_rounded;
      case 'pets':
        return Icons.pets_rounded;
      case 'home':
        return Icons.home_rounded;
      case 'record_voice_over':
        return Icons.record_voice_over_rounded;
      case 'text_fields':
        return Icons.text_fields_rounded;
      case 'category':
        return Icons.category_rounded;
      case 'menu_book':
        return Icons.menu_book_rounded;
      case 'schedule':
        return Icons.schedule_rounded;
      default:
        return Icons.quiz_rounded;
    }
  }

  String _difficultyLabel() {
    switch (difficulty) {
      case 'easy':
        return 'سهل';
      case 'hard':
        return 'صعب';
      default:
        return 'متوسط';
    }
  }

  Color _difficultyColor() {
    switch (difficulty) {
      case 'easy':
        return ChildProfileDesign.statusActive;
      case 'hard':
        return ChildProfileDesign.statusNeedsAttention;
      default:
        return ChildProfileDesign.statusImproving;
    }
  }

  String _statusLabel() {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in_progress':
        return 'قيد التقدم';
      default:
        return 'لم يبدأ';
    }
  }

  IconData _statusIcon() {
    switch (status) {
      case 'completed':
        return Icons.check_circle_rounded;
      case 'in_progress':
        return Icons.play_circle_outline_rounded;
      default:
        return Icons.radio_button_unchecked_rounded;
    }
  }

  Color _statusColor() {
    switch (status) {
      case 'completed':
        return ChildProfileDesign.statusActive;
      case 'in_progress':
        return ChildProfileDesign.statusImproving;
      default:
        return AppColors.textTertiary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final canTap = !isLocked;
    final title = test['title'] as String? ?? 'اختبار';
    final description = test['description'] as String? ?? '';

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: canTap ? () => context.push('/assessments/test/${test['id']}?childId=$childId') : null,
        borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadius),
        child: Container(
          padding: ChildProfileDesign.cardPadding,
          decoration: BoxDecoration(
            color: ChildProfileDesign.profileCardBg,
            borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadius),
            border: Border.all(
              color: canTap ? AppColors.border : AppColors.gray300,
            ),
            boxShadow: ChildProfileDesign.cardShadowSoft(context),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                textDirection: TextDirection.rtl,
                children: [
                  Container(
                    width: 56.w,
                    height: 56.w,
                    decoration: BoxDecoration(
                      color: canTap ? ChildProfileDesign.profileAccentLight : AppColors.gray200,
                      borderRadius: BorderRadius.circular(14.r),
                    ),
                    child: Icon(
                      isLocked ? Icons.lock_rounded : _icon(test['icon'] as String?),
                      size: 28.sp,
                      color: canTap ? ChildProfileDesign.profileAccent : AppColors.textTertiary,
                    ),
                  ),
                  SizedBox(width: 14.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          title,
                          style: ChildProfileDesign.titleMedium(context).copyWith(
                            fontSize: 16.sp,
                            color: canTap ? AppColors.textPrimary : AppColors.textTertiary,
                          ),
                          textAlign: TextAlign.right,
                        ),
                        if (description.isNotEmpty) ...[
                          SizedBox(height: 4.h),
                          Text(
                            description,
                            style: ChildProfileDesign.captionFriendly(context),
                            textAlign: TextAlign.right,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
              SizedBox(height: 12.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                textDirection: TextDirection.rtl,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    textDirection: TextDirection.rtl,
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                        decoration: BoxDecoration(
                          color: _difficultyColor().withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8.r),
                        ),
                        child: Text(
                          _difficultyLabel(),
                          style: ChildProfileDesign.captionFriendly(context).copyWith(
                            color: _difficultyColor(),
                            fontWeight: AppTypography.semiBold,
                          ),
                        ),
                      ),
                      SizedBox(width: 8.w),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(_statusIcon(), size: 18.sp, color: _statusColor()),
                          SizedBox(width: 4.w),
                          Text(
                            _statusLabel(),
                            style: ChildProfileDesign.captionFriendly(context).copyWith(
                              color: _statusColor(),
                              fontWeight: AppTypography.medium,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  if (score != null)
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
                      decoration: BoxDecoration(
                        color: ChildProfileDesign.statusActive.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10.r),
                      ),
                      child: Text(
                        '$score%',
                        style: ChildProfileDesign.titleMedium(context).copyWith(
                          fontSize: 15.sp,
                          color: ChildProfileDesign.statusActive,
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
