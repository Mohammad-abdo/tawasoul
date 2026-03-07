import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../config/app_config.dart';

class OnboardingSlide {
  final String imageUrl;
  final String title;
  final String description;
  
  OnboardingSlide({
    required this.imageUrl,
    required this.title,
    required this.description,
  });
}

class OnboardingProvider extends ChangeNotifier {
  final ApiService _apiService;
  
  OnboardingProvider(this._apiService);
  
  List<OnboardingSlide> _slides = [];
  int _currentIndex = 0;
  bool _isLoading = false;
  
  List<OnboardingSlide> get slides => _slides;
  int get currentIndex => _currentIndex;
  bool get isLoading => _isLoading;
  
  Future<void> loadOnboardingSlides({String? language}) async {
    _isLoading = true;
    notifyListeners();

    try {
      final query = language != null ? '?language=$language' : '?platform=MOBILE';
      final response = await _apiService.get('${AppConfig.onboardingEndpoint}$query');
      if (response['success'] == true && response['data'] != null) {
        final list = response['data'] as List<dynamic>?;
        if (list != null && list.isNotEmpty) {
          _slides = list
              .where((e) => e is Map)
              .map((e) {
                final m = Map<String, dynamic>.from(e as Map);
                return OnboardingSlide(
                  imageUrl: (m['imageUrl'] ?? m['image'] ?? '') as String,
                  title: (m['title'] ?? '') as String,
                  description: (m['description'] ?? '') as String,
                );
              })
              .toList();
        } else {
          _slides = _getDefaultSlides();
        }
      } else {
        _slides = _getDefaultSlides();
      }
    } catch (_) {
      _slides = _getDefaultSlides();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  List<OnboardingSlide> _getDefaultSlides() {
    return [
      OnboardingSlide(
        imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800',
        title: 'مرحباً بك في تواصل',
        description: 'منصة متخصصة لمساعدة الأطفال ذوي الاحتياجات الخاصة في تطوير مهارات التواصل',
      ),
      OnboardingSlide(
        imageUrl: 'https://images.unsplash.com/photo-1587652991060-d46142981d4a?w=800',
        title: 'استشارات متخصصة',
        description: 'احصل على استشارات وجلسات فيديو مباشرة مع أفضل المتخصصين المعتمدين',
      ),
      OnboardingSlide(
        imageUrl: 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800',
        title: 'ابدأ رحلتك معنا',
        description: 'سجل الآن وتابع تطور طفلك من خلال تقارير دورية واختبارات تقييمية ذكية',
      ),
    ];
  }
  
  void setCurrentIndex(int index) {
    _currentIndex = index;
    notifyListeners();
  }
}


