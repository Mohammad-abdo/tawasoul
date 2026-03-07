import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';
import '../../features/shared/mock_content.dart';

/// Notifications Provider - NOW USING MOCK DATA
/// No backend connection required
class NotificationsProvider extends ChangeNotifier {
  final AuthService _authService;

  NotificationsProvider(this._authService);

  bool _isLoading = false;
  String? _error;
  List<Map<String, dynamic>> _notifications = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Map<String, dynamic>> get notifications => _notifications;
  int get unreadCount =>
      _notifications.where((n) => n['read'] != true && n['isRead'] != true).length;

  /// MOCK - Load notifications from static data
  Future<bool> loadNotifications({
    bool? read,
    int page = 1,
  }) async {
    final token = _authService.getToken();
    if (token == null) return false;
    
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 400));

      // Get notifications from mock data
      var notificationsList = List<Map<String, dynamic>>.from(
        MockContent.notifications.map((e) => Map<String, dynamic>.from(e))
      );

      // Filter by read status if specified
      if (read != null) {
        notificationsList = notificationsList.where((n) {
          final isRead = n['read'] == true || n['isRead'] == true;
          return isRead == read;
        }).toList();
      }

      _notifications = notificationsList;
      _error = null;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// MOCK - Mark notification as read
  Future<bool> markAsRead(String id) async {
    final token = _authService.getToken();
    if (token == null) return false;
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 200));

      final idx = _notifications.indexWhere((n) => '${n['id']}' == id);
      if (idx >= 0) {
        _notifications[idx]['read'] = true;
        _notifications[idx]['isRead'] = true;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error marking notification as read: $e');
      return false;
    }
  }

  /// MOCK - Mark all as read
  Future<bool> markAllAsRead() async {
    final token = _authService.getToken();
    if (token == null) return false;
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 300));

      for (var notification in _notifications) {
        notification['read'] = true;
        notification['isRead'] = true;
      }
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Error marking all notifications as read: $e');
      return false;
    }
  }
}
