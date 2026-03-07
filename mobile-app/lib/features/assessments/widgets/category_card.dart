import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../constants/assessment_categories_theme.dart';

/// Category status for clear visual distinction (completed, in-progress, new, locked).
enum CategoryCardStatus {
  newTest,
  inProgress,
  completed,
  locked,
}

/// Reusable category card: large playful icon, name, short description, progress ring/bar, tap animation.
/// Clear difference between completed / in-progress / new / locked. Accessibility: large fonts, contrast.
class CategoryCard extends StatefulWidget {
  final Map<String, dynamic> category;
  final double progress;
  final CategoryCardStatus status;
  final VoidCallback? onTap;

  const CategoryCard({
    super.key,
    required this.category,
    required this.progress,
    required this.status,
    this.onTap,
  });

  @override
  State<CategoryCard> createState() => _CategoryCardState();
}

class _CategoryCardState extends State<CategoryCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _liftAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 120),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.97).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    _liftAnimation = Tween<double>(begin: 0.0, end: -4.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  static IconData _iconFor(String name) {
    switch (name) {
      case 'visibility':
        return Icons.visibility_rounded;
      case 'hearing':
        return Icons.hearing_rounded;
      case 'schedule':
        return Icons.schedule_rounded;
      case 'psychology':
        return Icons.psychology_rounded;
      case 'image':
        return Icons.image_rounded;
      case 'bolt':
        return Icons.bolt_rounded;
      case 'sports_esports':
        return Icons.sports_esports_rounded;
      case 'lightbulb':
        return Icons.lightbulb_rounded;
      case 'list_alt':
        return Icons.list_alt_rounded;
      case 'swap_horiz':
        return Icons.swap_horiz_rounded;
      case 'self_improvement':
        return Icons.self_improvement_rounded;
      case 'favorite':
        return Icons.favorite_rounded;
      default:
        return Icons.help_outline_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = Color(widget.category['color'] as int);
    final title = widget.category['title'] as String;
    final description = widget.category['description'] as String? ?? '';
    final emoji = widget.category['emoji'] as String? ?? '';
    final iconName = widget.category['icon'] as String? ?? '';
    final isLocked = widget.status == CategoryCardStatus.locked;
    final canTap = widget.onTap != null && !isLocked;

    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) => _controller.reverse(),
      onTapCancel: () => _controller.reverse(),
      onTap: canTap ? widget.onTap : null,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          final isPressed = _controller.value > 0 || _controller.isAnimating;
          return Transform.translate(
            offset: Offset(0, _liftAnimation.value),
            child: Transform.scale(
              scale: _scaleAnimation.value,
              child: Container(
                padding: EdgeInsets.all(14.w),
                decoration: BoxDecoration(
                  color: AssessmentCategoriesTheme.cardBg,
                  borderRadius: BorderRadius.circular(AssessmentCategoriesTheme.cardRadius),
                  border: Border.all(
                    color: _borderColor(color),
                    width: _borderWidth(),
                  ),
                  boxShadow: _boxShadows(isPressed, color),
                ),
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    if (isLocked) _buildLockOverlay(),
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Large playful icon + title + description
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            _buildIconArea(color, emoji, iconName),
                            SizedBox(height: 10.h),
                            Text(
                              title,
                              style: AppTypography.headingS(context).copyWith(
                                fontSize: 15.sp,
                                fontWeight: AppTypography.semiBold,
                                color: AssessmentCategoriesTheme.textPrimary,
                                height: 1.25,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (description.isNotEmpty) ...[
                              SizedBox(height: 4.h),
                              Text(
                                description,
                                style: TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 12.sp,
                                  color: AssessmentCategoriesTheme.textSecondary,
                                  height: 1.25,
                                ),
                                textAlign: TextAlign.center,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ],
                        ),
                        // Progress ring + status label
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            _buildProgressRing(color),
                            SizedBox(height: 6.h),
                            _StatusLabel(status: widget.status),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildIconArea(Color color, String emoji, String iconName) {
    return Container(
      width: 60.w,
      height: 60.w,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color.withOpacity(0.2),
            color.withOpacity(0.08),
          ],
        ),
        borderRadius: BorderRadius.circular(AssessmentCategoriesTheme.iconContainerRadius),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.15),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Center(
        child: emoji.isNotEmpty
            ? Text(emoji, style: TextStyle(fontSize: 32.sp))
            : Icon(
                _iconFor(iconName),
                size: 30.sp,
                color: color,
              ),
      ),
    );
  }

  Widget _buildProgressRing(Color color) {
    final value = widget.progress.clamp(0.0, 1.0);
    final size = AssessmentCategoriesTheme.progressRingSize;
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          SizedBox(
            width: size,
            height: size,
            child: CircularProgressIndicator(
              value: value,
              strokeWidth: 3.5.w,
              backgroundColor: AppColors.gray200,
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
          Text(
            '${(value * 100).toInt()}',
            style: TextStyle(
              fontFamily: AppTypography.numberFont,
              fontSize: 12.sp,
              fontWeight: AppTypography.semiBold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLockOverlay() {
    return Positioned.fill(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AssessmentCategoriesTheme.cardRadius),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.82),
          ),
          child: Center(
            child: Icon(
              Icons.lock_rounded,
              size: 36.sp,
              color: AssessmentCategoriesTheme.lockedMuted,
            ),
          ),
        ),
      ),
    );
  }

  List<BoxShadow> _boxShadows(bool isPressed, Color color) {
    final list = List<BoxShadow>.from(AssessmentCategoriesTheme.cardShadow(isPressed));
    if (_showGlow()) {
      list.add(
        BoxShadow(
          color: color.withOpacity(0.2),
          blurRadius: 14,
          spreadRadius: 0,
          offset: const Offset(0, 4),
        ),
      );
    }
    return list;
  }

  Color _borderColor(Color categoryColor) {
    switch (widget.status) {
      case CategoryCardStatus.completed:
        return AssessmentCategoriesTheme.success;
      case CategoryCardStatus.inProgress:
        return AssessmentCategoriesTheme.inProgress;
      case CategoryCardStatus.locked:
        return AssessmentCategoriesTheme.cardBorder;
      default:
        return AssessmentCategoriesTheme.cardBorder;
    }
  }

  double _borderWidth() {
    switch (widget.status) {
      case CategoryCardStatus.completed:
      case CategoryCardStatus.inProgress:
        return 2.0;
      default:
        return 1.0;
    }
  }

  bool _showGlow() {
    return widget.status == CategoryCardStatus.inProgress ||
        widget.status == CategoryCardStatus.completed;
  }
}

class _StatusLabel extends StatelessWidget {
  final CategoryCardStatus status;

  const _StatusLabel({required this.status});

  @override
  Widget build(BuildContext context) {
    String label;
    Color color;
    switch (status) {
      case CategoryCardStatus.completed:
        label = 'مكتمل';
        color = AssessmentCategoriesTheme.success;
        break;
      case CategoryCardStatus.inProgress:
        label = 'قيد التقدم';
        color = AssessmentCategoriesTheme.inProgress;
        break;
      case CategoryCardStatus.locked:
        label = 'مقفل';
        color = AssessmentCategoriesTheme.lockedMuted;
        break;
      default:
        label = 'جديد';
        color = AssessmentCategoriesTheme.newTest;
    }
    return Text(
      label,
      style: TextStyle(
        fontFamily: AppTypography.primaryFont,
        fontSize: 11.sp,
        fontWeight: AppTypography.semiBold,
        color: color,
      ),
    );
  }
}
