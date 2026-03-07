import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../children/theme/child_profile_design.dart';
import '../constants/assessment_categories_theme.dart';
import '../data/mock_assessments.dart';
import '../mahara_kids/constants/mahara_colors.dart';
import '../mahara_kids/widgets/mahara_background.dart';

/// Final Evaluation – Child-friendly visuals + parent summary.
/// Stars, emojis, progress bar, strength/improvement points,
/// recommendation for parents, clear next steps.
/// Supports score 0-5 (score0to5) and categoryId.
/// Professional design with entrance animations.
class AssessmentResultsScreen extends StatefulWidget {
  final String childId;
  final int? totalSteps;
  final int? correctSteps;
  final int? totalScore;
  final int? score0to5;
  final String? categoryId;

  const AssessmentResultsScreen({
    super.key,
    required this.childId,
    this.totalSteps,
    this.correctSteps,
    this.totalScore,
    this.score0to5,
    this.categoryId,
  });

  @override
  State<AssessmentResultsScreen> createState() => _AssessmentResultsScreenState();
}

class _AssessmentResultsScreenState extends State<AssessmentResultsScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _headerAnim;
  late Animation<double> _cardsAnim;

  double get _percentage {
    if (widget.score0to5 != null) return (widget.score0to5! / 5.0).clamp(0.0, 1.0);
    if (widget.totalSteps == null || widget.correctSteps == null || widget.totalSteps! == 0) return 0.75;
    return widget.correctSteps! / widget.totalSteps!;
  }

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    _headerAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.5, curve: Curves.easeOut)),
    );
    _cardsAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.3, 1.0, curve: Curves.easeOut)),
    );
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  String _getLevel() {
    final p = _percentage * 100;
    if (p >= 90) return 'excellent';
    if (p >= 70) return 'good';
    if (p >= 50) return 'practice';
    return 'encourage';
  }

  String _categoryTitle(String id) {
    try {
      final c = MockAssessmentsData.categories.firstWhere(
        (e) => e['id'] == id,
        orElse: () => <String, dynamic>{'title': ''},
      );
      return c['title'] as String? ?? '';
    } catch (_) {
      return '';
    }
  }

  Map<String, dynamic> _getVisualFeedback() {
    switch (_getLevel()) {
      case 'excellent':
        return {
          'emoji': '🎉',
          'stars': 5,
          'title': 'رائع جداً!',
          'message': 'لقد أتممت الاختبار بنجاح كبير!',
          'color': MaharaColors.success,
        };
      case 'good':
        return {
          'emoji': '⭐',
          'stars': 4,
          'title': 'ممتاز!',
          'message': 'أداء رائع! استمر في المحاولة',
          'color': MaharaColors.primary,
        };
      case 'practice':
        return {
          'emoji': '💪',
          'stars': 3,
          'title': 'جيد!',
          'message': 'أنت على الطريق الصحيح!',
          'color': MaharaColors.primaryLight,
        };
      default:
        return {
          'emoji': '🌟',
          'stars': 2,
          'title': 'استمر!',
          'message': 'كل محاولة تقربك من النجاح',
          'color': MaharaColors.primary,
        };
    }
  }

  List<String> _strengths() {
    switch (_getLevel()) {
      case 'excellent':
        return ['التمييز السمعي ممتاز', 'التعاون خلال الاختبار'];
      case 'good':
        return ['التركيز جيد', 'الاستجابة للتوجيهات'];
      case 'practice':
        return ['التحسن واضح', 'الاستمرارية في المحاولة'];
      default:
        return ['الرغبة في المشاركة', 'تحسن تدريجي'];
    }
  }

  List<String> _improvements() {
    switch (_getLevel()) {
      case 'excellent':
        return ['مواصلة التدريب الخفيف للثبات'];
      case 'good':
        return ['تكرار تمارين التسلسل', 'تدريب النطق اليومي'];
      case 'practice':
        return ['تمارين الربط صورة–صوت', 'زيادة وقت التمارين'];
      default:
        return ['تمارين التمييز السمعي', 'جلسات قصيرة متكررة'];
    }
  }

  String _parentRecommendation() {
    switch (_getLevel()) {
      case 'excellent':
        return 'الأداء ممتاز. يُنصح بالمتابعة الدورية مرة أسبوعياً للحفاظ على المستوى.';
      case 'good':
        return 'الطفل يتحسن بشكل جيد. ننصح بجلسة أسبوعية مع الاختصاصي وتمارين منزلية بسيطة.';
      case 'practice':
        return 'هناك تقدم ملحوظ. نوصي بزيادة تكرار التمارين في المنزل وحجز جلسة متابعة قريبة.';
      default:
        return 'ننصح بحجز جلسة تقييم مع الاختصاصي لضبط خطة مناسبة، مع تشجيع الطفل دون ضغط.';
    }
  }

  List<String> _nextSteps() {
    return [
      'مراجعة التقرير من قسم "ملف الطفل"',
      'حجز جلسة متابعة مع الاختصاصي إن لزم',
      'تنفيذ التمارين المقترحة في المنزل',
    ];
  }

  @override
  Widget build(BuildContext context) {
    final feedback = _getVisualFeedback();

    return MaharaBackground(
      child: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, _) {
              return Column(
                children: [
                  Opacity(
                    opacity: _headerAnim.value,
                    child: Transform.translate(
                      offset: Offset(0, 20 * (1 - _headerAnim.value)),
                      child: Column(
                        children: [
                          SizedBox(height: 12.h),
                          Text(
                            feedback['emoji'] as String,
                            style: TextStyle(fontSize: 64.sp),
                          ),
                          SizedBox(height: 12.h),
                          Text(
                            feedback['title'] as String,
                            style: TextStyle(
                              fontFamily: 'MadaniArabic',
                              fontSize: 24.sp,
                              fontWeight: FontWeight.w700,
                              color: MaharaColors.textPrimary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          if (widget.categoryId != null && widget.categoryId!.isNotEmpty) ...[
                            SizedBox(height: 4.h),
                            Text(
                              _categoryTitle(widget.categoryId!),
                              style: ChildProfileDesign.captionFriendly(context).copyWith(
                                color: MaharaColors.textSecondary,
                                fontSize: 14.sp,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                          SizedBox(height: 6.h),
                          Padding(
                            padding: EdgeInsets.symmetric(horizontal: 8.w),
                            child: Text(
                              feedback['message'] as String,
                              style: ChildProfileDesign.bodyFriendly(context).copyWith(
                                color: MaharaColors.textSecondary,
                                fontSize: 15.sp,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          SizedBox(height: 20.h),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(5, (i) {
                              final filled = i < (feedback['stars'] as int);
                              return Padding(
                                padding: EdgeInsets.symmetric(horizontal: 4.w),
                                child: Icon(
                                  filled ? Icons.star_rounded : Icons.star_border_rounded,
                                  size: 36.sp,
                                  color: filled ? AssessmentCategoriesTheme.success : AssessmentCategoriesTheme.lockedMuted,
                                ),
                              );
                            }),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(height: 24.h),
                  Opacity(
                    opacity: _cardsAnim.value,
                    child: Transform.translate(
                      offset: Offset(0, 24 * (1 - _cardsAnim.value)),
                      child: Column(
                        children: [
                          _SectionCard(
                            icon: Icons.bar_chart_rounded,
                            title: 'لمحة النتيجة',
                            iconColor: const Color(0xFFE11D48).withOpacity(0.9),
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8.r),
                                child: LinearProgressIndicator(
                                  value: _percentage,
                                  minHeight: 10.h,
                                  backgroundColor: AppColors.gray200,
                                  valueColor: AlwaysStoppedAnimation<Color>(AssessmentCategoriesTheme.success),
                                ),
                              ),
                              SizedBox(height: 6.h),
                              Text(
                                'التقدم العام في هذا الاختبار',
                                style: ChildProfileDesign.captionFriendly(context).copyWith(
                                  color: AssessmentCategoriesTheme.textSecondary,
                                  fontSize: 13.sp,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                          SizedBox(height: 12.h),
                                      _SectionCard(
                            icon: Icons.thumb_up_rounded,
                            title: 'نقاط القوة',
                            iconColor: AssessmentCategoriesTheme.newTest,
                            children: _strengths()
                                .map((s) => Padding(
                                      padding: EdgeInsets.only(bottom: 6.h),
                                      child: Row(
                                        textDirection: TextDirection.rtl,
                                        children: [
                                          Icon(Icons.check_circle_rounded, size: 20.sp, color: AssessmentCategoriesTheme.success),
                                          SizedBox(width: 8.w),
                                          Expanded(
                                            child: Text(s, style: ChildProfileDesign.bodyFriendly(context).copyWith(fontSize: 14.sp), textAlign: TextAlign.right),
                                          ),
                                        ],
                                      ),
                                    ))
                                .toList(),
                          ),
                          SizedBox(height: 12.h),
                                      _SectionCard(
                            icon: Icons.trending_up_rounded,
                            title: 'نقاط تحتاج تحسين',
                            iconColor: AssessmentCategoriesTheme.newTest,
                            children: _improvements()
                                .map((s) => Padding(
                                      padding: EdgeInsets.only(bottom: 6.h),
                                      child: Row(
                                        textDirection: TextDirection.rtl,
                                        children: [
                                          Icon(Icons.lightbulb_outline_rounded, size: 20.sp, color: ChildProfileDesign.statusNeedsAttention),
                                          SizedBox(width: 8.w),
                                          Expanded(
                                            child: Text(s, style: ChildProfileDesign.bodyFriendly(context).copyWith(fontSize: 14.sp), textAlign: TextAlign.right),
                                          ),
                                        ],
                                      ),
                                    ))
                                .toList(),
                          ),
                          SizedBox(height: 12.h),
                                      _SectionCard(
                            icon: Icons.family_restroom_rounded,
                            title: 'توصية للأهل',
                            iconColor: AssessmentCategoriesTheme.newTest,
                            children: [
                              Text(
                                _parentRecommendation(),
                                style: ChildProfileDesign.bodyFriendly(context).copyWith(fontSize: 14.sp, height: 1.5),
                                textAlign: TextAlign.right,
                              ),
                            ],
                          ),
                          SizedBox(height: 12.h),
                                      _SectionCard(
                            icon: Icons.list_alt_rounded,
                            title: 'الخطوات التالية',
                            iconColor: AssessmentCategoriesTheme.newTest,
                            children: _nextSteps()
                                .asMap()
                                .entries
                                .map((e) => Padding(
                                      padding: EdgeInsets.only(bottom: 6.h),
                                      child: Row(
                                        textDirection: TextDirection.rtl,
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Container(
                                            width: 22.w,
                                            height: 22.w,
                                            decoration: BoxDecoration(
                                              color: AssessmentCategoriesTheme.successSoft,
                                              shape: BoxShape.circle,
                                            ),
                                            alignment: Alignment.center,
                                            child: Text(
                                              '${e.key + 1}',
                                              style: TextStyle(
                                                fontFamily: 'MadaniArabic',
                                                fontSize: 11.sp,
                                                fontWeight: FontWeight.w600,
                                                color: AssessmentCategoriesTheme.success,
                                              ),
                                            ),
                                          ),
                                          SizedBox(width: 10.w),
                                          Expanded(
                                            child: Padding(
                                              padding: EdgeInsets.only(top: 2.h),
                                              child: Text(
                                                e.value,
                                                style: ChildProfileDesign.bodyFriendly(context).copyWith(fontSize: 14.sp),
                                                textAlign: TextAlign.right,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ))
                                .toList(),
                          ),
                          SizedBox(height: 24.h),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () => context.go('/home'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AssessmentCategoriesTheme.success,
                                padding: EdgeInsets.symmetric(vertical: 14.h),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(ChildProfileDesign.buttonRadius)),
                                elevation: 0,
                              ),
                              child: Text(
                                'العودة للرئيسية',
                                style: TextStyle(
                                  fontFamily: 'MadaniArabic',
                                  fontSize: 16.sp,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                          SizedBox(height: 10.h),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton(
                              onPressed: () => context.go('/assessments/categories?childId=${widget.childId}'),
                              style: OutlinedButton.styleFrom(
                                side: BorderSide(color: AssessmentCategoriesTheme.success, width: 2),
                                padding: EdgeInsets.symmetric(vertical: 14.h),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(ChildProfileDesign.buttonRadius)),
                              ),
                              child: Text(
                                'جرب اختبار آخر',
                                style: TextStyle(
                                  fontFamily: 'MadaniArabic',
                                  fontSize: 16.sp,
                                  fontWeight: FontWeight.w600,
                                  color: AssessmentCategoriesTheme.success,
                                ),
                              ),
                            ),
                          ),
                          SizedBox(height: 20.h),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            
          },
        ),
      ),)
    );
  }
}

class _SectionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final List<Widget> children;
  final Color? iconColor;

  const _SectionCard({
    required this.icon,
    required this.title,
    required this.children,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    final accent = iconColor ?? AssessmentCategoriesTheme.newTest;
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
      decoration: BoxDecoration(
        color: AssessmentCategoriesTheme.cardBg,
        borderRadius: BorderRadius.circular(AssessmentCategoriesTheme.cardRadius),
        border: Border.all(color: AssessmentCategoriesTheme.cardBorder),
        boxShadow: AssessmentCategoriesTheme.cardShadow(false),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            textDirection: TextDirection.rtl,
            children: [
              Icon(icon, size: 22.sp, color: accent),
              SizedBox(width: 8.w),
              Flexible(
                child: Text(
                  title,
                  style: ChildProfileDesign.titleMedium(context).copyWith(fontSize: 17.sp),
                  textAlign: TextAlign.right,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          SizedBox(height: 12.h),
          ...children,
        ],
      ),
    );
  }
}
