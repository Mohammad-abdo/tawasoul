import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import 'package:go_router/go_router.dart';

/// Complete Video Session Screen
/// Video call interface
/// Chat sidebar
/// Send tests during session
class SessionScreen extends StatefulWidget {
  final String appointmentId;

  const SessionScreen({
    super.key,
    required this.appointmentId,
  });

  @override
  State<SessionScreen> createState() => _SessionScreenState();
}

class _SessionScreenState extends State<SessionScreen> {
  bool _isChatOpen = false;
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _chatScrollController = ScrollController();
  
  // Mock chat messages
  final List<Map<String, dynamic>> _messages = [
    {
      'id': 'msg_1',
      'text': 'مرحباً، كيف حال الطفل اليوم؟',
      'isDoctor': true,
      'time': '10:05',
    },
    {
      'id': 'msg_2',
      'text': 'الحمد لله، حالته جيدة',
      'isDoctor': false,
      'time': '10:06',
    },
  ];

  // Mock available tests
  final List<Map<String, dynamic>> _availableTests = [
    {
      'id': 'test_1',
      'title': 'اختبار التمييز السمعي',
      'category': 'تمييز الأصوات',
      'icon': Icons.volume_up_rounded,
    },
    {
      'id': 'test_2',
      'title': 'اختبار النطق',
      'category': 'النطق والتكرار',
      'icon': Icons.mic_rounded,
    },
    {
      'id': 'test_3',
      'title': 'ربط الصورة بالصوت',
      'category': 'ربط الصورة بالصوت',
      'icon': Icons.image_rounded,
    },
  ];

  @override
  void dispose() {
    _messageController.dispose();
    _chatScrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;
    
    setState(() {
      _messages.add({
        'id': 'msg_${_messages.length + 1}',
        'text': _messageController.text.trim(),
        'isDoctor': false,
        'time': DateTime.now().toString().substring(11, 16),
      });
    });
    
    _messageController.clear();
    
    // Scroll to bottom
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_chatScrollController.hasClients) {
        _chatScrollController.animateTo(
          _chatScrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _sendTest(Map<String, dynamic> test) {
    setState(() {
      _messages.add({
        'id': 'test_${_messages.length + 1}',
        'text': 'تم إرسال اختبار: ${test['title']}',
        'isDoctor': true,
        'time': DateTime.now().toString().substring(11, 16),
        'isTest': true,
        'testId': test['id'],
        'testTitle': test['title'],
      });
    });
    
    // Show dialog to start test
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.r),
        ),
        title: Text(
          'اختبار جديد',
          style: AppTypography.headingM(context),
          textAlign: TextAlign.right,
        ),
        content: Text(
          'تم إرسال اختبار "${test['title']}" من الطبيب. هل تريد البدء الآن؟',
          style: AppTypography.bodyMedium(context),
          textAlign: TextAlign.right,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'لاحقاً',
              style: AppTypography.bodyMedium(context).copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to test
              context.push('/assessments/test/${test['id']}?childId=mock_child_1&fromSession=true');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
            ),
            child: Text(
              'ابدأ الآن',
              style: AppTypography.bodyMedium(context).copyWith(
                color: AppColors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            // Video Area
            _buildVideoArea(),
            // Top Controls
            _buildTopControls(context),
            // Bottom Controls
            _buildBottomControls(context),
            // Chat Sidebar
            if (_isChatOpen) _buildChatSidebar(context),
          ],
        ),
      ),
    );
  }

  Widget _buildVideoArea() {
    return Container(
      width: double.infinity,
      height: double.infinity,
      color: Colors.black,
      child: Stack(
        children: [
          // Remote Video (Doctor)
          Center(
            child: Container(
              width: double.infinity,
              height: double.infinity,
              color: AppColors.gray800,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.videocam_rounded,
                    size: 80.sp,
                    color: AppColors.white.withOpacity(0.5),
                  ),
                  SizedBox(height: 16.h),
                  Text(
                    'د/ سارة أحمد',
                    style: AppTypography.headingM(context).copyWith(
                      color: AppColors.white,
                    ),
                  ),
                  SizedBox(height: 8.h),
                  Text(
                    'جاري الاتصال...',
                    style: AppTypography.bodyMedium(context).copyWith(
                      color: AppColors.white.withOpacity(0.7),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Local Video (User) - Picture in Picture
          Positioned(
            top: 80.h,
            left: 20.w,
            child: Container(
              width: 120.w,
              height: 160.h,
              decoration: BoxDecoration(
                color: AppColors.gray700,
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(color: AppColors.white, width: 2),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.person_rounded,
                    size: 40.sp,
                    color: AppColors.white.withOpacity(0.7),
                  ),
                  SizedBox(height: 8.h),
                  Text(
                    'أنت',
                    style: AppTypography.bodySmall(context).copyWith(
                      color: AppColors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopControls(BuildContext context) {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.black.withOpacity(0.7),
              Colors.transparent,
            ],
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            IconButton(
              icon: Icon(
                Icons.close_rounded,
                size: 28.sp,
                color: AppColors.white,
              ),
              onPressed: () => context.pop(),
            ),
            Text(
              'جلسة فيديو',
              style: AppTypography.headingS(context).copyWith(
                color: AppColors.white,
              ),
            ),
            IconButton(
              icon: Icon(
                _isChatOpen ? Icons.chat_bubble_rounded : Icons.chat_bubble_outline_rounded,
                size: 28.sp,
                color: AppColors.white,
              ),
              onPressed: () {
                setState(() {
                  _isChatOpen = !_isChatOpen;
                });
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomControls(BuildContext context) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: EdgeInsets.all(20.w),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.bottomCenter,
            end: Alignment.topCenter,
            colors: [
              Colors.black.withOpacity(0.8),
              Colors.transparent,
            ],
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildControlButton(
              icon: Icons.mic_off_rounded,
              label: 'كتم',
              onTap: () {},
            ),
            _buildControlButton(
              icon: Icons.videocam_off_rounded,
              label: 'إيقاف',
              onTap: () {},
            ),
            _buildControlButton(
              icon: Icons.quiz_rounded,
              label: 'اختبار',
              onTap: () => _showTestsDialog(context),
              color: AppColors.primary,
            ),
            _buildControlButton(
              icon: Icons.call_end_rounded,
              label: 'إنهاء',
              onTap: () => context.pop(),
              color: AppColors.error,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    Color? color,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 56.w,
            height: 56.w,
            decoration: BoxDecoration(
              color: color ?? AppColors.white.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              size: 28.sp,
              color: AppColors.white,
            ),
          ),
          SizedBox(height: 4.h),
          Text(
            label,
            style: AppTypography.bodySmall(context).copyWith(
              color: AppColors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChatSidebar(BuildContext context) {
    return Positioned(
      right: 0,
      top: 0,
      bottom: 0,
      child: Container(
        width: 320.w,
        decoration: BoxDecoration(
          color: AppColors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 10,
              offset: const Offset(-2, 0),
            ),
          ],
        ),
        child: Column(
          children: [
            // Chat Header
            Container(
              padding: EdgeInsets.all(16.w),
              decoration: BoxDecoration(
                color: AppColors.primary,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 4,
                  ),
                ],
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(
                      Icons.close_rounded,
                      size: 24.sp,
                      color: AppColors.white,
                    ),
                    onPressed: () {
                      setState(() {
                        _isChatOpen = false;
                      });
                    },
                  ),
                  Expanded(
                    child: Text(
                      'المحادثة',
                      style: AppTypography.headingS(context).copyWith(
                        color: AppColors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  SizedBox(width: 48.w),
                ],
              ),
            ),
            // Messages
            Expanded(
              child: ListView.builder(
                controller: _chatScrollController,
                padding: EdgeInsets.all(16.w),
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  final message = _messages[index];
                  return _buildMessageBubble(context, message);
                },
              ),
            ),
            // Input Area
            Container(
              padding: EdgeInsets.all(16.w),
              decoration: BoxDecoration(
                color: AppColors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 4,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(
                      Icons.attach_file_rounded,
                      size: 24.sp,
                      color: AppColors.textSecondary,
                    ),
                    onPressed: () {},
                  ),
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'اكتب رسالة...',
                        hintStyle: AppTypography.bodyMedium(context).copyWith(
                          color: AppColors.textTertiary,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24.r),
                          borderSide: BorderSide(color: AppColors.border),
                        ),
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 16.w,
                          vertical: 12.h,
                        ),
                      ),
                      textDirection: TextDirection.rtl,
                      maxLines: null,
                    ),
                  ),
                  SizedBox(width: 8.w),
                  IconButton(
                    icon: Icon(
                      Icons.send_rounded,
                      size: 24.sp,
                      color: AppColors.primary,
                    ),
                    onPressed: _sendMessage,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(BuildContext context, Map<String, dynamic> message) {
    final isDoctor = message['isDoctor'] as bool;
    final isTest = message['isTest'] == true;
    
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Row(
        mainAxisAlignment: isDoctor ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isDoctor) ...[
            Container(
              width: 32.w,
              height: 32.w,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.person_rounded,
                size: 18.sp,
                color: AppColors.primary,
              ),
            ),
            SizedBox(width: 8.w),
          ],
          Flexible(
            child: Container(
              padding: EdgeInsets.all(12.w),
              decoration: BoxDecoration(
                color: isDoctor
                    ? AppColors.primary
                    : AppColors.gray100,
                borderRadius: BorderRadius.only(
                  topRight: Radius.circular(16.r),
                  topLeft: Radius.circular(16.r),
                  bottomRight: Radius.circular(isDoctor ? 4.r : 16.r),
                  bottomLeft: Radius.circular(isDoctor ? 16.r : 4.r),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (isTest) ...[
                    Container(
                      padding: EdgeInsets.all(8.w),
                      decoration: BoxDecoration(
                        color: AppColors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8.r),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.quiz_rounded,
                            size: 16.sp,
                            color: AppColors.white,
                          ),
                          SizedBox(width: 4.w),
                          Text(
                            message['testTitle'] as String,
                            style: AppTypography.bodySmall(context).copyWith(
                              color: AppColors.white,
                              fontWeight: AppTypography.semiBold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 8.h),
                  ],
                  Text(
                    message['text'] as String,
                    style: AppTypography.bodyMedium(context).copyWith(
                      color: isDoctor ? AppColors.white : AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.right,
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    message['time'] as String,
                    style: AppTypography.bodySmall(context).copyWith(
                      color: isDoctor
                          ? AppColors.white.withOpacity(0.7)
                          : AppColors.textTertiary,
                      fontSize: 10.sp,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isDoctor) ...[
            SizedBox(width: 8.w),
            Container(
              width: 32.w,
              height: 32.w,
              decoration: BoxDecoration(
                color: AppColors.success.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.person_rounded,
                size: 18.sp,
                color: AppColors.success,
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _showTestsDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
      ),
      builder: (context) => Container(
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              'إرسال اختبار',
              style: AppTypography.headingM(context),
              textAlign: TextAlign.right,
            ),
            SizedBox(height: 8.h),
            Text(
              'اختر اختباراً لإرساله للطفل خلال الجلسة',
              style: AppTypography.bodyMedium(context).copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.right,
            ),
            SizedBox(height: 24.h),
            ..._availableTests.map((test) {
              return Padding(
                padding: EdgeInsets.only(bottom: 12.h),
                child: GestureDetector(
                  onTap: () {
                    Navigator.pop(context);
                    _sendTest(test);
                  },
                  child: Container(
                    padding: EdgeInsets.all(16.w),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(16.r),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: EdgeInsets.all(12.w),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                          child: Icon(
                            test['icon'] as IconData,
                            size: 24.sp,
                            color: AppColors.primary,
                          ),
                        ),
                        SizedBox(width: 16.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                test['title'] as String,
                                style: AppTypography.headingS(context),
                                textAlign: TextAlign.right,
                              ),
                              SizedBox(height: 4.h),
                              Text(
                                test['category'] as String,
                                style: AppTypography.bodySmall(context).copyWith(
                                  color: AppColors.textSecondary,
                                ),
                                textAlign: TextAlign.right,
                              ),
                            ],
                          ),
                        ),
                        SizedBox(width: 12.w),
                        Icon(
                          Icons.arrow_back_ios_rounded,
                          size: 20.sp,
                          color: AppColors.textTertiary,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
            SizedBox(height: 24.h),
          ],
        ),
      ),
    );
  }
}
