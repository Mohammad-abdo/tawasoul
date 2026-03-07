import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/rating_widget.dart';
import '../../../core/constants/app_colors.dart';

class FeedbackModal extends StatefulWidget {
  final String specialistName;
  final String? specialistImage;

  const FeedbackModal({
    super.key,
    required this.specialistName,
    this.specialistImage,
  });

  @override
  State<FeedbackModal> createState() => _FeedbackModalState();
}

class _FeedbackModalState extends State<FeedbackModal> {
  double _rating = 4.0;
  final TextEditingController _commentController = TextEditingController();
  int _characterCount = 0;

  @override
  void initState() {
    super.initState();
    _commentController.addListener(() {
      setState(() {
        _characterCount = _commentController.text.length;
      });
    });
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20.r),
          topRight: Radius.circular(20.r),
        ),
      ),
      child: Container(
        padding: EdgeInsets.all(24.w),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Close button
              Align(
                alignment: Alignment.topRight,
                child: IconButton(
                  icon: Icon(
                    Icons.close,
                    size: 24.sp,
                    color: AppColors.textPrimary,
                  ),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ),
              // Celebration icon
              Icon(
                Icons.celebration,
                size: 40.sp,
                color: AppColors.yellow,
              ),
              SizedBox(height: 15.h),
              // Title
              Text(
                'لقد انتهت مكالمتك.',
                style: TextStyle(
                  fontFamily: 'MadaniArabic',
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 20.h),
              // Specialist image
              Container(
                width: 80.w,
                height: 80.w,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  image: widget.specialistImage != null
                      ? DecorationImage(
                          image: NetworkImage(widget.specialistImage!),
                          fit: BoxFit.cover,
                        )
                      : null,
                  color: widget.specialistImage == null
                      ? AppColors.gray100
                      : null,
                ),
                child: widget.specialistImage == null
                    ? Icon(
                        Icons.person,
                        size: 40.sp,
                        color: AppColors.textTertiary,
                      )
                    : null,
              ),
              SizedBox(height: 15.h),
              // Question
              RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  style: TextStyle(
                    fontFamily: 'MadaniArabic',
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                    height: 1.5,
                  ),
                  children: [
                    const TextSpan(text: 'كيف كانت مكالمتك صباح الجمعة مع '),
                    TextSpan(
                      text: widget.specialistName,
                      style: const TextStyle(
                        fontFamily: 'Inter',
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 20.h),
              // Rating
              RatingWidget(rating: _rating, size: 30),
              SizedBox(height: 20.h),
              // Comment prompt
              Text(
                'اترك لنا تعليقك...',
                style: TextStyle(
                  fontFamily: 'MadaniArabic',
                  fontSize: 14.sp,
                  color: AppColors.textPrimary,
                  height: 1.5,
                ),
                textAlign: TextAlign.right,
              ),
              SizedBox(height: 10.h),
              // Comment input
              Container(
                height: 120.h,
                decoration: BoxDecoration(
                  color: AppColors.white,
                  border: Border.all(color: AppColors.borderLight),
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: TextField(
                  controller: _commentController,
                  maxLength: 500,
                  maxLines: null,
                  expands: true,
                  textDirection: TextDirection.rtl,
                  decoration: InputDecoration(
                    hintText: '',
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.all(16.w),
                    counterText: '$_characterCount/500',
                    counterStyle: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12.sp,
                      color: AppColors.textPlaceholder,
                    ),
                  ),
                  style: TextStyle(
                    fontFamily: 'MadaniArabic',
                    fontSize: 14.sp,
                    color: AppColors.textPrimary,
                    height: 1.5,
                  ),
                ),
              ),
              SizedBox(height: 30.h),
              // Send Button
              SizedBox(
                width: double.infinity,
                height: 50.h,
                child: ElevatedButton(
                  onPressed: () {
                    // TODO: Submit feedback
                    Navigator.of(context).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('شكراً لك على تقييمك'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: AppColors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10.r),
                    ),
                  ),
                  child: Text(
                    'ارسال',
                    style: TextStyle(
                      fontFamily: 'MadaniArabic',
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w400,
                      height: 1.5,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}


