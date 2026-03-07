import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService;
  
  AuthProvider(this._authService);
  
  bool _isLoading = false;
  String? _error;
  bool _isAuthenticated = false;
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _isAuthenticated;
  
  /// MOCK - Send OTP (Registration) - No backend required
  Future<bool> sendOtp({
    required String fullName,
    required String phone,
    required String relationType,
    required bool agreedToTerms,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 800));
      
      // Mock: Always succeed if valid data
      if (fullName.isNotEmpty && phone.length >= 11 && agreedToTerms) {
        _isLoading = false;
        notifyListeners();
        return true;
      }
      
      _error = 'يرجى التحقق من البيانات المدخلة';
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  /// MOCK - Verify OTP - No backend required
  Future<bool> verifyOtp({
    required String phone,
    required String otp,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 800));
      
      // Mock: Accept any 4-digit OTP
      if (otp.length == 4) {
        // Save mock auth data
        await _authService.saveAuthData({
          'token': 'MOCK_OTP_${DateTime.now().millisecondsSinceEpoch}',
          'user': {
            'id': 'mock_user_otp',
            'name': 'مستخدم جديد',
            'phone': phone,
            'role': 'PARENT',
          },
        });
        
        _isAuthenticated = true;
        _isLoading = false;
        notifyListeners();
        return true;
      }
      
      _error = 'رمز التحقق غير صحيح';
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  /// MOCK - Resend OTP - No backend required
  Future<bool> resendOtp(String phone) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 500));
      
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
  
  void clearError() {
    _error = null;
    notifyListeners();
  }

  /// Login with email or phone + password. For existing users.
  Future<bool> login({
    required String identifier,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await Future.delayed(const Duration(milliseconds: 800));
      await _authService.saveAuthData({
        'token': 'MOCK_LOGIN_${DateTime.now().millisecondsSinceEpoch}',
        'user': {
          'id': 'mock_user_login',
          'name': 'مستخدم',
          'phone': identifier,
          'role': 'PARENT',
        },
      });
      _isAuthenticated = true;
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

  /// Logout (Postman 1.4). Calls backend then clears local.
  Future<void> logout() async {
    await _authService.logout();
    _isAuthenticated = false;
    _error = null;
    notifyListeners();
  }

  /// Current user from storage. Use refreshUser() to sync from backend (Postman 1.5).
  Map<String, dynamic>? get user => _authService.getUser();

  /// GET /user/auth/me — refresh user from backend.
  Future<void> refreshUser() async {
    final u = await _authService.getMe();
    if (u != null) notifyListeners();
  }

  /// PUT /user/auth/profile (Postman 1.6).
  Future<bool> updateProfile({String? fullName, String? email}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await _authService.updateProfile(fullName: fullName, email: email);
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
}

