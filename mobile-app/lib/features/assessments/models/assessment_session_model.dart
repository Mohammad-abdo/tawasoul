/// Single assessment session: one test run for a category.
/// Tracks start time, duration, and aggregates for CategoryScoreModel.
class AssessmentSessionModel {
  final String sessionId;
  final String childId;
  final String categoryId;
  final String? testId;
  final DateTime startedAt;
  final DateTime? completedAt;
  final int totalSteps;
  final int correctSteps;
  final int attempts;
  final int totalScore; // raw sum; normalized 0-5 is computed

  const AssessmentSessionModel({
    required this.sessionId,
    required this.childId,
    required this.categoryId,
    this.testId,
    required this.startedAt,
    this.completedAt,
    this.totalSteps = 0,
    this.correctSteps = 0,
    this.attempts = 0,
    this.totalScore = 0,
  });

  int get timeSeconds {
    final end = completedAt ?? DateTime.now();
    return end.difference(startedAt).inSeconds;
  }

  /// Normalize to 0-5 scale: from correct/total and totalScore
  int get normalizedScore {
    if (totalSteps <= 0) return 0;
    final ratio = correctSteps / totalSteps;
    final rawMax = totalSteps * 10; // assume max 10 per step
    final scoreRatio = rawMax > 0 ? (totalScore / rawMax).clamp(0.0, 1.0) : ratio;
    final combined = (ratio * 0.6 + scoreRatio * 0.4).clamp(0.0, 1.0);
    return (combined * 5).round().clamp(0, 5);
  }

  double get accuracy =>
      totalSteps > 0 ? (correctSteps / totalSteps).toDouble() : 0.0;

  AssessmentSessionModel copyWith({
    String? sessionId,
    String? childId,
    String? categoryId,
    String? testId,
    DateTime? startedAt,
    DateTime? completedAt,
    int? totalSteps,
    int? correctSteps,
    int? attempts,
    int? totalScore,
  }) {
    return AssessmentSessionModel(
      sessionId: sessionId ?? this.sessionId,
      childId: childId ?? this.childId,
      categoryId: categoryId ?? this.categoryId,
      testId: testId ?? this.testId,
      startedAt: startedAt ?? this.startedAt,
      completedAt: completedAt ?? this.completedAt,
      totalSteps: totalSteps ?? this.totalSteps,
      correctSteps: correctSteps ?? this.correctSteps,
      attempts: attempts ?? this.attempts,
      totalScore: totalScore ?? this.totalScore,
    );
  }
}
