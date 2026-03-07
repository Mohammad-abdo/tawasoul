import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';

class EncouragementWidget extends StatefulWidget {
  final VoidCallback onFinished;

  const EncouragementWidget({
    super.key,
    required this.onFinished,
  });

  @override
  State<EncouragementWidget> createState() => _EncouragementWidgetState();
}

class _EncouragementWidgetState extends State<EncouragementWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );

    _scaleAnimation = Tween<double>(begin: 0.0, end: 1.2).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.elasticOut,
      ),
    );

    _controller.forward();

    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        widget.onFinished();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.5),
      child: Center(
        child: ScaleTransition(
          scale: _scaleAnimation,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.star,
                size: 100,
                color: Colors.yellow,
              ),
              SizedBox(height: 20.h),
              Text(
                'رائع! أحسنت',
                style: TextStyle(
                  fontFamily: 'ExpoArabic',
                  fontSize: 32.sp,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              SizedBox(height: 10.h),
              const Icon(
                Icons.celebration,
                size: 60,
                color: Colors.orange,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
