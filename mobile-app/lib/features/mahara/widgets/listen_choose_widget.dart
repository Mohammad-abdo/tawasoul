import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../models/activity.dart';
import '../providers/mahara_provider.dart';
import 'activity_audio_player.dart';
import '../../../core/services/auth_service.dart';

class ListenChooseWidget extends StatefulWidget {
  final Activity activity;
  final String childId;

  const ListenChooseWidget({
    super.key,
    required this.activity,
    required this.childId,
  });

  @override
  State<ListenChooseWidget> createState() => _ListenChooseWidgetState();
}

class _ListenChooseWidgetState extends State<ListenChooseWidget> {
  String? _selectedId;
  late GlobalKey<State> _audioPlayerKey;

  @override
  void initState() {
    super.initState();
    _audioPlayerKey = GlobalKey<State>();
  }

  void _onImageTap(String imageId) async {
    setState(() {
      _selectedId = imageId;
    });

    final provider = context.read<MaharaProvider>();
    final authService = context.read<AuthService>();
    final token = authService.getToken() ?? '';
    final childId = widget.childId;


    // The backend handles validation, but we can also check locally for immediate feedback
    final isCorrect = imageId == widget.activity.correctImageId;

    if (isCorrect) {
      await provider.submitInteraction(
        childId: childId,
        token: token,
        selectedImageId: imageId,
      );
    } else {
      // Wrong choice: replay audio and reset selection
      setState(() {
        _selectedId = null;
      });
      // Replay audio (forcing a rebuild on the player might work if we use a unique key)
      // Actually, my ActivityAudioPlayer handles replay on tap, but we want it automatic
      // Let's just tap it programmatically or reset state
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.activity.audios.isEmpty) {
      return const Center(child: Text('بيانات النشاط غير مكتملة'));
    }

    final audioUrl = widget.activity.audios[0].url;

    return Column(
      children: [
        Padding(
          padding: EdgeInsets.only(top: 40.h),
          child: ActivityAudioPlayer(
            key: _audioPlayerKey,
            url: audioUrl,
            autoPlay: true,
          ),
        ),
        const Spacer(),
        Wrap(
          spacing: 20.w,
          runSpacing: 20.h,
          alignment: WrapAlignment.center,
          children: widget.activity.images.map((image) {
            final isSelected = _selectedId == image.id;
            return GestureDetector(
              onTap: () => _onImageTap(image.id),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20.r),
                  border: Border.all(
                    color: isSelected ? Colors.green : Colors.transparent,
                    width: 4,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16.r),
                  child: Image.network(
                    image.url,
                    width: 140.w,
                    height: 140.w,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const Spacer(),
        Padding(
          padding: EdgeInsets.all(20.h),
          child: const Text(
            'استمع واختر الصورة الصحيحة',
            style: TextStyle(
              fontFamily: 'MadaniArabic',
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }
}
