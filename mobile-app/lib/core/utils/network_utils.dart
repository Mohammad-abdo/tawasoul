import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class NetworkUtils {
  /// Test connection to backend
  static Future<bool> testConnection() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConfig.baseUrl.replaceAll('/api', '')}/health'),
      ).timeout(
        const Duration(seconds: 5),
        onTimeout: () {
          throw Exception('Connection timeout');
        },
      );
      
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
  
  /// Get current base URL
  static String getCurrentBaseUrl() {
    return AppConfig.baseUrl;
  }
  
  /// Check if running on emulator
  static Future<bool> isEmulator() async {
    try {
      // Try to connect to emulator URL
      final response = await http.get(
        Uri.parse('http://10.0.2.2:3000/health'),
      ).timeout(const Duration(seconds: 2));
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}

