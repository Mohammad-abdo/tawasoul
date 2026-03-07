import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';

class ActivityAudioPlayer extends StatefulWidget {
  final String url;
  final bool autoPlay;
  final VoidCallback? onCompleted;
  final Widget? child;

  const ActivityAudioPlayer({
    super.key,
    required this.url,
    this.autoPlay = true,
    this.onCompleted,
    this.child,
  });

  @override
  State<ActivityAudioPlayer> createState() => _ActivityAudioPlayerState();
}

class _ActivityAudioPlayerState extends State<ActivityAudioPlayer> {
  late AudioPlayer _player;
  bool _isPlaying = false;

  @override
  void initState() {
    super.initState();
    _player = AudioPlayer();
    
    _player.onPlayerStateChanged.listen((state) {
      if (mounted) {
        setState(() {
          _isPlaying = state == PlayerState.playing;
        });
      }
    });

    _player.onPlayerComplete.listen((event) {
      if (mounted && widget.onCompleted != null) {
        widget.onCompleted!();
      }
    });

    if (widget.autoPlay) {
      _play();
    }
  }

  Future<void> _play() async {
    try {
      await _player.play(UrlSource(widget.url));
    } catch (e) {
      debugPrint('Error playing audio: $e');
    }
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _isPlaying ? null : _play,
      child: widget.child ?? Icon(
        _isPlaying ? Icons.volume_up : Icons.volume_mute,
        size: 50,
        color: Colors.blue,
      ),
    );
  }
}
