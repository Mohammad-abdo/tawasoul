import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../features/onboarding/screens/onboarding_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/otp_verification_screen.dart';
import '../../features/assessment_onboarding/screens/assessment_intro_screen.dart';
import '../../features/assessment_onboarding/screens/assessment_child_info_screen.dart';
import '../../features/assessment_onboarding/screens/assessment_summary_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/children/screens/child_profile_selection_screen.dart';
import '../../features/children/screens/child_survey_success_screen.dart';
import '../../features/appointments/screens/appointment_booking_screen.dart';
import '../../features/appointments/screens/appointments_list_screen.dart';
import '../../features/appointments/screens/appointment_details_screen.dart';
import '../../features/appointments/screens/specialist_profile_screen.dart';
import '../../features/appointments/screens/specialist_search_screen.dart';
import '../../features/appointments/screens/doctor_booking_screen.dart';
import '../../features/doctors/screens/doctors_list_screen.dart';
import '../../features/appointments/screens/session_screen.dart';
import '../../features/chat/screens/chat_list_screen.dart';
import '../../features/chat/screens/chat_conversation_screen.dart';
import '../../features/account/screens/account_screen.dart';
import '../../features/packages/screens/packages_screen.dart';
import '../../features/packages/screens/packages_list_screen.dart';
import '../../features/packages/screens/package_details_screen.dart';
import '../../features/notifications/screens/notifications_screen.dart';
import '../../features/notifications/screens/notification_details_screen.dart';
import '../../features/checkout/screens/checkout_screen.dart';
import '../../features/payments/screens/order_confirmation_screen.dart';
import '../../features/booking_payment/screens/booking_payment_screen.dart';
import '../../features/booking_payment/screens/booking_confirmation_screen.dart';
import '../../features/booking_payment/screens/booking_payment_status_screen.dart';
import '../../features/products/screens/products_list_screen.dart';
import '../../features/products/screens/product_details_screen.dart';
import '../../features/cart/screens/cart_screen.dart';
import '../../features/account/screens/faq_screen.dart';
import '../../features/account/screens/support_screen.dart';
import '../../features/account/screens/privacy_policy_screen.dart';
import '../../features/account/screens/profile_update_screen.dart';
import '../../features/address/screens/address_management_screen.dart';
import '../../features/assessments/screens/assessments_list_screen.dart';
import '../../features/assessments/screens/assessment_test_screen.dart';
import '../../features/assessments/screens/assessment_results_screen.dart';
import '../../features/assessments/screens/assessment_categories_screen.dart';
import '../../features/assessments/screens/category_tests_screen.dart';
import '../../features/articles/screens/articles_list_screen.dart';
import '../../features/articles/screens/article_details_screen.dart';
import '../../features/services/screens/services_list_screen.dart';
import '../../features/services/screens/service_details_screen.dart';
import '../../features/children/screens/child_profile_screen.dart';
import '../../features/children/screens/progress_reports_screen.dart';
import '../../features/mahara/screens/activity_player_screen.dart';
import '../../features/assessments/mahara_kids/mahara_activity_screen.dart';
import '../../features/splash/screens/splash_screen.dart';
import '../../features/reviews/screens/reviews_list_screen.dart';
import '../../features/products/screens/product_filters_screen.dart';
import '../../features/orders/screens/order_tracking_screen.dart';
import '../../features/children/screens/child_evaluation_dashboard.dart';
import '../../features/favorites/screens/favorites_screen.dart';
import '../../features/history/screens/history_screen.dart';
import '../../features/orders/screens/orders_list_screen.dart';
import '../providers/auth_provider.dart';
import '../config/app_config.dart';

final appRouter = GoRouter(
  initialLocation: '/splash',
  redirect: (context, state) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final prefs = await SharedPreferences.getInstance();
    final onboardingCompleted = prefs.getBool(AppConfig.keyOnboardingCompleted) ?? false;
    final assessmentOnboardingCompleted = prefs.getBool(AppConfig.keyAssessmentOnboardingCompleted) ?? false;
    final isLoggedIn = authProvider.isAuthenticated || prefs.getString(AppConfig.keyAuthToken) != null;

    final loc = state.matchedLocation;
    final isSplash = loc == '/splash';
    final isOnboarding = loc == '/onboarding';
    final isLogin = loc == '/login';
    final isRegister = loc == '/register';
    final isOtp = loc.startsWith('/otp');
    final isAssessmentIntro = loc == '/assessment-onboarding/intro';
    final isAssessmentChildInfo = loc == '/assessment-onboarding/child-info';
    final isAssessmentSummary = loc == '/assessment-onboarding/summary';
    final isChildrenSurvey = loc.startsWith('/children/survey');
    final isAuthOrOnboarding = isLogin || isRegister || isOtp || isOnboarding;

    // 1) App onboarding not completed → onboarding
    if (!onboardingCompleted && !isOnboarding && !isSplash) {
      return '/onboarding';
    }

    // 2) Not logged in → allow only splash, onboarding, login, register, otp
    if (!isLoggedIn) {
      if (isAuthOrOnboarding || isSplash) return null;
      return '/login';
    }

    // 3) Logged in but assessment onboarding not completed → force assessment flow
    if (isLoggedIn && !assessmentOnboardingCompleted) {
      final inAssessmentFlow = isAssessmentIntro || isAssessmentChildInfo || isAssessmentSummary || isChildrenSurvey;
      if (inAssessmentFlow) return null;
      return '/assessment-onboarding/intro';
    }

    // 4) Logged in and assessment completed → block auth screens, send to home
    if (isLoggedIn && assessmentOnboardingCompleted && isAuthOrOnboarding) {
      return '/home';
    }

    return null;
  },
  routes: [
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => const OnboardingScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/otp-verification',
      builder: (context, state) {
        final phone = state.uri.queryParameters['phone'] ?? '';
        return OtpVerificationScreen(phone: phone);
      },
    ),
    GoRoute(
      path: '/assessment-onboarding/intro',
      builder: (context, state) => const AssessmentIntroScreen(),
    ),
    GoRoute(
      path: '/assessment-onboarding/child-info',
      builder: (context, state) => const AssessmentChildInfoScreen(),
    ),
    GoRoute(
      path: '/assessment-onboarding/summary',
      builder: (context, state) => const AssessmentSummaryScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/children/select',
      builder: (context, state) => const ChildProfileSelectionScreen(),
    ),
    GoRoute(
      path: '/children/survey',
      builder: (context, state) {
        final fromOnboarding = state.uri.queryParameters['fromOnboarding'] == '1';
        return ChildProfileSelectionScreen(fromOnboarding: fromOnboarding);
      },
    ),
    GoRoute(
      path: '/children/survey/success',
      builder: (context, state) {
        final childId = state.uri.queryParameters['childId'] ?? '';
        return ChildSurveySuccessScreen(childId: childId.isEmpty ? null : childId);
      },
    ),
    GoRoute(
      path: '/appointments',
      builder: (context, state) => const AppointmentsListScreen(),
    ),
    GoRoute(
      path: '/appointments/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return AppointmentDetailsScreen(appointmentId: id);
      },
    ),
    GoRoute(
      path: '/appointments/booking',
      builder: (context, state) => const AppointmentBookingScreen(),
    ),
    GoRoute(
      path: '/sessions/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return SessionScreen(appointmentId: id);
      },
    ),
    GoRoute(
      path: '/doctors',
      builder: (context, state) {
        final recommendedForChildId =
            state.uri.queryParameters['recommendedForChildId'];
        return DoctorsListScreen(
          recommendedForChildId: recommendedForChildId?.isNotEmpty == true
              ? recommendedForChildId
              : null,
        );
      },
    ),
    GoRoute(
      path: '/specialist/search',
      builder: (context, state) => const SpecialistSearchScreen(),
    ),
    GoRoute(
      path: '/specialist/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return SpecialistProfileScreen(specialistId: id);
      },
    ),
    GoRoute(
      path: '/doctor/book/:doctorId',
      builder: (context, state) {
        final doctorId = state.pathParameters['doctorId'] ?? '';
        return DoctorBookingScreen(doctorId: doctorId);
      },
    ),
    GoRoute(
      path: '/chat',
      builder: (context, state) => const ChatListScreen(),
    ),
    GoRoute(
      path: '/chat/conversation/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return ChatConversationScreen(conversationId: id);
      },
    ),
    GoRoute(
      path: '/account',
      builder: (context, state) => const AccountScreen(),
    ),
    GoRoute(
      path: '/reviews',
      builder: (context, state) {
        final specialistId = state.uri.queryParameters['specialistId'];
        final serviceId = state.uri.queryParameters['serviceId'];
        return ReviewsListScreen(
          specialistId: specialistId,
          serviceId: serviceId,
        );
      },
    ),
    GoRoute(
      path: '/packages',
      builder: (context, state) => const PackagesScreen(),
    ),
    GoRoute(
      path: '/packages/list',
      builder: (context, state) => const PackagesListScreen(),
    ),
    GoRoute(
      path: '/packages/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return PackageDetailsScreen(packageId: id);
      },
    ),
    GoRoute(
      path: '/notifications',
      builder: (context, state) => const NotificationsScreen(),
    ),
    GoRoute(
      path: '/notifications/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return NotificationDetailsScreen(notificationId: id);
      },
    ),
    GoRoute(
      path: '/checkout',
      builder: (context, state) => const CheckoutScreen(),
    ),
    GoRoute(
      path: '/order-confirmation',
      builder: (context, state) => const OrderConfirmationScreen(),
    ),
    GoRoute(
      path: '/booking/payment',
      builder: (context, state) => const BookingPaymentScreen(),
    ),
    GoRoute(
      path: '/booking/confirmation',
      builder: (context, state) => const BookingConfirmationScreen(),
    ),
    GoRoute(
      path: '/booking/payment/status',
      builder: (context, state) {
        final stateParam = state.uri.queryParameters['state'] ?? 'failed';
        return BookingPaymentStatusScreen(state: stateParam);
      },
    ),
    GoRoute(
      path: '/products',
      builder: (context, state) => const ProductsListScreen(),
    ),
    GoRoute(
      path: '/products/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return ProductDetailsScreen(productId: id);
      },
    ),
    GoRoute(
      path: '/cart',
      builder: (context, state) => const CartScreen(),
    ),
    GoRoute(
      path: '/products/filters',
      builder: (context, state) {
        final initial = state.extra as Map<String, dynamic>?;
        return ProductFiltersScreen(
          initialFilters: initial,
          onApplyFilters: (filters) => context.pop(filters),
        );
      },
    ),
    GoRoute(
      path: '/orders',
      builder: (context, state) => const OrdersListScreen(),
    ),
    GoRoute(
      path: '/orders/:id/tracking',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return OrderTrackingScreen(orderId: id);
      },
    ),
    GoRoute(
      path: '/children/:id/evaluation',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return ChildEvaluationDashboard(childId: id);
      },
    ),
    GoRoute(
      path: '/favorites',
      builder: (context, state) => const FavoritesScreen(),
    ),
    GoRoute(
      path: '/history',
      builder: (context, state) => const HistoryScreen(),
    ),
    GoRoute(
      path: '/account/faq',
      builder: (context, state) => const FaqScreen(),
    ),
    GoRoute(
      path: '/account/support',
      builder: (context, state) => const SupportScreen(),
    ),
    GoRoute(
      path: '/account/privacy',
      builder: (context, state) => const PrivacyPolicyScreen(),
    ),
    GoRoute(
      path: '/account/profile/update',
      builder: (context, state) => const ProfileUpdateScreen(),
    ),
    GoRoute(
      path: '/addresses',
      builder: (context, state) => const AddressManagementScreen(),
    ),
    GoRoute(
      path: '/children/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return ChildProfileScreen(childId: id);
      },
    ),
    GoRoute(
      path: '/children/:id/reports',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return ProgressReportsScreen(childId: id);
      },
    ),
    GoRoute(
      path: '/assessments/categories',
      builder: (context, state) {
        final childId = state.uri.queryParameters['childId'] ?? '';
        return AssessmentCategoriesScreen(childId: childId);
      },
    ),
    GoRoute(
      path: '/assessments/category/:categoryId',
      builder: (context, state) {
        final categoryId = state.pathParameters['categoryId'] ?? '';
        final childId = state.uri.queryParameters['childId'] ?? '';
        return CategoryTestsScreen(
          categoryId: categoryId,
          childId: childId,
        );
      },
    ),
    GoRoute(
      path: '/assessments/child/:childId',
      builder: (context, state) {
        final childId = state.pathParameters['childId'] ?? '';
        return AssessmentsListScreen(childId: childId);
      },
    ),
    GoRoute(
      path: '/assessments/test/:testId',
      builder: (context, state) {
        final testId = state.pathParameters['testId'] ?? '';
        final childId = state.uri.queryParameters['childId'] ?? '';
        return AssessmentTestScreen(
          testId: testId,
          childId: childId,
        );
      },
    ),
    GoRoute(
      path: '/assessments/results/:childId',
      builder: (context, state) {
        final childId = state.pathParameters['childId'] ?? '';
        final totalSteps = int.tryParse(state.uri.queryParameters['totalSteps'] ?? '');
        final correctSteps = int.tryParse(state.uri.queryParameters['correctSteps'] ?? '');
        final totalScore = int.tryParse(state.uri.queryParameters['totalScore'] ?? '');
        final score0to5 = int.tryParse(state.uri.queryParameters['score0to5'] ?? '');
        final categoryId = state.uri.queryParameters['categoryId'] ?? '';
        return AssessmentResultsScreen(
          childId: childId,
          totalSteps: totalSteps,
          correctSteps: correctSteps,
          totalScore: totalScore,
          score0to5: score0to5 != 0 ? score0to5 : null,
          categoryId: categoryId.isNotEmpty ? categoryId : null,
        );
      },
    ),
    GoRoute(
      path: '/services',
      builder: (context, state) => const ServicesListScreen(),
    ),
    GoRoute(
      path: '/services/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return ServiceDetailsScreen(serviceId: id);
      },
    ),
    GoRoute(
      path: '/articles',
      builder: (context, state) => const ArticlesListScreen(),
    ),
    GoRoute(
      path: '/articles/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'] ?? '';
        return ArticleDetailsScreen(articleId: id);
      },
    ),
    GoRoute(
      path: '/mahara/activity/:childId',
      builder: (context, state) {
        final childId = state.pathParameters['childId'] ?? '';
        return ActivityPlayerScreen(
          childId: childId,
          token: 'TOKEN_WILL_BE_FETCHED_IN_SCREEN',
        );
      },
    ),
    GoRoute(
      path: '/mahara-kids/activity/:activityId',
      builder: (context, state) {
        final activityId = state.pathParameters['activityId'] ?? '';
        final activityType = state.uri.queryParameters['type'] ?? 'listen_watch';
        // You can pass activity data via query parameters or fetch from provider
        return MaharaActivityScreen(
          activityId: activityId,
          activityType: activityType,
          activityData: null, // Can be passed or fetched from provider
        );
      },
    ),
  ],
);
