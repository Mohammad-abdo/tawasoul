import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/theme/app_theme.dart';
import 'core/routes/app_router.dart';
import 'core/services/api_service.dart';
import 'core/services/auth_service.dart';
import 'core/providers/auth_provider.dart';
import 'core/providers/onboarding_provider.dart';
import 'core/providers/children_provider.dart';
import 'core/providers/doctors_provider.dart';
import 'core/providers/language_provider.dart';
import 'core/providers/home_data_provider.dart';
import 'core/providers/faq_provider.dart';
import 'core/providers/assessment_provider.dart';
import 'core/providers/bookings_provider.dart';
import 'core/providers/notifications_provider.dart';
import 'core/services/notification_sound_service.dart';

import 'features/mahara/providers/mahara_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize SharedPreferences
  final prefs = await SharedPreferences.getInstance();
  
  // Initialize services
  final apiService = ApiService();
  final authService = AuthService(prefs);
  
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LanguageProvider(prefs)),
        ChangeNotifierProvider(create: (_) => AuthProvider(authService)),
        ChangeNotifierProvider(create: (_) => OnboardingProvider(apiService)),
        ChangeNotifierProvider(create: (_) => ChildrenProvider(authService)),
        ChangeNotifierProvider(create: (_) => DoctorsProvider(authService)),
        ChangeNotifierProvider(create: (_) => HomeDataProvider()),
        ChangeNotifierProvider(create: (_) => FAQProvider()),
        ChangeNotifierProvider(create: (_) => AssessmentProvider()),
        ChangeNotifierProvider(create: (_) => BookingsProvider(authService)),
        ChangeNotifierProvider(create: (_) => NotificationsProvider(authService)),
        Provider<NotificationSoundService>(create: (_) => NotificationSoundService(prefs)),
        ChangeNotifierProvider(create: (_) => MaharaProvider()),
      ],
      child: const TawasoulApp(),
    ),
  );
}


class TawasoulApp extends StatelessWidget {
  const TawasoulApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<LanguageProvider>(
      builder: (context, languageProvider, child) {
        return ScreenUtilInit(
          designSize: const Size(390, 844), // iPhone 14 Pro size
          minTextAdapt: true,
          splitScreenMode: true,
          builder: (context, child) {
            return MaterialApp.router(
              title: 'تواصل',
              debugShowCheckedModeBanner: false,
              theme: AppTheme.lightTheme,
              routerConfig: appRouter,
              locale: languageProvider.locale,
              supportedLocales: const [
                Locale('ar', 'SA'),
                Locale('ar'), // Arabic without country code
                Locale('en', 'US'),
                Locale('en'), // English without country code
              ],
              localizationsDelegates: const [
                GlobalMaterialLocalizations.delegate,
                GlobalWidgetsLocalizations.delegate,
                GlobalCupertinoLocalizations.delegate,
              ],
              localeResolutionCallback: (locale, supportedLocales) {
                // Use provider's locale first
                final providerLocale = languageProvider.locale;
                for (var supportedLocale in supportedLocales) {
                  if (supportedLocale.languageCode == providerLocale.languageCode) {
                    return supportedLocale;
                  }
                }
                // Fallback to system locale
                if (locale != null) {
                  for (var supportedLocale in supportedLocales) {
                    if (supportedLocale.languageCode == locale.languageCode) {
                      return supportedLocale;
                    }
                  }
                }
                // Final fallback to English
                return const Locale('en', 'US');
              },
            );
          },
        );
      },
    );
  }
}

