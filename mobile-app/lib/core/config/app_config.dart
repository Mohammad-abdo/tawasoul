/// API endpoints aligned with Tawasoul_API_Collection.postman_collection.json
/// Base URL is configured once for the deployed backend.
class AppConfig {
  // Backend API Base URL
  static const String baseUrl = 'https://api.example.com/api';

  /// Base URL without /api, for building full image URLs.
  static String get baseOrigin {
    const u = baseUrl;
    if (u.endsWith('/api')) return u.substring(0, u.length - 4);
    if (u.endsWith('/api/')) return u.substring(0, u.length - 5);
    return u;
  }
  //https://api.example.com/api/user/auth/send-otp

  // 1. Authentication & User
  static const String sendOtpEndpoint = '/user/auth/send-otp';
  static const String verifyOtpEndpoint = '/user/auth/verify-otp';
  static const String resendOtpEndpoint = '/user/auth/resend-otp';
  static const String logoutEndpoint = '/user/auth/logout';
  static const String getMeEndpoint = '/user/auth/me';
  static const String updateProfileEndpoint = '/user/auth/profile';
  static const String deleteAccountEndpoint = '/user/auth/account';

  // 2. Public
  static const String onboardingEndpoint = '/public/onboarding-slides';
  static const String staticPagesEndpoint = '/public/static-pages';
  static const String homeDataEndpoint = '/public/home-data';
  static const String faqsEndpoint = '/public/faqs';

  // 3. Children
  static const String childrenListEndpoint = '/user/children';
  static const String childrenSurveyEndpoint = '/user/children/survey';
  static String childByIdEndpoint(String id) => '/user/children/$id';
  static String childStatisticsEndpoint(String id) => '/user/children/$id/statistics';

  // 4. Doctors
  static const String doctorsListEndpoint = '/user/doctors';
  static String doctorByIdEndpoint(String id) => '/user/doctors/$id';
  static String doctorSlotsEndpoint(String id) => '/user/doctors/$id/available-slots';

  // 5. Mahara
  static const String maharaCurrentEndpoint = '/user/mahara/activities/current';
  static const String maharaSubmitEndpoint = '/user/mahara/activities/submit';
  static const String maharaHistoryEndpoint = '/user/mahara/activities/history';
  static const String maharaActivitiesEndpoint = '/user/mahara/activities';

  // 6. Appointments / Bookings
  static const String bookingsListEndpoint = '/user/bookings';
  static const String bookAppointmentEndpoint = '/user/bookings';
  static String bookingByIdEndpoint(String id) => '/user/bookings/$id';
  static String cancelBookingEndpoint(String id) => '/user/bookings/$id/cancel';
  static String rescheduleBookingEndpoint(String id) => '/user/bookings/$id/reschedule';

  // 7. Assessments
  static const String assessmentsTestsEndpoint = '/user/assessments/tests';
  static String assessmentStartEndpoint(String testId) => '/user/assessments/tests/$testId/start';
  static String assessmentAnswerEndpoint(String sessionId) => '/user/assessments/sessions/$sessionId/answer';
  static String assessmentCompleteEndpoint(String sessionId) => '/user/assessments/sessions/$sessionId/complete';
  static const String assessmentsResultsEndpoint = '/user/assessments/results';

  // 8. Notifications, Packages, Favorites
  static const String notificationsEndpoint = '/user/notifications';
  static String notificationReadEndpoint(String id) => '/user/notifications/$id/read';
  static const String uploadImageEndpoint = '/user/upload/image';
  static const String packagesEndpoint = '/user/packages';
  static String packagePurchaseEndpoint(String id) => '/user/packages/$id/purchase';
  static const String favoritesEndpoint = '/user/favorites';

  // Default images
  static const String defaultSliderImage =
      'https://images.unsplash.com/photo-1587652991060-d46142981d4a?w=800';
  static const String defaultDoctorImage =
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400';
  static const String defaultServiceImage =
      'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400';
  static const String defaultArticleImage =
      'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=400';

  // App & Storage
  static const String appName = 'تواصل';
  static const String appNameEn = 'Tawasoul';
  static const int otpLength = 5;
  static const int otpExpirationMinutes = 5;
  static const String keyAuthToken = 'auth_token';
  static const String keyUserData = 'user_data';
  static const String keyOnboardingCompleted = 'onboarding_completed';
  static const String keyLanguage = 'language';
  static const String keyChildSurveyCompleted = 'child_survey_completed';
  static const String keyAssessmentOnboardingCompleted = 'assessment_onboarding_completed';
  static const String keyNotificationSoundMuted = 'notification_sound_muted';
}
