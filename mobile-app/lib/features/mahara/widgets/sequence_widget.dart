import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../models/activity.dart';
import '../providers/mahara_provider.dart';
import '../../../core/services/auth_service.dart';

class SequenceWidget extends StatefulWidget {
  final Activity activity;
  final String childId;

  const SequenceWidget({
    super.key,
    required this.activity,
    required this.childId,
  });

  @override
  State<SequenceWidget> createState() => _SequenceWidgetState();
}


class _SequenceWidgetState extends State<SequenceWidget> {
  late List<ActivityImage> _shuffledImages;

  @override
  void initState() {
    super.initState();
    _shuffledImages = List.from(widget.activity.images)..shuffle();
  }

  void _onReorder(int oldIndex, int newIndex) {
    setState(() {
      if (newIndex > oldIndex) {
        newIndex -= 1;
      }
      final item = _shuffledImages.removeAt(oldIndex);
      _shuffledImages.insert(newIndex, item);
    });
  }

  void _checkSequence() async {
    final activity = widget.activity;
    final currentOrderIds = _shuffledImages.map((img) => img.id).toList();
    
    // The correct order is defined in activity.sequenceItems
    final correctOrderIds = List<ActivitySequenceItem>.from(activity.sequenceItems)
      ..sort((a, b) => a.position.compareTo(b.position));
    
    final correctIds = correctOrderIds.map((item) => item.imageId).toList();

    bool isCorrect = true;
    if (currentOrderIds.length != correctIds.length) {
      isCorrect = false;
    } else {
      for (int i = 0; i < currentOrderIds.length; i++) {
        if (currentOrderIds[i] != correctIds[i]) {
          isCorrect = false;
          break;
        }
      }
    }

    if (isCorrect) {
      final provider = context.read<MaharaProvider>();
      final authService = context.read<AuthService>();
      final token = authService.getToken() ?? '';
      
      await provider.submitInteraction(
        childId: widget.childId,

        token: token,
        sequence: currentOrderIds,
      );
    } else {
      // Wrong order - reset to shuffle
      setState(() {
        _shuffledImages.shuffle();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('حاول مرة أخرى! ترتیب غير صحيح')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(height: 40.h),
        const Text(
          'رتب الصور بالتسلسل الصحيح',
          style: TextStyle(
            fontFamily: 'MadaniArabic',
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 10.h),
        const Text(
          'اسحب الصور لتحريكها',
          style: TextStyle(
            fontFamily: 'MadaniArabic',
            fontSize: 14,
            color: Colors.grey,
          ),
        ),
        const Spacer(),
        SizedBox(
          height: 160.h,
          child: ReorderableListView(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.symmetric(horizontal: 20.w),
            children: _shuffledImages.map((image) {
              return Padding(
                key: ValueKey(image.id),
                padding: EdgeInsets.symmetric(horizontal: 8.w),
                child: Container(
                  width: 120.w,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16.r),
                    border: Border.all(color: Colors.blue, width: 2),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(14.r),
                    child: Image.network(
                      image.url,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              );
            }).toList(),
            onReorder: _onReorder,
          ),
        ),
        const Spacer(),
        Padding(
          padding: EdgeInsets.all(40.h),
          child: ElevatedButton(
            onPressed: _checkSequence,
            style: ElevatedButton.styleFrom(
              minimumSize: Size(double.infinity, 50.h),
              backgroundColor: Colors.green,
            ),
            child: const Text(
              'تحقق من الترتيب',
              style: TextStyle(color: Colors.white, fontSize: 18),
            ),
          ),
        ),
      ],
    );
  }
}
