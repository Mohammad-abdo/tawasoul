import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/category_score_model.dart';

/// Local storage for assessment results (normalized).
/// Key: assessment_scores_{childId} -> JSON list of CategoryScoreModel.
class AssessmentResultsRepository {
  static const String _prefix = 'assessment_scores_';

  static Future<List<CategoryScoreModel>> getScores(String childId) async {
    final prefs = await SharedPreferences.getInstance();
    final key = '$_prefix$childId';
    final json = prefs.getString(key);
    if (json == null) return [];
    try {
      final list = jsonDecode(json) as List<dynamic>;
      return list
          .map((e) => CategoryScoreModel.fromMap(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  static Future<void> addScore(CategoryScoreModel score) async {
    final prefs = await SharedPreferences.getInstance();
    final key = '${_prefix}${score.childId}';
    final list = await getScores(score.childId);
    list.add(score);
    await prefs.setString(key, jsonEncode(list.map((e) => e.toMap()).toList()));
  }

  static Future<void> clearScores(String childId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('$_prefix$childId');
  }

  /// Latest score per category for progress display
  static Future<Map<String, CategoryScoreModel>> getLatestByCategory(
      String childId) async {
    final list = await getScores(childId);
    final byCategory = <String, CategoryScoreModel>{};
    for (final s in list) {
      final existing = byCategory[s.categoryId];
      if (existing == null || s.completedAt.isAfter(existing.completedAt)) {
        byCategory[s.categoryId] = s;
      }
    }
    return byCategory;
  }

  /// Category progress: completed tests count per category (simplified: 1 if has score)
  static Future<double> getCategoryProgress(
      String childId, String categoryId) async {
    final byCategory = await getLatestByCategory(childId);
    return byCategory.containsKey(categoryId) ? 1.0 : 0.0;
  }
}
