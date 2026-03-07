import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../models/activity.dart';
import '../providers/mahara_provider.dart';
import 'activity_audio_player.dart';

class ListenWatchWidget extends StatelessWidget {
  final Activity activity;
  final VoidCallback onComplete;

  const ListenWatchWidget({
    super.key,
    required this.activity,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    if (activity.images.isEmpty || activity.audios.isEmpty) {
      return const Center(child: Text('بيانات النشاط غير مكتملة'));
    }

    final imageUrl = activity.images[0].url;
    final audioUrl = activity.audios[0].url;

    return Column(
      children: [
        Expanded(
          child: Center(
            child: ActivityAudioPlayer(
              url: audioUrl,
              autoPlay: true,
              onCompleted: onComplete,

              child: ClipRRect(
                borderRadius: BorderRadius.circular(20.r),
                child: Image.network(
                  imageUrl,
                  width: 300.w,
                  height: 300.w,
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),
        ),
        Padding(
          padding: EdgeInsets.all(20.h),
          child: const Text(
            'استمع وشاهد',
            style: TextStyle(
              fontFamily: 'MadaniArabic',
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }
}
