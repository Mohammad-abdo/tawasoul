import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_navigation_bar.dart';
import '../../../core/widgets/child_profile_avatar_gateway.dart';
import '../../../core/widgets/toast_helper.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../data/messages_data.dart';
import '../constants/chat_colors.dart';

/// Redesigned Messages page: filters, search, modern cards, swipe actions, empty state.
/// Keeps existing navigation to /chat/conversation/:id and message data shape.
class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  List<Map<String, dynamic>> _messages = [];
  MessageFilter _filter = MessageFilter.all;
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocus = FocusNode();

  @override
  void initState() {
    super.initState();
    _messages = List.from(getDefaultMessages());
    _searchController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocus.dispose();
    super.dispose();
  }

  String get _searchQuery => _searchController.text.trim();

  List<Map<String, dynamic>> _getFilteredMessages() {
    var list = _messages.where((m) {
      switch (_filter) {
        case MessageFilter.all:
          break;
        case MessageFilter.unread:
          if ((m['unreadCount'] as int) <= 0) return false;
          break;
        case MessageFilter.parents:
          if ((m['role'] as String?) != 'parent') return false;
          break;
        case MessageFilter.doctors:
          if ((m['role'] as String?) != 'doctor') return false;
          break;
        case MessageFilter.system:
          if ((m['role'] as String?) != 'system') return false;
          break;
      }
      return true;
    }).toList();

    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      list = list.where((m) {
        final name = (m['name'] as String? ?? '').toLowerCase();
        final msg = (m['lastMessage'] as String? ?? '').toLowerCase();
        return name.contains(q) || msg.contains(q);
      }).toList();
    }
    return list;
  }

  void _markAsRead(Map<String, dynamic> message) {
    setState(() {
      final i = _messages.indexWhere((m) => m['id'] == message['id']);
      if (i >= 0) _messages[i] = Map.from(_messages[i])..['unreadCount'] = 0;
    });
    ToastHelper.success(context, 'تم تحديد كمقروء');
  }

  void _archiveMessage(Map<String, dynamic> message) {
    setState(() => _messages.removeWhere((m) => m['id'] == message['id']));
    ToastHelper.show(context, message: 'تم أرشفة المحادثة');
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _getFilteredMessages();

    return Scaffold(
      backgroundColor: ChatColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'الرسائل',
              childAvatar: const ChildProfileAvatarGateway(),
              leading: IconButton(
                icon: Icon(AppIcons.arrowBack, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: CustomScrollView(
                slivers: [
                  SliverPersistentHeader(
                    pinned: true,
                    delegate: _StickyFilterDelegate(
                      searchController: _searchController,
                      searchFocus: _searchFocus,
                      filter: _filter,
                      onFilterChanged: (f) => setState(() => _filter = f),
                    ),
                  ),
                  if (filtered.isEmpty)
                    SliverFillRemaining(
                      child: _EmptyMessagesState(
                        hasSearch: _searchQuery.isNotEmpty,
                        onClearSearch: () {
                          _searchController.clear();
                          setState(() {});
                        },
                      ),
                    )
                  else
                    SliverPadding(
                      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final message = filtered[index];
                            return Padding(
                              padding: EdgeInsets.only(bottom: 10.h),
                              child: _MessageCard(
                                message: message,
                                onTap: () => context.push('/chat/conversation/${message['id']}'),
                                onMarkRead: () => _markAsRead(message),
                                onArchive: () => _archiveMessage(message),
                              ),
                            );
                          },
                          childCount: filtered.length,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            AppNavigationBar(
              currentIndex: 3,
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
                    break;
                  case 4:
                    context.push('/account');
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

class _StickyFilterDelegate extends SliverPersistentHeaderDelegate {
  final TextEditingController searchController;
  final FocusNode searchFocus;
  final MessageFilter filter;
  final ValueChanged<MessageFilter> onFilterChanged;

  _StickyFilterDelegate({
    required this.searchController,
    required this.searchFocus,
    required this.filter,
    required this.onFilterChanged,
  });

  static const double _headerHeight = 130.0;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return SizedBox(
      height: _headerHeight,
      child: Container(
        color: ChatColors.background,
        padding: EdgeInsets.fromLTRB(16.w, 6.h, 16.w, 8.h),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Search
            TextField(
              controller: searchController,
              focusNode: searchFocus,
              textDirection: TextDirection.rtl,
              decoration: InputDecoration(
                hintText: 'بحث في الرسائل...',
                hintStyle: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 14.sp,
                  color: ChatColors.textTertiary,
                ),
                prefixIcon: Icon(Icons.search_rounded, size: 22.sp, color: ChatColors.textTertiary),
                suffixIcon: searchController.text.isNotEmpty
                    ? IconButton(
                        icon: Icon(Icons.clear_rounded, size: 20.sp, color: ChatColors.textTertiary),
                        onPressed: () => searchController.clear(),
                      )
                    : null,
                filled: true,
                fillColor: ChatColors.cardBg,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14.r),
                  borderSide: BorderSide(color: ChatColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14.r),
                  borderSide: BorderSide(color: ChatColors.border),
                ),
                contentPadding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
              ),
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 14.sp,
                color: ChatColors.textPrimary,
              ),
            ),
            SizedBox(height: 8.h),
            // Filter chips
            SizedBox(
              height: 34.h,
              child: ListView(
              scrollDirection: Axis.horizontal,
              reverse: true,
              children: MessageFilter.values.map((f) {
                final isSelected = filter == f;
                return Padding(
                  padding: EdgeInsets.only(left: 8.w),
                  child: FilterChip(
                    label: Text(
                      f.label,
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12.sp,
                        fontWeight: isSelected ? AppTypography.semiBold : AppTypography.regular,
                      ),
                    ),
                    selected: isSelected,
                    onSelected: (_) => onFilterChanged(f),
                    backgroundColor: ChatColors.cardBg,
                    selectedColor: ChatColors.primary,
                    checkmarkColor: Colors.white,
                    showCheckmark: true,
                    side: BorderSide(
                      color: isSelected ? ChatColors.primary : ChatColors.border,
                      width: isSelected ? 1.5 : 1,
                    ),
                    padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
      ),
    );
  }

  @override
  double get minExtent => _headerHeight;

  @override
  double get maxExtent => _headerHeight;

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) => true;
}

class _MessageCard extends StatelessWidget {
  final Map<String, dynamic> message;
  final VoidCallback onTap;
  final VoidCallback onMarkRead;
  final VoidCallback onArchive;

  const _MessageCard({
    required this.message,
    required this.onTap,
    required this.onMarkRead,
    required this.onArchive,
  });

  bool get _isUnread => (message['unreadCount'] as int) > 0;
  String get _role => message['role'] as String? ?? 'doctor';

  (Color bg, Color badgeBg, String label) _roleStyle() {
    switch (_role) {
      case 'parent':
        return (ChatColors.parentSoft, ChatColors.parentBadge, 'ولي أمر');
      case 'system':
        return (ChatColors.systemSoft, ChatColors.systemBadge, 'النظام');
      default:
        return (ChatColors.doctorSoft, ChatColors.doctorBadge, 'طبيب');
    }
  }

  @override
  Widget build(BuildContext context) {
    final (_, badgeBg, roleLabel) = _roleStyle();
    final imageUrl = message['imageUrl'] as String? ?? '';
    final isSystem = _role == 'system';

    return Dismissible(
      key: ValueKey(message['id']),
      direction: DismissDirection.horizontal,
      background: Container(
        alignment: Alignment.centerRight,
        padding: EdgeInsets.only(right: 20.w),
        decoration: BoxDecoration(
          color: ChatColors.doctorSoft,
          borderRadius: BorderRadius.circular(16.r),
        ),
        child: Icon(Icons.done_all_rounded, color: ChatColors.doctorBadge, size: 24.sp),
      ),
      secondaryBackground: Container(
        alignment: Alignment.centerLeft,
        padding: EdgeInsets.only(left: 20.w),
        decoration: BoxDecoration(
          color: ChatColors.primarySoft,
          borderRadius: BorderRadius.circular(16.r),
        ),
        child: Icon(Icons.archive_rounded, color: ChatColors.primary, size: 24.sp),
      ),
      confirmDismiss: (direction) async {
        if (direction == DismissDirection.endToStart) {
          onArchive();
          return true;
        }
        if (direction == DismissDirection.startToEnd) {
          onMarkRead();
        }
        return false;
      },
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16.r),
          splashColor: ChatColors.primary.withOpacity(0.08),
          highlightColor: ChatColors.primary.withOpacity(0.04),
          child: Container(
            padding: EdgeInsets.all(14.w),
            decoration: BoxDecoration(
              color: _isUnread ? ChatColors.cardBgUnread : ChatColors.cardBg,
              borderRadius: BorderRadius.circular(16.r),
              border: Border.all(
                color: _isUnread ? ChatColors.primary.withOpacity(0.2) : ChatColors.border,
                width: _isUnread ? 1.5 : 1,
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
              textDirection: TextDirection.rtl,
              children: [
                // Avatar (right in RTL)
                _Avatar(
                  imageUrl: imageUrl,
                  isSystem: isSystem,
                  isOnline: message['isOnline'] as bool? ?? false,
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Flexible(
                                  child: Text(
                                    message['name'] as String? ?? '',
                                    style: AppTypography.headingS(context).copyWith(
                                      fontSize: 15.sp,
                                      fontWeight: _isUnread ? AppTypography.semiBold : AppTypography.medium,
                                      color: ChatColors.textPrimary,
                                    ),
                                    textAlign: TextAlign.right,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                SizedBox(width: 6.w),
                                Container(
                                  padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                                  decoration: BoxDecoration(
                                    color: badgeBg.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(8.r),
                                  ),
                                  child: Text(
                                    roleLabel,
                                    style: TextStyle(
                                      fontFamily: AppTypography.primaryFont,
                                      fontSize: 10.sp,
                                      fontWeight: AppTypography.semiBold,
                                      color: badgeBg,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(width: 8.w),
                          Text(
                            message['time'] as String? ?? '',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 11.sp,
                              color: ChatColors.textTertiary,
                            ),
                          ),
                          if (_isUnread) ...[
                            SizedBox(width: 6.w),
                            Container(
                              width: 8.w,
                              height: 8.w,
                              decoration: const BoxDecoration(
                                color: ChatColors.unreadDot,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ],
                        ],
                      ),
                      SizedBox(height: 6.h),
                      Text(
                        message['lastMessage'] as String? ?? '',
                        style: AppTypography.bodyMedium(context).copyWith(
                          fontSize: 13.sp,
                          color: _isUnread ? ChatColors.textSecondary : ChatColors.textTertiary,
                          fontWeight: _isUnread ? AppTypography.medium : AppTypography.regular,
                          height: 1.35,
                        ),
                        textAlign: TextAlign.right,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  final String imageUrl;
  final bool isSystem;
  final bool isOnline;

  const _Avatar({
    required this.imageUrl,
    required this.isSystem,
    required this.isOnline,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          width: 52.w,
          height: 52.w,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: ChatColors.separator,
            border: Border.all(color: ChatColors.border),
          ),
          child: ClipOval(
            child: isSystem || imageUrl.isEmpty
                ? Icon(
                    isSystem ? Icons.notifications_active_rounded : Icons.person_rounded,
                    size: 26.sp,
                    color: ChatColors.textTertiary,
                  )
                : Image.network(
                    imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Icon(
                      Icons.person_rounded,
                      size: 26.sp,
                      color: ChatColors.textTertiary,
                    ),
                  ),
          ),
        ),
        if (isOnline && !isSystem)
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              width: 14.w,
              height: 14.w,
              decoration: BoxDecoration(
                color: ChatColors.unreadDot,
                shape: BoxShape.circle,
                border: Border.all(color: ChatColors.cardBg, width: 2),
              ),
            ),
          ),
      ],
    );
  }
}

class _EmptyMessagesState extends StatelessWidget {
  final bool hasSearch;
  final VoidCallback onClearSearch;

  const _EmptyMessagesState({
    required this.hasSearch,
    required this.onClearSearch,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(32.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              hasSearch ? Icons.search_off_rounded : Icons.chat_bubble_outline_rounded,
              size: 80.sp,
              color: ChatColors.textTertiary.withOpacity(0.6),
            ),
            SizedBox(height: 20.h),
            Text(
              hasSearch ? 'لا توجد رسائل تطابق البحث' : 'لا توجد رسائل بعد',
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 16.sp,
                color: ChatColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            if (hasSearch) ...[
              SizedBox(height: 16.h),
              TextButton.icon(
                onPressed: onClearSearch,
                icon: Icon(Icons.clear_rounded, size: 18.sp, color: ChatColors.primary),
                label: Text(
                  'مسح البحث',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 14.sp,
                    color: ChatColors.primary,
                    fontWeight: AppTypography.semiBold,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
