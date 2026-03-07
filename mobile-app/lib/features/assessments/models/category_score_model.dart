/// Normalized category result: score 0-5, time (seconds), attempts, accuracy (0-1).
/// Stored per child per category per session for DB/reports.
class CategoryScoreModel {
  final String childId;
  final String categoryId;
  final String sessionId;
  final int score; // 0-5
  final int timeSeconds;
  final int attempts;
  final double accuracy; // 0.0 - 1.0
  final DateTime completedAt;

  const CategoryScoreModel({
    required this.childId,
    required this.categoryId,
    required this.sessionId,
    required this.score,
    required this.timeSeconds,
    required this.attempts,
    required this.accuracy,
    required this.completedAt,
  });

  factory CategoryScoreModel.fromMap(Map<String, dynamic> map) {
    return CategoryScoreModel(
      childId: map['childId'] as String,
      categoryId: map['categoryId'] as String,
      sessionId: map['sessionId'] as String,
      score: (map['score'] as num?)?.toInt() ?? 0,
      timeSeconds: (map['timeSeconds'] as num?)?.toInt() ?? 0,
      attempts: (map['attempts'] as num?)?.toInt() ?? 0,
      accuracy: (map['accuracy'] as num?)?.toDouble() ?? 0.0,
      completedAt: map['completedAt'] != null
          ? DateTime.tryParse(map['completedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() => {
        'childId': childId,
        'categoryId': categoryId,
        'sessionId': sessionId,
        'score': score,
        'timeSeconds': timeSeconds,
        'attempts': attempts,
        'accuracy': accuracy,
        'completedAt': completedAt.toIso8601String(),
      };

  /// Score 0-5 to percentage for display (e.g. 4 -> 80%)
  double get scorePercent => (score / 5.0).clamp(0.0, 1.0);
}
