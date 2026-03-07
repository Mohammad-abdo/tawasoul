# Tawasoul Mobile App

Flutter mobile application for the Tawasoul platform - a specialized platform for providing consultation and treatment services for children with special needs.

## Features

- **Authentication**: OTP-based authentication with phone number
- **Onboarding**: Interactive onboarding flow
- **Child Profiles**: Create and manage child profiles with status and age groups
- **Appointments**: Book, view, and manage appointments with specialists
- **Packages**: View and purchase therapy packages
- **Products**: Browse and purchase products from the store
- **Chat**: Real-time messaging with specialists
- **Notifications**: Receive notifications for appointments, orders, and messages
- **Account Management**: Update profile, manage addresses, view FAQ and support

## Tech Stack

- **Framework**: Flutter
- **State Management**: Provider
- **Navigation**: GoRouter
- **HTTP Client**: Dio
- **Local Storage**: SharedPreferences
- **Form Validation**: Flutter Form Builder
- **UI Components**: Flutter ScreenUtil for responsive design

## Project Structure

```
lib/
├── core/
│   ├── config/          # App configuration
│   ├── constants/       # Colors, strings
│   ├── providers/       # State management providers
│   ├── routes/          # App routing
│   ├── services/        # API and auth services
│   ├── theme/           # App theme
│   ├── utils/           # Utility functions
│   └── widgets/         # Reusable widgets
├── features/
│   ├── account/         # Account management
│   ├── address/         # Address management
│   ├── appointments/    # Appointment booking
│   ├── auth/            # Authentication
│   ├── cart/            # Shopping cart
│   ├── chat/            # Messaging
│   ├── children/        # Child profiles
│   ├── home/            # Home screen
│   ├── notifications/   # Notifications
│   ├── onboarding/      # Onboarding flow
│   ├── packages/         # Therapy packages
│   ├── payments/        # Payment and checkout
│   └── products/        # Product catalog
└── main.dart            # App entry point
```

## Getting Started

### Prerequisites

- Flutter SDK (>=3.0.0)
- Dart SDK (>=3.0.0)
- Android Studio / VS Code with Flutter extensions
- iOS development tools (for iOS builds)

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd mobile-app
   ```

3. Install dependencies:
   ```bash
   flutter pub get
   ```

4. Run the app:
   ```bash
   flutter run
   ```

### Configuration

1. **Update the API base URL** in `lib/core/config/app_config.dart`:

```dart
static const String baseUrl = 'YOUR_API_BASE_URL';
```

2. **Add Font Files** (Optional but recommended):
   - Place font files in `assets/fonts/`:
     - ExpoArabic-Regular.ttf
     - ExpoArabic-Bold.ttf
     - MadaniArabic-Regular.ttf
     - MadaniArabic-Medium.ttf
     - MadaniArabic-SemiBold.ttf
     - Inter-Regular.ttf
   - Uncomment the `fonts:` section in `pubspec.yaml`
   - Run `flutter pub get`

   **Note**: The app will work without custom fonts (using system defaults), but for the best design match, add the font files.

## Design System

- **Primary Color**: #90194D
- **Typography**: 
  - ExpoArabic (Headings)
  - MadaniArabic (Body text)
  - Inter (Numbers)
- **Layout**: RTL (Right-to-Left) support

## Building for Production

### Android
```bash
flutter build apk --release
```

### iOS
```bash
flutter build ios --release
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

[Your License Here]

