import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../constants/account_theme.dart';

/// Profile info card: email, phone, children count, account date.
class ProfileInfoSection extends StatelessWidget {
  final String? email;
  final String? phone;
  final int? childrenCount;
  final String? accountCreatedAt;

  const ProfileInfoSection({
    super.key,
    this.email,
    this.phone,
    this.childrenCount,
    this.accountCreatedAt,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AccountTheme.cardRadius),
        border: Border.all(color: AccountTheme.cardBorder),
        boxShadow: AccountTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _InfoRow(
            icon: Icons.email_outlined,
            label: 'البريد الإلكتروني',
            value: email ?? 'sara@example.com',
          ),
          Divider(height: 24.h, color: AccountTheme.cardBorder),
          _InfoRow(
            icon: Icons.phone_outlined,
            label: 'رقم الهاتف',
            value: phone ?? '+20 ١٢٣ ٤٥٦ ٧٨٩٠',
          ),
          Divider(height: 24.h, color: AccountTheme.cardBorder),
          _InfoRow(
            icon: Icons.child_care_outlined,
            label: 'ملفات الأطفال',
            value: childrenCount != null ? '$childrenCount' : '١',
          ),
          if (accountCreatedAt != null && accountCreatedAt!.isNotEmpty) ...[
            Divider(height: 24.h, color: AccountTheme.cardBorder),
            _InfoRow(
              icon: Icons.calendar_today_outlined,
              label: 'تاريخ الانضمام',
              value: accountCreatedAt!,
            ),
          ],
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      textDirection: TextDirection.rtl,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                value,
                style: AppTypography.bodyMedium(context).copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: AppTypography.medium,
                ),
                textAlign: TextAlign.right,
              ),
              SizedBox(height: 2.h),
              Text(
                label,
                style: AppTypography.bodySmall(context).copyWith(
                  color: AppColors.textTertiary,
                  fontSize: 12.sp,
                ),
                textAlign: TextAlign.right,
              ),
            ],
          ),
        ),
        SizedBox(width: 12.w),
        Container(
          width: 44.w,
          height: 44.w,
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12.r),
          ),
          child: Icon(icon, size: 22.sp, color: AppColors.primary),
        ),
      ],
    );
  }
}
