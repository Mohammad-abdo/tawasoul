import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../widgets/mahara_background.dart';
import '../models/activity_model.dart';
import '../constants/mahara_colors.dart';

/// Matching Activity Screen
/// Left: images, Right: sound icons
/// Tap-to-match interaction with clear visual feedback
class MatchingScreen extends StatefulWidget {
  final MaharaActivity activity;

  const MatchingScreen({super.key, required this.activity});

  @override
  State<MatchingScreen> createState() => _MatchingScreenState();
}

class _MatchingScreenState extends State<MatchingScreen> {
  String? _selectedLeftId;
  String? _selectedRightId;
  final Map<String, String> _matchedPairs = {};
  final Map<String, bool> _lockedItems = {};

  void _handleLeftTap(String itemId) {
    if (_lockedItems[itemId] == true) return;

    setState(() {
      if (_selectedLeftId == itemId) {
        _selectedLeftId = null;
      } else {
        _selectedLeftId = itemId;
        _selectedRightId = null;
      }
    });
  }

  void _handleRightTap(String rightId) {
    if (_lockedItems[rightId] == true) return;

    setState(() {
      if (_selectedRightId == rightId) {
        _selectedRightId = null;
      } else {
        _selectedRightId = rightId;
        if (_selectedLeftId != null) {
          _attemptMatch(_selectedLeftId!, rightId);
        }
      }
    });
  }

  void _attemptMatch(String leftId, String rightId) {
    // Simple matching logic - adjust based on your needs
    final isCorrect = leftId == rightId;

    if (isCorrect) {
      setState(() {
        _matchedPairs[leftId] = rightId;
        _lockedItems[leftId] = true;
        _lockedItems[rightId] = true;
        _selectedLeftId = null;
        _selectedRightId = null;
      });
      _showSuccessAnimation();
      
      // Check if all items are matched
      final allMatched = widget.activity.matchingItems?.every(
        (item) => _lockedItems[item.id] == true,
      ) ?? false;
      if (allMatched) {
        widget.activity.onComplete?.call(true);
      }
    } else {
      _showSnapBackAnimation();
      widget.activity.onComplete?.call(false);
    }
  }

  void _showSuccessAnimation() {
    // Visual feedback handled by locked state styling
  }

  void _showSnapBackAnimation() {
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {
        setState(() {
          _selectedLeftId = null;
          _selectedRightId = null;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final items = widget.activity.matchingItems ?? [];

    return MaharaBackground(
      child: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 30.w, vertical: 50.h),
          child: Row(
            children: [
              // Left side - images (minimum 140x140px)
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: items.map((item) {
                    final isSelected = _selectedLeftId == item.id;
                    final isLocked = _lockedItems[item.id] == true;

                    return Padding(
                      padding: EdgeInsets.only(bottom: 24.h),
                      child: Semantics(
                        label: 'Image option',
                        button: true,
                        child: GestureDetector(
                          onTap: () => _handleLeftTap(item.id),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 250),
                            width: 140.w,
                            height: 140.w,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(24.r),
                              border: Border.all(
                                color: isSelected
                                    ? MaharaColors.primary
                                    : Colors.transparent,
                                width: isSelected ? 5 : 0,
                              ),
                              boxShadow: isLocked
                                  ? [
                                      BoxShadow(
                                        color: MaharaColors.success.withOpacity(0.35),
                                        blurRadius: 24,
                                        spreadRadius: 3,
                                        offset: const Offset(0, 4),
                                      ),
                                    ]
                                  : [
                                      BoxShadow(
                                        color: MaharaColors.shadowLight,
                                        blurRadius: 12,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(24.r),
                              child: Image.network(
                                item.imageUrl,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    color: MaharaColors.gray100,
                                    child: Icon(
                                      Icons.image_outlined,
                                      size: 50.sp,
                                      color: MaharaColors.gray400,
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              SizedBox(width: 40.w),
              // Right side - sound icons (minimum 140x140px)
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: items.map((item) {
                    final isSelected = _selectedRightId == item.id;
                    final isLocked = _lockedItems[item.id] == true;

                    return Padding(
                      padding: EdgeInsets.only(bottom: 24.h),
                      child: Semantics(
                        label: 'Sound option',
                        button: true,
                        child: GestureDetector(
                          onTap: () => _handleRightTap(item.id),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 250),
                            width: 140.w,
                            height: 140.w,
                            decoration: BoxDecoration(
                              color: MaharaColors.primary,
                              borderRadius: BorderRadius.circular(24.r),
                              border: Border.all(
                                color: isSelected
                                    ? Colors.white
                                    : Colors.transparent,
                                width: isSelected ? 5 : 0,
                              ),
                              boxShadow: isLocked
                                  ? [
                                      BoxShadow(
                                        color: MaharaColors.success.withOpacity(0.35),
                                        blurRadius: 24,
                                        spreadRadius: 3,
                                        offset: const Offset(0, 4),
                                      ),
                                    ]
                                  : [
                                      BoxShadow(
                                        color: MaharaColors.shadowLight,
                                        blurRadius: 12,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                            ),
                            child: Icon(
                              Icons.volume_up_rounded,
                              size: 64.sp,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
