import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../models/activity.dart';
import '../providers/mahara_provider.dart';
import 'activity_audio_player.dart';
import '../../../core/services/auth_service.dart';

class AudioAssociationWidget extends StatelessWidget {
  final Activity activity;
  final String childId;

  const AudioAssociationWidget({
    super.key,
    required this.activity,
    required this.childId,
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
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(20.r),
                  child: Image.network(
                    imageUrl,
                    width: 300.w,
                    height: 300.w,
                    fit: BoxFit.cover,
                  ),
                ),
                SizedBox(height: 40.h),
                ActivityAudioPlayer(
                  url: audioUrl,
                  autoPlay: true,
                  onCompleted: () async {
                    final provider = context.read<MaharaProvider>();
                    final authService = context.read<AuthService>();
                    final token = authService.getToken() ?? '';
                    
                    await provider.submitInteraction(
                      childId: childId,

                      token: token,
                      event: 'AUDIO_FINISHED',
                    );
                  },
                ),
              ],
            ),
          ),
        ),
        Padding(
          padding: EdgeInsets.all(20.h),
          child: const Text(
            'استمع للجملة',
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
