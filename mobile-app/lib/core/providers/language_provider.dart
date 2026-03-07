import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class LanguageProvider extends ChangeNotifier {
  final SharedPreferences prefs;
  Locale _locale = const Locale('ar', 'SA');

  LanguageProvider(this.prefs) {
    _loadLanguage();
  }

  Locale get locale => _locale;
  String get languageCode => _locale.languageCode;

  Future<void> _loadLanguage() async {
    final savedLanguage = prefs.getString(AppConfig.keyLanguage);
    if (savedLanguage != null) {
      if (savedLanguage == 'ar' || savedLanguage == 'العربية') {
        _locale = const Locale('ar', 'SA');
      } else if (savedLanguage == 'en' || savedLanguage == 'English') {
        _locale = const Locale('en', 'US');
      }
      notifyListeners();
    }
  }

  Future<void> setLanguage(String language) async {
    Locale newLocale;
    if (language == 'ar' || language == 'العربية') {
      newLocale = const Locale('ar', 'SA');
    } else if (language == 'en' || language == 'English') {
      newLocale = const Locale('en', 'US');
    } else {
      return; // Invalid language
    }

    _locale = newLocale;
    await prefs.setString(AppConfig.keyLanguage, newLocale.languageCode);
    notifyListeners();
  }

  Future<void> toggleLanguage() async {
    if (_locale.languageCode == 'ar') {
      await setLanguage('en');
    } else {
      await setLanguage('ar');
    }
  }
}


