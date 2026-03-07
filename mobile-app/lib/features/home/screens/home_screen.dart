import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_navigation_bar.dart';
import '../../../core/widgets/child_profile_avatar_gateway.dart';
import '../../../core/widgets/rating_widget.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/config/app_config.dart';
import '../../../core/providers/home_data_provider.dart';
import '../../../core/providers/children_provider.dart';
import '../../../core/providers/language_provider.dart';
import '../../../core/providers/doctors_provider.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../assessments/data/mock_assessments.dart';
import 'package:go_router/go_router.dart';

/// Enhanced Home Screen
/// Multiple sections with clear headers
/// Horizontal/vertical scrolls as appropriate
/// Smooth animations
/// Consistent card sizes
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final PageController _sliderController = PageController();
  int _currentSliderIndex = 0;
  int _heroSliderCount = 1;

  @override
  void initState() {
    super.initState();
    // Load home data and children from backend when screen initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final homeDataProvider = Provider.of<HomeDataProvider>(context, listen: false);
      final languageProvider = Provider.of<LanguageProvider>(context, listen: false);
      final childrenProvider = Provider.of<ChildrenProvider>(context, listen: false);
      final doctorsProvider = Provider.of<DoctorsProvider>(context, listen: false);
      homeDataProvider.loadHomeData(language: languageProvider.languageCode);
      childrenProvider.loadChildren();
      doctorsProvider.loadDoctors(limit: 10);
    });
    // Auto-play slider
    _startSliderAutoPlay();
  }

  void _startSliderAutoPlay() {
    Future.delayed(const Duration(seconds: 3), () {
      if (!mounted || !_sliderController.hasClients) return;
      final n = _heroSliderCount.clamp(1, 99);
      final nextIndex = n <= 1 ? 0 : (_currentSliderIndex + 1) % n;
      _sliderController.animateToPage(nextIndex, duration: const Duration(milliseconds: 500), curve: Curves.easeInOut);
      _startSliderAutoPlay();
    });
  }

  @override
  void dispose() {
    _sliderController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer3<HomeDataProvider, LanguageProvider, DoctorsProvider>(
      builder: (context, homeDataProvider, languageProvider, doctorsProvider, child) {
        final isArabic = languageProvider.languageCode == 'ar';
        if (homeDataProvider.sliders.isNotEmpty && _heroSliderCount != homeDataProvider.sliders.length) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) setState(() => _heroSliderCount = homeDataProvider.sliders.length);
          });
        }
        return Scaffold(
          backgroundColor: AppColors.background,
          body: SafeArea(
            child: Column(
              children: [
                // Header — child avatar (top-right RTL) as gateway to Child Profile
                AppHeader(
                  subtitle: isArabic ? 'أهلاً بك معانا' : 'Welcome',
                  userName: 'سارة محمد علي',
                  userImage: null,
                  childAvatar: const ChildProfileAvatarGateway(),
                  onNotificationTap: () {
                    context.push('/notifications');
                  },
                  onProfileTap: () {
                    context.push('/account');
                  },
                ),
                // Content
                Expanded(
                  child: homeDataProvider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : homeDataProvider.error != null
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                homeDataProvider.error!,
                                style: AppTypography.errorText(context),
                              ),
                              SizedBox(height: 16.h),
                              ElevatedButton(
                                onPressed: () {
                                  homeDataProvider.loadHomeData(language: languageProvider.languageCode);
                                },
                                child: Text(isArabic ? 'إعادة المحاولة' : 'Retry'),
                              ),
                            ],
                          ),
                        )
                      : SingleChildScrollView(
                          padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Hero Slider — تُعرض دائماً (من الباكند أو شرائح افتراضية)
                              _buildHeroSlider(context, homeDataProvider.sliders, isArabic),
                              SizedBox(height: 24.h),
                              // Doctors Section (from API, with default image)
                              _buildDoctorsSlider(context, isArabic, doctorsProvider),
                              SizedBox(height: 24.h),
                              // Exams Section - Horizontal Slider
                              _buildExamsSection(context, isArabic),
                              SizedBox(height: 24.h),
                              // Services Section
                              _buildServicesSection(context, homeDataProvider.services, isArabic),
                              SizedBox(height: 24.h),
                              // Upcoming Appointments
                              _buildUpcomingAppointments(context, isArabic),
                              SizedBox(height: 24.h),
                              // Articles Section
                              _buildArticlesSection(context, homeDataProvider.articles, isArabic),
                              SizedBox(height: 24.h),
                            ],
                          ),
                        ),
                ),
                // Bottom Navigation
                AppNavigationBar(
                  currentIndex: 0,
                  onTap: (index) {
                    switch (index) {
                      case 0:
                        break; // Already on home
                      case 1:
                        context.push('/appointments');
                        break;
                      case 2:
                        context.push('/assessments/categories?childId=mock_child_1');
                        break;
                      case 3:
                        context.push('/chat');
                        break;
                      case 4:
                        context.push('/account');
                        break;
                    }
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildHeroSlider(BuildContext context, List<Map<String, dynamic>> sliders, bool isArabic) {
    return Column(
      children: [
        SizedBox(
          height: 180.h,
          child: PageView.builder(
            controller: _sliderController,
            onPageChanged: (index) {
              setState(() {
                _currentSliderIndex = index;
              });
            },
            itemCount: sliders.length,
            itemBuilder: (context, index) {
              final slider = sliders[index];
              return GestureDetector(
                onTap: () {
                  final link = slider['buttonLink'] ?? '/appointments/booking';
                  if (link.startsWith('/')) {
                    context.push(link);
                  }
                },
                child: Container(
                  margin: EdgeInsets.symmetric(horizontal: 4.w),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20.r),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20.r),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        // Background Image (صورة افتراضية إن لم تأتِ من الباكند)
                        SizedBox(
                          width: double.infinity,
                          height: 180.h,
                          child: AppNetworkImage(
                            imageUrl: (slider['imageUrl'] ?? slider['image'] ?? AppConfig.defaultSliderImage)?.toString(),
                            width: double.infinity,
                            height: 180.h,
                            fit: BoxFit.cover,
                            placeholderStyle: AppImagePlaceholderStyle.generic,
                          ),
                        ),
                        // Gradient Overlay
                        Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.transparent,
                                Colors.black.withOpacity(0.6),
                              ],
                            ),
                          ),
                        ),
                        // Content
                        Padding(
                          padding: EdgeInsets.all(20.w),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.end,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                slider['title'] ?? (isArabic ? 'احجز الآن' : 'Book Now'),
                                style: AppTypography.headingM(context).copyWith(
                                  color: AppColors.white,
                                ),
                                textAlign: TextAlign.right,
                              ),
                              SizedBox(height: 8.h),
                              Text(
                                slider['description'] ?? (isArabic ? 'مع أمهر المتخصصين' : 'With the best specialists'),
                                style: AppTypography.bodyMedium(context).copyWith(
                                  color: AppColors.white.withOpacity(0.9),
                                ),
                                textAlign: TextAlign.right,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        SizedBox(height: 12.h),
        // Slider Indicators
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            sliders.length,
            (index) => Container(
              width: 8.w,
              height: 8.w,
              margin: EdgeInsets.symmetric(horizontal: 4.w),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _currentSliderIndex == index
                    ? AppColors.primary
                    : AppColors.gray300,
              ),
            ),
          ),
        ),
      ],
    );
  }

  static String? _doctorInitials(String? name) {
    if (name == null || name.trim().isEmpty) return null;
    final parts = name.trim().split(RegExp(r'\s+')).where((s) => s.isNotEmpty).toList();
    if (parts.isEmpty) return null;
    if (parts.length == 1) return parts[0].length >= 1 ? parts[0][0] : null;
    final a = parts[0].length >= 1 ? parts[0][0] : '';
    final b = parts[1].length >= 1 ? parts[1][0] : '';
    return (a + b).trim().isEmpty ? null : (a + b).trim();
  }

  Widget _buildDoctorsSlider(BuildContext context, bool isArabic, DoctorsProvider doctorsProvider) {
    final doctors = doctorsProvider.doctors;
    if (doctors.isEmpty && !doctorsProvider.isLoading) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                onTap: () => context.push('/doctors'),
                child: Text(
                  isArabic ? 'المزيد' : 'More',
                  style: AppTypography.primaryText(context),
                ),
              ),
              Row(
                children: [
                  Icon(Icons.medical_services_rounded, size: 20.sp, color: AppColors.primary),
                  SizedBox(width: 8.w),
                  Text(
                    isArabic ? 'الأطباء والمختصون' : 'Doctors & Specialists',
                    style: AppTypography.headingM(context),
                  ),
                ],
              ),
            ],
          ),
          SizedBox(height: 16.h),
          Center(
            child: Padding(
              padding: EdgeInsets.symmetric(vertical: 24.h),
              child: Text(
                isArabic ? 'لا يوجد مختصون حالياً' : 'No specialists at the moment',
                style: AppTypography.bodyMedium(context).copyWith(color: AppColors.textTertiary),
              ),
            ),
          ),
        ],
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: () => context.push('/doctors'),
              child: Text(
                isArabic ? 'المزيد' : 'More',
                style: AppTypography.primaryText(context),
              ),
            ),
            Row(
              children: [
                Icon(Icons.medical_services_rounded, size: 20.sp, color: AppColors.primary),
                SizedBox(width: 8.w),
                Text(
                  isArabic ? 'الأطباء والمختصون' : 'Doctors & Specialists',
                  style: AppTypography.headingM(context),
                ),
              ],
            ),
          ],
        ),
        SizedBox(height: 16.h),
        SizedBox(
          height: 300.h,
          child: doctorsProvider.isLoading && doctors.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
                  scrollDirection: Axis.horizontal,
                  reverse: true,
                  itemCount: doctors.length,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: EdgeInsets.only(left: 16.w),
                      child: _buildDoctorSliderCard(context, doctors[index]),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildDoctorSliderCard(BuildContext context, Map<String, dynamic> doctor) {
    final slots = (doctor['availableSlots'] as List<dynamic>?) ?? (doctor['slots'] as List<dynamic>?) ?? [];
    final availableCount = slots.where((s) => s is Map && (s['available'] == true || s['available'] == true)).length;
    final imageUrl = doctor['profileImage'] ?? doctor['image'] ?? doctor['imageUrl'];
    final defaultImage = imageUrl is String && imageUrl.trim().isNotEmpty ? imageUrl : AppConfig.defaultDoctorImage;
    final reviewsCount = doctor['reviewsCount'] ?? 0;

    return GestureDetector(
      onTap: () => context.push('/specialist/${doctor['id']}'),
      child: Container(
        width: 260.w,
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(24.r),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.08),
              blurRadius: 20,
              offset: const Offset(0, 8),
              spreadRadius: 0,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Image Section with modern overlay
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
                  child: AppNetworkImage(
                    imageUrl: defaultImage,
                    width: double.infinity,
                    height: 115.h,
                    fit: BoxFit.cover,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
                    placeholderStyle: AppImagePlaceholderStyle.avatar,
                    initials: _doctorInitials(doctor['fullName'] ?? doctor['name'] ?? doctor['username']?.toString()),
                  ),
                ),
                // Gradient overlay
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: 48.h,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.7),
                        ],
                      ),
                    ),
                  ),
                ),
                // Rating badge - modern design
                Positioned(
                  top: 12.h,
                  left: 12.w,
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(20.r),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 8,
                          spreadRadius: 0,
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.star_rounded,
                          size: 16.sp,
                          color: AppColors.warning,
                        ),
                        SizedBox(width: 4.w),
                        Text(
                          (doctor['rating'] as num?)?.toStringAsFixed(1) ?? '0.0',
                          style: AppTypography.bodySmall(context).copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: AppTypography.bold,
                            fontSize: 12.sp,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // Experience badge
                if (doctor['experience'] != null)
                  Positioned(
                    top: 12.h,
                    right: 12.w,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(20.r),
                      ),
                      child: Text(
                        doctor['experience'].toString(),
                        style: AppTypography.bodySmall(context).copyWith(
                          color: AppColors.white,
                          fontWeight: AppTypography.semiBold,
                          fontSize: 10.sp,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            // Content Section
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 12.h),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // Doctor name
                  Text(
                    (doctor['fullName'] ?? doctor['name'] ?? doctor['username'] ?? '').toString(),
                    style: AppTypography.headingS(context).copyWith(
                      fontSize: 14.sp,
                      fontWeight: AppTypography.bold,
                    ),
                    textAlign: TextAlign.right,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 2.h),
                  // Specialty
                  Text(
                    _doctorSpecialtyString(doctor),
                    style: AppTypography.bodySmall(context).copyWith(
                      color: AppColors.primary,
                      fontSize: 11.sp,
                      fontWeight: AppTypography.medium,
                    ),
                    textAlign: TextAlign.right,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 8.h),
                  // Info row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Available slots
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                        decoration: BoxDecoration(
                          color: AppColors.success.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8.r),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              AppIcons.calendar,
                              size: 14.sp,
                              color: AppColors.success,
                            ),
                            SizedBox(width: 4.w),
                            Text(
                              '$availableCount متاح',
                              style: AppTypography.bodySmall(context).copyWith(
                                color: AppColors.success,
                                fontWeight: AppTypography.semiBold,
                                fontSize: 11.sp,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Price
                      Row(
                        children: [
                          Text(
                            'ج.م',
                            style: AppTypography.bodySmall(context).copyWith(
                              color: AppColors.textTertiary,
                              fontSize: 10.sp,
                            ),
                          ),
                          SizedBox(width: 2.w),
                          Text(
                            '${doctor['price'] ?? doctor['sessionPrice'] ?? ''}',
                            style: AppTypography.headingS(context).copyWith(
                              color: AppColors.primary,
                              fontWeight: AppTypography.bold,
                              fontSize: 16.sp,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  SizedBox(height: 8.h),
                  // Book button
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.primary,
                          AppColors.primary.withOpacity(0.8),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(14.r),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () => context.push('/specialist/${doctor['id']}'),
                        borderRadius: BorderRadius.circular(14.r),
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 10.h),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'احجز الآن',
                                style: AppTypography.bodyMedium(context).copyWith(
                                  color: AppColors.white,
                                  fontWeight: AppTypography.semiBold,
                                ),
                              ),
                              SizedBox(width: 6.w),
                              Icon(
                                AppIcons.arrowBack,
                                size: 18.sp,
                                color: AppColors.white,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _doctorSpecialtyString(Map<String, dynamic> doctor) {
    final spec = doctor['specialty'] ?? doctor['specialization'];
    if (spec != null) return spec.toString();
    final list = doctor['specialties'];
    if (list is List && list.isNotEmpty) {
      return list.map((e) => e.toString()).join(' · ');
    }
    return '';
  }


  Widget _buildExamsSection(BuildContext context, bool isArabic) {
    final categories = MockAssessmentsData.categories;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: () => context.push('/assessments/categories?childId=mock_child_1'),
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      isArabic ? 'المزيد' : 'More',
                      style: AppTypography.bodyMedium(context).copyWith(
                        color: AppColors.primary,
                        fontWeight: AppTypography.semiBold,
                      ),
                    ),
                    SizedBox(width: 4.w),
                    Icon(
                      AppIcons.arrowForward,
                      size: 16.sp,
                      color: AppColors.primary,
                    ),
                  ],
                ),
              ),
            ),
            Row(
              children: [
                Container(
                  padding: EdgeInsets.all(8.w),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: Icon(
                    Icons.quiz_rounded,
                    size: 20.sp,
                    color: AppColors.primary,
                  ),
                ),
                SizedBox(width: 8.w),
                Text(
                  isArabic ? 'الاختبارات التقييمية' : 'Assessment Tests',
                  style: AppTypography.headingM(context),
                  textAlign: TextAlign.right,
                ),
              ],
            ),
          ],
        ),
        SizedBox(height: 20.h),
        // Horizontal Slider with improved cards - Fixed height
        SizedBox(
          height: 200.h,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            reverse: true,
            itemCount: categories.length,
            itemBuilder: (context, index) {
              final category = categories[index];
              return Padding(
                padding: EdgeInsets.only(left: 16.w),
                child: _buildExamCategoryCard(context, category, isArabic),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildExamCategoryCard(
    BuildContext context,
    Map<String, dynamic> category,
    bool isArabic,
  ) {
    final categoryColor = Color(category['color'] as int);
    final imageUrl = category['imageUrl'] as String?;
    final emoji = category['emoji'] as String? ?? '📝';
    
    return GestureDetector(
      onTap: () {
        context.push('/assessments/category/${category['id']}?childId=mock_child_1');
      },
      child: Container(
        width: 180.w,
        height: 200.h,
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(
            color: categoryColor.withOpacity(0.3),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: categoryColor.withOpacity(0.15),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            // Image Section
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
                  child: Container(
                    height: 90.h,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          categoryColor.withOpacity(0.3),
                          categoryColor.withOpacity(0.1),
                        ],
                      ),
                    ),
                    child: imageUrl != null
                        ? Image.network(
                            imageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return _buildEmojiPlaceholder(emoji, categoryColor);
                            },
                          )
                        : _buildEmojiPlaceholder(emoji, categoryColor),
                  ),
                ),
                // Emoji Badge
                Positioned(
                  top: 8.h,
                  right: 8.w,
                  child: Container(
                    padding: EdgeInsets.all(6.w),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                    child: Text(
                      emoji,
                      style: TextStyle(fontSize: 20.sp),
                    ),
                  ),
                ),
              ],
            ),
            // Content - Fixed overflow issue
            Padding(
              padding: EdgeInsets.all(12.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    category['title'] as String,
                    style: AppTypography.headingS(context).copyWith(
                      fontWeight: AppTypography.semiBold,
                      fontSize: 13.sp,
                    ),
                    textAlign: TextAlign.right,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    category['description'] as String,
                    style: AppTypography.bodySmall(context).copyWith(
                      color: AppColors.textSecondary,
                      fontSize: 10.sp,
                    ),
                    textAlign: TextAlign.right,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 8.h),
                  // Start Button
                  Container(
                    width: double.infinity,
                    padding: EdgeInsets.symmetric(vertical: 6.h),
                    decoration: BoxDecoration(
                      color: categoryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10.r),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.play_circle_filled_rounded,
                          size: 16.sp,
                          color: categoryColor,
                        ),
                        SizedBox(width: 4.w),
                        Text(
                          'ابدأ',
                          style: AppTypography.bodySmall(context).copyWith(
                            color: categoryColor,
                            fontWeight: AppTypography.semiBold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmojiPlaceholder(String emoji, Color color) {
    return Container(
      color: color.withOpacity(0.1),
      child: Center(
        child: Text(
          emoji,
          style: TextStyle(fontSize: 60.sp),
        ),
      ),
    );
  }

  IconData _getCategoryIcon(String iconName) {
    switch (iconName) {
      case 'volume_up':
        return Icons.volume_up_rounded;
      case 'mic':
        return Icons.mic_rounded;
      case 'image':
        return Icons.image_rounded;
      case 'sort':
        return Icons.sort_rounded;
      default:
        return Icons.help_outline_rounded;
    }
  }

  Widget _buildServicesSection(BuildContext context, List<Map<String, dynamic>> services, bool isArabic) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: () => context.push('/services'),
              child: Text(
                isArabic ? 'المزيد' : 'More',
                style: AppTypography.primaryText(context),
              ),
            ),
            Row(
              children: [
                Icon(
                  Icons.medical_services_rounded,
                  size: 20.sp,
                  color: AppColors.primary,
                ),
                SizedBox(width: 8.w),
                Text(
                  isArabic ? 'خدماتنا' : 'Our Services',
                  style: AppTypography.headingM(context),
                  textAlign: TextAlign.right,
                ),
              ],
            ),
          ],
        ),
        SizedBox(height: 16.h),
        if (services.isEmpty)
          _buildEmptySectionCard(
            context,
            icon: Icons.medical_services_outlined,
            message: isArabic ? 'لا توجد خدمات مُضافة حالياً' : 'No services added yet',
          )
        else
          ...services.map((service) => Padding(
            padding: EdgeInsets.only(bottom: 12.h),
            child: _buildServiceCard(
              context,
              title: service['title'] ?? '',
              description: service['description'] ?? '',
              imageUrl: service['imageUrl'] ?? AppConfig.defaultServiceImage,
              onTap: () {
                final link = service['link'];
                if (link != null && link.startsWith('/')) {
                  context.push(link);
                } else {
                  context.push('/appointments/booking');
                }
              },
            ),
          )).toList(),
      ],
    );
  }

  Widget _buildServiceCard(
    BuildContext context, {
    required String title,
    required String description,
    required String imageUrl,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(16.w),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(
              AppIcons.arrowForward,
              size: 24.sp,
              color: AppColors.primary,
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    title,
                    style: AppTypography.headingS(context),
                    textAlign: TextAlign.right,
                  ),
                  SizedBox(height: 6.h),
                  Text(
                    description,
                    style: AppTypography.bodyMedium(context).copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.right,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            SizedBox(width: 12.w),
            Container(
              width: 80.w,
              height: 80.w,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(color: AppColors.border),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12.r),
                child: Image.network(
                  imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: AppColors.gray100,
                      child: Icon(
                        AppIcons.image,
                        size: 32.sp,
                        color: AppColors.gray400,
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingAppointments(BuildContext context, bool isArabic) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: () => context.push('/appointments'),
              child: Text(
                isArabic ? 'المزيد' : 'More',
                style: AppTypography.primaryText(context),
              ),
            ),
            Row(
              children: [
                Icon(
                  AppIcons.calendar,
                  size: 20.sp,
                  color: AppColors.primary,
                ),
                SizedBox(width: 8.w),
                Text(
                  isArabic ? 'الاجتماعات القادمة' : 'Upcoming Appointments',
                  style: AppTypography.headingM(context),
                ),
              ],
            ),
          ],
        ),
        SizedBox(height: 16.h),
        _buildAppointmentCard(context, isArabic),
      ],
    );
  }

  Widget _buildAppointmentCard(BuildContext context, bool isArabic) {
    return GestureDetector(
      onTap: () {
        context.push('/appointments/app_1');
      },
      child: Container(
        padding: EdgeInsets.all(20.w),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                OutlinedButton(
                  onPressed: () {
                    context.push('/appointments');
                  },
                  style: OutlinedButton.styleFrom(
                    padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                    minimumSize: Size(72.w, 32.h),
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10.r),
                    ),
                  ),
                  child: Text(
                    isArabic ? 'تعديل' : 'Edit',
                    style: AppTypography.bodySmall(context).copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                ),
                Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          isArabic ? 'اسم الاخصائي' : 'Specialist Name',
                          style: AppTypography.headingS(context),
                          textAlign: TextAlign.right,
                        ),
                        SizedBox(height: 4.h),
                        Row(
                          children: [
                            Text(
                              '98',
                              style: AppTypography.numberText(context),
                            ),
                            SizedBox(width: 8.w),
                            const RatingWidget(rating: 4.9, showNumber: false),
                          ],
                        ),
                      ],
                    ),
                    SizedBox(width: 16.w),
                    Container(
                      width: 48.w,
                      height: 48.w,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.border),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24.r),
                        child: Image.network(
                          'https://via.placeholder.com/48',
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Icon(
                              AppIcons.person,
                              size: 24.sp,
                              color: AppColors.gray400,
                            );
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            SizedBox(height: 20.h),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  isArabic ? 'وقت الاجتماع' : 'Meeting Time',
                  style: AppTypography.headingS(context),
                  textAlign: TextAlign.right,
                ),
                SizedBox(height: 4.h),
                Text(
                  '25 مارس، الأحد، 09:00 صباحًا\nخلال 3 أيام',
                  style: AppTypography.bodyMedium(context).copyWith(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.right,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }


  Widget _buildArticlesSection(BuildContext context, List<Map<String, dynamic>> articles, bool isArabic) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: () => context.push('/articles'),
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      isArabic ? 'المزيد' : 'More',
                      style: AppTypography.bodyMedium(context).copyWith(
                        color: AppColors.primary,
                        fontWeight: AppTypography.semiBold,
                      ),
                    ),
                    SizedBox(width: 4.w),
                    Icon(
                      AppIcons.arrowForward,
                      size: 16.sp,
                      color: AppColors.primary,
                    ),
                  ],
                ),
              ),
            ),
            Row(
              children: [
                Container(
                  padding: EdgeInsets.all(8.w),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: Icon(
                    Icons.article_rounded,
                    size: 20.sp,
                    color: AppColors.primary,
                  ),
                ),
                SizedBox(width: 8.w),
                Text(
                  isArabic ? 'المقالات والأخبار' : 'Articles & News',
                  style: AppTypography.headingM(context),
                ),
              ],
            ),
          ],
        ),
        SizedBox(height: 20.h),
        if (articles.isEmpty)
          _buildEmptySectionCard(
            context,
            icon: Icons.article_outlined,
            message: isArabic ? 'لا توجد مقالات أو أخبار حالياً' : 'No articles or news at the moment',
          )
        else
          SizedBox(
            height: 300.h,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              reverse: true,
              itemCount: articles.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: EdgeInsets.only(left: 16.w),
                  child: _buildArticleCard(context, articles[index], isArabic),
                );
              },
            ),
          ),
      ],
    );
  }

  /// بطاقة حالة فراغ موحّدة لأي قسم (خدمات، مقالات، إلخ).
  Widget _buildEmptySectionCard(
    BuildContext context, {
    required IconData icon,
    required String message,
  }) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(vertical: 32.h, horizontal: 24.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 48.sp, color: AppColors.gray300),
          SizedBox(height: 12.h),
          Text(
            message,
            style: AppTypography.bodyMedium(context).copyWith(color: AppColors.textTertiary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildArticleCard(BuildContext context, Map<String, dynamic> article, bool isArabic) {
    final imageUrl = article['imageUrl'] ?? AppConfig.defaultArticleImage;
    final title = article['title'] ?? '';
    final description = article['description'] ?? '';
    final link = article['link'];
    
    return GestureDetector(
      onTap: link != null && link.startsWith('/') 
        ? () => context.push(link)
        : () {
            // Default: show article details
            showDialog(
              context: context,
              builder: (context) => AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24.r),
                ),
                contentPadding: EdgeInsets.zero,
                content: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
                            child: Image.network(
                              imageUrl,
                              width: double.infinity,
                              height: 220.h,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  height: 220.h,
                                  color: AppColors.gray100,
                                  child: Icon(
                                    AppIcons.image,
                                    size: 48.sp,
                                    color: AppColors.gray400,
                                  ),
                                );
                              },
                            ),
                          ),
                          Positioned(
                            top: 12.h,
                            right: 12.w,
                            child: Container(
                              padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: BorderRadius.circular(12.r),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.article_rounded,
                                    size: 14.sp,
                                    color: AppColors.white,
                                  ),
                                  SizedBox(width: 4.w),
                                  Text(
                                    'مقال',
                                    style: AppTypography.bodySmall(context).copyWith(
                                      color: AppColors.white,
                                      fontWeight: AppTypography.semiBold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      Padding(
                        padding: EdgeInsets.all(24.w),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              title,
                              style: AppTypography.headingM(context),
                              textAlign: TextAlign.right,
                            ),
                            SizedBox(height: 12.h),
                            Text(
                              description,
                              style: AppTypography.bodyMedium(context).copyWith(
                                color: AppColors.textSecondary,
                                height: AppTypography.lineHeightRelaxed,
                              ),
                              textAlign: TextAlign.right,
                            ),
                            if (article['content'] != null) ...[
                              SizedBox(height: 16.h),
                              Divider(color: AppColors.border),
                              SizedBox(height: 16.h),
                              Text(
                                article['content'] as String,
                                style: AppTypography.bodyMedium(context).copyWith(
                                  height: AppTypography.lineHeightRelaxed,
                                ),
                                textAlign: TextAlign.right,
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                actions: [
                  Padding(
                    padding: EdgeInsets.all(16.w),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          padding: EdgeInsets.symmetric(vertical: 14.h),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16.r),
                          ),
                        ),
                        child: Text(
                          'إغلاق',
                          style: AppTypography.bodyLarge(context).copyWith(
                            color: AppColors.white,
                            fontWeight: AppTypography.semiBold,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
      child: Container(
        width: 320.w,
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(24.r),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            // Image with gradient overlay
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
                  child: Image.network(
                    imageUrl,
                    width: double.infinity,
                    height: 140.h,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        height: 140.h,
                        color: AppColors.gray100,
                        child: Icon(
                          AppIcons.image,
                          size: 48.sp,
                          color: AppColors.gray400,
                        ),
                      );
                    },
                  ),
                ),
                // Gradient overlay
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: 48.h,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.6),
                        ],
                      ),
                    ),
                  ),
                ),
                // Article badge
                Positioned(
                  top: 12.h,
                  right: 12.w,
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
                    decoration: BoxDecoration(
                      color: AppColors.white.withOpacity(0.9),
                      borderRadius: BorderRadius.circular(12.r),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.article_rounded,
                          size: 14.sp,
                          color: AppColors.primary,
                        ),
                        SizedBox(width: 4.w),
                        Text(
                          'مقال',
                          style: AppTypography.bodySmall(context).copyWith(
                            color: AppColors.primary,
                            fontWeight: AppTypography.semiBold,
                            fontSize: 11.sp,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            // Content
            Expanded(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 12.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          title,
                          style: AppTypography.headingS(context).copyWith(fontSize: 14.sp),
                          textAlign: TextAlign.right,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: 6.h),
                        Text(
                          description,
                          style: AppTypography.bodySmall(context).copyWith(
                            color: AppColors.textSecondary,
                            fontSize: 12.sp,
                            height: 1.35,
                          ),
                          textAlign: TextAlign.right,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                    SizedBox(height: 8.h),
                    // Read more button
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Icon(
                          AppIcons.arrowBack,
                          size: 16.sp,
                          color: AppColors.primary,
                        ),
                        Text(
                          'اقرأ المزيد',
                          style: AppTypography.bodyMedium(context).copyWith(
                            color: AppColors.primary,
                            fontWeight: AppTypography.semiBold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
