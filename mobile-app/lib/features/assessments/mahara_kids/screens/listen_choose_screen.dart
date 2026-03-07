import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:just_audio/just_audio.dart';
import 'dart:async';
import 'dart:math' as math;
import '../widgets/mahara_background.dart';
import '../widgets/mahara_audio_button.dart';
import '../models/activity_model.dart';
import '../constants/mahara_colors.dart';

/// Listen & Choose Activity Screen
/// Auto-play audio, 2-3 large selectable image cards
/// Clear visual feedback for correct/incorrect choices
class ListenChooseScreen extends StatefulWidget {
  final MaharaActivity activity;

  const ListenChooseScreen({super.key, required this.activity});

  @override
  State<ListenChooseScreen> createState() => _ListenChooseScreenState();
}

class _ListenChooseScreenState extends State<ListenChooseScreen>
    with TickerProviderStateMixin {
  late AudioPlayer _audioPlayer;
  String? _selectedOptionId;
  bool _isCorrect = false;
  bool _hasFeedback = false;
  late AnimationController _shakeController;
  late AnimationController _glowController;
  late Animation<double> _shakeAnimation;
  late Animation<double> _glowAnimation;
  StreamSubscription<PlayerState>? _playerStateSubscription;

  @override
  void initState() {
    super.initState();
    _audioPlayer = AudioPlayer();
    _shakeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _shakeAnimation = Tween<double>(begin: 0, end: 8).animate(
      CurvedAnimation(
        parent: _shakeController,
        curve: Curves.elasticOut,
      ),
    );
    _glowAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _glowController,
        curve: Curves.easeInOut,
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
    } catch (e) {
      if (mounted) {
        debugPrint('Error playing audio: $e');
      }
    }
  }

  void _handleOptionTap(String optionId) {
    if (_isCorrect || _hasFeedback) return;

    final option = widget.activity.options?.firstWhere(
      (opt) => opt.id == optionId,
    );

    if (option == null || !mounted) return;

    setState(() {
      _selectedOptionId = optionId;
      _isCorrect = option.isCorrect;
      _hasFeedback = true;
    });

    if (option.isCorrect) {
      _glowController.forward();
      _showSuccessFeedback();
    } else {
      _shakeController.forward().then((_) {
        if (mounted) {
          _shakeController.reset();
          _replayAudio();
        }
      });
    }
  }

  void _showSuccessFeedback() {
    Future.delayed(const Duration(milliseconds: 2000), () {
      if (mounted) {
        _glowController.reverse();
        widget.activity.onComplete?.call(true);
      }
    });
  }

  void _replayAudio() {
    if (!mounted) return;
    _audioPlayer.seek(Duration.zero);
    _audioPlayer.play();
    // Reset feedback after delay
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (mounted) {
        setState(() {
          _hasFeedback = false;
          _selectedOptionId = null;
        });
      }
    });
  }

  @override
  void dispose() {
    _playerStateSubscription?.cancel();
    _audioPlayer.dispose();
    _shakeController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final options = widget.activity.options ?? [];
    final columns = options.length <= 2 ? 2 : 3;
    final itemSize = columns == 2 ? 160.w : 140.w;

    return MaharaBackground(
      child: SafeArea(
        child: Column(
          children: [
            SizedBox(height: 50.h),
            // Replay audio button (top center) - Large, accessible
            if (widget.activity.audioUrl != null)
              MaharaAudioButton(
                audioUrl: widget.activity.audioUrl!,
              ),
            SizedBox(height: 60.h),
            // Image cards grid - Large tap targets
            Expanded(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 30.w),
                child: GridView.builder(
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: columns,
                    crossAxisSpacing: 24.w,
                    mainAxisSpacing: 24.h,
                    childAspectRatio: 1.0,
                  ),
                  itemCount: options.length,
                  itemBuilder: (context, index) {
                    final option = options[index];
                    final isSelected = _selectedOptionId == option.id;
                    final showGlow = isSelected && _isCorrect;
                    final showShake = isSelected && !_isCorrect;

                    return AnimatedBuilder(
                      animation: Listenable.merge([
                        showGlow ? _glowAnimation : _shakeAnimation,
                      ]),
                      builder: (context, child) {
                        return Transform.translate(
                          offset: showShake
                              ? Offset(
                                  _shakeAnimation.value *
                                      math.sin(_shakeAnimation.value * 2 * math.pi),
                                  0,
                                )
                              : Offset.zero,
                          child: Transform.scale(
                            scale: showGlow
                                ? 1.0 + (_glowAnimation.value * 0.08)
                                : 1.0,
                            child: Semantics(
                              label: 'Select option ${index + 1}',
                              button: true,
                              child: GestureDetector(
                                onTap: () => _handleOptionTap(option.id),
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(28.r),
                                    border: Border.all(
                                      color: showGlow
                                          ? MaharaColors.success
                                          : showShake
                                              ? MaharaColors.feedbackNegative
                                              : Colors.transparent,
                                      width: showGlow || showShake ? 4 : 0,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: showGlow
                                            ? MaharaColors.success
                                                .withOpacity(0.4 * _glowAnimation.value)
                                            : MaharaColors.shadowLight,
                                        blurRadius: showGlow ? 32 : 16,
                                        spreadRadius: showGlow ? 4 : 0,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(28.r),
                                    child: Image.network(
                                      option.imageUrl,
                                      fit: BoxFit.cover,
                                      loadingBuilder: (context, child, loadingProgress) {
                                        if (loadingProgress == null) return child;
                                        return Container(
                                          color: MaharaColors.gray100,
                                          child: Center(
                                            child: CircularProgressIndicator(
                                              value: loadingProgress.expectedTotalBytes != null
                                                  ? loadingProgress.cumulativeBytesLoaded /
                                                      loadingProgress.expectedTotalBytes!
                                                  : null,
                                              strokeWidth: 2,
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
                                            size: 60.sp,
                                            color: MaharaColors.gray400,
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ),
            SizedBox(height: 50.h),
          ],
        ),
      ),
    );
  }
}
