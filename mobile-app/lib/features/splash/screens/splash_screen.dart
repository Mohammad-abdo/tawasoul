import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/config/app_config.dart';

/// Colorful, playful splash for children's speech therapy & skill development app.
/// Bright colors, soft gradients, floating bubbles, logo, welcome message, start button.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _logoController;
  late AnimationController _bubbleController;
  late Animation<double> _logoFade;
  late Animation<double> _logoScale;
  late Animation<double> _buttonFade;

  @override
  void initState() {
    super.initState();
    _logoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _logoFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _logoController, curve: const Interval(0.0, 0.6, curve: Curves.easeOut)),
    );
    _logoScale = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _logoController, curve: const Interval(0.0, 0.6, curve: Curves.elasticOut)),
    );
    _buttonFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _logoController, curve: const Interval(0.4, 0.9, curve: Curves.easeOut)),
    );

    _bubbleController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();

    _logoController.forward();
    _navigateAfterDelay();
  }

  Future<void> _navigateAfterDelay() async {
    await Future.delayed(const Duration(milliseconds: 2800));
    if (!mounted) return;
    await _navigateToNext();
  }

  Future<void> _navigateToNext() async {
    final prefs = await SharedPreferences.getInstance();
    final onboardingCompleted = prefs.getBool(AppConfig.keyOnboardingCompleted) ?? false;
    final isLoggedIn = prefs.getString(AppConfig.keyAuthToken) != null;
    final assessmentOnboardingCompleted =
        prefs.getBool(AppConfig.keyAssessmentOnboardingCompleted) ?? false;
    if (!mounted) return;
    if (!onboardingCompleted) {
      context.go('/onboarding');
    } else if (!isLoggedIn) {
      context.go('/login');
    } else if (!assessmentOnboardingCompleted) {
      context.go('/assessment-onboarding/intro');
    } else {
      context.go('/home');
    }
  }

  @override
  void dispose() {
    _logoController.dispose();
    _bubbleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          _GradientBackground(),
          _FloatingBubbles(animation: _bubbleController),
          SafeArea(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(flex: 2),
                AnimatedBuilder(
                  animation: _logoController,
                  builder: (context, child) {
                    return Opacity(
                      opacity: _logoFade.value,
                      child: Transform.scale(
                        scale: _logoScale.value,
                        child: child,
                      ),
                    );
                  },
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _AppLogo(),
                      SizedBox(height: 24.h),
                      Text(
                        'مرحباً بكم في مهارات المرح!',
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 20.sp,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF2D3748),
                          height: 1.3,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 8.h),
                      Text(
                        'لنبدأ التعلم معاً 🌟',
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 16.sp,
                          color: const Color(0xFF4A5568),
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                const Spacer(flex: 2),
                AnimatedBuilder(
                  animation: _logoController,
                  builder: (context, child) {
                    return Opacity(
                      opacity: _buttonFade.value,
                      child: child,
                    );
                  },
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 40.w, vertical: 24.h),
                    child: SizedBox(
                      width: double.infinity,
                      height: 56.h,
                      child: ElevatedButton(
                        onPressed: () => _navigateToNext(),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFFB347),
                          foregroundColor: const Color(0xFF2D3748),
                          elevation: 4,
                          shadowColor: Colors.black26,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(28.r),
                          ),
                        ),
                        child: Text(
                          'ابدأ',
                          style: TextStyle(
                            fontFamily: 'MadaniArabic',
                            fontSize: 20.sp,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 32.h),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _GradientBackground extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFFFFF9E6),
            const Color(0xFFFFE4C4),
            const Color(0xFFB8E6F0).withOpacity(0.6),
            const Color(0xFFD4F0D4).withOpacity(0.7),
          ],
          stops: const [0.0, 0.35, 0.65, 1.0],
        ),
      ),
    );
  }
}

class _FloatingBubbles extends StatelessWidget {
  final Animation<double> animation;

  const _FloatingBubbles({required this.animation});

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: AnimatedBuilder(
        animation: animation,
        builder: (context, child) {
          return CustomPaint(
            painter: _BubblesPainter(animation.value),
          );
        },
      ),
    );
  }
}

class _BubblesPainter extends CustomPainter {
  final double t;

  _BubblesPainter(this.t);

  @override
  void paint(Canvas canvas, Size size) {
    final rng = math.Random(42);
    for (var i = 0; i < 12; i++) {
      final x = (rng.nextDouble() * size.width);
      final y = (rng.nextDouble() * size.height);
      final radius = 8.0 + rng.nextDouble() * 16;
      final drift = math.sin(t * 2 * math.pi + i) * 6;
      final cy = (y + drift) % (size.height + 20);
      final opacity = (0.15 + rng.nextDouble() * 0.2).clamp(0.0, 1.0);
      final colors = [
        const Color(0xFFFFB347),
        const Color(0xFF7FDBDA),
        const Color(0xFF90EE90),
        const Color(0xFFFFD700),
      ];
      final paint = Paint()
        ..color = colors[i % colors.length].withOpacity(opacity)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(Offset(x, cy), radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _BubblesPainter oldDelegate) => oldDelegate.t != t;
}

class _AppLogo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 130.w,
      height: 130.w,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFFFFB347),
            const Color(0xFF7FDBDA),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF7FDBDA).withOpacity(0.4),
            blurRadius: 30,
            spreadRadius: 2,
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Icon(
        Icons.child_care_rounded,
        size: 70.sp,
        color: Colors.white,
      ),
    );
  }
}
