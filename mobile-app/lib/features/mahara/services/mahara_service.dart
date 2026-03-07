import '../models/activity.dart';
import '../../shared/mock_content.dart';

/// Mahara Service - Using Static Data
/// This service now uses mock data instead of backend API calls
class MaharaService {
  // Get current activity for a child
  Future<Activity?> getCurrentActivity(String childId, String token) async {
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 500));

      // Get mock activities
      final activities = MockContent.maharaActivities;
      
      if (activities.isEmpty) {
        return null;
      }

      // Return the first activity as the current one
      final activityData = activities.first;
      return Activity.fromJson(activityData);
    } catch (e) {
      rethrow;
    }
  }

  // Get all activities for a child
  Future<List<Activity>> getAllActivities(String childId, String token) async {
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 500));

      final activities = MockContent.maharaActivities;
      return activities.map((data) => Activity.fromJson(data)).toList();
    } catch (e) {
      rethrow;
    }
  }

  // Submit activity interaction
  Future<Map<String, dynamic>> submitInteraction({
    required String childId,
    required String activityId,
    required String token,
    String? event,
    String? selectedImageId,
    List<Map<String, String>>? matches,
    List<String>? sequence,
  }) async {
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 300));

      // Return mock success response
      return {
        'success': true,
        'data': {
          'isCorrect': true,
          'score': 10,
          'message': 'أحسنت! إجابة صحيحة',
          'nextActivityId': 'activity_2',
        },
      };
    } catch (e) {
      rethrow;
    }
  }

  // Get activity by ID
  Future<Activity?> getActivityById(String activityId, String token) async {
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 300));

      final activities = MockContent.maharaActivities;
      final activityData = activities.firstWhere(
        (a) => a['id'] == activityId,
        orElse: () => {},
      );

      if (activityData.isEmpty) {
        return null;
      }

      return Activity.fromJson(activityData);
    } catch (e) {
      rethrow;
    }
  }
}
