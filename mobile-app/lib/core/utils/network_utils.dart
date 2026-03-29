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
  
  /// Legacy helper kept for compatibility. The app now uses a single backend URL.
  static Future<bool> isEmulator() async {
    return false;
  }
}

