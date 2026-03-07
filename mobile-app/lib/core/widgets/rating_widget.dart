import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants/app_colors.dart';

class RatingWidget extends StatelessWidget {
  final double rating;
  final double? size;
  final bool showNumber;

  const RatingWidget({
    super.key,
    required this.rating,
    this.size,
    this.showNumber = false,
  });

  @override
  Widget build(BuildContext context) {
    final iconSize = size ?? 16.sp;
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (showNumber)
          Padding(
            padding: EdgeInsets.only(left: 8.w),
            child: Text(
              rating.toStringAsFixed(1),
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 12.sp,
                color: AppColors.gray600,
                height: 1.33,
              ),
            ),
          ),
        ...List.generate(5, (index) {
          if (index < rating.floor()) {
            // Full star
            return Icon(
              Icons.star,
              size: iconSize,
              color: AppColors.yellow,
            );
          } else if (index < rating) {
            // Half star
            return Icon(
              Icons.star_half,
              size: iconSize,
              color: AppColors.yellow,
            );
          } else {
            // Empty star
            return Icon(
              Icons.star_border,
              size: iconSize,
              color: AppColors.gray100,
            );
          }
        }),
      ],
    );
  }
}


