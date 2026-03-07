import 'package:flutter/foundation.dart';
import '../../features/shared/mock_content.dart';

/// Home Data Provider - NOW USING MOCK DATA
/// No backend connection required
class HomeDataProvider extends ChangeNotifier {
  
  HomeDataProvider();

  bool _isLoading = false;
  String? _error;
  List<Map<String, dynamic>> _sliders = [];
  List<Map<String, dynamic>> _services = [];
  List<Map<String, dynamic>> _articles = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  
  /// Get sliders from mock data or default sliders
  List<Map<String, dynamic>> get sliders =>
      _sliders.isNotEmpty ? _sliders : _defaultSliders;
  List<Map<String, dynamic>> get services => _services;
  List<Map<String, dynamic>> get articles => _articles;

  /// Default sliders when no data available
  static List<Map<String, dynamic>> get _defaultSliders => [
        {
          'id': 'slider_default_1',
          'imageUrl': 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800',
          'title': 'احجز الآن',
          'description': 'مع أمهر المتخصصين في دعم طفلك',
          'buttonLink': '/appointments/booking',
        },
        {
          'id': 'slider_default_2',
          'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
          'title': 'تواصل معنا',
          'description': 'نرافقك وطفلك في رحلة النمو',
          'buttonLink': '/appointments',
        },
      ];

  /// MOCK - Load home data from static data
  Future<void> loadHomeData({String? language}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 500));

      // Get data from MockContent
      _sliders = _defaultSliders;
      _services = List<Map<String, dynamic>>.from(
        MockContent.services.map((e) => Map<String, dynamic>.from(e))
      );
      _articles = List<Map<String, dynamic>>.from(
        MockContent.articles.map((e) => Map<String, dynamic>.from(e))
      );

      _error = null;
      
      if (kDebugMode && _sliders.isNotEmpty) {
        debugPrint('HomeData: loaded ${_sliders.length} sliders from mock data');
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('Error loading home data: $e');
      
      // Fallback to default
      _sliders = _defaultSliders;
      _services = List<Map<String, dynamic>>.from(
        MockContent.services.map((e) => Map<String, dynamic>.from(e))
      );
      _articles = List<Map<String, dynamic>>.from(
        MockContent.articles.map((e) => Map<String, dynamic>.from(e))
      );
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
