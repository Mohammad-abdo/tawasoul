import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/assessment_provider.dart';
import '../../../core/widgets/toast_helper.dart';
import '../data/mock_assessments.dart';
import '../mahara_kids/models/activity_model.dart';
import '../mahara_kids/mahara_activity_router.dart';
import 'stage_transition_screen.dart';

class AssessmentTestScreen extends StatefulWidget {
  final String testId;
  final String childId;

  const AssessmentTestScreen({
    super.key,
    required this.testId,
    required this.childId,
  });

  @override
  State<AssessmentTestScreen> createState() => _AssessmentTestScreenState();
}

class _AssessmentTestScreenState extends State<AssessmentTestScreen> {
  int _currentStageIndex = 0;
  int _currentActivityInStage = 0;
  final Map<String, int> _scores = {};
  String? _categoryId;
  bool _showStageTransition = false;
  bool _lastStagePassed = false;

  List<List<Map<String, dynamic>>> get _stages {
    return MockAssessmentsData.getStagesForTest(widget.testId);
  }

  List<Map<String, dynamic>> get _activitiesInCurrentStage {
    if (_stages.isEmpty || _currentStageIndex >= _stages.length) return [];
    return _stages[_currentStageIndex];
  }

  List<Map<String, dynamic>> get _allActivities {
    return MockAssessmentsData.activitiesByTestId[widget.testId] ?? [];
  }

  @override
  void initState() {
    super.initState();
    final list = MockAssessmentsData.tests.where((t) => t['id'] == widget.testId).toList();
    _categoryId = list.isNotEmpty ? list.first['categoryId'] as String? : null;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AssessmentProvider>().startSession(widget.childId, _categoryId, widget.testId);
    });
  }

  MaharaActivity _buildActivity(Map<String, dynamic> activityData) {
    final type = activityData['type'] as String;
    final activityId = activityData['id'] as String;

    switch (type) {
      case 'listen_watch':
        return MaharaActivity(
          id: activityId,
          type: 'listen_watch',
          audioUrl: activityData['audioUrl'] as String?,
          mainImageUrl: activityData['imageUrl'] as String?,
          onComplete: (_) => _handleNext(),
        );
      case 'listen_choose':
        final options = (activityData['options'] as List?)?.map((opt) {
          return ActivityOption(
            id: opt['id'] as String,
            imageUrl: opt['imageUrl'] as String,
            isCorrect: opt['isCorrect'] as bool,
          );
        }).toList();
        return MaharaActivity(
          id: activityId,
          type: 'listen_choose',
          audioUrl: activityData['audioUrl'] as String?,
          options: options,
          correctAnswerId: options?.firstWhere((o) => o.isCorrect).id,
          onComplete: (isCorrect) => _handleActivityResult(activityId, isCorrect),
        );
      case 'matching':
        final items = (activityData['items'] as List?)?.map((item) {
          return ActivityItem(
            id: item['id'] as String,
            imageUrl: item['imageUrl'] as String,
            audioUrl: item['audioUrl'] as String?,
          );
        }).toList();
        return MaharaActivity(
          id: activityId,
          type: 'matching',
          matchingItems: items,
          onComplete: (isCorrect) => _handleActivityResult(activityId, isCorrect == true),
        );
      case 'sequence':
        final items = (activityData['items'] as List?)?.map((item) {
          return ActivityItem(
            id: item['id'] as String,
            imageUrl: item['imageUrl'] as String,
          );
        }).toList();
        return MaharaActivity(
          id: activityId,
          type: 'sequence',
          sequenceItems: items,
          correctSequence: (activityData['correctSequence'] as List?)?.cast<String>(),
          onComplete: (isCorrect) => _handleActivityResult(activityId, isCorrect == true),
        );
      case 'audio_association':
        return MaharaActivity(
          id: activityId,
          type: 'audio_association',
          audioUrl: activityData['audioUrl'] as String?,
          mainImageUrl: activityData['imageUrl'] as String?,
          onComplete: (_) => _handleNext(),
        );
      default:
        return MaharaActivity(
          id: activityId,
          type: 'listen_watch',
          onComplete: (_) => _handleNext(),
        );
    }
  }

  void _handleNext() {
    final activities = _activitiesInCurrentStage;
    if (activities.isEmpty) {
      _finishTest();
      return;
    }
    final currentActivityId = activities[_currentActivityInStage]['id'] as String;
    if (!_scores.containsKey(currentActivityId)) {
      _scores[currentActivityId] = 5;
    }

    if (_currentActivityInStage < activities.length - 1) {
      setState(() {
        _currentActivityInStage++;
      });
    } else {
      _onStageComplete();
    }
  }

  void _onStageComplete() {
    final stageActivities = _activitiesInCurrentStage;
    final stageIds = stageActivities.map((a) => a['id'] as String).toList();
    var correct = 0;
    for (final id in stageIds) {
      final s = _scores[id] ?? 0;
      if (s >= 5) correct++;
    }
    final passed = stageActivities.isEmpty ||
        (correct / stageActivities.length) >= MockAssessmentsData.stagePassThreshold;

    setState(() {
      _showStageTransition = true;
      _lastStagePassed = passed;
    });
  }

  void _onTransitionContinue() {
    if (_currentStageIndex < _stages.length - 1) {
      setState(() {
        _showStageTransition = false;
        _currentStageIndex++;
        _currentActivityInStage = 0;
      });
    } else {
      _finishTest();
    }
  }

  void _handleActivityResult(String activityId, bool isCorrect) {
    context.read<AssessmentProvider>().incrementAttempts();
    final score = isCorrect ? 10 : 0;
    _scores[activityId] = score;

    if (mounted) {
      ToastHelper.show(context, message: isCorrect ? 'أحسنت! 🎉' : 'حاول مرة أخرى 💪', success: isCorrect);
    }
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (mounted) {
        _handleNext();
      }
    });
  }

  Future<void> _finishTest() async {
    final totalSteps = _allActivities.length;
    final correctSteps = _scores.values.where((score) => score >= 5).length;
    final totalScore = _scores.values.fold<int>(0, (sum, score) => sum + score);
    final categoryId = _categoryId ?? '';

    final provider = context.read<AssessmentProvider>();
    provider.setScoresFromTest(_scores);
    if (categoryId.isNotEmpty) {
      await provider.saveCategoryScoreAndReset(widget.childId, categoryId);
      provider.loadCategoryProgress(widget.childId);
    }

    if (!mounted) return;
    ToastHelper.success(context, 'تم حفظ النتيجة! 🌟');

    final score0to5 = totalSteps > 0
        ? ((correctSteps / totalSteps * 0.6 + (totalScore / (totalSteps * 10)).clamp(0.0, 1.0) * 0.4) * 5).round().clamp(0, 5)
        : 0;
    context.push(
      '/assessments/results/${widget.childId}?totalSteps=$totalSteps&correctSteps=$correctSteps&totalScore=$totalScore&score0to5=$score0to5&categoryId=$categoryId',
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_showStageTransition) {
      return StageTransitionScreen(
        stageIndex: _currentStageIndex,
        totalStages: _stages.length,
        passed: _lastStagePassed,
        onContinue: _onTransitionContinue,
      );
    }

    if (_activitiesInCurrentStage.isEmpty && _allActivities.isEmpty) {
      return Scaffold(
        body: Center(
          child: Text(
            'لا توجد أنشطة في هذا الاختبار',
            style: TextStyle(
              fontFamily: 'MadaniArabic',
              fontSize: 16.sp,
            ),
          ),
        ),
      );
    }

    final activities = _activitiesInCurrentStage;
    if (activities.isEmpty) {
      return const SizedBox.shrink();
    }
    final currentActivityData = activities[_currentActivityInStage];
    final activity = _buildActivity(currentActivityData);

    return _ActivityScreenWrapper(
      activity: activity,
      activityIndex: _currentActivityInStage + 1,
      totalActivities: activities.length,
      stageIndex: _currentStageIndex + 1,
      totalStages: _stages.length,
      onNext: _handleNext,
      onResult: _handleActivityResult,
    );
  }
}

class _ActivityScreenWrapper extends StatelessWidget {
  final MaharaActivity activity;
  final int activityIndex;
  final int totalActivities;
  final int stageIndex;
  final int totalStages;
  final VoidCallback onNext;
  final Function(String, bool) onResult;

  const _ActivityScreenWrapper({
    required this.activity,
    required this.activityIndex,
    required this.totalActivities,
    required this.stageIndex,
    required this.totalStages,
    required this.onNext,
    required this.onResult,
  });

  @override
  Widget build(BuildContext context) {
    // Full-screen test flow - NO back button, NO navigation bar
    return PopScope(
      canPop: false, // Prevent back navigation during test
      child: Scaffold(
        body: Builder(
          builder: (context) {
            Widget screen = MaharaActivityRouter.buildScreen(activity);

            // For non-interactive activities, add next button
            if (activity.type == 'listen_watch' || activity.type == 'audio_association') {
              screen = Stack(
                children: [
                  screen,
                  Positioned(
                    bottom: 40.h,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: TweenAnimationBuilder<double>(
                        tween: Tween(begin: 0.0, end: 1.0),
                        duration: const Duration(seconds: 3),
                        builder: (context, value, child) {
                          if (value < 1.0) return const SizedBox.shrink();
                          return ElevatedButton(
                            onPressed: onNext,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF6C9BD2),
                              padding: EdgeInsets.symmetric(horizontal: 40.w, vertical: 16.h),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(30.r),
                              ),
                            ),
                            child: Text(
                              activityIndex < totalActivities
                                  ? 'التالي'
                                  : (totalStages > 1 ? 'إنهاء المرحلة' : 'إنهاء'),
                              style: TextStyle(
                                fontFamily: 'MadaniArabic',
                                fontSize: 18.sp,
                                color: Colors.white,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ],
              );
            }
            // Interactive activities (listen_choose, matching, sequence) handle completion via callback

            return screen;
          },
        ),
      ),
    );
  }
}
