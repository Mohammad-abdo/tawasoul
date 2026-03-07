import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_navigation_bar.dart';
import '../../../core/widgets/child_profile_avatar_gateway.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/notifications_provider.dart';
import '../../shared/mock_content.dart';
import '../constants/account_theme.dart';
import '../widgets/profile_header.dart';
import '../widgets/profile_info_section.dart';
import '../widgets/package_card.dart';
import '../widgets/notification_item.dart';

/// Account/Profile – modern, elegant layout.
/// Profile header, info card, recommended packages slider, notifications, menu, logout.
/// State-driven; reusable components; does not break existing APIs.
class AccountScreen extends StatefulWidget {
  const AccountScreen({super.key});

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationsProvider>().loadNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    final packages = MockContent.packages;
    final childrenCount = MockContent.children.length;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              subtitle: 'أهلاً بك معانا',
              userName: 'سارة محمد علي',
              userImage: null,
              childAvatar: const ChildProfileAvatarGateway(),
              onNotificationTap: () => context.push('/notifications'),
              onProfileTap: () => context.push('/account/profile/update'),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 20.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    ProfileHeader(
                      name: 'سارة محمد علي',
                      imageUrl: null,
                      role: 'ولي أمر',
                      isPremium: false,
                      onEdit: () => context.push('/account/profile/update'),
                    ),
                    SizedBox(height: 20.h),
                    ProfileInfoSection(
                      email: 'sara@example.com',
                      phone: '+20 ١٢٣ ٤٥٦ ٧٨٩٠',
                      childrenCount: childrenCount > 0 ? childrenCount : 1,
                      accountCreatedAt: 'يناير ٢٠٢٤',
                    ),
                    SizedBox(height: 24.h),
                    _RecommendedPackagesSection(packages: packages),
                    SizedBox(height: 24.h),
                    _NotificationsSection(),
                    SizedBox(height: 24.h),
                    _MenuSection(context),
                    SizedBox(height: 24.h),
                    _LogoutButton(context),
                    SizedBox(height: 24.h),
                  ],
                ),
              ),
            ),
            AppNavigationBar(
              currentIndex: 4,
              onTap: (index) {
                switch (index) {
                  case 0:
                    context.push('/home');
                    break;
                  case 1:
                    context.push('/appointments');
                    break;
                  case 2:
                    context.push('/assessments/categories?childId=mock_child_1');
                    break;
                  case 3:
                    context.push('/chat');
                    break;
                  case 4:
                    break;
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _RecommendedPackagesSection extends StatelessWidget {
  final List<dynamic> packages;

  const _RecommendedPackagesSection({required this.packages});

  @override
  Widget build(BuildContext context) {
    if (packages.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          textDirection: TextDirection.rtl,
          children: [
            Text(
              'موصى بها لك',
              style: AppTypography.headingM(context).copyWith(
                fontSize: 18.sp,
                fontWeight: AppTypography.bold,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.right,
            ),
            TextButton(
              onPressed: () => context.push('/packages/list'),
              child: Text(
                'عرض الكل',
                style: AppTypography.bodyMedium(context).copyWith(
                  color: AppColors.primary,
                  fontWeight: AppTypography.semiBold,
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: 12.h),
        SizedBox(
          height: 220.h,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            reverse: true,
            padding: EdgeInsets.symmetric(vertical: 8.h),
            itemCount: packages.length,
            separatorBuilder: (_, __) => SizedBox(width: 16.w),
            itemBuilder: (context, index) {
              final pkg = packages[index] as Map<String, dynamic>;
              final isRecommended = pkg['isPopular'] == true;
              return PackageCard(
                package: pkg,
                isRecommended: isRecommended,
              );
            },
          ),
        ),
      ],
    );
  }
}

class _NotificationsSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<NotificationsProvider>(
      builder: (context, np, _) {
        final list = np.notifications.take(5).toList();
        final unreadCount = np.unreadCount;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              textDirection: TextDirection.rtl,
              children: [
                Text(
                  'الإشعارات',
                  style: AppTypography.headingM(context).copyWith(
                    fontSize: 18.sp,
                    fontWeight: AppTypography.bold,
                    color: AppColors.textPrimary,
                  ),
                  textAlign: TextAlign.right,
                ),
                if (unreadCount > 0)
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(AccountTheme.badgeRadius),
                    ),
                    child: Text(
                      '$unreadCount غير مقروء',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12.sp,
                        fontWeight: AppTypography.semiBold,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                TextButton(
                  onPressed: () => context.push('/notifications'),
                  child: Text(
                    'عرض الكل',
                    style: AppTypography.bodyMedium(context).copyWith(
                      color: AppColors.primary,
                      fontWeight: AppTypography.semiBold,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 12.h),
            if (list.isEmpty)
              Container(
                padding: EdgeInsets.all(24.w),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(AccountTheme.cardRadius),
                  border: Border.all(color: AccountTheme.cardBorder),
                ),
                child: Column(
                  children: [
                    Icon(Icons.notifications_none_rounded, size: 48.sp, color: AppColors.textTertiary),
                    SizedBox(height: 12.h),
                    Text(
                      'لا توجد إشعارات',
                      style: AppTypography.bodyMedium(context).copyWith(color: AppColors.textSecondary),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: list.length,
                separatorBuilder: (_, __) => SizedBox(height: 10.h),
                itemBuilder: (context, index) {
                  final n = list[index];
                  final title = n['title']?.toString() ?? '';
                  final message = n['message']?.toString() ?? '';
                  final time = n['time']?.toString() ?? '';
                  final isUnread = n['read'] != true && n['isRead'] != true;
                  final type = (n['type'] ?? n['category'] ?? '').toString().toLowerCase();
                  IconData icon = Icons.notifications_rounded;
                  Color iconColor = AppColors.primary;
                  if (type.contains('appointment') || type.contains('booking')) {
                    icon = Icons.calendar_today_rounded;
                    iconColor = AppColors.primary;
                  } else if (type.contains('assessment') || type.contains('test')) {
                    icon = Icons.quiz_rounded;
                    iconColor = AppColors.success;
                  } else if (type.contains('message') || type.contains('chat')) {
                    icon = Icons.chat_bubble_rounded;
                    iconColor = AppColors.info;
                  }
                  return NotificationItem(
                    icon: icon,
                    iconColor: iconColor,
                    title: title,
                    description: message,
                    timestamp: time,
                    isUnread: isUnread,
                    onTap: () => context.push('/notifications'),
                  );
                },
              ),
          ],
        );
      },
    );
  }
}

Widget _MenuSection(BuildContext context) {
  final menuItems = [
    {'icon': Icons.person_outline_rounded, 'title': 'الملف الشخصي', 'route': '/account/profile/update'},
    {'icon': Icons.card_giftcard_rounded, 'title': 'الباقات', 'route': '/packages/list'},
    {'icon': Icons.shopping_bag_rounded, 'title': 'المنتجات', 'route': '/products'},
    {'icon': Icons.shopping_cart_rounded, 'title': 'سلة المشتريات', 'route': '/cart'},
    {'icon': Icons.receipt_long_rounded, 'title': 'الطلبات', 'route': '/orders'},
    {'icon': Icons.favorite_rounded, 'title': 'المفضلة', 'route': '/favorites'},
    {'icon': Icons.history_rounded, 'title': 'السجل', 'route': '/history'},
    {'icon': Icons.location_on_rounded, 'title': 'العناوين', 'route': '/addresses'},
    {'icon': Icons.notifications_rounded, 'title': 'الإشعارات', 'route': '/notifications'},
    {'icon': Icons.help_outline_rounded, 'title': 'الأسئلة الشائعة', 'route': '/account/faq'},
    {'icon': Icons.headset_mic_rounded, 'title': 'الدعم الفني', 'route': '/account/support'},
    {'icon': Icons.privacy_tip_rounded, 'title': 'سياسة الخصوصية', 'route': '/account/privacy'},
  ];

  return Container(
    decoration: BoxDecoration(
      color: AppColors.white,
      borderRadius: BorderRadius.circular(AccountTheme.cardRadius),
      border: Border.all(color: AccountTheme.cardBorder),
      boxShadow: AccountTheme.cardShadow,
    ),
    child: Column(
      children: [
        for (int i = 0; i < menuItems.length; i++) ...[
          _MenuItem(
            icon: menuItems[i]['icon'] as IconData,
            title: menuItems[i]['title'] as String,
            onTap: () => context.push(menuItems[i]['route'] as String),
          ),
          if (i < menuItems.length - 1)
            Divider(height: 1, color: AccountTheme.cardBorder, indent: 56.w),
        ],
      ],
    ),
  );
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: AccountTheme.cardRadius > 0
          ? BorderRadius.circular(AccountTheme.cardRadius)
          : null,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
        child: Row(
          textDirection: TextDirection.rtl,
          children: [
            Icon(AppIcons.arrowBack, size: 20.sp, color: AppColors.textTertiary),
            SizedBox(width: 16.w),
            Expanded(
              child: Text(
                title,
                style: AppTypography.bodyLarge(context).copyWith(
                  color: AppColors.textPrimary,
                ),
                textAlign: TextAlign.right,
              ),
            ),
            SizedBox(width: 16.w),
            Container(
              width: 40.w,
              height: 40.w,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12.r),
              ),
              child: Icon(icon, size: 20.sp, color: AppColors.primary),
            ),
          ],
        ),
      ),
    );
  }
}

Widget _LogoutButton(BuildContext context) {
  return SizedBox(
    width: double.infinity,
    height: 52.h,
    child: OutlinedButton.icon(
      onPressed: () async {
        await context.read<AuthProvider>().logout();
        if (context.mounted) context.go('/login');
      },
      icon: Icon(Icons.logout_rounded, size: 20.sp, color: AppColors.error),
      label: Text(
        'تسجيل الخروج',
        style: AppTypography.bodyLarge(context).copyWith(
          color: AppColors.error,
          fontWeight: AppTypography.semiBold,
        ),
      ),
      style: OutlinedButton.styleFrom(
        side: const BorderSide(color: AppColors.error, width: 2),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AccountTheme.cardRadius),
        ),
      ),
    ),
  );
}
