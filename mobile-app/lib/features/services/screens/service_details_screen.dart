import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../../core/widgets/app_header.dart';
import '../../shared/mock_content.dart';
import '../constants/services_theme.dart';
import '../widgets/service_section.dart';

/// Service details – hero, content sections, sticky CTA, related specialists, FAQs.
/// Clean hierarchy; does not break existing APIs or booking.
class ServiceDetailsScreen extends StatefulWidget {
  final String serviceId;

  const ServiceDetailsScreen({super.key, required this.serviceId});

  @override
  State<ServiceDetailsScreen> createState() => _ServiceDetailsScreenState();
}

class _ServiceDetailsScreenState extends State<ServiceDetailsScreen> {
  static IconData _iconFrom(String? name) {
    switch (name) {
      case 'record_voice_over':
        return Icons.record_voice_over_rounded;
      case 'psychology':
        return Icons.psychology_rounded;
      case 'assignment':
        return Icons.assignment_rounded;
      default:
        return Icons.miscellaneous_services_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final service = MockContent.services
        .where((item) => item['id'] == widget.serviceId)
        .toList()
        .isNotEmpty
        ? MockContent.services.firstWhere((item) => item['id'] == widget.serviceId)
        : MockContent.services.first;

    final title = service['title']?.toString() ?? '';
    final description = service['description']?.toString() ?? '';
    final imageUrl = service['imageUrl']?.toString() ?? '';
    final overview = service['overview']?.toString();
    final whoIsItFor = service['whoIsItFor']?.toString();
    final benefits = service['benefits'];
    final howItWorks = service['howItWorks'];
    final duration = service['duration']?.toString();
    final requirements = service['requirements']?.toString();
    final pricing = service['pricing']?.toString();
    final iconName = service['icon']?.toString();

    final benefitsList = benefits is List
        ? (benefits as List).map((e) => e.toString()).where((s) => s.isNotEmpty).toList()
        : <String>[];
    final howItWorksList = howItWorks is List
        ? (howItWorks as List).map((e) => e.toString()).where((s) => s.isNotEmpty).toList()
        : <String>[];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Stack(
          children: [
            CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: AppHeader(
                    title: 'تفاصيل الخدمة',
                    leading: IconButton(
                      icon: Icon(AppIcons.arrowBack, size: 24.sp, color: AppColors.textPrimary),
                      onPressed: () => context.pop(),
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 20.w),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _HeroSection(
                          title: title,
                          description: description,
                          imageUrl: imageUrl,
                          icon: _iconFrom(iconName),
                        ),
                        SizedBox(height: 24.h),
                        if (overview != null && overview.isNotEmpty)
                          ServiceSection(
                            icon: Icons.info_outline_rounded,
                            title: 'نظرة عامة',
                            bodyText: overview,
                          ),
                        if (overview != null && overview.isNotEmpty) SizedBox(height: 16.h),
                        if (whoIsItFor != null && whoIsItFor.isNotEmpty)
                          ServiceSection(
                            icon: Icons.person_outline_rounded,
                            title: 'لمن هذه الخدمة؟',
                            bodyText: whoIsItFor,
                          ),
                        if (whoIsItFor != null && whoIsItFor.isNotEmpty) SizedBox(height: 16.h),
                        if (benefitsList.isNotEmpty)
                          ServiceSection(
                            icon: Icons.check_circle_outline_rounded,
                            title: 'الفوائد والنتائج',
                            child: ServiceSectionBullets(items: benefitsList),
                          ),
                        if (benefitsList.isNotEmpty) SizedBox(height: 16.h),
                        if (howItWorksList.isNotEmpty)
                          ServiceSection(
                            icon: Icons.timeline_rounded,
                            title: 'كيف تعمل الخدمة',
                            child: _NumberedSteps(items: howItWorksList),
                          ),
                        if (howItWorksList.isNotEmpty) SizedBox(height: 16.h),
                        if (duration != null || requirements != null || (pricing != null && pricing.isNotEmpty))
                          ServiceSection(
                            icon: Icons.schedule_rounded,
                            title: 'المدة والمتطلبات',
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                if (duration != null && duration.isNotEmpty)
                                  _InfoRow(label: 'المدة', value: duration),
                                if (requirements != null && requirements.isNotEmpty) ...[
                                  if (duration != null && duration.isNotEmpty) SizedBox(height: 8.h),
                                  _InfoRow(label: 'المتطلبات', value: requirements),
                                ],
                                if (pricing != null && pricing.isNotEmpty) ...[
                                  if (duration != null || requirements != null) SizedBox(height: 8.h),
                                  _InfoRow(label: 'السعر', value: pricing),
                                ],
                              ],
                            ),
                          ),
                        if (duration != null || requirements != null || (pricing != null && pricing.isNotEmpty))
                          SizedBox(height: 16.h),
                        _RelatedSection(onTap: () => context.push('/doctors')),
                        SizedBox(height: 16.h),
                        _FaqSection(),
                        SizedBox(height: 100.h),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                padding: EdgeInsets.fromLTRB(20.w, 12.h, 20.w, 12.h + MediaQuery.paddingOf(context).bottom),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 12,
                      offset: const Offset(0, -4),
                    ),
                  ],
                ),
                child: SafeArea(
                  top: false,
                  child: SizedBox(
                    height: 52.h,
                    child: ElevatedButton(
                      onPressed: () => context.push('/appointments/booking'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(ServicesTheme.buttonRadius),
                        ),
                      ),
                      child: Text(
                        'احجز الآن',
                        style: AppTypography.bodyLarge(context).copyWith(
                          color: Colors.white,
                          fontWeight: AppTypography.semiBold,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HeroSection extends StatelessWidget {
  final String title;
  final String description;
  final String imageUrl;
  final IconData icon;

  const _HeroSection({
    required this.title,
    required this.description,
    required this.imageUrl,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: 20.h),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(ServicesTheme.cardRadius),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(ServicesTheme.cardRadius),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Stack(
              children: [
                Image.network(
                  imageUrl,
                  width: double.infinity,
                  height: 200.h,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    height: 200.h,
                    color: AppColors.gray100,
                    child: Icon(Icons.image_rounded, size: 56.sp, color: AppColors.textTertiary),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: 80.h,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, Colors.black.withOpacity(0.75)],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 16.h,
                  right: 16.w,
                  child: Container(
                    padding: EdgeInsets.all(12.w),
                    decoration: BoxDecoration(
                      color: AppColors.white.withOpacity(0.95),
                      borderRadius: BorderRadius.circular(16.r),
                    ),
                    child: Icon(icon, size: 32.sp, color: AppColors.primary),
                  ),
                ),
              ],
            ),
            Container(
              padding: EdgeInsets.all(20.w),
              color: AppColors.white,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    title,
                    style: AppTypography.headingL(context).copyWith(
                      fontSize: 22.sp,
                      color: ServicesTheme.textPrimary,
                      fontWeight: AppTypography.bold,
                    ),
                    textAlign: TextAlign.right,
                  ),
                  SizedBox(height: 8.h),
                  Text(
                    description,
                    style: AppTypography.bodyMedium(context).copyWith(
                      fontSize: 14.sp,
                      color: ServicesTheme.textSecondary,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.right,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NumberedSteps extends StatelessWidget {
  final List<String> items;

  const _NumberedSteps({required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (int i = 0; i < items.length; i++) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            textDirection: TextDirection.rtl,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  items[i],
                  style: AppTypography.bodyMedium(context).copyWith(
                    fontSize: 14.sp,
                    color: ServicesTheme.textSecondary,
                    height: 1.45,
                  ),
                  textAlign: TextAlign.right,
                ),
              ),
              SizedBox(width: 10.w),
              Container(
                width: 28.w,
                height: 28.w,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  '${i + 1}',
                  style: TextStyle(
                    fontFamily: AppTypography.numberFont,
                    fontSize: 13.sp,
                    fontWeight: AppTypography.semiBold,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          if (i < items.length - 1) SizedBox(height: 12.h),
        ],
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      textDirection: TextDirection.rtl,
      children: [
        Text(
          value,
          style: AppTypography.bodyMedium(context).copyWith(
            fontSize: 14.sp,
            color: ServicesTheme.textPrimary,
          ),
          textAlign: TextAlign.right,
        ),
        Text(
          label,
          style: AppTypography.bodySmall(context).copyWith(
            fontSize: 13.sp,
            color: ServicesTheme.textTertiary,
          ),
          textAlign: TextAlign.right,
        ),
      ],
    );
  }
}

class _RelatedSection extends StatelessWidget {
  final VoidCallback onTap;

  const _RelatedSection({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ServiceSection(
      icon: Icons.medical_services_rounded,
      title: 'المختصون المرتبطون',
      child: GestureDetector(
        onTap: onTap,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          textDirection: TextDirection.rtl,
          children: [
            Text(
              'عرض الأطباء والمختصين',
              style: AppTypography.bodyMedium(context).copyWith(
                color: AppColors.primary,
                fontWeight: AppTypography.semiBold,
              ),
            ),
            Icon(AppIcons.arrowBack, size: 20.sp, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}

class _FaqSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final faqs = [
      {'q': 'كم عدد الجلسات المطلوبة؟', 'a': 'يختلف حسب حالة الطفل ويتم تحديده بعد التقييم الأولي.'},
      {'q': 'هل يمكن الحضور أونلاين؟', 'a': 'نعم، نوفر جلسات حضورياً وأونلاين حسب الخدمة والتوفر.'},
    ];
    return ServiceSection(
      icon: Icons.help_outline_rounded,
      title: 'أسئلة شائعة',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (final faq in faqs) ...[
            Padding(
              padding: EdgeInsets.only(bottom: 12.h),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    faq['q']!,
                    style: AppTypography.bodyMedium(context).copyWith(
                      fontWeight: AppTypography.semiBold,
                      color: ServicesTheme.textPrimary,
                      fontSize: 14.sp,
                    ),
                    textAlign: TextAlign.right,
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    faq['a']!,
                    style: AppTypography.bodySmall(context).copyWith(
                      color: ServicesTheme.textSecondary,
                      fontSize: 13.sp,
                      height: 1.45,
                    ),
                    textAlign: TextAlign.right,
                  ),
                ],
              ),
            ),
            if (faq != faqs.last)
              Divider(height: 1, color: ServicesTheme.cardBorder),
            if (faq != faqs.last) SizedBox(height: 12.h),
          ],
        ],
      ),
    );
  }
}
