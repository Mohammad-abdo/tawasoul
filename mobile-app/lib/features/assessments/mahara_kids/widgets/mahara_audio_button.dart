import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:just_audio/just_audio.dart';
import 'dart:async';
import '../constants/mahara_colors.dart';

/// Large, accessible audio button with gentle animations
/// Minimum 120x120px for easy tapping (children 2-6 years)
class MaharaAudioButton extends StatefulWidget {
  final String audioUrl;
  final VoidCallback? onPlayComplete;

  const MaharaAudioButton({
    super.key,
    required this.audioUrl,
    this.onPlayComplete,
  });

  @override
  State<MaharaAudioButton> createState() => _MaharaAudioButtonState();
}

class _MaharaAudioButtonState extends State<MaharaAudioButton>
    with SingleTickerProviderStateMixin {
  late AudioPlayer _audioPlayer;
  bool _isPlaying = false;
  bool _isLoading = false;
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  StreamSubscription<PlayerState>? _playerStateSubscription;

  @override
  void initState() {
    super.initState();
    _audioPlayer = AudioPlayer();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.92).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeInOut,
      ),
    );
    _loadAudio();
  }

  Future<void> _loadAudio() async {
    if (!mounted) return;
    
    setState(() => _isLoading = true);
    try {
      await _audioPlayer.setUrl(widget.audioUrl);
      _playerStateSubscription = _audioPlayer.playerStateStream.listen((state) {
        if (!mounted) return;
        
        if (state.processingState == ProcessingState.completed) {
          setState(() {
            _isPlaying = false;
            _isLoading = false;
          });
          widget.onPlayComplete?.call();
        } else if (state.processingState == ProcessingState.loading) {
          if (mounted) {
            setState(() => _isLoading = true);
          }
        } else {
          if (mounted) {
            setState(() => _isLoading = false);
          }
        }
      });
      if (mounted) {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        debugPrint('Error loading audio: $e');
      }
    }
  }

  Future<void> _playAudio() async {
    if (_isPlaying || _isLoading || !mounted) return;

    setState(() => _isPlaying = true);
    _animationController.forward().then((_) {
      if (mounted) {
        _animationController.reverse();
      }
    });

    try {
      await _audioPlayer.seek(Duration.zero);
      await _audioPlayer.play();
    } catch (e) {
      if (mounted) {
        setState(() {
          _isPlaying = false;
          _isLoading = false;
        });
        debugPrint('Error playing audio: $e');
      }
    }
  }

  @override
  void dispose() {
    _playerStateSubscription?.cancel();
    _audioPlayer.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Play audio',
      button: true,
      child: GestureDetector(
        onTap: _playAudio,
        child: ScaleTransition(
          scale: _scaleAnimation,
          child: Container(
            width: 120.w,
            height: 120.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: MaharaColors.primary,
              boxShadow: [
                BoxShadow(
                  color: MaharaColors.primary.withOpacity(0.25),
                  blurRadius: 24,
                  spreadRadius: 2,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: _isLoading
                ? Center(
                    child: SizedBox(
                      width: 30.w,
                      height: 30.w,
                      child: const CircularProgressIndicator(
                        strokeWidth: 3,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    ),
                  )
                : Icon(
                    _isPlaying ? Icons.volume_up_rounded : Icons.play_arrow_rounded,
                    size: 56.sp,
                    color: Colors.white,
                  ),
          ),
        ),
      ),
    );
  }
}
