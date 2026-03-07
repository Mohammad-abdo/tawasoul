import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';
import '../../features/shared/mock_content.dart';

/// Doctors Provider - NOW USING MOCK DATA
/// No backend connection required
class DoctorsProvider extends ChangeNotifier {
  final AuthService _authService;

  DoctorsProvider(this._authService);

  bool _isLoading = false;
  String? _error;
  List<Map<String, dynamic>> _doctors = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Map<String, dynamic>> get doctors => _doctors;

  /// MOCK - Load doctors from static data
  Future<bool> loadDoctors({
    String? recommendedForChildId,
    int page = 1,
    int limit = 20,
    String? search,
    String? specialty,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final token = _authService.getToken();
      if (token == null) {
        _error = 'Not authenticated';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 500));

      // Get doctors from mock data
      var doctorsList = List<Map<String, dynamic>>.from(
        MockContent.doctors.map((e) => Map<String, dynamic>.from(e))
      );

      // Apply search filter
      if (search != null && search.trim().isNotEmpty) {
        final searchLower = search.toLowerCase();
        doctorsList = doctorsList.where((doc) {
          final name = (doc['name'] ?? '').toString().toLowerCase();
          final spec = (doc['specialty'] ?? '').toString().toLowerCase();
          return name.contains(searchLower) || spec.contains(searchLower);
        }).toList();
      }

      // Apply specialty filter
      if (specialty != null && specialty.trim().isNotEmpty) {
        doctorsList = doctorsList.where((doc) {
          final docSpec = (doc['specialty'] ?? '').toString();
          return docSpec.contains(specialty);
        }).toList();
      }

      // Apply pagination
      final startIndex = (page - 1) * limit;
      final endIndex = startIndex + limit;

      if (startIndex < doctorsList.length) {
        _doctors = doctorsList.sublist(
          startIndex,
          endIndex > doctorsList.length ? doctorsList.length : endIndex,
        );
      } else {
        _doctors = [];
      }

      _error = null;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _doctors = [];
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void clearDoctors() {
    _doctors = [];
    _error = null;
    notifyListeners();
  }

  /// MOCK - Get doctor by ID
  Future<Map<String, dynamic>?> getDoctorById(String doctorId) async {
    final token = _authService.getToken();
    if (token == null) return null;
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 300));
      
      final doctor = MockContent.doctors.firstWhere(
        (d) => d['id'] == doctorId,
        orElse: () => {},
      );
      
      if (doctor.isNotEmpty) {
        return Map<String, dynamic>.from(doctor);
      }
    } catch (_) {}
    return null;
  }

  /// MOCK - Get available slots
  Future<List<Map<String, dynamic>>> getAvailableSlots({
    required String doctorId,
    required String date,
  }) async {
    final token = _authService.getToken();
    if (token == null) return [];
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 400));
      
      // Find doctor in mock data
      final doctor = MockContent.doctors.firstWhere(
        (d) => d['id'] == doctorId,
        orElse: () => {},
      );
      
      if (doctor.isNotEmpty && doctor['availableSlots'] != null) {
        final slots = doctor['availableSlots'] as List;
        return slots.map((e) => Map<String, dynamic>.from(e as Map)).toList();
      }
    } catch (_) {}
    return [];
  }
}
