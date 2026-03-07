import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../theme/child_profile_design.dart';

/// Quick actions shown on long-press of child avatar.
/// Actions: Start assessment, View progress, Book session.
void showChildQuickActionsModal(
  BuildContext context, {
  required String childId,
  String? childName,
}) {
  showModalBottomSheet<void>(
    context: context,
    backgroundColor: AppColors.white,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
    ),
    builder: (ctx) => SafeArea(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 24.h),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (childName != null && childName.isNotEmpty)
              Padding(
                padding: EdgeInsets.only(bottom: 16.h),
                child: Text(
                  childName,
                  style: ChildProfileDesign.titleMedium(ctx),
                  textAlign: TextAlign.center,
                ),
              ),
            _ActionTile(
              icon: Icons.psychology_rounded,
              label: 'بدء التقييم',
              onTap: () {
                Navigator.of(ctx).pop();
                context.push('/assessments/child/$childId');
              },
            ),
            _ActionTile(
              icon: Icons.trending_up_rounded,
              label: 'عرض التقدم',
              onTap: () {
                Navigator.of(ctx).pop();
                context.push('/children/$childId/evaluation');
              },
            ),
            _ActionTile(
              icon: Icons.calendar_today_rounded,
              label: 'حجز جلسة',
              onTap: () {
                Navigator.of(ctx).pop();
                context.push('/appointments/booking');
              },
            ),
            SizedBox(height: 8.h),
          ],
        ),
      ),
    ),
  );
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14.r),
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 14.h, horizontal: 16.w),
          child: Row(
            textDirection: TextDirection.rtl,
            children: [
              Icon(icon, size: 24.sp, color: ChildProfileDesign.profileAccent),
              SizedBox(width: 16.w),
              Text(
                label,
                style: ChildProfileDesign.bodyFriendly(context).copyWith(
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
