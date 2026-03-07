import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_navigation_bar.dart';
import '../../../core/widgets/child_profile_avatar_gateway.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../../core/providers/bookings_provider.dart';

/// Redesigned Appointments List Screen
/// Card-style layout with clear information
/// Swipeable/scrollable list
/// Visual distinction for past sessions
/// Filter/sort options
class AppointmentsListScreen extends StatefulWidget {
  const AppointmentsListScreen({super.key});

  @override
  State<AppointmentsListScreen> createState() => _AppointmentsListScreenState();
}

class _AppointmentsListScreenState extends State<AppointmentsListScreen> {
  String _selectedFilter = 'all'; // all, upcoming, completed, cancelled

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BookingsProvider>().loadBookings();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header — child avatar as gateway to Child Profile
            AppHeader(
              title: 'حجوزاتي',
              childAvatar: const ChildProfileAvatarGateway(),
              leading: IconButton(
                icon: Icon(
                  AppIcons.arrowBack,
                  size: 24.sp,
                  color: AppColors.textPrimary,
                ),
                onPressed: () => context.pop(),
              ),
            ),
            // Filter Chips
            _buildFilterChips(),
            // Content - Consultations only
            Expanded(
              child: _buildConsultationsList(context),
            ),
            // Bottom Navigation
            AppNavigationBar(
              currentIndex: 1,
              onTap: (index) {
                switch (index) {
                  case 0:
                    context.push('/home');
                    break;
                  case 1:
                    break; // Already on appointments
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

  Widget _buildFilterChips() {
    final filters = [
      {'id': 'all', 'label': 'الكل'},
      {'id': 'upcoming', 'label': 'قادمة'},
      {'id': 'completed', 'label': 'مكتملة'},
      {'id': 'cancelled', 'label': 'ملغاة'},
    ];

    return SizedBox(
      height: 44.h,
      child: ListView(
        scrollDirection: Axis.horizontal,
        reverse: true,
        padding: EdgeInsets.symmetric(horizontal: 20.w),
        children: filters.map((filter) {
          final isSelected = _selectedFilter == filter['id'];
          return Padding(
            padding: EdgeInsets.only(left: 8.w),
            child: FilterChip(
              selected: isSelected,
              label: Text(
                filter['label']!,
                style: AppTypography.bodyMedium(context).copyWith(
                  color: isSelected ? AppColors.white : AppColors.textPrimary,
                  fontWeight: isSelected ? AppTypography.semiBold : AppTypography.regular,
                ),
              ),
              onSelected: (selected) {
                setState(() {
                  _selectedFilter = filter['id']!;
                });
              },
              selectedColor: AppColors.primary,
              backgroundColor: AppColors.white,
              side: BorderSide(
                color: isSelected ? AppColors.primary : AppColors.border,
                width: isSelected ? 2 : 1,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20.r),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildConsultationsList(BuildContext context) {
    final bp = context.watch<BookingsProvider>();
    final rawList = bp.bookings;
    final appointments = rawList.map((b) {
      final s = (b['status'] ?? b['bookingStatus'] ?? '').toString().toUpperCase();
      AppointmentStatus status = AppointmentStatus.upcoming;
      if (s == 'COMPLETED' || s == 'DONE') status = AppointmentStatus.completed;
      else if (s == 'CANCELLED' || s == 'CANCELED') status = AppointmentStatus.cancelled;
      final doctor = b['doctor'] is Map ? b['doctor'] as Map<String, dynamic> : null;
      final date = b['date'] ?? b['scheduledAt'] ?? b['scheduledDate'] ?? '';
      final time = b['startTime'] ?? b['time'] ?? '';
      return <String, dynamic>{
        'id': b['id'] ?? '',
        'status': status,
        'date': date is String ? date : '$date',
        'time': time is String ? time : '$time',
        'title': b['title'] ?? b['sessionType'] ?? 'جلسة',
        'type': b['sessionType'] ?? b['type'] ?? 'فيديو',
        'doctorImage': doctor?['profileImage'] ?? doctor?['imageUrl'] ?? b['doctorImage'] ?? 'https://via.placeholder.com/64',
        'doctorName': doctor?['fullName'] ?? doctor?['name'] ?? b['doctorName'] ?? '',
        'price': b['price'] ?? b['amount'] ?? '',
      };
    }).toList();

    // Filter appointments
    final filteredAppointments = appointments.where((app) {
      if (_selectedFilter == 'all') return true;
      switch (_selectedFilter) {
        case 'upcoming':
          return app['status'] == AppointmentStatus.upcoming;
        case 'completed':
          return app['status'] == AppointmentStatus.completed;
        case 'cancelled':
          return app['status'] == AppointmentStatus.cancelled;
        default:
          return true;
      }
    }).toList();

    if (bp.isLoading && rawList.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (bp.error != null && rawList.isEmpty) {
      return Center(
        child: Padding(
          padding: EdgeInsets.all(40.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64.sp, color: AppColors.error),
              SizedBox(height: 16.h),
              Text(
                bp.error!,
                style: AppTypography.bodyMedium(context).copyWith(color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }
    if (filteredAppointments.isEmpty) {
      return Center(
        child: Padding(
          padding: EdgeInsets.all(40.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                AppIcons.calendarOutline,
                size: 64.sp,
                color: AppColors.textTertiary,
              ),
              SizedBox(height: 16.h),
              Text(
                'لا توجد حجوزات',
                style: AppTypography.headingM(context).copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
      itemCount: filteredAppointments.length,
      itemBuilder: (context, index) {
        final appointment = filteredAppointments[index];
        return Padding(
          padding: EdgeInsets.only(bottom: 16.h),
          child: _buildAppointmentCard(
            appointment: appointment,
            onTap: () => context.push('/appointments/${appointment['id']}'),
          ),
        );
      },
    );
  }

  Widget _buildAppointmentCard({
    required Map<String, dynamic> appointment,
    required VoidCallback onTap,
  }) {
    final status = appointment['status'] as AppointmentStatus;
    final isPast = status == AppointmentStatus.completed || status == AppointmentStatus.cancelled;

    String statusText;
    switch (status) {
      case AppointmentStatus.upcoming:
        statusText = 'قادمة';
        break;
      case AppointmentStatus.completed:
        statusText = 'مكتملة';
        break;
      case AppointmentStatus.cancelled:
        statusText = 'ملغاة';
        break;
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20.r),
      child: Container(
        padding: EdgeInsets.all(20.w),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(
            color: isPast ? AppColors.gray300 : AppColors.border,
            width: isPast ? 1 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isPast ? 0.02 : 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: Status & Date
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                StatusBadge(status: status, text: statusText),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      appointment['date'] as String,
                      style: AppTypography.bodyMedium(context).copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: AppTypography.semiBold,
                      ),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 2.h),
                    Text(
                      appointment['time'] as String,
                      style: AppTypography.bodySmall(context).copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  ],
                ),
              ],
            ),
            SizedBox(height: 16.h),
            // Content: Doctor & Service
            Row(
              children: [
                // Doctor Image
                Container(
                  width: 64.w,
                  height: 64.w,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12.r),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12.r),
                    child: Image.network(
                      appointment['doctorImage'] as String,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: AppColors.gray100,
                          child: Icon(
                            AppIcons.person,
                            size: 32.sp,
                            color: AppColors.gray400,
                          ),
                        );
                      },
                    ),
                  ),
                ),
                SizedBox(width: 16.w),
                // Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        appointment['title'] as String,
                        style: AppTypography.headingS(context),
                        textAlign: TextAlign.right,
                      ),
                      SizedBox(height: 6.h),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8.r),
                            ),
                            child: Text(
                              appointment['type'] as String,
                              style: AppTypography.bodySmall(context).copyWith(
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                          SizedBox(width: 8.w),
                          Text(
                            appointment['doctorName'] as String,
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
              ],
            ),
            SizedBox(height: 16.h),
            Divider(color: AppColors.border, height: 1),
            SizedBox(height: 16.h),
            // Footer: Actions & Price
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Actions
                if (status == AppointmentStatus.upcoming)
                  Row(
                    children: [
                      SizedBox(
                        height: 40.h,
                        child: OutlinedButton.icon(
                          onPressed: () {
                            context.push('/appointments/${appointment['id']}');
                          },
                          icon: Icon(
                            AppIcons.edit,
                            size: 16.sp,
                            color: AppColors.primary,
                          ),
                          label: Text(
                            'تعديل',
                            style: AppTypography.bodySmall(context).copyWith(
                              color: AppColors.primary,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.primary),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10.r),
                            ),
                            padding: EdgeInsets.symmetric(horizontal: 12.w),
                          ),
                        ),
                      ),
                    ],
                  )
                else
                  SizedBox(
                    height: 40.h,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        context.push('/appointments/booking');
                      },
                      icon: Icon(
                        AppIcons.add,
                        size: 16.sp,
                        color: AppColors.primary,
                      ),
                      label: Text(
                        'حجز مرة أخرى',
                        style: AppTypography.bodySmall(context).copyWith(
                          color: AppColors.primary,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.primary),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10.r),
                        ),
                        padding: EdgeInsets.symmetric(horizontal: 12.w),
                      ),
                    ),
                  ),
                // Price
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      appointment['price'] as String,
                      style: AppTypography.headingS(context).copyWith(
                        color: AppColors.primary,
                      ),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 2.h),
                    Text(
                      'مشاهدة التفاصيل',
                      style: AppTypography.bodySmall(context).copyWith(
                        color: AppColors.textTertiary,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
