import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/config/app_config.dart';
import '../../../core/providers/onboarding_provider.dart';
import '../widgets/onboarding_slide_widget.dart';
import '../widgets/onboarding_indicator.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OnboardingProvider>().loadOnboardingSlides();
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConfig.keyOnboardingCompleted, true);
    if (mounted) {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Consumer<OnboardingProvider>(
          builder: (context, provider, child) {
            if (provider.isLoading) {
              return const Center(
                child: CircularProgressIndicator(
                  color: AppColors.primary,
                ),
              );
            }

            final slides = provider.slides;
            if (slides.isEmpty) {
              return const SizedBox.shrink();
            }

            return Column(
              children: [
                // Skip button
                Align(
                  alignment: Alignment.topRight,
                  child: Padding(
                    padding: EdgeInsets.all(20.w),
                    child: TextButton(
                      onPressed: _completeOnboarding,
                      child: Text(
                        AppStrings.skip,
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 12.sp,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                ),

                // Slides
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    onPageChanged: (index) {
                      setState(() {
                        _currentPage = index;
                      });
                      provider.setCurrentIndex(index);
                    },
                    itemCount: slides.length,
                    itemBuilder: (context, index) {
                      return OnboardingSlideWidget(
                        slide: slides[index],
                      );
                    },
                  ),
                ),

                // Indicators
                Padding(
                  padding: EdgeInsets.symmetric(vertical: 20.h),
                  child: OnboardingIndicator(
                    currentIndex: _currentPage,
                    totalSlides: slides.length,
                  ),
                ),

                // Next button
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 20.h),
                  child: SizedBox(
                    width: double.infinity,
                    height: 50.h,
                    child: ElevatedButton(
                      onPressed: () {
                        if (_currentPage < slides.length - 1) {
                          _pageController.nextPage(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeInOut,
                          );
                        } else {
                          _completeOnboarding();
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _currentPage == slides.length - 1
                            ? AppColors.primary
                            : Colors.transparent,
                        foregroundColor: _currentPage == slides.length - 1
                            ? AppColors.white
                            : AppColors.primary,
                        side: BorderSide(
                          color: AppColors.primary,
                          width: 1,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10.r),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            _currentPage == slides.length - 1
                                ? AppStrings.getStarted
                                : AppStrings.next,
                            style: TextStyle(
                              fontFamily: 'MadaniArabic',
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          if (_currentPage < slides.length - 1) ...[
                            SizedBox(width: 8.w),
                            Icon(
                              Icons.arrow_forward,
                              size: 20.w,
                              color: AppColors.primary,
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}


