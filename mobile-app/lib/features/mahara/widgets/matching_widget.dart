import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../models/activity.dart';
import '../providers/mahara_provider.dart';
import 'activity_audio_player.dart';
import '../../../core/services/auth_service.dart';

class MatchingWidget extends StatefulWidget {
  final Activity activity;
  final String childId;

  const MatchingWidget({
    super.key,
    required this.activity,
    required this.childId,
  });

  @override
  State<MatchingWidget> createState() => _MatchingWidgetState();
}


class _MatchingWidgetState extends State<MatchingWidget> {
  String? _selectedAudioId;
  final Set<String> _matchedAudioIds = {};
  final Set<String> _matchedImageIds = {};

  void _onAudioTap(String audioId) {
    if (_matchedAudioIds.contains(audioId)) return;
    setState(() {
      _selectedAudioId = audioId;
    });
  }

  void _onImageTap(String imageId) async {
    if (_selectedAudioId == null || _matchedImageIds.contains(imageId)) return;

    final activity = widget.activity;
    // Check if this audioId and imageId match
    final matchingPair = activity.matchPairs.firstWhere(
      (p) => p.audioId == _selectedAudioId && p.imageId == imageId,
      orElse: () => ActivityMatchPair(id: '', imageId: '', audioId: ''),
    );

    if (matchingPair.id.isNotEmpty) {
      // Correct match
      setState(() {
        _matchedAudioIds.add(_selectedAudioId!);
        _matchedImageIds.add(imageId);
        _selectedAudioId = null;
      });

      // Check if all matched
      if (_matchedAudioIds.length == activity.matchPairs.length) {
        final provider = context.read<MaharaProvider>();
        final authService = context.read<AuthService>();
        final token = authService.getToken() ?? '';
        final childId = widget.childId;


        // Construct matches list for submission
        final matches = activity.matchPairs.map((p) => {
          'audioId': p.audioId,
          'imageId': p.imageId,
        }).toList();

        await provider.submitInteraction(
          childId: childId,
          token: token,
          matches: matches,
        );
      }
    } else {
      // Incorrect match - reset selection
      setState(() {
        _selectedAudioId = null;
      });
      // Optionally show a "wrong" feedback
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(height: 40.h),
        const Text(
          'صل الصوت بالصورة المناسبة',
          style: TextStyle(
            fontFamily: 'MadaniArabic',
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const Spacer(),
        // Audios Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: widget.activity.audios.map((audio) {
            final isSelected = _selectedAudioId == audio.id;
            final isMatched = _matchedAudioIds.contains(audio.id);
            return Opacity(
              opacity: isMatched ? 0.3 : 1.0,
              child: ActivityAudioPlayer(
                url: audio.url,
                autoPlay: false,
                child: GestureDetector(
                  onTap: () => _onAudioTap(audio.id),
                  child: Container(
                    padding: EdgeInsets.all(10.w),
                    decoration: BoxDecoration(
                      color: isSelected ? Colors.blue.withOpacity(0.2) : Colors.white,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSelected ? Colors.blue : Colors.grey,
                        width: 2,
                      ),
                    ),
                    child: Icon(
                      Icons.play_circle_fill,
                      size: 60.sp,
                      color: isSelected ? Colors.blue : Colors.grey,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        SizedBox(height: 40.h),
        // Images Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: widget.activity.images.map((image) {
            final isMatched = _matchedImageIds.contains(image.id);
            return GestureDetector(
              onTap: () => _onImageTap(image.id),
              child: Opacity(
                opacity: isMatched ? 0.3 : 1.0,
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16.r),
                    border: Border.all(
                      color: isMatched ? Colors.green : Colors.grey,
                      width: 2,
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(14.r),
                    child: Image.network(
                      image.url,
                      width: 100.w,
                      height: 100.w,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const Spacer(),
      ],
    );
  }
}
