import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_navigation_bar.dart';
import '../../../core/widgets/toast_helper.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/providers/doctors_provider.dart';
import '../../shared/mock_content.dart';
import '../constants/doctors_theme.dart';
import '../data/doctors_filters.dart';
import '../widgets/doctor_card.dart';
import '../widgets/doctor_card_skeleton.dart';

/// Doctors & Specialists – professional, elegant design.
/// Same structure as rest of app: AppHeader → content (header block, sticky filters, grid/empty/skeleton).
/// Advanced filtering and search; reusable DoctorCard; state-driven; does not break APIs or booking.
class DoctorsListScreen extends StatefulWidget {
  final String? recommendedForChildId;

  const DoctorsListScreen({super.key, this.recommendedForChildId});

  @override
  State<DoctorsListScreen> createState() => _DoctorsListScreenState();
}

class _DoctorsListScreenState extends State<DoctorsListScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _specialtyFilter = 'all';
  AvailabilityFilter _availabilityFilter = AvailabilityFilter.all;
  double _minRating = 0.0;
  int _minExperience = 0;
  List<Map<String, dynamic>> _sourceDoctors = List<Map<String, dynamic>>.from(
    MockContent.doctors.map((e) => Map<String, dynamic>.from(e)),
  );
  bool _useApi = false;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() => setState(() {}));
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadDoctors());
  }

  Future<void> _loadDoctors() async {
    try {
      final dp = context.read<DoctorsProvider>();
      final ok = await dp.loadDoctors(recommendedForChildId: widget.recommendedForChildId);
      if (mounted) {
        setState(() {
          _useApi = ok;
          _sourceDoctors = _useApi && dp.doctors.isNotEmpty
              ? List<Map<String, dynamic>>.from(dp.doctors.map((e) => Map<String, dynamic>.from(e)))
              : List<Map<String, dynamic>>.from(MockContent.doctors.map((e) => Map<String, dynamic>.from(e)));
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _useApi = false;
          _sourceDoctors = List<Map<String, dynamic>>.from(
            MockContent.doctors.map((e) => Map<String, dynamic>.from(e)),
          );
        });
      }
    }
  }

  List<Map<String, dynamic>> get _filteredDoctors {
    final query = _searchController.text.trim().toLowerCase();
    return _sourceDoctors.where((doc) {
      if (query.isNotEmpty) {
        final name = (doc['name'] ?? doc['username'] ?? '').toString().toLowerCase();
        final spec = _specString(doc).toLowerCase();
        if (!name.contains(query) && !spec.contains(query)) return false;
      }
      if (_specialtyFilter != 'all') {
        if (!_specString(doc).contains(_specialtyFilter)) return false;
      }
      if (_availabilityFilter == AvailabilityFilter.online) {
        if (doc['isOnline'] != true) return false;
      } else if (_availabilityFilter == AvailabilityFilter.offline) {
        if (doc['isOnline'] == true) return false;
      }
      final rating = (doc['rating'] as num?)?.toDouble() ?? 0.0;
      if (rating < _minRating) return false;
      final years = parseExperienceYears(doc['experience']);
      if (years != null && years < _minExperience) return false;
      return true;
    }).toList();
  }

  String _specString(Map<String, dynamic> doc) {
    if (doc['specialties'] is List && (doc['specialties'] as List).isNotEmpty) {
      return (doc['specialties'] as List).join(' ');
    }
    return (doc['specialty'] ?? doc['specialization'] ?? '').toString();
  }

  String _priceFromDoctor(Map<String, dynamic> doc) {
    final sp = doc['sessionPrices'];
    if (sp is List && sp.isNotEmpty) {
      num? minP;
      for (final e in sp) {
        if (e is Map && e['price'] != null) {
          final p = (e['price'] is num) ? e['price'] as num : num.tryParse(e['price'].toString());
          if (p != null && (minP == null || p < minP)) minP = p;
        }
      }
      if (minP != null) return minP.toString();
    }
    return doc['price']?.toString() ?? '';
  }

  static String? _initialsFromName(String? name) {
    if (name == null || name.trim().isEmpty) return null;
    final parts = name.trim().split(RegExp(r'\s+')).where((s) => s.isNotEmpty).toList();
    if (parts.isEmpty) return null;
    if (parts.length == 1) return parts[0].length >= 1 ? parts[0][0] : null;
    final a = parts[0].length >= 1 ? parts[0][0] : '';
    final b = parts[1].length >= 1 ? parts[1][0] : '';
    return (a + b).trim().isEmpty ? null : (a + b).trim();
  }

  int _crossAxisCount() {
    final width = MediaQuery.sizeOf(context).width;
    if (width > 700) return 2;
    return 1;
  }

  void _clearFilters() {
    _searchController.clear();
    setState(() {
      _specialtyFilter = 'all';
      _availabilityFilter = AvailabilityFilter.all;
      _minRating = 0.0;
      _minExperience = 0;
    });
    if (mounted) ToastHelper.show(context, message: 'تم مسح الفلاتر', success: true);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pageTitle = widget.recommendedForChildId != null
        ? 'مختصون مناسبون لطفلك'
        : 'الأطباء والمختصون';
    final subtitle = widget.recommendedForChildId != null
        ? 'اختر مختصاً من القائمة لحجز جلسة أو عرض الملف'
        : 'اختر طبيباً أو مختصاً لعرض الملف وحجز المواعيد';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: pageTitle,
              leading: IconButton(
                icon: Icon(AppIcons.arrowBack, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: Consumer<DoctorsProvider>(
                builder: (context, dp, _) {
                  final loading = dp.isLoading && _sourceDoctors.isEmpty;
                  final list = _filteredDoctors;

                  return CustomScrollView(
                    slivers: [
                      SliverToBoxAdapter(
                        child: _HeaderSection(title: pageTitle, subtitle: subtitle),
                      ),
                      SliverPersistentHeader(
                        pinned: true,
                        delegate: _StickyFiltersDelegate(
                          searchController: _searchController,
                          specialtyFilter: _specialtyFilter,
                          onSpecialtyChanged: (v) => setState(() => _specialtyFilter = v),
                          availabilityFilter: _availabilityFilter,
                          onAvailabilityChanged: (v) => setState(() => _availabilityFilter = v),
                          minRating: _minRating,
                          onRatingChanged: (v) => setState(() => _minRating = v),
                          minExperience: _minExperience,
                          onExperienceChanged: (v) => setState(() => _minExperience = v),
                        ),
                      ),
                      if (loading)
                        SliverPadding(
                          padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                          sliver: SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (_, i) => Padding(
                                padding: EdgeInsets.only(bottom: 12.h),
                                child: DoctorCardSkeleton(),
                              ),
                              childCount: 6,
                            ),
                          ),
                        )
                      else if (list.isEmpty)
                        SliverToBoxAdapter(
                          child: ConstrainedBox(
                            constraints: BoxConstraints(minHeight: 280),
                            child: Center(
                              child: _EmptyState(
                                hasFilters: _searchController.text.isNotEmpty ||
                                    _specialtyFilter != 'all' ||
                                    _availabilityFilter != AvailabilityFilter.all ||
                                    _minRating > 0 ||
                                    _minExperience > 0,
                                onClear: _clearFilters,
                              ),
                            ),
                          ),
                        )
                      else
                        SliverPadding(
                          padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                          sliver: SliverGrid(
                            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: _crossAxisCount(),
                              mainAxisSpacing: 12.h,
                              crossAxisSpacing: 12.w,
                              childAspectRatio: 0.64,
                            ),
                            delegate: SliverChildBuilderDelegate(
                              (context, index) {
                                final doctor = list[index];
                                return DoctorCard(
                                  doctor: doctor,
                                  specString: _specString(doctor),
                                  priceString: _priceFromDoctor(doctor),
                                  initials: _initialsFromName(doctor['name']?.toString()),
                                );
                              },
                              childCount: list.length,
                            ),
                          ),
                        ),
                    ],
                  );
                },
              ),
            ),
            AppNavigationBar(
              currentIndex: 0,
              onTap: (index) {
                switch (index) {
                  case 0:
                    break;
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
  }
}

/// Header: page title + short subtitle. Clean, calm, medical-friendly.
class _HeaderSection extends StatelessWidget {
  final String title;
  final String subtitle;

  const _HeaderSection({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            title,
            style: AppTypography.headingL(context).copyWith(
              fontSize: 22.sp,
              color: AppColors.textPrimary,
              fontWeight: AppTypography.bold,
            ),
            textAlign: TextAlign.right,
          ),
          SizedBox(height: 6.h),
          Text(
            subtitle,
            style: AppTypography.bodyMedium(context).copyWith(
              fontSize: 14.sp,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
            textAlign: TextAlign.right,
          ),
        ],
      ),
    );
  }
}

class _StickyFiltersDelegate extends SliverPersistentHeaderDelegate {
  final TextEditingController searchController;
  final String specialtyFilter;
  final ValueChanged<String> onSpecialtyChanged;
  final AvailabilityFilter availabilityFilter;
  final ValueChanged<AvailabilityFilter> onAvailabilityChanged;
  final double minRating;
  final ValueChanged<double> onRatingChanged;
  final int minExperience;
  final ValueChanged<int> onExperienceChanged;

  _StickyFiltersDelegate({
    required this.searchController,
    required this.specialtyFilter,
    required this.onSpecialtyChanged,
    required this.availabilityFilter,
    required this.onAvailabilityChanged,
    required this.minRating,
    required this.onRatingChanged,
    required this.minExperience,
    required this.onExperienceChanged,
  });

  static const double _headerHeight = 220.0;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return SizedBox(
      height: _headerHeight,
      child: Container(
        color: AppColors.background,
        padding: EdgeInsets.fromLTRB(16.w, 6.h, 16.w, 8.h),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: searchController,
              textDirection: TextDirection.rtl,
              decoration: InputDecoration(
                hintText: 'ابحث بالاسم أو التخصص...',
                hintStyle: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 14.sp,
                  color: AppColors.textPlaceholder,
                ),
                prefixIcon: Icon(AppIcons.search, size: 22.sp, color: AppColors.textTertiary),
                filled: true,
                fillColor: AppColors.cardBackground,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14.r),
                  borderSide: BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14.r),
                  borderSide: BorderSide(color: AppColors.border),
                ),
                contentPadding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
              ),
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 14.sp,
                color: AppColors.textPrimary,
              ),
            ),
            SizedBox(height: 8.h),
            SizedBox(
              height: 34.h,
              child: ListView(
                scrollDirection: Axis.horizontal,
                reverse: true,
                children: specialtyOptions.map((opt) {
                  final value = opt['value'] ?? 'all';
                  final label = opt['label'] ?? 'الكل';
                  final selected = specialtyFilter == value;
                  return Padding(
                    padding: EdgeInsets.only(left: 8.w),
                    child: FilterChip(
                      label: Text(label, style: TextStyle(fontFamily: AppTypography.primaryFont, fontSize: 12.sp)),
                      selected: selected,
                      onSelected: (_) => onSpecialtyChanged(value),
                      backgroundColor: AppColors.cardBackground,
                      selectedColor: DoctorsTheme.primary,
                      checkmarkColor: Colors.white,
                      side: BorderSide(
                        color: selected ? DoctorsTheme.primary : AppColors.border,
                      ),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  );
                }).toList(),
              ),
            ),
            SizedBox(height: 6.h),
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<AvailabilityFilter>(
                    value: availabilityFilter,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: AppColors.cardBackground,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12.r),
                        borderSide: BorderSide(color: AppColors.border),
                      ),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                    ),
                    isExpanded: true,
                    items: AvailabilityFilter.values
                        .map((e) => DropdownMenuItem(value: e, child: Text(e.label, style: TextStyle(fontSize: 12.sp))))
                        .toList(),
                    onChanged: (v) => v != null ? onAvailabilityChanged(v) : null,
                  ),
                ),
                SizedBox(width: 8.w),
                Expanded(
                  child: DropdownButtonFormField<double>(
                    value: ratingOptions.any((e) => (e['value'] as double) == minRating) ? minRating : 0.0,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: AppColors.cardBackground,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12.r),
                        borderSide: BorderSide(color: AppColors.border),
                      ),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                    ),
                    isExpanded: true,
                    items: ratingOptions
                        .map((e) => DropdownMenuItem(
                              value: e['value'] as double,
                              child: Text(e['label'] as String, style: TextStyle(fontSize: 12.sp)),
                            ))
                        .toList(),
                    onChanged: (v) => v != null ? onRatingChanged(v) : null,
                  ),
                ),
                SizedBox(width: 8.w),
                Expanded(
                  child: DropdownButtonFormField<int>(
                    value: experienceOptions.any((e) => (e['value'] as int) == minExperience) ? minExperience : 0,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: AppColors.cardBackground,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12.r),
                        borderSide: BorderSide(color: AppColors.border),
                      ),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                    ),
                    isExpanded: true,
                    items: experienceOptions
                        .map((e) => DropdownMenuItem(
                              value: e['value'] as int,
                              child: Text(e['label'] as String, style: TextStyle(fontSize: 12.sp)),
                            ))
                        .toList(),
                    onChanged: (v) => v != null ? onExperienceChanged(v) : null,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  double get minExtent => _headerHeight;

  @override
  double get maxExtent => _headerHeight;

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) => true;
}

class _EmptyState extends StatelessWidget {
  final bool hasFilters;
  final VoidCallback onClear;

  const _EmptyState({required this.hasFilters, required this.onClear});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(32.w),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.person_search_rounded,
            size: 80.sp,
            color: AppColors.textTertiary.withOpacity(0.6),
          ),
          SizedBox(height: 20.h),
          Text(
            hasFilters ? 'لا توجد نتائج تطابق الفلاتر' : 'لا يوجد أطباء أو مختصون',
            style: AppTypography.headingM(context).copyWith(color: AppColors.textPrimary),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 10.h),
          Text(
            hasFilters ? 'جرّب تغيير البحث أو الفلاتر' : 'سيتم إضافة المختصين قريباً.',
            style: AppTypography.bodyMedium(context).copyWith(
              color: AppColors.textSecondary,
              fontSize: 14.sp,
            ),
            textAlign: TextAlign.center,
          ),
          if (hasFilters) ...[
            SizedBox(height: 20.h),
            TextButton.icon(
              onPressed: onClear,
              icon: Icon(Icons.clear_all_rounded, size: 20.sp, color: DoctorsTheme.primary),
              label: Text(
                'مسح الفلاتر',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 14.sp,
                  fontWeight: AppTypography.semiBold,
                  color: DoctorsTheme.primary,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
