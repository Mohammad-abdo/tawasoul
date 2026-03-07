import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants/app_colors.dart';
import '../theme/app_typography.dart';

/// Bottom Navigation Bar with centered floating Tests & Assessments button.
/// - 5 items: Home, Appointments, [Center FAB: Tests], Chat, Account
/// - Center FAB: circular, gradient, shadow/glow, notebook-with-checkmark icon
/// - Other icons smaller and neutral; existing navigation logic preserved
class AppNavigationBar extends StatefulWidget {
  final int currentIndex;
  final Function(int)? onTap;

  const AppNavigationBar({
    super.key,
    required this.currentIndex,
    this.onTap,
  });

  @override
  State<AppNavigationBar> createState() => _AppNavigationBarState();
}

class _AppNavigationBarState extends State<AppNavigationBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _fabScaleController;
  late Animation<double> _fabScaleAnimation;

  @override
  void initState() {
    super.initState();
    _fabScaleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _fabScaleAnimation = Tween<double>(begin: 1.0, end: 1.08).animate(
      CurvedAnimation(parent: _fabScaleController, curve: Curves.easeOut),
    );
    if (widget.currentIndex == 2) _fabScaleController.forward();
  }

  @override
  void didUpdateWidget(AppNavigationBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    final isActive = widget.currentIndex == 2;
    if (isActive != (oldWidget.currentIndex == 2)) {
      if (isActive) {
        _fabScaleController.forward();
      } else {
        _fabScaleController.reverse();
      }
    }
  }

  @override
  void dispose() {
    _fabScaleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isTestsActive = widget.currentIndex == 2;
    if (isTestsActive && !_fabScaleController.isAnimating) {
      _fabScaleController.forward();
    } else if (!isTestsActive && _fabScaleController.value > 0) {
      _fabScaleController.reverse();
    }

    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            offset: const Offset(0, -2),
            blurRadius: 12,
            spreadRadius: 0,
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Container(
          constraints: BoxConstraints(
            minHeight: 64.h,
            maxHeight: 72.h,
          ),
          padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 6.h),
          child: AnimatedBuilder(
            animation: _fabScaleAnimation,
            builder: (context, _) {
              return Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildNavItem(
                    context: context,
                    icon: Icons.home_outlined,
                    activeIcon: Icons.home_rounded,
                    label: 'الرئيسية',
                    index: 0,
                    isActive: widget.currentIndex == 0,
                  ),
                  _buildNavItem(
                    context: context,
                    icon: Icons.calendar_today_outlined,
                    activeIcon: Icons.calendar_today_rounded,
                    label: 'الحجوزات',
                    index: 1,
                    isActive: widget.currentIndex == 1,
                  ),
                  _buildCenterFAB(isActive: isTestsActive),
                  _buildNavItem(
                    context: context,
                    icon: Icons.chat_bubble_outline_rounded,
                    activeIcon: Icons.chat_bubble_rounded,
                    label: 'المحادثة',
                    index: 3,
                    isActive: widget.currentIndex == 3,
                  ),
                  _buildNavItem(
                    context: context,
                    icon: Icons.person_outline_rounded,
                    activeIcon: Icons.person_rounded,
                    label: 'حسابي',
                    index: 4,
                    isActive: widget.currentIndex == 4,
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildCenterFAB({required bool isActive}) {
    return Expanded(
      child: Center(
        child: _CenterFABButton(
          isActive: isActive,
          scaleAnimation: _fabScaleAnimation,
          onTap: () => widget.onTap?.call(2),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required BuildContext context,
    required IconData icon,
    required IconData activeIcon,
    required String label,
    required int index,
    required bool isActive,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: () => widget.onTap?.call(index),
        behavior: HitTestBehavior.opaque,
        child: Container(
          constraints: BoxConstraints(
            minHeight: 48.h,
          ),
          padding: EdgeInsets.symmetric(vertical: 4.h),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isActive ? activeIcon : icon,
                size: 22.sp,
                color: isActive
                    ? AppColors.primary
                    : AppColors.textTertiary,
              ),
              SizedBox(height: 2.h),
              Flexible(
                child: Text(
                  label,
                  style: AppTypography.bodySmall(context).copyWith(
                    fontSize: 10.sp,
                    fontWeight:
                        isActive ? AppTypography.semiBold : AppTypography.regular,
                    color: isActive
                        ? AppColors.primary
                        : AppColors.textTertiary,
                    height: 1.0,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Center FAB: circular, gradient, shadow/glow, scale on active, tap micro-interaction.
class _CenterFABButton extends StatefulWidget {
  final bool isActive;
  final Animation<double> scaleAnimation;
  final VoidCallback? onTap;

  const _CenterFABButton({
    required this.isActive,
    required this.scaleAnimation,
    this.onTap,
  });

  @override
  State<_CenterFABButton> createState() => _CenterFABButtonState();
}

class _CenterFABButtonState extends State<_CenterFABButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final size = 56.0.w;
    final iconSize = 28.0.sp;
    final baseScale = widget.scaleAnimation.value;
    final tapScale = _pressed ? 0.92 : 1.0;
    final scale = baseScale * tapScale;

    return Transform.scale(
      scale: scale,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: widget.onTap,
          onTapDown: (_) => setState(() => _pressed = true),
          onTapUp: (_) => setState(() => _pressed = false),
          onTapCancel: () => setState(() => _pressed = false),
          customBorder: const CircleBorder(),
          splashColor: Colors.white.withOpacity(0.3),
          highlightColor: Colors.white.withOpacity(0.15),
          child: Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: widget.isActive
                    ? [
                        AppColors.primary,
                        AppColors.primaryLight,
                      ]
                    : [
                        AppColors.primary.withOpacity(0.85),
                        AppColors.primaryLight.withOpacity(0.9),
                      ],
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.35),
                  blurRadius: widget.isActive ? 14 : 10,
                  spreadRadius: widget.isActive ? 1 : 0,
                  offset: const Offset(0, 4),
                ),
                BoxShadow(
                  color: Colors.black.withOpacity(0.12),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(
              Icons.assignment_turned_in_rounded,
              size: iconSize,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}
