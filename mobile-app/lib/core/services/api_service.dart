import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import '../config/app_config.dart';

class ApiService {
  final String baseUrl = AppConfig.baseUrl;
  
  Future<Map<String, dynamic>> get(String endpoint, {String? token}) async {
    try {
      final headers = <String, String>{
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
      
      final url = '$baseUrl$endpoint';
      if (kDebugMode) {
        print('📤 API Request: GET $url');
      }
      
      final response = await http.get(
        Uri.parse(url),
        headers: headers,
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Connection timeout - Server did not respond in 30 seconds');
        },
      );
      
      if (kDebugMode) {
        print('📥 API Response: ${response.statusCode}');
        print('📥 Response Body: ${response.body}');
      }
      
      return _handleResponse(response);
    } on http.ClientException catch (e) {
      if (kDebugMode) {
        print('❌ Network Error: ${e.message}');
      }
      throw Exception('Network error: ${e.message}. Check if server is running at $baseUrl');
    } on Exception catch (e) {
      if (kDebugMode) {
        print('❌ Exception: ${e.toString()}');
      }
      rethrow;
    } catch (e) {
      if (kDebugMode) {
        print('❌ Unknown Error: $e');
      }
      throw Exception('Network error: $e');
    }
  }
  
  Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> data, {
    String? token,
  }) async {
    try {
      final headers = <String, String>{
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
      
      final url = '$baseUrl$endpoint';
      if (kDebugMode) {
        print('📤 API Request: POST $url');
        print('📤 Request Body: ${jsonEncode(data)}');
      }
      
      final response = await http.post(
        Uri.parse(url),
        headers: headers,
        body: jsonEncode(data),
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw Exception('Connection timeout - Server did not respond in 30 seconds');
        },
      );
      
      if (kDebugMode) {
        print('📥 API Response: ${response.statusCode}');
        print('📥 Response Body: ${response.body}');
      }
      
      return _handleResponse(response);
    } on http.ClientException catch (e) {
      if (kDebugMode) {
        print('❌ Network Error: ${e.message}');
      }
      throw Exception('Network error: ${e.message}. Check if server is running at $baseUrl');
    } on Exception catch (e) {
      if (kDebugMode) {
        print('❌ Exception: ${e.toString()}');
      }
      rethrow;
    } catch (e) {
      if (kDebugMode) {
        print('❌ Unknown Error: $e');
      }
      throw Exception('Network error: $e');
    }
  }
  
  Future<Map<String, dynamic>> put(
    String endpoint,
    Map<String, dynamic> data, {
    String? token,
  }) async {
    try {
      final headers = <String, String>{
        'Content-Type': 'application/json',
      };
      
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
      
      final response = await http.put(
        Uri.parse('$baseUrl$endpoint'),
        headers: headers,
        body: jsonEncode(data),
      );
      
      return _handleResponse(response);
    } on Exception {
      rethrow;
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
  
  Future<Map<String, dynamic>> delete(String endpoint, {String? token}) async {
    try {
      final headers = <String, String>{
        'Content-Type': 'application/json',
      };
      
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
      
      final response = await http.delete(
        Uri.parse('$baseUrl$endpoint'),
        headers: headers,
      );
      
      return _handleResponse(response);
    } on Exception {
      rethrow;
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
  
  Map<String, dynamic> _handleResponse(http.Response response) {
    final statusCode = response.statusCode;
    
    // Handle empty response
    if (response.body.isEmpty) {
      if (statusCode >= 200 && statusCode < 300) {
        return {'success': true, 'data': null};
      } else {
        throw Exception('Request failed with status: $statusCode');
      }
    }
    
    try {
      final responseBody = jsonDecode(response.body) as Map<String, dynamic>;
      
      if (statusCode >= 200 && statusCode < 300) {
        return responseBody;
      } else {
        // Extract error message from response
        String errorMessage = 'Request failed';
        if (responseBody.containsKey('error')) {
          if (responseBody['error'] is Map) {
            errorMessage = responseBody['error']['message'] ?? 
                          responseBody['error']['code'] ?? 
                          'Request failed';
          } else {
            errorMessage = responseBody['error'].toString();
          }
        } else if (responseBody.containsKey('message')) {
          errorMessage = responseBody['message'].toString();
        }
        
        throw Exception(errorMessage);
      }
    } catch (e) {
      // If JSON parsing fails, return error
      if (e is FormatException) {
        throw Exception('Invalid response from server: ${response.body}');
      }
      rethrow;
    }
  }
}

