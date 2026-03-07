import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants/app_colors.dart';
import 'app_network_image.dart';

class AppHeader extends StatelessWidget {
  final String? title;
  final String? subtitle;
  final String? userName;
  final String? userImage;
  final Widget? leading;
  final Widget? trailing;
  final List<Widget>? actions;
  final VoidCallback? onNotificationTap;
  final VoidCallback? onProfileTap;
  /// Child profile avatar gateway. Shown at top-right in RTL (high-visibility).
  /// Tap → Child Profile or selector; long-press → quick actions.
  final Widget? childAvatar;

  const AppHeader({
    super.key,
    this.title,
    this.subtitle,
    this.userName,
    this.userImage,
    this.leading,
    this.trailing,
    this.actions,
    this.onNotificationTap,
    this.onProfileTap,
    this.childAvatar,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 5.h),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(
          bottom: BorderSide(
            color: Color(0x0D000000), // rgba(0,0,0,0.05)
            width: 1,
          ),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            // Child avatar (RTL top-right) – high-visibility gateway to Child Profile
            if (childAvatar != null) ...[
              childAvatar!,
              SizedBox(width: 10.w),
            ],
            // Left side - Notifications and Cart
            Row(
              children: [
                if (onNotificationTap != null)
                  GestureDetector(
                    onTap: onNotificationTap,
                    child: Container(
                      padding: EdgeInsets.all(10.w),
                      child: Icon(
                        Icons.notifications_outlined,
                        size: 24.sp,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                SizedBox(width: 10.w),
                // Cart icon (hidden for now)
                Opacity(
                  opacity: 0,
                  child: Icon(
                    Icons.shopping_cart_outlined,
                    size: 24.sp,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const Spacer(),
            // Center - Title
            if (title != null)
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (subtitle != null)
                      Text(
                        subtitle!,
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 12.sp,
                          color: AppColors.textLight,
                          height: 1.5,
                        ),
                        textAlign: TextAlign.right,
                      ),
                    if (userName != null)
                      Text(
                        userName!,
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textPrimary,
                          height: 1.5,
                        ),
                        textAlign: TextAlign.right,
                      ),
                    if (title != null && userName == null)
                      Text(
                        title!,
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                          height: 1.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                  ],
                ),
              ),
            // Right side - Profile
            if (userImage != null || onProfileTap != null)
              GestureDetector(
                onTap: onProfileTap,
                child: Container(
                  width: 45.w,
                  height: 45.w,
                  padding: EdgeInsets.all(3.w),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.gray200,
                      width: 1,
                    ),
                  ),
                  child: ClipOval(
                    child: AppNetworkImage(
                      imageUrl: userImage,
                      width: 45.w,
                      height: 45.w,
                      fit: BoxFit.cover,
                      placeholderStyle: AppImagePlaceholderStyle.avatar,
                    ),
                  ),
                ),
              ),
            // Leading widget (back button, etc.)
            if (leading != null) ...[
              SizedBox(width: 10.w),
              leading!,
            ],
            // Trailing widget (add button, etc.)
            if (trailing != null) ...[
              SizedBox(width: 10.w),
              trailing!,
            ],
          ],
        ),
      ),
    );
  }
}

