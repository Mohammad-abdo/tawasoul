import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';
import '../utils/phone_formatter.dart';
import 'api_service.dart';

class AuthService {
  final SharedPreferences prefs;
  final ApiService apiService;
  
  AuthService(this.prefs) : apiService = ApiService();
  
  Future<Map<String, dynamic>> sendOtp({
    required String fullName,
    required String phone,
    required String relationType,
    required bool agreedToTerms,
  }) async {
    // Format phone number (remove spaces, ensure proper format)
    final formattedPhone = PhoneFormatter.digitsOnly(phone);
    
    return await apiService.post(
      AppConfig.sendOtpEndpoint,
      {
        'fullName': fullName,
        'phone': formattedPhone,
        'relationType': relationType,
        'agreedToTerms': agreedToTerms,
      },
    );
  }
  
  Future<Map<String, dynamic>> verifyOtp({
    required String phone,
    required String otp,
  }) async {
    // Format phone number
    final formattedPhone = PhoneFormatter.digitsOnly(phone);
    
    final response = await apiService.post(
      AppConfig.verifyOtpEndpoint,
      {
        'phone': formattedPhone,
        'otp': otp,
      },
    );
    
    if (response['success'] == true && response['data'] != null) {
      await saveAuthData(response['data']);
    }
    
    return response;
  }
  
  Future<Map<String, dynamic>> resendOtp(String phone) async {
    final formattedPhone = PhoneFormatter.digitsOnly(phone);
    return await apiService.post(
      AppConfig.resendOtpEndpoint,
      {'phone': formattedPhone},
    );
  }

  /// POST /user/auth/logout (Postman 1.4). Clears local auth regardless of response.
  Future<void> logout() async {
    final token = getToken();
    if (token != null) {
      try {
        await apiService.post(AppConfig.logoutEndpoint, {}, token: token);
      } catch (_) {}
    }
    await clearAuthData();
  }

  /// GET /user/auth/me (Postman 1.5). Refreshes user from backend.
  Future<Map<String, dynamic>?> getMe() async {
    final token = getToken();
    if (token == null) return null;
    try {
      final res = await apiService.get(AppConfig.getMeEndpoint, token: token);
      if (res['success'] == true && res['data'] != null) {
        final user = res['data'] is Map ? res['data'] as Map<String, dynamic> : (res['data'] as Map)['user'] as Map<String, dynamic>?;
        if (user != null) {
          await prefs.setString(AppConfig.keyUserData, jsonEncode(user));
          return user;
        }
      }
    } catch (_) {}
    return null;
  }

  /// PUT /user/auth/profile (Postman 1.6).
  Future<Map<String, dynamic>> updateProfile({
    String? fullName,
    String? email,
  }) async {
    final token = getToken();
    if (token == null) throw Exception('Not authenticated');
    final body = <String, dynamic>{};
    if (fullName != null) body['fullName'] = fullName;
    if (email != null) body['email'] = email;
    final res = await apiService.put(AppConfig.updateProfileEndpoint, body, token: token);
    if (res['success'] == true && res['data'] != null) {
      final user = res['data'] is Map ? res['data'] as Map<String, dynamic> : (res['data'] as Map)['user'] as Map<String, dynamic>?;
      if (user != null) await prefs.setString(AppConfig.keyUserData, jsonEncode(user));
    }
    return res;
  }

  Future<void> saveAuthData(Map<String, dynamic> data) async {
    if (data['token'] != null) {
      await prefs.setString(AppConfig.keyAuthToken, data['token']);
    }
    if (data['user'] != null) {
      await prefs.setString(AppConfig.keyUserData, jsonEncode(data['user']));
    }
  }
  
  Future<void> clearAuthData() async {
    await prefs.remove(AppConfig.keyAuthToken);
    await prefs.remove(AppConfig.keyUserData);
  }
  
  /// Save token directly (for mock authentication)
  Future<void> saveToken(String token) async {
    await prefs.setString(AppConfig.keyAuthToken, token);
  }
  
  /// Clear token (for logout)
  Future<void> clearToken() async {
    await prefs.remove(AppConfig.keyAuthToken);
  }
  
  bool isLoggedIn() {
    return prefs.getString(AppConfig.keyAuthToken) != null;
  }
  
  String? getToken() {
    return prefs.getString(AppConfig.keyAuthToken);
  }
  
  Map<String, dynamic>? getUser() {
    final userJson = prefs.getString(AppConfig.keyUserData);
    if (userJson != null) {
      return jsonDecode(userJson) as Map<String, dynamic>;
    }
    return null;
  }
}

