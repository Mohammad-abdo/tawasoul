import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../widgets/mahara_background.dart';
import '../models/activity_model.dart';
import '../constants/mahara_colors.dart';

/// Sequence/Order Activity Screen
/// Draggable image cards with clear drop zones
/// Visual feedback for correct/incorrect order
class SequenceScreen extends StatefulWidget {
  final MaharaActivity activity;

  const SequenceScreen({super.key, required this.activity});

  @override
  State<SequenceScreen> createState() => _SequenceScreenState();
}

class _SequenceScreenState extends State<SequenceScreen> {
  final List<String> _currentOrder = [];
  final List<String> _dropZones = [];
  bool _isComplete = false;

  @override
  void initState() {
    super.initState();
    final items = widget.activity.sequenceItems ?? [];
    _dropZones.addAll(List.generate(items.length, (index) => ''));
    _initializeItems();
  }

  void _initializeItems() {
    final items = widget.activity.sequenceItems ?? [];
    final itemIds = items.map((item) => item.id).toList()..shuffle();
    setState(() {
      _currentOrder.clear();
      _currentOrder.addAll(itemIds);
    });
  }

  void _handleItemTap(int sourceIndex) {
    if (_isComplete) return;

    final itemId = _currentOrder[sourceIndex];
    if (itemId.isEmpty) return;

    // Find first empty drop zone
    final emptyIndex = _dropZones.indexWhere((zone) => zone.isEmpty);
    if (emptyIndex == -1) return;

    setState(() {
      _dropZones[emptyIndex] = itemId;
      _currentOrder[sourceIndex] = '';
    });

    _checkSequence();
  }

  void _checkSequence() {
    final correctSequence = widget.activity.correctSequence ?? [];
    if (_dropZones.length != correctSequence.length) return;

    // Check if all zones are filled
    final allFilled = _dropZones.every((zone) => zone.isNotEmpty);
    if (!allFilled) return;

    bool isCorrect = true;
    for (int i = 0; i < _dropZones.length; i++) {
      if (_dropZones[i] != correctSequence[i]) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      setState(() => _isComplete = true);
      _showCelebrationAnimation();
      widget.activity.onComplete?.call(true);
    } else {
      // Soft reset for wrong sequence
      Future.delayed(const Duration(milliseconds: 1000), () {
        if (mounted && !_isComplete) {
          _resetSequence();
          widget.activity.onComplete?.call(false);
        }
      });
    }
  }

  void _showCelebrationAnimation() {
    // Visual celebration feedback
  }

  void _resetSequence() {
    setState(() {
      _isComplete = false;
      _dropZones.clear();
      _dropZones.addAll(
        List.generate(
          widget.activity.sequenceItems?.length ?? 0,
          (index) => '',
        ),
      );
    });
    _initializeItems();
  }

  @override
  Widget build(BuildContext context) {
    final items = widget.activity.sequenceItems ?? [];

    return MaharaBackground(
      child: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 30.w, vertical: 40.h),
          child: Column(
            children: [
              // Drop zones (ordered) - Large, clear
              Expanded(
                flex: 2,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: List.generate(_dropZones.length, (index) {
                    final itemId = _dropZones[index];
                    final item = items.firstWhere(
                      (it) => it.id == itemId,
                      orElse: () => ActivityItem(
                        id: '',
                        imageUrl: '',
                      ),
                    );

                    return Expanded(
                      child: Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8.w),
                        child: Container(
                          height: 160.w,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(24.r),
                            border: Border.all(
                              color: MaharaColors.primary,
                              width: 4,
                              style: BorderStyle.solid,
                            ),
                            color: itemId.isEmpty
                                ? Colors.transparent
                                : MaharaColors.backgroundCard,
                          ),
                          child: itemId.isEmpty
                              ? null
                              : ClipRRect(
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
                    );
                  }),
                ),
              ),
              SizedBox(height: 40.h),
              // Draggable items (unordered) - Large tap targets
              Expanded(
                flex: 3,
                child: Wrap(
                  spacing: 20.w,
                  runSpacing: 20.h,
                  alignment: WrapAlignment.center,
                  children: List.generate(_currentOrder.length, (index) {
                    final itemId = _currentOrder[index];
                    if (itemId.isEmpty) {
                      return SizedBox(width: 120.w, height: 120.w);
                    }

                    final item = items.firstWhere(
                      (it) => it.id == itemId,
                    );

                    return Semantics(
                      label: 'Drag item ${index + 1}',
                      button: true,
                      child: GestureDetector(
                        onTap: () => _handleItemTap(index),
                        child: Container(
                          width: 120.w,
                          height: 120.w,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(24.r),
                            boxShadow: [
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
                    );
                  }),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
