import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../providers/mahara_provider.dart';
import '../models/activity.dart';
import '../models/activity_type.dart';
import '../widgets/listen_watch_widget.dart';
import '../widgets/listen_choose_widget.dart';
import '../widgets/matching_widget.dart';
import '../widgets/sequence_widget.dart';
import '../widgets/audio_association_widget.dart';
import '../widgets/encouragement_widget.dart';

import '../../../core/services/auth_service.dart';

class ActivityPlayerScreen extends StatefulWidget {
  final String childId;

  const ActivityPlayerScreen({
    super.key,
    required this.childId,
    String? token, // Keep for backward compatibility if needed but make optional
  });

  @override
  State<ActivityPlayerScreen> createState() => _ActivityPlayerScreenState();
}

class _ActivityPlayerScreenState extends State<ActivityPlayerScreen> {
  String? _token;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final authService = context.read<AuthService>();
      _token = authService.getToken();
      if (_token != null) {
        context.read<MaharaProvider>().fetchCurrentActivity(widget.childId, _token!);
      }
    });
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<MaharaProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('خطأ: ${provider.error}'),
                  ElevatedButton(
                    onPressed: () {
                      if (_token != null) {
                        provider.fetchCurrentActivity(widget.childId, _token!);
                      }
                    },
                    child: const Text('إعادة المحاولة'),
                  ),
                ],
              ),
            );
          }

          if (provider.currentActivity == null) {
            return const Center(child: Text('تهانينا! لقد أتممت جميع الأنشطة.'));
          }

          return Stack(
            children: [
              _buildActivityContent(provider.currentActivity!),
              if (provider.isCompleted)
                EncouragementWidget(
                  onFinished: () {
                    if (_token != null) {
                      provider.loadNextActivity(widget.childId, _token!);
                    }
                  },
                ),
            ],
          );

        },
      ),
    );
  }

  Widget _buildActivityContent(Activity activity) {
    switch (activity.type) {
      case ActivityType.LISTEN_WATCH:
        return ListenWatchWidget(
          activity: activity,
          onComplete: () {
            if (_token != null) {
              context.read<MaharaProvider>().submitInteraction(
                childId: widget.childId,
                token: _token!,
                event: 'WATCH_FINISHED',
              );
            }
          },
        );
      case ActivityType.LISTEN_CHOOSE_IMAGE:
        return ListenChooseWidget(
          activity: activity,
          childId: widget.childId,
        );
      case ActivityType.MATCHING:
        return MatchingWidget(
          activity: activity,
          childId: widget.childId,
        );
      case ActivityType.SEQUENCE_ORDER:
        return SequenceWidget(
          activity: activity,
          childId: widget.childId,
        );
      case ActivityType.AUDIO_ASSOCIATION:
        return AudioAssociationWidget(
          activity: activity,
          childId: widget.childId,
        );
      default:
        return const Center(child: Text('نوع نشاط غير معروف'));
    }
  }

}
