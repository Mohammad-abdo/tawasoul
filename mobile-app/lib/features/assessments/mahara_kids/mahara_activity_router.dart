import 'package:flutter/material.dart';
import 'models/activity_model.dart';
import 'screens/listen_watch_screen.dart';
import 'screens/listen_choose_screen.dart';
import 'screens/matching_screen.dart';
import 'screens/sequence_screen.dart';
import 'screens/audio_association_screen.dart';

class MaharaActivityRouter {
  static Widget buildScreen(MaharaActivity activity) {
    switch (activity.type) {
      case 'listen_watch':
        return ListenWatchScreen(activity: activity);
      case 'listen_choose':
        return ListenChooseScreen(activity: activity);
      case 'matching':
        return MatchingScreen(activity: activity);
      case 'sequence':
        return SequenceScreen(activity: activity);
      case 'audio_association':
        return AudioAssociationScreen(activity: activity);
      default:
        return Scaffold(
          body: Center(
            child: Text('Unknown activity type: ${activity.type}'),
          ),
        );
    }
  }
}
