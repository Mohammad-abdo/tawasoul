import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/app_config.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../../core/widgets/rating_widget.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../../core/providers/doctors_provider.dart';

/// ملف الأخصائي — بيانات من الباكند مع صورة افتراضية إن لم تأتِ.
class SpecialistProfileScreen extends StatefulWidget {
  final String specialistId;

  const SpecialistProfileScreen({super.key, required this.specialistId});

  @override
  State<SpecialistProfileScreen> createState() => _SpecialistProfileScreenState();
}

class _SpecialistProfileScreenState extends State<SpecialistProfileScreen> {
  Map<String, dynamic>? _doctor;
  List<Map<String, dynamic>> _slots = [];
  bool _loading = true;
  String? _error;
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _load();
    });
  }

  Future<void> _load() async {
    final dp = context.read<DoctorsProvider>();
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final doctor = await dp.getDoctorById(widget.specialistId);
      final dateStr = '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}';
      final slots = await dp.getAvailableSlots(doctorId: widget.specialistId, date: dateStr);
      if (mounted) {
        setState(() {
          _doctor = doctor;
          _slots = slots;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading && _doctor == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(backgroundColor: AppColors.background, elevation: 0),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    if (_error != null && _doctor == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(backgroundColor: AppColors.background, elevation: 0),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(_error!, style: AppTypography.bodyMedium(context).copyWith(color: AppColors.error), textAlign: TextAlign.center),
              SizedBox(height: 16.h),
              TextButton(onPressed: () => context.pop(), child: const Text('إغلاق')),
            ],
          ),
        ),
      );
    }
    final doctor = _doctor ?? <String, dynamic>{};
    final availableSlots = _slots;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'ملف الأخصائي',
              leading: IconButton(
                icon: Icon(AppIcons.arrowBack, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(20.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _buildProfileHeader(context, doctor),
                    SizedBox(height: 24.h),
                    _buildStatsRow(context, doctor),
                    SizedBox(height: 24.h),
                    _buildSectionTitle(context, 'نبذة عن الأخصائي'),
                    SizedBox(height: 12.h),
                    _buildContentCard(context, doctor['about']?.toString() ?? doctor['bio']?.toString() ?? ''),
                    SizedBox(height: 24.h),
                    _buildSectionTitle(context, 'المؤهلات العلمية'),
                    SizedBox(height: 12.h),
                    _buildContentCard(context, doctor['education']?.toString() ?? ''),
                    SizedBox(height: 24.h),
                    _buildSectionTitle(context, 'المواعيد المتاحة'),
                    SizedBox(height: 12.h),
                    if (availableSlots.isEmpty)
                      _buildEmptySlots(context)
                    else
                      _buildAvailableSlots(context, availableSlots, widget.specialistId),
                    SizedBox(height: 32.h),
                  ],
                ),
              ),
            ),
            Container(
              padding: EdgeInsets.all(20.w),
              decoration: BoxDecoration(
                color: AppColors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    offset: const Offset(0, -2),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: SizedBox(
                width: double.infinity,
                height: 52.h,
                child: ElevatedButton(
                  onPressed: () {
                    context.push('/doctor/book/${widget.specialistId}');
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
                  ),
                  child: Text(
                    'احجز موعد الآن',
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
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, Map<String, dynamic> doctor) {
    final img = doctor['profileImage'] ?? doctor['image'] ?? doctor['imageUrl'];
    final imageUrl = img is String && img.trim().isNotEmpty ? img : AppConfig.defaultDoctorImage;
    final name = doctor['fullName'] ?? doctor['name'] ?? doctor['username'] ?? '';
    final spec = doctor['specialty'] ?? doctor['specialization'];
    final specStr = spec != null ? spec.toString() : (doctor['specialties'] as List?)?.map((e) => e.toString()).join(' · ') ?? '';

    return Container(
      padding: EdgeInsets.all(24.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(24.r),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(name.toString(), style: AppTypography.headingM(context), textAlign: TextAlign.right),
                SizedBox(height: 6.h),
                Text(specStr, style: AppTypography.bodyMedium(context).copyWith(color: AppColors.primary, fontWeight: AppTypography.semiBold), textAlign: TextAlign.right),
                SizedBox(height: 12.h),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text('(${doctor['reviewsCount'] ?? 0} تقييم)', style: AppTypography.bodySmall(context).copyWith(color: AppColors.textTertiary)),
                    SizedBox(width: 8.w),
                    RatingWidget(rating: (doctor['rating'] as num?)?.toDouble() ?? 0.0, size: 18.sp),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(width: 20.w),
          ClipRRect(
            borderRadius: BorderRadius.circular(20.r),
            child: AppNetworkImage(
              imageUrl: imageUrl,
              width: 120.w,
              height: 120.w,
              fit: BoxFit.cover,
              borderRadius: BorderRadius.circular(20.r),
              placeholderStyle: AppImagePlaceholderStyle.avatar,
              initials: name.toString().isNotEmpty ? name.toString().trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join() : null,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow(BuildContext context, Map<String, dynamic> doctor) {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(context, 'السعر', doctor['price']?.toString() ?? doctor['sessionPrice']?.toString() ?? '-', AppIcons.money),
        ),
        SizedBox(width: 12.w),
        Expanded(
          child: _buildStatCard(context, 'ساعات العمل', doctor['workingHours']?.toString() ?? '-', AppIcons.clock),
        ),
        SizedBox(width: 12.w),
        Expanded(
          child: _buildStatCard(context, 'الخبرة', doctor['experience']?.toString() ?? '-', AppIcons.calendar),
        ),
      ],
    );
  }

  Widget _buildStatCard(BuildContext context, String label, String value, IconData icon) {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Icon(icon, size: 24.sp, color: AppColors.primary),
          SizedBox(height: 8.h),
          Text(value, style: AppTypography.headingS(context).copyWith(color: AppColors.primary), textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
          SizedBox(height: 4.h),
          Text(label, style: AppTypography.bodySmall(context).copyWith(color: AppColors.textTertiary), textAlign: TextAlign.center),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Text(title, style: AppTypography.headingS(context), textAlign: TextAlign.right);
  }

  Widget _buildContentCard(BuildContext context, String text) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Text(
        text.isEmpty ? '-' : text,
        style: AppTypography.bodyMedium(context).copyWith(color: AppColors.textSecondary, height: AppTypography.lineHeightRelaxed),
        textAlign: TextAlign.right,
      ),
    );
  }

  Widget _buildEmptySlots(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(40.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Icon(Icons.calendar_today_outlined, size: 48.sp, color: AppColors.gray300),
          SizedBox(height: 16.h),
          Text('لا توجد مواعيد متاحة حالياً', style: AppTypography.bodyMedium(context).copyWith(color: AppColors.textSecondary), textAlign: TextAlign.center),
        ],
      ),
    );
  }

  Widget _buildAvailableSlots(BuildContext context, List<Map<String, dynamic>> slots, String doctorId) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Wrap(
        spacing: 12.w,
        runSpacing: 12.h,
        alignment: WrapAlignment.end,
        children: slots.map((slot) {
          final available = slot['available'] != false;
          final time = slot['time'] ?? slot['startTime'] ?? '';
          final date = slot['date'] ?? '';
          return GestureDetector(
            onTap: available
                ? () {
                    context.push('/doctor/book/$doctorId?date=$date&time=$time');
                  }
                : null,
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 14.h),
              decoration: BoxDecoration(
                color: available ? AppColors.primary.withOpacity(0.1) : AppColors.gray200,
                borderRadius: BorderRadius.circular(16.r),
                border: Border.all(color: available ? AppColors.primary : AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(time.toString(), style: AppTypography.bodyMedium(context).copyWith(color: available ? AppColors.primary : AppColors.textTertiary, fontWeight: available ? AppTypography.semiBold : AppTypography.regular)),
                  if (date.isNotEmpty) ...[SizedBox(height: 4.h), Text(date, style: AppTypography.bodySmall(context).copyWith(color: available ? AppColors.primary : AppColors.textTertiary, fontSize: 11.sp))],
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
