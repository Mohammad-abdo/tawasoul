import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/app_config.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../../core/widgets/rating_widget.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../../core/providers/doctors_provider.dart';
import '../../../core/providers/children_provider.dart';
import '../../../core/providers/bookings_provider.dart';

/// Redesigned Appointment Booking Screen
/// Step-by-step booking process with clear visual feedback
/// Clean, simple, user-friendly interface
/// Supports childId, date, and time from query parameters
class AppointmentBookingScreen extends StatefulWidget {
  const AppointmentBookingScreen({super.key});

  @override
  State<AppointmentBookingScreen> createState() => _AppointmentBookingScreenState();
}

class _AppointmentBookingScreenState extends State<AppointmentBookingScreen> {
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String? _selectedTime;
  String? _childId;
  String? _selectedSpecialistId;
  Map<String, dynamic>? _doctorCache;
  final TextEditingController _notesController = TextEditingController();
  int _characterCount = 0;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _notesController.addListener(() {
      setState(() {
        _characterCount = _notesController.text.length;
      });
    });
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadFromParams());
  }

  Future<void> _loadFromParams() async {
    final uri = GoRouterState.of(context).uri;
    final specialistId = uri.queryParameters['specialistId'];
    if (specialistId != null && specialistId.isNotEmpty && specialistId != _selectedSpecialistId) {
      setState(() => _selectedSpecialistId = specialistId);
      final dp = context.read<DoctorsProvider>();
      final doctor = await dp.getDoctorById(specialistId);
      if (mounted && doctor != null) setState(() => _doctorCache = doctor);
    }
    final cId = uri.queryParameters['childId'];
    if (cId != null && cId.isNotEmpty) setState(() => _childId = cId);
    final time = uri.queryParameters['time'];
    if (time != null && time.isNotEmpty) setState(() => _selectedTime = time);
  }

  final List<String> _availableTimes = [
    '10:00 ص',
    '11:00 ص',
    '01:00 م',
    '02:00 م',
    '03:00 م',
    '04:00 م',
    '05:00 م',
    '06:00 م',
    '08:00 م',
    '09:00 م',
    '10:00 م',
    '11:00 م',
  ];

  final List<String> _unavailableTimes = [
    '12:00 م',
    '07:00 ص',
  ];

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  String _formatDate(DateTime date) {
    final months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  String _getDayName(DateTime date) {
    final days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    return days[date.weekday % 7];
  }

  bool get _canProceed => _selectedSpecialistId != null && _selectedTime != null && _childId != null;

  Map<String, dynamic>? get _selectedSpecialist {
    if (_selectedSpecialistId == null) return _doctorCache;
    if (_doctorCache != null && _doctorCache!['id'] == _selectedSpecialistId) return _doctorCache;
    final dp = context.read<DoctorsProvider>();
    try {
      return dp.doctors.firstWhere((doc) => '${doc['id']}' == _selectedSpecialistId);
    } catch (_) {
      return _doctorCache;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Get query parameters
    final uri = GoRouterState.of(context).uri;
    final childIdParam = uri.queryParameters['childId'];
    final timeParam = uri.queryParameters['time'];
    final specialistIdParam = uri.queryParameters['specialistId'];
    
    if (childIdParam != null && _childId != childIdParam) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() {
            _childId = childIdParam;
          });
        }
      });
    }
    
    if (specialistIdParam != null && _selectedSpecialistId != specialistIdParam) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() {
            _selectedSpecialistId = specialistIdParam;
          });
        }
      });
    }
    
    if (timeParam != null && _selectedTime != timeParam) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() {
            _selectedTime = timeParam;
          });
        }
      });
    }
    
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            AppHeader(
              title: 'حجز موعد',
              leading: IconButton(
                icon: Icon(
                  AppIcons.arrowBack,
                  size: 24.sp,
                  color: AppColors.textPrimary,
                ),
                onPressed: () => context.pop(),
              ),
            ),
            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 24.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title Section
                    Text(
                      'تحديد موعد مع استشاري',
                      style: AppTypography.headingM(context),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      'لتقييم الحالة وتحديد أخصائي للمتابعة',
                      style: AppTypography.bodyMedium(context).copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 32.h),
                    // Specialist Selection Section
                    _buildSectionTitle('اختر الأخصائي', AppIcons.person),
                    SizedBox(height: 16.h),
                    _buildSpecialistSelector(),
                    SizedBox(height: 32.h),
                    // Child Selection Section
                    _buildSectionTitle('اختر الطفل', AppIcons.person),
                    SizedBox(height: 16.h),
                    _buildChildSelector(),
                    SizedBox(height: 32.h),
                    // Date Selection Section
                    _buildSectionTitle('اختر التاريخ', AppIcons.calendar),
                    SizedBox(height: 16.h),
                    _buildDateSelector(),
                    SizedBox(height: 32.h),
                    // Time Selection Section
                    _buildSectionTitle('اختر الوقت', AppIcons.clock),
                    SizedBox(height: 16.h),
                    _buildTimeSelector(),
                    SizedBox(height: 32.h),
                    // Notes Section (Optional)
                    _buildSectionTitle('ملاحظات (اختياري)', AppIcons.edit),
                    SizedBox(height: 16.h),
                    _buildNotesField(),
                    SizedBox(height: 40.h),
                  ],
                ),
              ),
            ),
            // Footer with cost and button
            _buildFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, IconData icon) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Text(
          title,
          style: AppTypography.headingS(context),
          textAlign: TextAlign.right,
        ),
        SizedBox(width: 8.w),
        Icon(
          icon,
          size: 20.sp,
          color: AppColors.primary,
        ),
      ],
    );
  }

  Widget _buildDateSelector() {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16.r),
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
        children: [
          // Current date display
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: Icon(
                  AppIcons.arrowForward,
                  size: 24.sp,
                  color: AppColors.primary,
                ),
                onPressed: () {
                  setState(() {
                    _selectedDate = _selectedDate.add(const Duration(days: 1));
                  });
                },
              ),
              Column(
                children: [
                  Text(
                    _formatDate(_selectedDate),
                    style: AppTypography.headingM(context),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    _getDayName(_selectedDate),
                    style: AppTypography.bodyMedium(context).copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
              IconButton(
                icon: Icon(
                  AppIcons.arrowBack,
                  size: 24.sp,
                  color: AppColors.primary,
                ),
                onPressed: () {
                  final newDate = _selectedDate.subtract(const Duration(days: 1));
                  if (newDate.isAfter(DateTime.now().subtract(const Duration(days: 1)))) {
                    setState(() {
                      _selectedDate = newDate;
                    });
                  }
                },
              ),
            ],
          ),
          SizedBox(height: 16.h),
          // Day selector
          SizedBox(
            height: 72.h,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              reverse: true,
              itemCount: 7,
              itemBuilder: (context, index) {
                final date = _selectedDate.add(Duration(days: index - 3));
                final isSelected = date.day == _selectedDate.day &&
                    date.month == _selectedDate.month &&
                    date.year == _selectedDate.year;
                final isPast = date.isBefore(DateTime.now().subtract(const Duration(days: 1)));
                
                return GestureDetector(
                  onTap: isPast ? null : () {
                    setState(() {
                      _selectedDate = date;
                    });
                  },
                  child: Container(
                    width: 64.w,
                    margin: EdgeInsets.symmetric(horizontal: 6.w),
                    decoration: BoxDecoration(
                      color: isPast
                          ? AppColors.gray100
                          : (isSelected ? AppColors.primary : AppColors.white),
                      borderRadius: BorderRadius.circular(16.r),
                      border: Border.all(
                        color: isPast
                            ? AppColors.gray300
                            : (isSelected ? AppColors.primary : AppColors.border),
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '${date.day}',
                          style: AppTypography.headingS(context).copyWith(
                            color: isPast
                                ? AppColors.textTertiary
                                : (isSelected ? AppColors.white : AppColors.textPrimary),
                          ),
                        ),
                        SizedBox(height: 4.h),
                        Text(
                          _getDayName(date),
                          style: AppTypography.bodySmall(context).copyWith(
                            color: isPast
                                ? AppColors.textTertiary
                                : (isSelected ? AppColors.white : AppColors.textSecondary),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeSelector() {
    return Wrap(
      spacing: 12.w,
      runSpacing: 12.h,
      children: [
        ..._availableTimes.map((time) {
          final isSelected = _selectedTime == time;
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedTime = time;
              });
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 104.w,
              height: 48.h,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : AppColors.white,
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.border,
                  width: isSelected ? 2 : 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ]
                    : [],
              ),
              child: Center(
                child: Text(
                  time,
                  style: AppTypography.bodyLarge(context).copyWith(
                    color: isSelected ? AppColors.white : AppColors.textPrimary,
                    fontWeight: isSelected ? AppTypography.semiBold : AppTypography.regular,
                  ),
                ),
              ),
            ),
          );
        }),
        ..._unavailableTimes.map((time) {
          return Container(
            width: 104.w,
            height: 48.h,
            decoration: BoxDecoration(
              color: AppColors.gray100,
              borderRadius: BorderRadius.circular(12.r),
              border: Border.all(color: AppColors.gray300),
            ),
            child: Center(
              child: Text(
                time,
                style: AppTypography.bodyMedium(context).copyWith(
                  color: AppColors.textTertiary,
                  decoration: TextDecoration.lineThrough,
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildChildSelector() {
    return Consumer<ChildrenProvider>(
      builder: (context, cp, _) {
        final children = cp.children;
        if (children.isEmpty) {
          return Container(
            padding: EdgeInsets.all(20.w),
            decoration: BoxDecoration(
              color: AppColors.gray50,
              borderRadius: BorderRadius.circular(16.r),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.child_care_outlined, size: 24.sp, color: AppColors.textTertiary),
                SizedBox(width: 12.w),
                Text('لا يوجد أطفال مسجلون. أضف طفلاً أولاً.', style: AppTypography.bodyMedium(context).copyWith(color: AppColors.textSecondary), textAlign: TextAlign.center),
              ],
            ),
          );
        }
        return Container(
          padding: EdgeInsets.all(16.w),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(16.r),
            border: Border.all(color: AppColors.border),
          ),
          child: Wrap(
            spacing: 12.w,
            runSpacing: 12.h,
            alignment: WrapAlignment.end,
            children: children.map((c) {
              final isSelected = _childId == c.id;
              return GestureDetector(
                onTap: () => setState(() => _childId = c.id),
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary.withOpacity(0.1) : AppColors.gray50,
                    borderRadius: BorderRadius.circular(12.r),
                    border: Border.all(color: isSelected ? AppColors.primary : AppColors.border),
                  ),
                  child: Text(c.name ?? 'طفل ${c.id}', style: AppTypography.bodyMedium(context).copyWith(color: isSelected ? AppColors.primary : AppColors.textPrimary, fontWeight: isSelected ? AppTypography.semiBold : AppTypography.regular)),
                ),
              );
            }).toList(),
          ),
        );
      },
    );
  }

  Widget _buildSpecialistSelector() {
    return GestureDetector(
      onTap: () async {
        final result = await context.push('/doctors');
        if (result != null && result is String) {
          setState(() {
            _selectedSpecialistId = result;
            _doctorCache = null;
          });
          final dp = context.read<DoctorsProvider>();
          final doctor = await dp.getDoctorById(result);
          if (mounted && doctor != null) setState(() => _doctorCache = doctor);
        }
      },
      child: Container(
        padding: EdgeInsets.all(20.w),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(16.r),
          border: Border.all(
            color: _selectedSpecialistId != null ? AppColors.primary : AppColors.border,
            width: _selectedSpecialistId != null ? 2 : 1,
          ),
        ),
        child: _selectedSpecialistId == null
            ? Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Icon(
                    AppIcons.arrowBack,
                    size: 20.sp,
                    color: AppColors.textTertiary,
                  ),
                  Text(
                    'اختر الأخصائي',
                    style: AppTypography.bodyMedium(context).copyWith(
                      color: AppColors.textTertiary,
                    ),
                    textAlign: TextAlign.right,
                  ),
                  Icon(
                    AppIcons.person,
                    size: 24.sp,
                    color: AppColors.primary,
                  ),
                ],
              )
            : Row(
                children: [
                  Icon(
                    AppIcons.arrowBack,
                    size: 20.sp,
                    color: AppColors.primary,
                  ),
                  SizedBox(width: 16.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          (_selectedSpecialist?['fullName'] ?? _selectedSpecialist?['name'] ?? _selectedSpecialist?['username'])?.toString() ?? '',
                          style: AppTypography.headingS(context),
                          textAlign: TextAlign.right,
                        ),
                        SizedBox(height: 4.h),
                        Text(
                          (_selectedSpecialist?['specialty'] ?? _selectedSpecialist?['specialization'])?.toString() ?? '',
                          style: AppTypography.bodySmall(context).copyWith(
                            color: AppColors.textSecondary,
                          ),
                          textAlign: TextAlign.right,
                        ),
                        SizedBox(height: 6.h),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Text(
                              _selectedSpecialist?['price']?.toString() ?? '',
                              style: AppTypography.bodyMedium(context).copyWith(
                                color: AppColors.primary,
                              ),
                            ),
                            SizedBox(width: 8.w),
                            RatingWidget(
                              rating: (_selectedSpecialist?['rating'] as num?)?.toDouble() ?? 0.0,
                              size: 14.sp,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: 16.w),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12.r),
                    child: AppNetworkImage(
                      imageUrl: _selectedSpecialist?['profileImage'] ?? _selectedSpecialist?['image'] ?? _selectedSpecialist?['imageUrl'] ?? AppConfig.defaultDoctorImage,
                      width: 60.w,
                      height: 60.w,
                      fit: BoxFit.cover,
                      borderRadius: BorderRadius.circular(12.r),
                      placeholderStyle: AppImagePlaceholderStyle.avatar,
                      initials: (_selectedSpecialist?['fullName'] ?? _selectedSpecialist?['name'] ?? '')?.toString().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join(),
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildNotesField() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: AppColors.border),
      ),
      child: TextField(
        controller: _notesController,
        maxLength: 500,
        maxLines: 5,
        textDirection: TextDirection.rtl,
        decoration: InputDecoration(
          hintText: 'أضف أي ملاحظات أو متطلبات خاصة...',
          hintStyle: AppTypography.placeholderText(context),
          border: InputBorder.none,
          contentPadding: EdgeInsets.all(16.w),
          counterText: '$_characterCount/500',
          counterStyle: AppTypography.bodySmall(context).copyWith(
            color: AppColors.textTertiary,
          ),
        ),
        style: AppTypography.bodyMedium(context),
      ),
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
      decoration: BoxDecoration(
        color: AppColors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            offset: const Offset(0, -2),
            blurRadius: 12,
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Cost info
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  'تكلفة الاستشارة',
                  style: AppTypography.bodySmall(context).copyWith(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.right,
                ),
                SizedBox(height: 4.h),
                Text(
                  _selectedSpecialist?['price']?.toString() ?? '152.00 ج.م',
                  style: AppTypography.headingS(context),
                  textAlign: TextAlign.right,
                ),
              ],
            ),
            // Continue button — ربط مع الباكند
            SizedBox(
              width: 160.w,
              height: 52.h,
              child: ElevatedButton(
                onPressed: (_canProceed && !_submitting)
                    ? () async {
                        if (_selectedSpecialistId == null || _childId == null || _selectedTime == null) return;
                        setState(() => _submitting = true);
                        final bp = context.read<BookingsProvider>();
                        final dateStr = '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';
                        final timeStr = _selectedTime!.replaceAll(' ص', '').replaceAll(' م', '').trim();
                        final result = await bp.bookAppointment(
                          doctorId: _selectedSpecialistId!,
                          childId: _childId!,
                          date: dateStr,
                          startTime: timeStr,
                          notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
                        );
                        if (mounted) {
                          setState(() => _submitting = false);
                          if (result != null) {
                            context.push('/booking/confirmation');
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(bp.error ?? 'فشل الحجز، حاول مرة أخرى')));
                          }
                        }
                      }
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.white,
                  disabledBackgroundColor: AppColors.buttonDisabled,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16.r),
                  ),
                  elevation: 0,
                ),
                child: _submitting
                    ? SizedBox(width: 24.w, height: 24.h, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.white))
                    : Text(
                        'التالي',
                        style: AppTypography.bodyLarge(context).copyWith(
                          color: AppColors.white,
                          fontWeight: AppTypography.semiBold,
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
