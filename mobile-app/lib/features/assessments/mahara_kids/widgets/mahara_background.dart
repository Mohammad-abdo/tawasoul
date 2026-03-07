import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants/mahara_colors.dart';

/// Global-friendly background with soft gradient and abstract shapes
/// Designed for calm, comfortable viewing
class MaharaBackground extends StatelessWidget {
  final Widget child;

  const MaharaBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            MaharaColors.backgroundLight,
            MaharaColors.backgroundMid,
            MaharaColors.backgroundLight,
          ],
          stops: const [0.0, 0.5, 1.0],
        ),
      ),
      child: Stack(
        children: [
          // Soft abstract shapes - very subtle
          Positioned(
            top: -60.h,
            right: -60.w,
            child: Container(
              width: 220.w,
              height: 220.h,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: MaharaColors.gray200.withOpacity(0.15),
              ),
            ),
          ),
          Positioned(
            bottom: -100.h,
            left: -100.w,
            child: Container(
              width: 280.w,
              height: 280.h,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: MaharaColors.gray200.withOpacity(0.12),
              ),
            ),
          ),
          child,
        ],
      ),
    );
  }
}
