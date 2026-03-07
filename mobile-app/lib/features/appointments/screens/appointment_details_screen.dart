import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../shared/mock_content.dart';

/// Redesigned Appointment Details Screen
/// Clear layout with easy-to-read information
/// Edit/Cancel buttons clearly visible
/// Status indicators with icons
class AppointmentDetailsScreen extends StatelessWidget {
  final String appointmentId;

  const AppointmentDetailsScreen({super.key, required this.appointmentId});

  @override
  Widget build(BuildContext context) {
    final appointment = MockContent.appointment;
    final doctorName = appointment['doctorName']?.toString() ?? 'اسم الاستشاري';
    final doctorImage = appointment['doctorImage']?.toString() ?? '';
    final title = appointment['title']?.toString() ?? 'جلسة استشارية';
    final dateTime = appointment['date']?.toString() ?? 'السبت 2 نوفمبر • 12:00 مساءً';
    final date = dateTime.split(' • ')[0];
    final time = dateTime.split(' • ').length > 1 ? dateTime.split(' • ')[1] : '12:00 مساءً';
    final type = appointment['type']?.toString() ?? 'فيديو';
    final price = appointment['price']?.toString() ?? '152.00 ج.م';
    final notes = appointment['notes']?.toString() ?? '';
    final status = 'confirmed'; // pending, confirmed, completed, cancelled

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            AppHeader(
              title: 'تفاصيل الجلسة',
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
                    // Status Badge
                    _buildStatusBadge(context, status),
                    SizedBox(height: 24.h),
                    // Specialist Card
                    _buildSpecialistCard(context, doctorName, doctorImage, title),
                    SizedBox(height: 24.h),
                    // Details Section
                    _buildSectionTitle(context, 'معلومات الجلسة'),
                    SizedBox(height: 16.h),
                    _buildDetailsCard(context, date, time, type, price),
                    SizedBox(height: 24.h),
                    // Notes Section (if exists)
                    if (notes.isNotEmpty) ...[
                      _buildSectionTitle(context, 'ملاحظات'),
                      SizedBox(height: 16.h),
                      _buildNotesCard(context, notes),
                      SizedBox(height: 24.h),
                    ],
                    // Action Buttons
                    _buildActionButtons(context, status),
                    SizedBox(height: 24.h),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(BuildContext context, String status) {
    Color statusColor;
    String statusText;
    IconData statusIcon;

    switch (status) {
      case 'pending':
        statusColor = AppColors.warning;
        statusText = 'قيد الانتظار';
        statusIcon = Icons.schedule_rounded;
        break;
      case 'confirmed':
        statusColor = AppColors.success;
        statusText = 'مؤكدة';
        statusIcon = Icons.check_circle_rounded;
        break;
      case 'completed':
        statusColor = AppColors.info;
        statusText = 'مكتملة';
        statusIcon = Icons.check_circle_outline_rounded;
        break;
      case 'cancelled':
        statusColor = AppColors.error;
        statusText = 'ملغاة';
        statusIcon = Icons.cancel_rounded;
        break;
      default:
        statusColor = AppColors.gray500;
        statusText = 'غير معروف';
        statusIcon = Icons.help_outline_rounded;
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: statusColor.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            statusIcon,
            size: 20.sp,
            color: statusColor,
          ),
          SizedBox(width: 8.w),
          Text(
            statusText,
            style: AppTypography.bodyMedium(context).copyWith(
              color: statusColor,
              fontWeight: AppTypography.semiBold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpecialistCard(BuildContext context, String name, String image, String title) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Image
          Container(
            width: 72.w,
            height: 72.w,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16.r),
              border: Border.all(color: AppColors.border),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16.r),
              child: image.isNotEmpty
                  ? Image.network(
                      image,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: AppColors.gray100,
                          child: Icon(
                            AppIcons.person,
                            size: 36.sp,
                            color: AppColors.gray400,
                          ),
                        );
                      },
                    )
                  : Container(
                      color: AppColors.gray100,
                      child: Icon(
                        AppIcons.person,
                        size: 36.sp,
                        color: AppColors.gray400,
                      ),
                    ),
            ),
          ),
          SizedBox(width: 16.w),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  name,
                  style: AppTypography.headingM(context),
                  textAlign: TextAlign.right,
                ),
                SizedBox(height: 6.h),
                Text(
                  title,
                  style: AppTypography.bodyMedium(context).copyWith(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.right,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Text(
      title,
      style: AppTypography.headingS(context),
      textAlign: TextAlign.right,
    );
  }

  Widget _buildDetailsCard(BuildContext context, String date, String time, String type, String price) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          _buildDetailRow(
            context: context,
            icon: AppIcons.calendar,
            label: 'التاريخ',
            value: date,
          ),
          SizedBox(height: 16.h),
          Divider(color: AppColors.border, height: 1),
          SizedBox(height: 16.h),
          _buildDetailRow(
            context: context,
            icon: AppIcons.clock,
            label: 'الوقت',
            value: time,
          ),
          SizedBox(height: 16.h),
          Divider(color: AppColors.border, height: 1),
          SizedBox(height: 16.h),
          _buildDetailRow(
            context: context,
            icon: Icons.video_call_rounded,
            label: 'نوع الجلسة',
            value: type,
          ),
          SizedBox(height: 16.h),
          Divider(color: AppColors.border, height: 1),
          SizedBox(height: 16.h),
          _buildDetailRow(
            context: context,
            icon: Icons.payments_rounded,
            label: 'السعر',
            value: price,
            isPrice: true,
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow({
    required BuildContext context,
    required IconData icon,
    required String label,
    required String value,
    bool isPrice = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          value,
          style: isPrice
              ? AppTypography.headingS(context).copyWith(
                  color: AppColors.primary,
                )
              : AppTypography.bodyLarge(context),
          textAlign: TextAlign.left,
        ),
        Row(
          children: [
            Icon(
              icon,
              size: 20.sp,
              color: AppColors.textSecondary,
            ),
            SizedBox(width: 8.w),
            Text(
              label,
              style: AppTypography.bodyMedium(context).copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.right,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildNotesCard(BuildContext context, String notes) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Text(
        notes,
        style: AppTypography.bodyMedium(context).copyWith(
          height: AppTypography.lineHeightRelaxed,
        ),
        textAlign: TextAlign.right,
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, String status) {
    if (status == 'completed' || status == 'cancelled') {
      return SizedBox(
        width: double.infinity,
        height: 52.h,
        child: OutlinedButton.icon(
          onPressed: () {
            context.push('/appointments/booking');
          },
          icon: Icon(
            AppIcons.add,
            size: 20.sp,
            color: AppColors.primary,
          ),
          label: Text(
            'حجز مرة أخرى',
            style: AppTypography.bodyLarge(context).copyWith(
              color: AppColors.primary,
              fontWeight: AppTypography.semiBold,
            ),
          ),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: AppColors.primary, width: 2),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16.r),
            ),
          ),
        ),
      );
    }

    return Column(
      children: [
        // Join/Start Session Button
        if (status == 'confirmed') ...[
          SizedBox(
            width: double.infinity,
            height: 52.h,
            child: ElevatedButton.icon(
              onPressed: () {
                // Navigate to session page
                context.push('/sessions/$appointmentId');
              },
              icon: Icon(
                Icons.video_call_rounded,
                size: 20.sp,
                color: AppColors.white,
              ),
              label: Text(
                'الانضمام للجلسة',
                style: AppTypography.bodyLarge(context).copyWith(
                  color: AppColors.white,
                  fontWeight: AppTypography.semiBold,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16.r),
                ),
                elevation: 0,
              ),
            ),
          ),
          SizedBox(height: 12.h),
        ],
        // Action Buttons Row
        Row(
          children: [
            Expanded(
              child: SizedBox(
                height: 52.h,
                child: OutlinedButton.icon(
                  onPressed: () {
                    // Edit appointment
                    context.push('/appointments/booking');
                  },
                  icon: Icon(
                    AppIcons.edit,
                    size: 20.sp,
                    color: AppColors.primary,
                  ),
                  label: Text(
                    'تعديل',
                    style: AppTypography.bodyLarge(context).copyWith(
                      color: AppColors.primary,
                      fontWeight: AppTypography.semiBold,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.primary, width: 2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16.r),
                    ),
                  ),
                ),
              ),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: SizedBox(
                height: 52.h,
                child: OutlinedButton.icon(
                  onPressed: () {
                    // Show cancel confirmation
                    _showCancelDialog(context);
                  },
                  icon: Icon(
                    AppIcons.delete,
                    size: 20.sp,
                    color: AppColors.error,
                  ),
                  label: Text(
                    'إلغاء',
                    style: AppTypography.bodyLarge(context).copyWith(
                      color: AppColors.error,
                      fontWeight: AppTypography.semiBold,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.error, width: 2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16.r),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _showCancelDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.r),
        ),
        title: Text(
          'إلغاء الحجز',
          style: AppTypography.headingM(context),
          textAlign: TextAlign.right,
        ),
        content: Text(
          'هل أنت متأكد من إلغاء هذا الحجز؟',
          style: AppTypography.bodyMedium(context),
          textAlign: TextAlign.right,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'تراجع',
              style: AppTypography.bodyLarge(context).copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Cancel appointment
              context.pop();
            },
            child: Text(
              'إلغاء الحجز',
              style: AppTypography.bodyLarge(context).copyWith(
                color: AppColors.error,
                fontWeight: AppTypography.semiBold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
