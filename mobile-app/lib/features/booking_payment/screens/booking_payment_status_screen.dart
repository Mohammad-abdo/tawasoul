import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../theme/booking_payment_design.dart';

/// Booking Payment Status – Failed / Pending / Canceled.
/// Explains what happened, provides next action, calm language.
class BookingPaymentStatusScreen extends StatelessWidget {
  final String state;

  const BookingPaymentStatusScreen({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    final config = _configForState(state);

    return Scaffold(
      backgroundColor: BookingPaymentDesign.bookingCardBg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 28.w, vertical: 32.h),
          child: Column(
            children: [
              SizedBox(height: 40.h),
              _buildIcon(config),
              SizedBox(height: 28.h),
              Text(
                config.title,
                style: BookingPaymentDesign.titleLarge(context).copyWith(fontSize: 22.sp),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 14.h),
              Text(
                config.message,
                style: BookingPaymentDesign.bodyFriendly(context),
                textAlign: TextAlign.center,
              ),
              if (config.subMessage != null) ...[
                SizedBox(height: 12.h),
                Text(
                  config.subMessage!,
                  style: BookingPaymentDesign.captionFriendly(context),
                  textAlign: TextAlign.center,
                ),
              ],
              SizedBox(height: 36.h),
              ...config.actions.map((a) => Padding(
                    padding: EdgeInsets.only(bottom: 14.h),
                    child: SizedBox(
                      width: double.infinity,
                      height: 54.h,
                      child: a.isPrimary
                          ? ElevatedButton(
                              onPressed: () => _handleAction(context, a.route, a.replace),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: config.color,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(BookingPaymentDesign.buttonRadius)),
                                elevation: 0,
                              ),
                              child: Text(a.label, style: BookingPaymentDesign.bodyFriendly(context).copyWith(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 16.sp)),
                            )
                          : OutlinedButton(
                              onPressed: () => _handleAction(context, a.route, a.replace),
                              style: OutlinedButton.styleFrom(
                                side: BorderSide(color: config.color),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(BookingPaymentDesign.buttonRadius)),
                              ),
                              child: Text(a.label, style: BookingPaymentDesign.bodyFriendly(context).copyWith(color: config.color, fontWeight: FontWeight.w600, fontSize: 16.sp)),
                            ),
                    ),
                  )),
              SizedBox(height: 24.h),
            ],
          ),
        ),
      ),
    );
  }

  void _handleAction(BuildContext context, String route, bool replace) {
    if (replace) {
      context.go(route);
    } else {
      context.push(route);
    }
  }

  Widget _buildIcon(_StatusConfig config) {
    return Container(
      width: 100.w,
      height: 100.w,
      decoration: BoxDecoration(
        color: config.color.withOpacity(0.12),
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Icon(config.icon, size: 48.sp, color: config.color),
      ),
    );
  }

  _StatusConfig _configForState(String s) {
    switch (s) {
      case 'failed':
        return _StatusConfig(
          title: 'لم يتم الدفع',
          message: 'لم نتمكن من إتمام عملية الدفع. لم يتم خصم أي مبلغ من حسابك.',
          subMessage: 'يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع أخرى.',
          color: BookingPaymentDesign.bookingError,
          icon: Icons.payment_rounded,
          actions: [
            _Action(label: 'إعادة المحاولة', route: '/booking/payment', isPrimary: true, replace: true),
            _Action(label: 'العودة لتعديل الحجز', route: '/appointments/booking', isPrimary: false, replace: true),
          ],
        );
      case 'pending':
        return _StatusConfig(
          title: 'الدفع قيد المراجعة',
          message: 'تم استلام طلبك وسيتم التحقق من الدفع خلال وقت قصير.',
          subMessage: 'سيصلك إشعار عند تأكيد الدفع. يمكنك متابعة حالة الحجز من "جلساتي".',
          color: BookingPaymentDesign.bookingWarning,
          icon: Icons.schedule_rounded,
          actions: [
            _Action(label: 'الذهاب إلى جلساتي', route: '/appointments', isPrimary: true, replace: true),
            _Action(label: 'العودة للرئيسية', route: '/home', isPrimary: false, replace: true),
          ],
        );
      case 'canceled':
        return _StatusConfig(
          title: 'تم إلغاء الدفع',
          message: 'تم إلغاء عملية الدفع. لم يتم حجز أي موعد ولم يتم خصم أي مبلغ.',
          subMessage: 'يمكنك حجز موعد جديد في أي وقت.',
          color: AppColors.textTertiary,
          icon: Icons.cancel_outlined,
          actions: [
            _Action(label: 'حجز موعد جديد', route: '/appointments/booking', isPrimary: true, replace: true),
            _Action(label: 'العودة للرئيسية', route: '/home', isPrimary: false, replace: true),
          ],
        );
      default:
        return _configForState('failed');
    }
  }
}

class _StatusConfig {
  final String title;
  final String message;
  final String? subMessage;
  final Color color;
  final IconData icon;
  final List<_Action> actions;

  _StatusConfig({
    required this.title,
    required this.message,
    this.subMessage,
    required this.color,
    required this.icon,
    required this.actions,
  });
}

class _Action {
  final String label;
  final String route;
  final bool isPrimary;
  final bool replace;

  _Action({required this.label, required this.route, required this.isPrimary, required this.replace});
}
