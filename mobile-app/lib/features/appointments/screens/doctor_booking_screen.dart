import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/app_config.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../../core/providers/doctors_provider.dart';
import '../../../core/providers/children_provider.dart';
import '../../../core/providers/bookings_provider.dart';

/// صفحة حجز موعد احترافية مع الأطباء
/// تتضمن: اختيار التاريخ، الوقت، طريقة الدفع
class DoctorBookingScreen extends StatefulWidget {
  final String doctorId;

  const DoctorBookingScreen({
    super.key,
    required this.doctorId,
  });

  @override
  State<DoctorBookingScreen> createState() => _DoctorBookingScreenState();
}

class _DoctorBookingScreenState extends State<DoctorBookingScreen> {
  int _currentStep = 0;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String? _selectedTime;
  String? _selectedChildId;
  String _paymentMethod = 'fawry'; // fawry, wallet
  final TextEditingController _notesController = TextEditingController();
  bool _isLoading = true;
  bool _isSubmitting = false;
  Map<String, dynamic>? _doctor;
  /// المواعيد المتاحة من API — يمكن استخدامها لتمييز الأوقات المتاحة/المحجوزة في الواجهة
  List<Map<String, dynamic>> _availableSlots = [];

  @override
  void initState() {
    super.initState();
    _loadDoctorData();
  }

  /// اقرأ التاريخ والوقت من الرابط عند القدوم من صفحة ملف الأخصائي (مواعيد متاحة)
  void _applyRouteParams() {
    final uri = GoRouterState.of(context).uri;
    final dateStr = uri.queryParameters['date'];
    final timeStr = uri.queryParameters['time'];
    DateTime? newDate;
    String? newTime;
    if (dateStr != null && dateStr.isNotEmpty) {
      final parsed = DateTime.tryParse(dateStr);
      if (parsed != null) newDate = parsed;
    }
    if (timeStr != null && timeStr.isNotEmpty) newTime = timeStr;
    if ((newDate != null || newTime != null) && mounted) {
      setState(() {
        if (newDate != null) _selectedDate = newDate;
        if (newTime != null) _selectedTime = newTime;
      });
      if (newDate != null) _loadAvailableSlots();
      if (newDate != null && newTime != null && _currentStep < 3) {
        setState(() => _currentStep = 3);
      } else if (newDate != null && _currentStep < 2) {
        setState(() => _currentStep = 2);
      }
    }
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _loadDoctorData() async {
    final dp = context.read<DoctorsProvider>();
    try {
      final doctor = await dp.getDoctorById(widget.doctorId);
      if (mounted) {
        setState(() {
          _doctor = doctor;
          _isLoading = false;
        });
        _loadAvailableSlots();
        _applyRouteParams();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('فشل تحميل بيانات الطبيب: $e')),
        );
      }
    }
  }

  Future<void> _loadAvailableSlots() async {
    final dp = context.read<DoctorsProvider>();
    final dateStr = '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';
    try {
      final slots = await dp.getAvailableSlots(doctorId: widget.doctorId, date: dateStr);
      if (mounted) {
        setState(() {
          _availableSlots = slots;
        });
      }
    } catch (e) {
      debugPrint('Error loading slots: $e');
    }
  }

  String _formatDate(DateTime date) {
    final months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  String _getDayName(DateTime date) {
    final days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.weekday % 7];
  }

  /// تواريخ قابلة للعرض حسب الشهر المختار
  List<DateTime> _getDisplayDates() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final targetMonth = DateTime(_selectedDate.year, _selectedDate.month, 1);
    final lastDay = DateTime(_selectedDate.year, _selectedDate.month + 1, 0);

    final List<DateTime> dates = [];
    DateTime start;
    if (targetMonth.isBefore(DateTime(now.year, now.month, 1))) {
      return dates; // شهر ماضي
    }
    if (targetMonth.year == now.year && targetMonth.month == now.month) {
      start = today;
    } else {
      start = targetMonth;
    }
    for (var d = start; d.isBefore(lastDay.add(const Duration(days: 1))) && dates.length < 21; d = d.add(const Duration(days: 1))) {
      dates.add(d);
    }
    return dates;
  }

  bool get _canProceedToNextStep {
    switch (_currentStep) {
      case 0:
        return _selectedChildId != null;
      case 1:
        return true; // تاريخ محدد دائماً
      case 2:
        return _selectedTime != null;
      case 3:
        return true; // Payment method always selected
      default:
        return false;
    }
  }

  void _nextStep() {
    if (_currentStep < 3 && _canProceedToNextStep) {
      setState(() => _currentStep++);
    } else if (_currentStep == 3) {
      _confirmBooking();
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }

  Future<void> _confirmBooking() async {
    if (_selectedChildId == null || _selectedTime == null || _doctor == null) {
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final bp = context.read<BookingsProvider>();
      final dateStr = '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';
      
      final result = await bp.bookAppointment(
        doctorId: widget.doctorId,
        childId: _selectedChildId!,
        date: dateStr,
        startTime: _selectedTime!,
        notes: _notesController.text.trim(),
      );

      if (mounted) {
        setState(() => _isSubmitting = false);
        if (result != null) {
          // Show success dialog
          _showSuccessDialog();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(bp.error ?? 'فشل الحجز')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('حدث خطأ: $e')),
        );
      }
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24.r)),
        child: Padding(
          padding: EdgeInsets.all(32.w),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 80.w,
                height: 80.w,
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.check_circle_rounded,
                  size: 50.sp,
                  color: AppColors.success,
                ),
              ),
              SizedBox(height: 24.h),
              Text(
                'تم الحجز بنجاح!',
                style: AppTypography.headingL(context).copyWith(
                  fontWeight: AppTypography.bold,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 12.h),
              Text(
                'سيتم إرسال تفاصيل الموعد عبر الإشعارات',
                style: AppTypography.bodyMedium(context).copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 32.h),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        context.pop(); // Close dialog
                        context.pop(); // Go back
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: BorderSide(color: AppColors.primary),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16.r),
                        ),
                        padding: EdgeInsets.symmetric(vertical: 14.h),
                      ),
                      child: Text(
                        'الرئيسية',
                        style: AppTypography.bodyMedium(context).copyWith(
                          fontWeight: AppTypography.semiBold,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        context.pop(); // Close dialog
                        context.go('/appointments'); // Go to appointments
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: AppColors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16.r),
                        ),
                        padding: EdgeInsets.symmetric(vertical: 14.h),
                        elevation: 0,
                      ),
                      child: Text(
                        'مواعيدي',
                        style: AppTypography.bodyMedium(context).copyWith(
                          fontWeight: AppTypography.semiBold,
                          color: AppColors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppColors.background,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_doctor == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: AppColors.background,
          elevation: 0,
          leading: IconButton(
            icon: Icon(AppIcons.arrowBack, color: AppColors.textPrimary),
            onPressed: () => context.pop(),
          ),
        ),
        body: Center(
          child: Text(
            'لم يتم العثور على بيانات الطبيب',
            style: AppTypography.bodyMedium(context),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildStepIndicator(),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(20.w),
                child: _buildStepContent(),
              ),
            ),
            _buildFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
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
          IconButton(
            icon: Icon(AppIcons.arrowBack, size: 24.sp),
            onPressed: () => context.pop(),
            color: AppColors.textPrimary,
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12.r),
                  child: AppNetworkImage(
                    imageUrl: _doctor?['profileImage'] ?? 
                             _doctor?['image'] ?? 
                             AppConfig.defaultDoctorImage,
                    width: 50.w,
                    height: 50.w,
                    fit: BoxFit.cover,
                    borderRadius: BorderRadius.circular(12.r),
                    placeholderStyle: AppImagePlaceholderStyle.avatar,
                  ),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        _doctor?['fullName'] ?? _doctor?['name'] ?? '',
                        style: AppTypography.headingS(context),
                        textAlign: TextAlign.right,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 2.h),
                      Text(
                        _doctor?['specialty'] ?? _doctor?['specialization'] ?? '',
                        style: AppTypography.bodySmall(context).copyWith(
                          color: AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.right,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static const List<String> _stepLabels = [
    'اختيار الطفل',
    'اختيار التاريخ',
    'اختيار الوقت',
    'الدفع والتأكيد',
  ];

  Widget _buildStepIndicator() {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 20.h, horizontal: 16.w),
      decoration: BoxDecoration(
        color: AppColors.white,
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
          Row(
            children: List.generate(4, (index) {
              final isCompleted = index < _currentStep;
              final isActive = index == _currentStep;
              return Expanded(
                child: Row(
                  children: [
                    if (index > 0)
                      Expanded(
                        child: Container(
                          height: 3.h,
                          margin: EdgeInsets.symmetric(horizontal: 2.w),
                          decoration: BoxDecoration(
                            color: isCompleted ? AppColors.primary : AppColors.gray300,
                            borderRadius: BorderRadius.circular(2.r),
                          ),
                        ),
                      ),
                    Container(
                      width: 36.w,
                      height: 36.w,
                      decoration: BoxDecoration(
                        color: isCompleted || isActive
                            ? AppColors.primary
                            : AppColors.gray100,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isActive ? AppColors.primary : AppColors.gray300,
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: isCompleted
                            ? Icon(Icons.check, size: 18.sp, color: AppColors.white)
                            : Text(
                                '${index + 1}',
                                style: AppTypography.bodySmall(context).copyWith(
                                  color: isActive ? AppColors.white : AppColors.textTertiary,
                                  fontWeight: AppTypography.semiBold,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ),
          SizedBox(height: 10.h),
          Text(
            _stepLabels[_currentStep],
            style: AppTypography.bodyMedium(context).copyWith(
              color: AppColors.primary,
              fontWeight: AppTypography.semiBold,
              fontSize: 14.sp,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildChildSelection();
      case 1:
        return _buildDateSelection();
      case 2:
        return _buildTimeSelection();
      case 3:
        return _buildPaymentSelection();
      default:
        return const SizedBox();
    }
  }

  Widget _buildChildSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          'اختر الطفل',
          style: AppTypography.headingL(context).copyWith(
            fontWeight: AppTypography.bold,
          ),
          textAlign: TextAlign.right,
        ),
        SizedBox(height: 8.h),
        Text(
          'حدد الطفل الذي سيحضر الجلسة',
          style: AppTypography.bodyMedium(context).copyWith(
            color: AppColors.textSecondary,
          ),
          textAlign: TextAlign.right,
        ),
        SizedBox(height: 24.h),
        Consumer<ChildrenProvider>(
          builder: (context, cp, _) {
            final children = cp.children;
            
            if (children.isEmpty) {
              return Container(
                padding: EdgeInsets.all(40.w),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(20.r),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.child_care_outlined,
                      size: 60.sp,
                      color: AppColors.textTertiary,
                    ),
                    SizedBox(height: 16.h),
                    Text(
                      'لا يوجد أطفال مسجلون',
                      style: AppTypography.bodyLarge(context),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      'يرجى إضافة طفل أولاً',
                      style: AppTypography.bodyMedium(context).copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              );
            }

            return Column(
              children: children.map((child) {
                final isSelected = _selectedChildId == child.id;
                
                return GestureDetector(
                  onTap: () => setState(() => _selectedChildId = child.id),
                  child: Container(
                    margin: EdgeInsets.only(bottom: 12.h),
                    padding: EdgeInsets.all(20.w),
                    decoration: BoxDecoration(
                      color: isSelected 
                          ? AppColors.primary.withOpacity(0.08) 
                          : AppColors.white,
                      borderRadius: BorderRadius.circular(20.r),
                      border: Border.all(
                        color: isSelected 
                            ? AppColors.primary 
                            : AppColors.border,
                        width: isSelected ? 2 : 1,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.1),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ]
                          : [],
                    ),
                    child: Row(
                      children: [
                        if (isSelected)
                          Container(
                            width: 28.w,
                            height: 28.w,
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.check,
                              size: 18.sp,
                              color: AppColors.white,
                            ),
                          )
                        else
                          Container(
                            width: 28.w,
                            height: 28.w,
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: AppColors.gray300,
                                width: 2,
                              ),
                              shape: BoxShape.circle,
                            ),
                          ),
                        SizedBox(width: 16.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                child.name ?? 'طفل ${child.id}',
                                style: AppTypography.headingS(context).copyWith(
                                  color: isSelected 
                                      ? AppColors.primary 
                                      : AppColors.textPrimary,
                                  fontWeight: AppTypography.semiBold,
                                ),
                                textAlign: TextAlign.right,
                              ),
                              if (child.birthDate != null) ...[
                                SizedBox(height: 4.h),
                                Text(
                                  'العمر: ${_calculateAge(child.birthDate!)}',
                                  style: AppTypography.bodyMedium(context).copyWith(
                                    color: AppColors.textSecondary,
                                  ),
                                  textAlign: TextAlign.right,
                                ),
                              ],
                            ],
                          ),
                        ),
                        SizedBox(width: 16.w),
                        Container(
                          width: 50.w,
                          height: 50.w,
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.child_care,
                            size: 28.sp,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            );
          },
        ),
      ],
    );
  }

  String _calculateAge(String birthDate) {
    try {
      final birth = DateTime.parse(birthDate);
      final today = DateTime.now();
      int years = today.year - birth.year;
      if (today.month < birth.month || 
          (today.month == birth.month && today.day < birth.day)) {
        years--;
      }
      return '$years سنة';
    } catch (e) {
      return 'غير محدد';
    }
  }

  Widget _buildDateSelection() {
    final displayDates = _getDisplayDates();
    final months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];
    final monthLabel = '${months[_selectedDate.month - 1]} ${_selectedDate.year}';
    final now = DateTime.now();
    final currentMonth = DateTime(now.year, now.month);
    final maxMonth = DateTime(now.year, now.month + 3);
    final selectedMonth = DateTime(_selectedDate.year, _selectedDate.month);
    final canGoPrev = selectedMonth.isAfter(currentMonth);
    final canGoNext = selectedMonth.isBefore(maxMonth);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          'اختر التاريخ',
          style: AppTypography.headingL(context).copyWith(
            fontWeight: AppTypography.bold,
          ),
          textAlign: TextAlign.right,
        ),
        SizedBox(height: 8.h),
        Text(
          'حدد اليوم المناسب للموعد',
          style: AppTypography.bodyMedium(context).copyWith(
            color: AppColors.textSecondary,
          ),
          textAlign: TextAlign.right,
        ),
        SizedBox(height: 24.h),
        Container(
          padding: EdgeInsets.all(20.w),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(20.r),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: Icon(AppIcons.arrowForward, size: 24.sp),
                    onPressed: canGoNext
                        ? () {
                            setState(() {
                              if (_selectedDate.month == 12) {
                                _selectedDate = DateTime(_selectedDate.year + 1, 1, 1);
                              } else {
                                _selectedDate = DateTime(_selectedDate.year, _selectedDate.month + 1, 1);
                              }
                              if (_getDisplayDates().isNotEmpty) {
                                _selectedDate = _getDisplayDates().first;
                              }
                              _loadAvailableSlots();
                            });
                          }
                        : null,
                    color: canGoNext ? AppColors.primary : AppColors.gray300,
                  ),
                  Text(
                    monthLabel,
                    style: AppTypography.headingM(context),
                  ),
                  IconButton(
                    icon: Icon(AppIcons.arrowBack, size: 24.sp),
                    onPressed: canGoPrev
                        ? () {
                            setState(() {
                              if (_selectedDate.month == 1) {
                                _selectedDate = DateTime(_selectedDate.year - 1, 12, 1);
                              } else {
                                _selectedDate = DateTime(_selectedDate.year, _selectedDate.month - 1, 1);
                              }
                              final dates = _getDisplayDates();
                              if (dates.isNotEmpty) {
                                _selectedDate = dates.first;
                              }
                              _loadAvailableSlots();
                            });
                          }
                        : null,
                    color: canGoPrev ? AppColors.primary : AppColors.gray300,
                  ),
                ],
              ),
              SizedBox(height: 20.h),
              if (displayDates.isEmpty)
                Padding(
                  padding: EdgeInsets.symmetric(vertical: 24.h),
                  child: Text(
                    'لا توجد أيام متاحة في هذا الشهر',
                    style: AppTypography.bodyMedium(context).copyWith(color: AppColors.textSecondary),
                    textAlign: TextAlign.center,
                  ),
                )
              else
                SizedBox(
                  height: 90.h,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    reverse: true,
                    itemCount: displayDates.length,
                    itemBuilder: (context, index) {
                      final date = displayDates[index];
                      final isSelected = date.day == _selectedDate.day &&
                          date.month == _selectedDate.month &&
                          date.year == _selectedDate.year;

                      return GestureDetector(
                        onTap: () {
                          setState(() => _selectedDate = date);
                          _loadAvailableSlots();
                        },
                        child: Container(
                          width: 70.w,
                          margin: EdgeInsets.symmetric(horizontal: 6.w),
                          decoration: BoxDecoration(
                            gradient: isSelected
                                ? LinearGradient(
                                    colors: [
                                      AppColors.primary,
                                      AppColors.primary.withOpacity(0.8),
                                    ],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  )
                                : null,
                            color: isSelected ? null : AppColors.gray50,
                            borderRadius: BorderRadius.circular(16.r),
                            border: Border.all(
                              color: isSelected ? AppColors.primary : AppColors.border,
                              width: isSelected ? 2 : 1,
                            ),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: AppColors.primary.withOpacity(0.3),
                                      blurRadius: 8,
                                      offset: const Offset(0, 4),
                                    ),
                                  ]
                                : [],
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _getDayName(date),
                                style: AppTypography.bodySmall(context).copyWith(
                                  color: isSelected ? AppColors.white : AppColors.textSecondary,
                                  fontSize: 11.sp,
                                ),
                              ),
                              SizedBox(height: 6.h),
                              Text(
                                '${date.day}',
                                style: AppTypography.headingM(context).copyWith(
                                  color: isSelected ? AppColors.white : AppColors.textPrimary,
                                  fontWeight: AppTypography.bold,
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
        ),
      ],
    );
  }

  Widget _buildTimeSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          'اختر الوقت',
          style: AppTypography.headingL(context).copyWith(
            fontWeight: AppTypography.bold,
          ),
          textAlign: TextAlign.right,
        ),
        SizedBox(height: 8.h),
        Text(
          'المواعيد المتاحة في ${_formatDate(_selectedDate)}',
          style: AppTypography.bodyMedium(context).copyWith(
            color: AppColors.textSecondary,
          ),
          textAlign: TextAlign.right,
        ),
        SizedBox(height: 24.h),
        Container(
          padding: EdgeInsets.all(20.w),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(20.r),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // Morning slots
              _buildTimeSection('الفترة الصباحية', Icons.wb_sunny_outlined, [
                '09:00 ص', '10:00 ص', '11:00 ص', '12:00 م',
              ]),
              SizedBox(height: 24.h),
              // Afternoon slots
              _buildTimeSection('الفترة المسائية', Icons.nightlight_outlined, [
                '02:00 م', '03:00 م', '04:00 م', '05:00 م',
              ]),
              SizedBox(height: 24.h),
              // Evening slots
              _buildTimeSection('الفترة الليلية', Icons.nights_stay_outlined, [
                '07:00 م', '08:00 م', '09:00 م', '10:00 م',
              ]),
              SizedBox(height: 24.h),
              // Notes field
              Text(
                'ملاحظات (اختياري)',
                style: AppTypography.bodyLarge(context).copyWith(
                  fontWeight: AppTypography.semiBold,
                ),
                textAlign: TextAlign.right,
              ),
              SizedBox(height: 12.h),
              TextField(
                controller: _notesController,
                maxLines: 3,
                maxLength: 200,
                textDirection: TextDirection.rtl,
                decoration: InputDecoration(
                  hintText: 'أضف أي ملاحظات خاصة بالموعد...',
                  hintStyle: AppTypography.bodyMedium(context).copyWith(
                    color: AppColors.textTertiary,
                  ),
                  filled: true,
                  fillColor: AppColors.gray50,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: EdgeInsets.all(16.w),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTimeSection(String title, IconData icon, List<String> times) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Text(
              title,
              style: AppTypography.bodyLarge(context).copyWith(
                fontWeight: AppTypography.semiBold,
              ),
            ),
            SizedBox(width: 8.w),
            Icon(icon, size: 20.sp, color: AppColors.primary),
          ],
        ),
        SizedBox(height: 12.h),
        Wrap(
          spacing: 12.w,
          runSpacing: 12.h,
          alignment: WrapAlignment.end,
          children: times.map((time) {
            final isSelected = _selectedTime == time;
            // إذا وردت مواعيد من API نعتمدها، وإلا نستخدم المحجوزة افتراضياً
            final isAvailable = _availableSlots.isEmpty
                ? !['12:00 م', '04:00 م'].contains(time)
                : _availableSlots.any((s) =>
                    (s['time'] ?? s['startTime'] ?? '').toString() == time);
            
            return GestureDetector(
              onTap: isAvailable ? () => setState(() => _selectedTime = time) : null,
              child: Container(
                width: 100.w,
                padding: EdgeInsets.symmetric(vertical: 14.h),
                decoration: BoxDecoration(
                  color: !isAvailable
                      ? AppColors.gray100
                      : (isSelected ? AppColors.primary : AppColors.white),
                  borderRadius: BorderRadius.circular(12.r),
                  border: Border.all(
                    color: !isAvailable
                        ? AppColors.gray300
                        : (isSelected ? AppColors.primary : AppColors.border),
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (!isAvailable)
                      Icon(
                        Icons.block,
                        size: 14.sp,
                        color: AppColors.textTertiary,
                      )
                    else if (isSelected)
                      Icon(
                        Icons.check_circle,
                        size: 14.sp,
                        color: AppColors.white,
                      ),
                    if (!isAvailable || isSelected) SizedBox(width: 4.w),
                    Text(
                      time,
                      style: AppTypography.bodyMedium(context).copyWith(
                        color: !isAvailable
                            ? AppColors.textTertiary
                            : (isSelected ? AppColors.white : AppColors.textPrimary),
                        fontWeight: isSelected 
                            ? AppTypography.semiBold 
                            : AppTypography.regular,
                        decoration: !isAvailable 
                            ? TextDecoration.lineThrough 
                            : null,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildPaymentSelection() {
    final price = _doctor?['price'] ?? _doctor?['sessionPrice'] ?? '200';
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          'طريقة الدفع',
          style: AppTypography.headingL(context).copyWith(
            fontWeight: AppTypography.bold,
          ),
          textAlign: TextAlign.right,
        ),
        SizedBox(height: 8.h),
        Text(
          'اختر الطريقة المناسبة لك',
          style: AppTypography.bodyMedium(context).copyWith(
            color: AppColors.textSecondary,
          ),
          textAlign: TextAlign.right,
        ),
        SizedBox(height: 24.h),
        // Payment methods
        _buildPaymentOption(
          'fawry',
          'الدفع عن طريق فوري',
          'ادفع بسهولة من أي فرع فوري',
          Icons.payment,
          AppColors.warning,
        ),
        SizedBox(height: 16.h),
        _buildPaymentOption(
          'wallet',
          'المحفظة الإلكترونية',
          'ادفع من محفظتك الإلكترونية',
          Icons.account_balance_wallet,
          AppColors.success,
        ),
        SizedBox(height: 32.h),
        // Summary
        Container(
          padding: EdgeInsets.all(24.w),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppColors.primary.withOpacity(0.1),
                AppColors.primary.withOpacity(0.05),
              ],
              begin: Alignment.topRight,
              end: Alignment.bottomLeft,
            ),
            borderRadius: BorderRadius.circular(20.r),
            border: Border.all(
              color: AppColors.primary.withOpacity(0.3),
            ),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    'ملخص الحجز',
                    style: AppTypography.headingM(context).copyWith(
                      fontWeight: AppTypography.bold,
                    ),
                  ),
                  SizedBox(width: 8.w),
                  Icon(
                    Icons.receipt_long,
                    size: 24.sp,
                    color: AppColors.primary,
                  ),
                ],
              ),
              SizedBox(height: 20.h),
              _buildSummaryRow('الطبيب', _doctor?['fullName'] ?? _doctor?['name'] ?? ''),
              SizedBox(height: 12.h),
              _buildSummaryRow('التاريخ', _formatDate(_selectedDate)),
              SizedBox(height: 12.h),
              _buildSummaryRow('الوقت', _selectedTime ?? ''),
              SizedBox(height: 12.h),
              _buildSummaryRow('طريقة الدفع', 
                _paymentMethod == 'fawry' ? 'فوري' : 'المحفظة الإلكترونية'),
              SizedBox(height: 20.h),
              Divider(color: AppColors.primary.withOpacity(0.3)),
              SizedBox(height: 12.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '$price ج.م',
                    style: AppTypography.headingL(context).copyWith(
                      color: AppColors.primary,
                      fontWeight: AppTypography.bold,
                    ),
                  ),
                  Text(
                    'الإجمالي',
                    style: AppTypography.headingM(context).copyWith(
                      fontWeight: AppTypography.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPaymentOption(
    String value,
    String title,
    String subtitle,
    IconData icon,
    Color color,
  ) {
    final isSelected = _paymentMethod == value;
    
    return GestureDetector(
      onTap: () => setState(() => _paymentMethod = value),
      child: Container(
        padding: EdgeInsets.all(20.w),
        decoration: BoxDecoration(
          color: isSelected 
              ? color.withOpacity(0.08) 
              : AppColors.white,
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(
            color: isSelected ? color : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: color.withOpacity(0.1),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        ),
        child: Row(
          children: [
            if (isSelected)
              Container(
                width: 28.w,
                height: 28.w,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.check,
                  size: 18.sp,
                  color: AppColors.white,
                ),
              )
            else
              Container(
                width: 28.w,
                height: 28.w,
                decoration: BoxDecoration(
                  border: Border.all(
                    color: AppColors.gray300,
                    width: 2,
                  ),
                  shape: BoxShape.circle,
                ),
              ),
            SizedBox(width: 16.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    title,
                    style: AppTypography.headingS(context).copyWith(
                      color: isSelected ? color : AppColors.textPrimary,
                      fontWeight: AppTypography.semiBold,
                    ),
                    textAlign: TextAlign.right,
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    subtitle,
                    style: AppTypography.bodyMedium(context).copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.right,
                  ),
                ],
              ),
            ),
            SizedBox(width: 16.w),
            Container(
              width: 50.w,
              height: 50.w,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 28.sp,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            value,
            style: AppTypography.bodyMedium(context),
            textAlign: TextAlign.left,
          ),
        ),
        Text(
          label,
          style: AppTypography.bodyMedium(context).copyWith(
            color: AppColors.textSecondary,
          ),
          textAlign: TextAlign.right,
        ),
      ],
    );
  }

  Widget _buildFooter() {
    final canProceed = _canProceedToNextStep;
    
    return Container(
      padding: EdgeInsets.all(20.w),
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
          children: [
            if (_currentStep > 0)
              Expanded(
                child: OutlinedButton(
                  onPressed: _isSubmitting ? null : _previousStep,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16.r),
                    ),
                    padding: EdgeInsets.symmetric(vertical: 16.h),
                  ),
                  child: Text(
                    'السابق',
                    style: AppTypography.bodyLarge(context).copyWith(
                      fontWeight: AppTypography.semiBold,
                    ),
                  ),
                ),
              ),
            if (_currentStep > 0) SizedBox(width: 12.w),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: (canProceed && !_isSubmitting) ? _nextStep : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.white,
                  disabledBackgroundColor: AppColors.gray300,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16.r),
                  ),
                  padding: EdgeInsets.symmetric(vertical: 16.h),
                  elevation: 0,
                ),
                child: _isSubmitting
                    ? SizedBox(
                        width: 24.w,
                        height: 24.h,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppColors.white,
                        ),
                      )
                    : Text(
                        _currentStep == 3 ? 'تأكيد الحجز' : 'التالي',
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
