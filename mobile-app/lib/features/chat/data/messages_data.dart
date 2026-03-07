/// Message/chat list data and filter types.
/// Keeps existing message structure; adds role for Parents / Doctors / System.
/// Used for state-driven filters and real-time search.

enum MessageFilter {
  all,
  unread,
  parents,
  doctors,
  system,
}

extension MessageFilterX on MessageFilter {
  String get label {
    switch (this) {
      case MessageFilter.all:
        return 'الكل';
      case MessageFilter.unread:
        return 'غير مقروءة';
      case MessageFilter.parents:
        return 'أولياء الأمور';
      case MessageFilter.doctors:
        return 'أطباء';
      case MessageFilter.system:
        return 'النظام';
    }
  }

  String get iconKey {
    switch (this) {
      case MessageFilter.all:
        return 'all';
      case MessageFilter.unread:
        return 'unread';
      case MessageFilter.parents:
        return 'parent';
      case MessageFilter.doctors:
        return 'doctor';
      case MessageFilter.system:
        return 'system';
    }
  }
}

/// Role of the sender for badge and filtering.
enum MessageRole {
  parent,
  doctor,
  system,
}

extension MessageRoleX on MessageRole {
  String get label {
    switch (this) {
      case MessageRole.parent:
        return 'ولي أمر';
      case MessageRole.doctor:
        return 'طبيب';
      case MessageRole.system:
        return 'النظام';
    }
  }
}

/// Raw chat/message item (same shape as before + role).
/// Existing APIs can keep id, name, lastMessage, time, unreadCount, imageUrl, isOnline.
Map<String, dynamic> messageItem({
  required String id,
  required String name,
  required String lastMessage,
  required String time,
  required int unreadCount,
  required String imageUrl,
  required bool isOnline,
  required String role,
}) {
  return {
    'id': id,
    'name': name,
    'lastMessage': lastMessage,
    'time': time,
    'unreadCount': unreadCount,
    'imageUrl': imageUrl,
    'isOnline': isOnline,
    'role': role,
  };
}

/// Default mock list: doctors, parents, system. Same structure as before.
List<Map<String, dynamic>> getDefaultMessages() {
  return [
    messageItem(
      id: 'doc_1',
      name: 'د/ سارة أحمد',
      lastMessage: 'كيف حال الطفل اليوم؟ نود متابعة الجلسة القادمة.',
      time: 'منذ دقيقتين',
      unreadCount: 2,
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?w=800',
      isOnline: true,
      role: 'doctor',
    ),
    messageItem(
      id: 'doc_2',
      name: 'د/ محمود علي',
      lastMessage: 'تم إرسال التقرير الأسبوعي.',
      time: 'منذ ساعة',
      unreadCount: 0,
      imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800',
      isOnline: false,
      role: 'doctor',
    ),
    messageItem(
      id: 'parent_1',
      name: 'أحمد والد عمر',
      lastMessage: 'هل يمكن تأجيل الموعد إلى يوم الخميس؟',
      time: 'أمس',
      unreadCount: 1,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      isOnline: true,
      role: 'parent',
    ),
    messageItem(
      id: 'parent_2',
      name: 'فاطمة والدة نورة',
      lastMessage: 'شكراً على التقرير المفصل.',
      time: 'منذ يومين',
      unreadCount: 0,
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
      isOnline: false,
      role: 'parent',
    ),
    messageItem(
      id: 'sys_1',
      name: 'إشعارات النظام',
      lastMessage: 'تم تأكيد حجز موعدك يوم الأحد ١٠ صباحاً.',
      time: 'منذ ٣ ساعات',
      unreadCount: 1,
      imageUrl: '',
      isOnline: false,
      role: 'system',
    ),
    messageItem(
      id: 'doc_3',
      name: 'د/ فاطمة حسن',
      lastMessage: 'شكراً لك على المتابعة المستمرة.',
      time: 'منذ 3 ساعات',
      unreadCount: 0,
      imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800',
      isOnline: true,
      role: 'doctor',
    ),
  ];
}
