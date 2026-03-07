import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../../core/widgets/app_network_image.dart';
import '../constants/account_theme.dart';

/// Profile header: avatar, name, role, membership badge, edit button.
class ProfileHeader extends StatelessWidget {
  final String? name;
  final String? imageUrl;
  final String? role;
  final bool isPremium;
  final VoidCallback? onEdit;

  const ProfileHeader({
    super.key,
    this.name,
    this.imageUrl,
    this.role,
    this.isPremium = false,
    this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    final displayName = name ?? 'سارة محمد علي';

    return Container(
      padding: EdgeInsets.all(24.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AccountTheme.cardRadius),
        border: Border.all(color: AccountTheme.cardBorder),
        boxShadow: AccountTheme.cardShadow,
      ),
      child: Column(
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 96.w,
                height: 96.w,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipOval(
                  child: AppNetworkImage(
                    imageUrl: imageUrl,
                    width: 96.w,
                    height: 96.w,
                    fit: BoxFit.cover,
                    placeholderStyle: AppImagePlaceholderStyle.avatar,
                    initials: displayName.isNotEmpty ? displayName.substring(0, 1) : null,
                  ),
                ),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: GestureDetector(
                  onTap: onEdit ?? () => context.push('/account/profile/update'),
                  child: Container(
                    width: 36.w,
                    height: 36.w,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.white, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Icon(AppIcons.edit, size: 18.sp, color: AppColors.white),
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 16.h),
          Text(
            displayName,
            style: AppTypography.headingM(context).copyWith(
              fontSize: 20.sp,
              fontWeight: AppTypography.bold,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 6.h),
          if (role != null && role!.isNotEmpty)
            Text(
              role!,
              style: AppTypography.bodySmall(context).copyWith(
                color: AppColors.textSecondary,
                fontSize: 13.sp,
              ),
              textAlign: TextAlign.center,
            ),
          SizedBox(height: 10.h),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 6.h),
            decoration: BoxDecoration(
              color: isPremium ? AccountTheme.premiumSoft : AppColors.gray100,
              borderRadius: BorderRadius.circular(AccountTheme.badgeRadius),
              border: Border.all(
                color: isPremium ? AccountTheme.premium : AppColors.gray300,
                width: 1,
              ),
            ),
            child: Text(
              isPremium ? 'بريميوم' : 'مجاني',
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 12.sp,
                fontWeight: AppTypography.semiBold,
                color: isPremium ? AccountTheme.premium : AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
