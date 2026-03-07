import 'package:flutter/foundation.dart';
import '../../features/shared/mock_content.dart';

/// FAQ Provider - NOW USING MOCK DATA
/// No backend connection required
class FAQProvider extends ChangeNotifier {
  
  FAQProvider();

  bool _isLoading = false;
  String? _error;
  List<Map<String, dynamic>> _faqs = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Map<String, dynamic>> get faqs => _faqs;

  /// MOCK - Load FAQs from static data
  Future<void> loadFAQs({String? category}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 400));

      // Get FAQs from mock data
      var faqsList = List<Map<String, dynamic>>.from(
        MockContent.faqs.map((e) => Map<String, dynamic>.from(e))
      );

      // Filter by category if specified
      if (category != null && category.isNotEmpty) {
        faqsList = faqsList.where((faq) {
          final faqCategory = faq['category']?.toString() ?? '';
          return faqCategory.toLowerCase() == category.toLowerCase();
        }).toList();
      }

      _faqs = faqsList;
      _error = null;
    } catch (e) {
      _error = e.toString();
      debugPrint('Error loading FAQs: $e');
      
      // Fallback to all FAQs
      _faqs = List<Map<String, dynamic>>.from(
        MockContent.faqs.map((e) => Map<String, dynamic>.from(e))
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
