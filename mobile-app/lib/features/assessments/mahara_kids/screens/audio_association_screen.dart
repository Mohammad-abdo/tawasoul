import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:just_audio/just_audio.dart';
import '../widgets/mahara_background.dart';
import '../widgets/mahara_audio_button.dart';
import '../models/activity_model.dart';
import '../constants/mahara_colors.dart';

/// Audio Association Activity Screen
/// Large contextual image with auto-play audio
/// Simple, focused interaction
class AudioAssociationScreen extends StatefulWidget {
  final MaharaActivity activity;

  const AudioAssociationScreen({super.key, required this.activity});

  @override
  State<AudioAssociationScreen> createState() => _AudioAssociationScreenState();
}

class _AudioAssociationScreenState extends State<AudioAssociationScreen>
    with SingleTickerProviderStateMixin {
  late AudioPlayer _audioPlayer;
  bool _hasPlayed = false;
  late AnimationController _imageAnimationController;
  late Animation<double> _imageScaleAnimation;
  StreamSubscription<PlayerState>? _playerStateSubscription;

  @override
  void initState() {
    super.initState();
    _audioPlayer = AudioPlayer();
    _imageAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _imageScaleAnimation = Tween<double>(begin: 0.94, end: 1.0).animate(
      CurvedAnimation(
        parent: _imageAnimationController,
        curve: Curves.easeOutCubic,
      ),
    );
    _playAudioOnLoad();
  }

  Future<void> _playAudioOnLoad() async {
    if (widget.activity.audioUrl == null) return;

    await Future.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    
    try {
      await _audioPlayer.setUrl(widget.activity.audioUrl!);
      await _audioPlayer.play();
      if (mounted) {
        setState(() => _hasPlayed = true);
        _imageAnimationController.forward();
      }
    } catch (e) {
      if (mounted) {
        debugPrint('Error playing audio: $e');
      }
    }
  }

  @override
  void dispose() {
    _playerStateSubscription?.cancel();
    _audioPlayer.dispose();
    _imageAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaharaBackground(
      child: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Large contextual image - 300x300px
              ScaleTransition(
                scale: _imageScaleAnimation,
                child: Container(
                  width: 300.w,
                  height: 300.w,
                  margin: EdgeInsets.symmetric(horizontal: 40.w),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(32.r),
                    boxShadow: [
                      BoxShadow(
                        color: MaharaColors.shadowMedium,
                        blurRadius: 24,
                        spreadRadius: 2,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(32.r),
                    child: widget.activity.mainImageUrl != null
                        ? Image.network(
                            widget.activity.mainImageUrl!,
                            fit: BoxFit.cover,
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return Container(
                                color: MaharaColors.backgroundCard,
                                child: Center(
                                  child: CircularProgressIndicator(
                                    value: loadingProgress.expectedTotalBytes != null
                                        ? loadingProgress.cumulativeBytesLoaded /
                                            loadingProgress.expectedTotalBytes!
                                        : null,
                                    strokeWidth: 3,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      MaharaColors.primary,
                                    ),
                                  ),
                                ),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                color: MaharaColors.gray100,
                                child: Icon(
                                  Icons.image_outlined,
                                  size: 100.sp,
                                  color: MaharaColors.gray400,
                                ),
                              );
                            },
                          )
                        : Container(
                            color: MaharaColors.gray100,
                            child: Icon(
                              Icons.image_outlined,
                              size: 100.sp,
                              color: MaharaColors.gray400,
                            ),
                          ),
                  ),
                ),
              ),
              SizedBox(height: 80.h),
              // Replay sound button - Large, accessible
              if (widget.activity.audioUrl != null)
                MaharaAudioButton(
                  audioUrl: widget.activity.audioUrl!,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
