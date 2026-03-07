import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';
import '../../features/shared/mock_content.dart';

/// Bookings/Appointments - NOW USING MOCK DATA
/// No backend connection required
class BookingsProvider extends ChangeNotifier {
  final AuthService _authService;

  BookingsProvider(this._authService);

  bool _isLoading = false;
  String? _error;
  List<Map<String, dynamic>> _bookings = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Map<String, dynamic>> get bookings => _bookings;

  /// MOCK - Load bookings from static data
  Future<bool> loadBookings({
    String? status,
    int page = 1,
    int limit = 20,
  }) async {
    final token = _authService.getToken();
    if (token == null) return false;
    
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Get appointments from mock data
      var appointments = List<Map<String, dynamic>>.from(
        MockContent.appointments.map((e) => Map<String, dynamic>.from(e))
      );
      
      // Filter by status if provided
      if (status != null && status.isNotEmpty) {
        appointments = appointments
            .where((a) => a['status']?.toString().toUpperCase() == status.toUpperCase())
            .toList();
      }
      
      // Apply pagination (simple implementation)
      final startIndex = (page - 1) * limit;
      final endIndex = startIndex + limit;
      
      if (startIndex < appointments.length) {
        _bookings = appointments.sublist(
          startIndex,
          endIndex > appointments.length ? appointments.length : endIndex,
        );
      } else {
        _bookings = [];
      }
      
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

  /// MOCK - Get booking by ID
  Future<Map<String, dynamic>?> getBookingById(String id) async {
    final token = _authService.getToken();
    if (token == null) return null;
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 300));
      
      // Find in mock data
      final appointment = MockContent.appointments.firstWhere(
        (a) => a['id'] == id,
        orElse: () => {},
      );
      
      if (appointment.isNotEmpty) {
        return Map<String, dynamic>.from(appointment);
      }
    } catch (_) {}
    return null;
  }

  /// MOCK - Book new appointment
  Future<Map<String, dynamic>?> bookAppointment({
    required String doctorId,
    required String childId,
    required String date,
    required String startTime,
    String? endTime,
    String? sessionType,
    String? notes,
  }) async {
    final token = _authService.getToken();
    if (token == null) return null;
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 800));
      
      // Create mock booking
      final newBooking = {
        'id': 'booking_${DateTime.now().millisecondsSinceEpoch}',
        'status': 'PENDING',
        'date': date,
        'time': startTime,
        'dateDisplay': '$date • $startTime',
        'title': 'جلسة جديدة',
        'type': sessionType ?? 'فيديو',
        'doctorId': doctorId,
        'childId': childId,
        'notes': notes ?? '',
      };
      
      _bookings.insert(0, newBooking);
      notifyListeners();
      return newBooking;
    } catch (_) {}
    return null;
  }

  /// MOCK - Cancel booking
  Future<bool> cancelBooking(String id, {String? reason}) async {
    final token = _authService.getToken();
    if (token == null) return false;
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 500));
      
      final idx = _bookings.indexWhere((b) => b['id'] == id);
      if (idx >= 0) {
        _bookings[idx]['status'] = 'CANCELLED';
        if (reason != null) {
          _bookings[idx]['cancelReason'] = reason;
        }
        notifyListeners();
        return true;
      }
    } catch (_) {}
    return false;
  }

  /// MOCK - Reschedule booking
  Future<bool> rescheduleBooking(
    String id, {
    required String newDate,
    required String newStartTime,
    String? newEndTime,
  }) async {
    final token = _authService.getToken();
    if (token == null) return false;
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 600));
      
      final idx = _bookings.indexWhere((b) => b['id'] == id);
      if (idx >= 0) {
        _bookings[idx]['date'] = newDate;
        _bookings[idx]['time'] = newStartTime;
        _bookings[idx]['dateDisplay'] = '$newDate • $newStartTime';
        notifyListeners();
        return true;
      }
    } catch (_) {}
    return false;
  }
}
