import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/toast_helper.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../../core/providers/notifications_provider.dart';
import '../../../core/services/notification_sound_service.dart';

/// Notifications from API (Postman §8). Loads via NotificationsProvider.
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationsProvider>().loadNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<NotificationsProvider>(
      builder: (context, np, _) {
        final list = np.notifications.map((n) {
          final type = (n['type'] ?? n['category'] ?? '').toString().toLowerCase();
          IconData icon = Icons.notifications_rounded;
          Color color = AppColors.primary;
          if (type.contains('appointment') || type.contains('booking')) {
            icon = Icons.calendar_today_rounded;
            color = AppColors.primary;
          } else if (type.contains('assessment') || type.contains('test')) {
            icon = Icons.quiz_rounded;
            color = AppColors.success;
          } else if (type.contains('message') || type.contains('chat')) {
            icon = Icons.chat_bubble_rounded;
            color = AppColors.info;
          } else if (type.contains('order')) {
            icon = Icons.shopping_bag_rounded;
            color = AppColors.warning;
          }
          return <String, dynamic>{
            ...n,
            'title': n['title'] ?? n['message'] ?? '',
            'message': n['message'] ?? n['body'] ?? n['content'] ?? '',
            'isRead': n['read'] == true || n['isRead'] == true,
            'time': n['createdAt'] ?? n['time'] ?? '',
            'icon': icon,
            'color': color,
          };
        }).toList();
        final unreadCount = np.unreadCount;

        return Scaffold(
          backgroundColor: AppColors.background,
          body: SafeArea(
            child: Column(
              children: [
                AppHeader(
                  title: 'الإشعارات',
                  leading: IconButton(
                    icon: Icon(
                      AppIcons.arrowBack,
                      size: 24.sp,
                      color: AppColors.textPrimary,
                    ),
                    onPressed: () => context.pop(),
                  ),
                  actions: [
                    Builder(
                      builder: (context) {
                        final soundService = context.read<NotificationSoundService>();
                        final isMuted = soundService.isMuted;
                        return IconButton(
                          icon: Icon(
                            isMuted ? Icons.volume_off_rounded : Icons.volume_up_rounded,
                            size: 24.sp,
                            color: AppColors.textPrimary,
                          ),
                          tooltip: isMuted ? 'تشغيل صوت الإشعارات' : 'كتم صوت الإشعارات',
                          onPressed: () async {
                            await soundService.setMuted(!isMuted);
                            if (context.mounted) setState(() {});
                            if (context.mounted) {
                              ToastHelper.show(
                                context,
                                message: isMuted ? 'تم تشغيل صوت الإشعارات' : 'تم كتم صوت الإشعارات',
                                success: true,
                              );
                            }
                          },
                        );
                      },
                    ),
                    if (unreadCount > 0)
                      TextButton(
                        onPressed: () async {
                          final ok = await np.markAllAsRead();
                          if (context.mounted && ok) {
                            ToastHelper.success(context, 'تم تحديد الكل كمقروء');
                          }
                        },
                        child: Text(
                          'جعل الكل مقروء',
                          style: AppTypography.bodyMedium(context).copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                  ],
                ),
                if (unreadCount > 0)
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
                    padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12.r),
                      border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(8.r),
                          ),
                          child: Text(
                            '$unreadCount',
                            style: AppTypography.bodySmall(context).copyWith(
                              color: AppColors.white,
                              fontWeight: AppTypography.semiBold,
                            ),
                          ),
                        ),
                        Text(
                          'إشعارات غير مقروءة',
                          style: AppTypography.bodyMedium(context).copyWith(
                            color: AppColors.primary,
                            fontWeight: AppTypography.semiBold,
                          ),
                        ),
                      ],
                    ),
                  ),
                Expanded(
                  child: np.isLoading && list.isEmpty
                      ? const Center(child: CircularProgressIndicator())
                      : list.isEmpty
                          ? _buildEmptyState(context)
                          : ListView.builder(
                              padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
                              itemCount: list.length,
                              itemBuilder: (context, index) {
                                final n = list[index];
                                return Padding(
                                  padding: EdgeInsets.only(bottom: 12.h),
                                  child: _buildNotificationCard(context, n, np),
                                );
                              },
                            ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_none_rounded,
            size: 80.sp,
            color: AppColors.gray300,
          ),
          SizedBox(height: 16.h),
          Text(
            'لا توجد إشعارات',
            style: AppTypography.headingM(context).copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(
    BuildContext context,
    Map<String, dynamic> notification,
    NotificationsProvider np,
  ) {
    final isRead = notification['isRead'] as bool? ?? false;
    final icon = notification['icon'] as IconData? ?? Icons.notifications_rounded;
    final color = notification['color'] as Color? ?? AppColors.primary;
    final id = '${notification['id']}';

    return GestureDetector(
      onTap: () async {
        if (!isRead) await np.markAsRead(id);
        if (context.mounted) context.push('/notifications/$id');
      },
      child: Container(
        padding: EdgeInsets.all(20.w),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(
            color: isRead ? AppColors.border : color.withOpacity(0.3),
            width: isRead ? 1 : 2,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                if (!isRead)
                  Container(
                    width: 8.w,
                    height: 8.w,
                    margin: EdgeInsets.only(bottom: 4.h),
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                    ),
                  )
                else
                  SizedBox(height: 12.h),
                Text(
                  (notification['time'] as String?) ?? '',
                  style: AppTypography.bodySmall(context).copyWith(
                    color: AppColors.textTertiary,
                  ),
                ),
              ],
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    (notification['title'] as String?) ?? '',
                    style: AppTypography.headingS(context).copyWith(
                      fontWeight: isRead ? AppTypography.regular : AppTypography.semiBold,
                    ),
                    textAlign: TextAlign.right,
                  ),
                  SizedBox(height: 6.h),
                  Text(
                    (notification['message'] as String?) ?? '',
                    style: AppTypography.bodyMedium(context).copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.right,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            SizedBox(width: 16.w),
            Container(
              width: 48.w,
              height: 48.w,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12.r),
              ),
              child: Icon(icon, size: 24.sp, color: color),
            ),
          ],
        ),
      ),
    );
  }
}
