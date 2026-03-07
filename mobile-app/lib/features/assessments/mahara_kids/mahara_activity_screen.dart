import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'models/activity_model.dart';
import 'mahara_activity_router.dart';

class MaharaActivityScreen extends StatelessWidget {
  final String activityId;
  final String activityType;
  final Map<String, dynamic>? activityData;

  const MaharaActivityScreen({
    super.key,
    required this.activityId,
    required this.activityType,
    this.activityData,
  });

  MaharaActivity _buildActivity() {
    // Convert activity data to MaharaActivity model
    switch (activityType) {
      case 'listen_watch':
        return MaharaActivity(
          id: activityId,
          type: 'listen_watch',
          audioUrl: activityData?['audioUrl'] ?? activityData?['audioAssetPath'],
          mainImageUrl: activityData?['imageUrl'] ?? activityData?['imageAssetPath'],
        );
      case 'listen_choose':
        final options = (activityData?['options'] as List?)?.map((opt) {
          return ActivityOption(
            id: opt['id'] ?? '',
            imageUrl: opt['imageUrl'] ?? '',
            isCorrect: opt['isCorrect'] ?? false,
          );
        }).toList();
        return MaharaActivity(
          id: activityId,
          type: 'listen_choose',
          audioUrl: activityData?['audioUrl'] ?? activityData?['audioAssetPath'],
          options: options,
          correctAnswerId: activityData?['correctAnswerId'],
        );
      case 'matching':
        final items = (activityData?['items'] as List?)?.map((item) {
          return ActivityItem(
            id: item['id'] ?? '',
            imageUrl: item['imageUrl'] ?? '',
            audioUrl: item['audioUrl'],
          );
        }).toList();
        return MaharaActivity(
          id: activityId,
          type: 'matching',
          matchingItems: items,
        );
      case 'sequence':
        final items = (activityData?['items'] as List?)?.map((item) {
          return ActivityItem(
            id: item['id'] ?? '',
            imageUrl: item['imageUrl'] ?? '',
          );
        }).toList();
        return MaharaActivity(
          id: activityId,
          type: 'sequence',
          sequenceItems: items,
          correctSequence: (activityData?['correctSequence'] as List?)?.cast<String>(),
        );
      case 'audio_association':
        return MaharaActivity(
          id: activityId,
          type: 'audio_association',
          audioUrl: activityData?['audioUrl'] ?? activityData?['audioAssetPath'],
          mainImageUrl: activityData?['imageUrl'] ?? activityData?['imageAssetPath'],
        );
      default:
        return MaharaActivity(
          id: activityId,
          type: 'listen_watch',
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final activity = _buildActivity();
    return PopScope(
      canPop: false, // Prevent back navigation - activities are fullscreen
      child: MaharaActivityRouter.buildScreen(activity),
    );
  }
}
