import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants/app_colors.dart';
import '../../features/children/theme/child_profile_design.dart';

/// Status ring color for the child avatar.
/// Green: good progress, Yellow: in progress, Red: needs attention.
enum ChildAvatarStatus {
  goodProgress,
  inProgress,
  needsAttention,
}

extension _ChildAvatarStatusX on ChildAvatarStatus {
  Color get color {
    switch (this) {
      case ChildAvatarStatus.goodProgress:
        return ChildProfileDesign.statusActive; // green
      case ChildAvatarStatus.inProgress:
        return AppColors.warning; // yellow
      case ChildAvatarStatus.needsAttention:
        return AppColors.error; // red
    }
  }
}

/// Circular child avatar with status ring for app bar / navigation.
/// Icon-only, emotional, high-visibility. No text.
/// Tap → open child profile or selector; long-press → quick actions.
class ChildAvatarButton extends StatelessWidget {
  final String? childId;
  final String? imageUrl;
  final String? name;
  final ChildAvatarStatus status;
  final VoidCallback onTap;
  final VoidCallback? onLongPress;
  final double size;

  const ChildAvatarButton({
    super.key,
    this.childId,
    this.imageUrl,
    this.name,
    this.status = ChildAvatarStatus.inProgress,
    required this.onTap,
    this.onLongPress,
    this.size = 44,
  });

  @override
  Widget build(BuildContext context) {
    final ringColor = status.color;
    final effectiveSize = size.w;
    final ringWidth = 2.5;
    final innerSize = effectiveSize - ringWidth * 2;

    return Semantics(
      button: true,
      label: name != null && name!.isNotEmpty
          ? 'ملف الطفل: $name'
          : 'إضافة طفل',
      hint: 'اضغط للفتح. اضغط مطولاً لإجراءات سريعة.',
      child: GestureDetector(
        onTap: onTap,
        onLongPress: onLongPress,
        behavior: HitTestBehavior.opaque,
        child: Container(
          width: effectiveSize + 8.w,
          height: effectiveSize + 8.h,
          alignment: Alignment.center,
          child: Focus(
            onFocusChange: (f) {},
            child: Container(
              width: effectiveSize,
              height: effectiveSize,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                  BoxShadow(
                    color: ringColor.withValues(alpha: 0.25),
                    blurRadius: 6,
                    spreadRadius: 0,
                  ),
                ],
              ),
              child: Container(
                margin: EdgeInsets.all(ringWidth),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: ringColor,
                    width: 2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: ringColor.withValues(alpha: 0.2),
                      blurRadius: 4,
                      spreadRadius: 0,
                    ),
                  ],
                ),
                child: ClipOval(
                  child: imageUrl != null && imageUrl!.isNotEmpty
                      ? Image.network(
                          imageUrl!,
                          width: innerSize,
                          height: innerSize,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _defaultAvatar(innerSize),
                        )
                      : _defaultAvatar(innerSize),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _defaultAvatar(double size) {
    return Container(
      width: size,
      height: size,
      color: ChildProfileDesign.profileAccentLight,
      child: Icon(
        Icons.child_care_rounded,
        size: (size * 0.55).clamp(20.0, 36.0),
        color: ChildProfileDesign.profileAccent,
      ),
    );
  }
}
