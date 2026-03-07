import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/providers/children_provider.dart';
import '../theme/child_profile_design.dart';

/// Bottom sheet to choose a child when there are multiple.
/// Horizontal list of avatars + names. Tap selects; caller opens profile via onSelect.
void showChildSelectorSheet(
  BuildContext context, {
  required List<Child> children,
  required String? selectedChildId,
  required void Function(String) onSelect,
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
            Text(
              'اختر الطفل',
              style: ChildProfileDesign.titleLarge(ctx),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 20.h),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: children.map((c) {
                  final isSelected = c.id == selectedChildId;
                  return Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8.w),
                    child: GestureDetector(
                      onTap: () {
                        Navigator.of(ctx).pop();
                        onSelect(c.id);
                      },
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 64.w,
                            height: 64.w,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isSelected
                                    ? ChildProfileDesign.profileAccent
                                    : AppColors.border,
                                width: isSelected ? 3 : 1,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.06),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: ClipOval(
                              child: c.profileImageUrl != null &&
                                      c.profileImageUrl!.isNotEmpty
                                  ? Image.network(
                                      c.profileImageUrl!,
                                      fit: BoxFit.cover,
                                      width: 64.w,
                                      height: 64.w,
                                      errorBuilder: (_, __, ___) =>
                                          _defaultChildIcon(64.w),
                                    )
                                  : _defaultChildIcon(64.w),
                            ),
                          ),
                          SizedBox(height: 8.h),
                          SizedBox(
                            width: 72.w,
                            child: Text(
                              c.name ?? 'طفل',
                              style:
                                  ChildProfileDesign.bodyFriendly(ctx).copyWith(
                                fontSize: 13.sp,
                                fontWeight:
                                    isSelected ? FontWeight.w600 : FontWeight.w400,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            SizedBox(height: 16.h),
          ],
        ),
      ),
    ),
  );
}

Widget _defaultChildIcon(double size) {
  return Container(
    width: size,
    height: size,
    color: ChildProfileDesign.profileAccentLight,
    child: Icon(
      Icons.child_care_rounded,
      size: size * 0.5,
      color: ChildProfileDesign.profileAccent,
    ),
  );
}
