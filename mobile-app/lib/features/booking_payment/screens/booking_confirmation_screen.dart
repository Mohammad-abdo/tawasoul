import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../theme/booking_payment_design.dart';

/// Booking Confirmation – Success state after payment.
/// Session summary, calendar CTA, reminder info, "Go to My Sessions".
/// Calm, trustworthy tone.
class BookingConfirmationScreen extends StatelessWidget {
  const BookingConfirmationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BookingPaymentDesign.bookingCardBg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 28.w, vertical: 24.h),
          child: Column(
            children: [
              SizedBox(height: 24.h),
              _buildSuccessIcon(context),
              SizedBox(height: 28.h),
              Text(
                'تم تأكيد الحجز بنجاح',
                style: BookingPaymentDesign.titleLarge(context).copyWith(fontSize: 24.sp),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 12.h),
              Text(
                'تم حجز موعدك بنجاح. سنرسل لك تذكيراً قبل الموعد مع تفاصيل الجلسة.',
                style: BookingPaymentDesign.bodyFriendly(context),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 32.h),
              _buildSessionSummaryCard(context),
              SizedBox(height: 24.h),
              _buildReminderCard(context),
              SizedBox(height: 28.h),
              _buildAddToCalendarButton(context),
              SizedBox(height: 14.h),
              _buildGoToSessionsButton(context),
              SizedBox(height: 14.h),
              TextButton(
                onPressed: () => context.go('/home'),
                child: Text(
                  'العودة للرئيسية',
                  style: BookingPaymentDesign.bodyFriendly(context).copyWith(
                    color: AppColors.textTertiary,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
              SizedBox(height: 32.h),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSuccessIcon(BuildContext context) {
    return Container(
      width: 110.w,
      height: 110.w,
      decoration: BoxDecoration(
        color: BookingPaymentDesign.bookingSuccess.withOpacity(0.12),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: BookingPaymentDesign.bookingSuccess.withOpacity(0.2),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Center(
        child: Container(
          width: 72.w,
          height: 72.w,
          decoration: const BoxDecoration(
            color: BookingPaymentDesign.bookingSuccess,
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.check_rounded, size: 44.sp, color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildSessionSummaryCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: BookingPaymentDesign.cardPadding,
      decoration: BoxDecoration(
        color: BookingPaymentDesign.bookingBg,
        borderRadius: BorderRadius.circular(BookingPaymentDesign.cardRadius),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            textDirection: TextDirection.rtl,
            children: [
              Icon(Icons.event_available_rounded, size: 22.sp, color: BookingPaymentDesign.bookingAccent),
              SizedBox(width: 8.w),
              Text('تفاصيل الجلسة', style: BookingPaymentDesign.titleMedium(context), textAlign: TextAlign.right),
            ],
          ),
          SizedBox(height: 14.h),
          _detailRow(context, 'الخدمة', 'موعد مع استشاري'),
          _detailRow(context, 'الاختصاصي', 'د/ سارة أحمد'),
          _detailRow(context, 'التاريخ والوقت', 'السبت، 2 نوفمبر، 12:00 م'),
          _detailRow(context, 'المدة', '٤٥ دقيقة'),
        ],
      ),
    );
  }

  Widget _detailRow(BuildContext context, String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        textDirection: TextDirection.rtl,
        children: [
          Text(value, style: BookingPaymentDesign.bodyFriendly(context), textAlign: TextAlign.right),
          Text(label, style: BookingPaymentDesign.captionFriendly(context), textAlign: TextAlign.right),
        ],
      ),
    );
  }

  Widget _buildReminderCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: BookingPaymentDesign.cardPaddingSmall,
      decoration: BoxDecoration(
        color: BookingPaymentDesign.bookingAccentLight.withOpacity(0.5),
        borderRadius: BorderRadius.circular(BookingPaymentDesign.cardRadiusSmall),
        border: Border.all(color: BookingPaymentDesign.bookingAccent.withOpacity(0.3)),
      ),
      child: Row(
        textDirection: TextDirection.rtl,
        children: [
          Icon(Icons.notifications_active_rounded, size: 22.sp, color: BookingPaymentDesign.bookingAccent),
          SizedBox(width: 12.w),
          Expanded(
            child: Text(
              'سنرسل إليك إشعاراً قبل الموعد للتذكير، مع رابط الانضمام للجلسة.',
              style: BookingPaymentDesign.bodyFriendly(context).copyWith(fontSize: 14.sp),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddToCalendarButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 52.h,
      child: OutlinedButton.icon(
        onPressed: () {},
        icon: Icon(Icons.calendar_today_rounded, size: 20.sp, color: BookingPaymentDesign.bookingAccent),
        label: Text(
          'إضافة إلى التقويم',
          style: BookingPaymentDesign.bodyFriendly(context).copyWith(
            fontWeight: FontWeight.w600,
            color: BookingPaymentDesign.bookingAccent,
            fontSize: 16.sp,
          ),
        ),
        style: OutlinedButton.styleFrom(
          side: BorderSide(color: BookingPaymentDesign.bookingAccent),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(BookingPaymentDesign.buttonRadius)),
        ),
      ),
    );
  }

  Widget _buildGoToSessionsButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 54.h,
      child: ElevatedButton(
        onPressed: () => context.go('/appointments'),
        style: ElevatedButton.styleFrom(
          backgroundColor: BookingPaymentDesign.bookingAccent,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(BookingPaymentDesign.buttonRadius)),
          elevation: 0,
        ),
        child: Text(
          'الذهاب إلى جلساتي',
          style: BookingPaymentDesign.bodyFriendly(context).copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            fontSize: 16.sp,
          ),
        ),
      ),
    );
  }
}
