import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants/assessment_categories_theme.dart';
import '../mahara_kids/widgets/mahara_background.dart';

/// Full-screen transition between assessment stages.
/// Shows passed/failed message, stage number, and Continue button.
class StageTransitionScreen extends StatefulWidget {
  final int stageIndex;
  final int totalStages;
  final bool passed;
  final VoidCallback onContinue;

  const StageTransitionScreen({
    super.key,
    required this.stageIndex,
    required this.totalStages,
    required this.passed,
    required this.onContinue,
  });

  @override
  State<StageTransitionScreen> createState() => _StageTransitionScreenState();
}

class _StageTransitionScreenState extends State<StageTransitionScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnim;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _scaleAnim = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );
    _fadeAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLastStage = widget.stageIndex >= widget.totalStages - 1;
    final nextStageNum = widget.stageIndex + 2;

    return MaharaBackground(
      child: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 32.h),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedBuilder(
                animation: _controller,
                builder: (context, child) {
                  return Opacity(
                    opacity: _fadeAnim.value,
                    child: Transform.scale(
                      scale: _scaleAnim.value,
                      child: child,
                    ),
                  );
                },
                child: Column(
                  children: [
                    Text(
                      widget.passed ? '🎉' : '💪',
                      style: TextStyle(fontSize: 80.sp),
                    ),
                    SizedBox(height: 24.h),
                    Text(
                      widget.passed ? 'أحسنت!' : 'استمر!',
                      style: TextStyle(
                        fontFamily: 'MadaniArabic',
                        fontSize: 28.sp,
                        fontWeight: FontWeight.w700,
                        color: AssessmentCategoriesTheme.textPrimary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 12.h),
                    Text(
                      widget.passed
                          ? (isLastStage
                              ? 'أكملت جميع المراحل بنجاح!'
                              : 'انتقل للمرحلة التالية')
                          : 'كل محاولة تقربك من النجاح',
                      style: TextStyle(
                        fontFamily: 'MadaniArabic',
                        fontSize: 16.sp,
                        color: AssessmentCategoriesTheme.textSecondary,
                        height: 1.4,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    if (!isLastStage) ...[
                      SizedBox(height: 28.h),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
                        decoration: BoxDecoration(
                          color: AssessmentCategoriesTheme.inProgressSoft,
                          borderRadius: BorderRadius.circular(16.r),
                          border: Border.all(color: AssessmentCategoriesTheme.inProgress.withOpacity(0.4)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.flag_rounded, size: 24.sp, color: AssessmentCategoriesTheme.inProgress),
                            SizedBox(width: 10.w),
                            Text(
                              'المرحلة $nextStageNum',
                              style: TextStyle(
                                fontFamily: 'MadaniArabic',
                                fontSize: 18.sp,
                                fontWeight: FontWeight.w600,
                                color: AssessmentCategoriesTheme.inProgress,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: widget.onContinue,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AssessmentCategoriesTheme.success,
                    padding: EdgeInsets.symmetric(vertical: 16.h),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
                    elevation: 0,
                  ),
                  child: Text(
                    isLastStage ? 'عرض النتيجة' : 'متابعة',
                    style: TextStyle(
                      fontFamily: 'MadaniArabic',
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              SizedBox(height: 24.h),
            ],
          ),
        ),
      ),
    );
  }
}
