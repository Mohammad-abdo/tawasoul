import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import '../theme/booking_payment_design.dart';

/// Booking Payment – Dedicated payment for sessions/appointments.
/// Sticky summary, package selection, pricing breakdown, payment methods, consent.
/// Service-focused, calendar/clock visuals, trust & transparency.
class BookingPaymentScreen extends StatefulWidget {
  const BookingPaymentScreen({super.key});

  @override
  State<BookingPaymentScreen> createState() => _BookingPaymentScreenState();
}

class _BookingPaymentScreenState extends State<BookingPaymentScreen> {
  String _selectedPaymentMethod = 'fawry';
  String _selectedPackage = 'single';
  bool _agreedToSession = false;
  bool _isSubmitting = false;

  // Mock from navigation params (in real app: parse from uri.queryParameters)
  String get _serviceName => 'موعد مع استشاري';
  String get _specialistName => 'د/ سارة أحمد';
  String get _sessionType => 'استشارة فردية';
  String get _dateTime => 'السبت، 2 نوفمبر، 12:00 م';
  String get _duration => '٤٥ دقيقة';
  double get _basePrice => 152.0;

  double _getTotalForPackage(String pkg) {
    switch (pkg) {
      case 'weekly':
        return (_basePrice * 4 * 0.9);
      case 'monthly':
        return (_basePrice * 12 * 0.85);
      default:
        return _basePrice;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BookingPaymentDesign.bookingBg,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'دفع الحجز',
              leading: IconButton(
                icon: Icon(Icons.arrow_back_ios_rounded, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildStickySummary(context),
                    SizedBox(height: 20.h),
                    _buildPackageSelection(context),
                    SizedBox(height: 20.h),
                    _buildPricingBreakdown(context),
                    SizedBox(height: 20.h),
                    _buildPaymentMethods(context),
                    SizedBox(height: 20.h),
                    _buildConsent(context),
                    SizedBox(height: 24.h),
                  ],
                ),
              ),
            ),
            _buildBottomBar(context),
          ],
        ),
      ),
    );
  }

  Widget _buildStickySummary(BuildContext context) {
    return Container(
      padding: BookingPaymentDesign.cardPadding,
      decoration: BoxDecoration(
        color: BookingPaymentDesign.bookingCardBg,
        borderRadius: BorderRadius.circular(BookingPaymentDesign.cardRadius),
        border: Border.all(color: AppColors.border),
        boxShadow: BookingPaymentDesign.cardShadow(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            textDirection: TextDirection.rtl,
            children: [
              Icon(Icons.event_available_rounded, size: 24.sp, color: BookingPaymentDesign.bookingAccent),
              SizedBox(width: 10.w),
              Text('ملخص الحجز', style: BookingPaymentDesign.titleMedium(context), textAlign: TextAlign.right),
            ],
          ),
          SizedBox(height: 16.h),
          _summaryRow(context, 'الخدمة', _serviceName),
          _summaryRow(context, 'الاختصاصي', _specialistName),
          _summaryRow(context, 'نوع الجلسة', _sessionType),
          _summaryRow(context, 'التاريخ والوقت', _dateTime),
          _summaryRow(context, 'مدة الجلسة', _duration),
          _summaryRow(context, 'سعر الجلسة', '$_basePrice ج.م'),
          SizedBox(height: 12.h),
          Divider(height: 1, color: AppColors.border),
          SizedBox(height: 12.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            textDirection: TextDirection.rtl,
            children: [
              Text('الإجمالي', style: BookingPaymentDesign.titleMedium(context), textAlign: TextAlign.right),
              Text('${_getTotalForPackage(_selectedPackage).toStringAsFixed(2)} ج.م',
                  style: BookingPaymentDesign.titleMedium(context).copyWith(color: BookingPaymentDesign.bookingAccent)),
            ],
          ),
          SizedBox(height: 12.h),
          OutlinedButton.icon(
            onPressed: () => context.pop(),
            icon: Icon(Icons.edit_calendar_rounded, size: 18.sp),
            label: const Text('تغيير التاريخ أو الوقت'),
            style: OutlinedButton.styleFrom(
              foregroundColor: BookingPaymentDesign.bookingAccent,
              side: BorderSide(color: BookingPaymentDesign.bookingAccent),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(BookingPaymentDesign.buttonRadius)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(BuildContext context, String label, String value) {
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

  Widget _buildPackageSelection(BuildContext context) {
    final packages = [
      {'id': 'single', 'label': 'جلسة واحدة', 'price': _basePrice, 'per': 'جلسة', 'discount': null},
      {'id': 'weekly', 'label': 'باقة أسبوعية (٤ جلسات)', 'price': _basePrice * 4 * 0.9, 'per': 'باقة', 'discount': '١٠٪'},
      {'id': 'monthly', 'label': 'باقة شهرية (١٢ جلسة)', 'price': _basePrice * 12 * 0.85, 'per': 'باقة', 'discount': '١٥٪'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          textDirection: TextDirection.rtl,
          children: [
            Icon(Icons.layers_rounded, size: 22.sp, color: BookingPaymentDesign.bookingAccent),
            SizedBox(width: 8.w),
            Text('اختر الباقة', style: BookingPaymentDesign.titleMedium(context), textAlign: TextAlign.right),
          ],
        ),
        SizedBox(height: 12.h),
        ...packages.map((p) {
          final id = p['id'] as String;
          final isSelected = _selectedPackage == id;
          return Padding(
            padding: EdgeInsets.only(bottom: 10.h),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => setState(() => _selectedPackage = id),
                borderRadius: BorderRadius.circular(BookingPaymentDesign.cardRadiusSmall),
                child: Container(
                  padding: BookingPaymentDesign.cardPaddingSmall,
                  decoration: BoxDecoration(
                    color: isSelected ? BookingPaymentDesign.bookingAccentLight : BookingPaymentDesign.bookingCardBg,
                    borderRadius: BorderRadius.circular(BookingPaymentDesign.cardRadiusSmall),
                    border: Border.all(
                      color: isSelected ? BookingPaymentDesign.bookingAccent : AppColors.border,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    textDirection: TextDirection.rtl,
                    children: [
                      if (isSelected) Icon(Icons.check_circle_rounded, size: 22.sp, color: BookingPaymentDesign.bookingAccent),
                      if (isSelected) SizedBox(width: 10.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              p['label'] as String,
                              style: BookingPaymentDesign.bodyFriendly(context).copyWith(
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                                color: AppColors.textPrimary,
                              ),
                              textAlign: TextAlign.right,
                            ),
                            if (p['discount'] != null)
                              Text(
                                'خصم ${p['discount']}',
                                style: BookingPaymentDesign.captionFriendly(context).copyWith(
                                  color: BookingPaymentDesign.bookingSuccess,
                                  fontWeight: FontWeight.w600,
                                ),
                                textAlign: TextAlign.right,
                              ),
                          ],
                        ),
                      ),
                      Text(
                        '${(p['price'] as num).toStringAsFixed(0)} ج.م',
                        style: BookingPaymentDesign.titleMedium(context).copyWith(
                          fontSize: 15.sp,
                          color: BookingPaymentDesign.bookingAccent,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildPricingBreakdown(BuildContext context) {
    final subtotal = _getTotalForPackage(_selectedPackage);
    final fees = 5.0;
    final total = subtotal + fees;

    return Container(
      padding: BookingPaymentDesign.cardPadding,
      decoration: BoxDecoration(
        color: BookingPaymentDesign.bookingCardBg,
        borderRadius: BorderRadius.circular(BookingPaymentDesign.cardRadius),
        border: Border.all(color: AppColors.border),
        boxShadow: BookingPaymentDesign.cardShadowSoft(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            textDirection: TextDirection.rtl,
            children: [
              Icon(Icons.receipt_long_rounded, size: 22.sp, color: BookingPaymentDesign.bookingAccent),
              SizedBox(width: 8.w),
              Text('تفاصيل المبلغ', style: BookingPaymentDesign.titleMedium(context), textAlign: TextAlign.right),
            ],
          ),
          SizedBox(height: 14.h),
          _priceRow('المجموع الفرعي', subtotal),
          _priceRow('رسوم الخدمة', fees),
          SizedBox(height: 10.h),
          Divider(height: 1, color: AppColors.border),
          SizedBox(height: 10.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            textDirection: TextDirection.rtl,
            children: [
              Text('$total ج.م', style: BookingPaymentDesign.titleMedium(context).copyWith(color: BookingPaymentDesign.bookingAccent)),
              Text('المبلغ النهائي', style: BookingPaymentDesign.titleMedium(context), textAlign: TextAlign.right),
            ],
          ),
        ],
      ),
    );
  }

  Widget _priceRow(String label, double value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        textDirection: TextDirection.rtl,
        children: [
          Text(
            '${value.toStringAsFixed(2)} ج.م',
            style: BookingPaymentDesign.bodyFriendly(context).copyWith(color: AppColors.textPrimary),
          ),
          Text(label, style: BookingPaymentDesign.captionFriendly(context), textAlign: TextAlign.right),
        ],
      ),
    );
  }

  Widget _buildPaymentMethods(BuildContext context) {
    final methods = [
      {'id': 'fawry', 'label': 'فوري', 'icon': Icons.payment_rounded},
      {'id': 'wallet', 'label': 'المحافظ الإلكترونية', 'icon': Icons.account_balance_wallet_rounded},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          textDirection: TextDirection.rtl,
          children: [
            Icon(Icons.payment_rounded, size: 22.sp, color: BookingPaymentDesign.bookingAccent),
            SizedBox(width: 8.w),
            Text('طريقة الدفع', style: BookingPaymentDesign.titleMedium(context), textAlign: TextAlign.right),
          ],
        ),
        SizedBox(height: 12.h),
        ...methods.map((m) {
          final id = m['id'] as String;
          final isSelected = _selectedPaymentMethod == id;
          return Padding(
            padding: EdgeInsets.only(bottom: 10.h),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => setState(() => _selectedPaymentMethod = id),
                borderRadius: BorderRadius.circular(BookingPaymentDesign.cardRadiusSmall),
                child: Container(
                  padding: BookingPaymentDesign.cardPaddingSmall,
                  decoration: BoxDecoration(
                    color: isSelected ? BookingPaymentDesign.bookingAccentLight : BookingPaymentDesign.bookingCardBg,
                    borderRadius: BorderRadius.circular(BookingPaymentDesign.cardRadiusSmall),
                    border: Border.all(
                      color: isSelected ? BookingPaymentDesign.bookingAccent : AppColors.border,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    textDirection: TextDirection.rtl,
                    children: [
                      if (isSelected) Icon(Icons.check_circle_rounded, size: 22.sp, color: BookingPaymentDesign.bookingAccent),
                      if (isSelected) SizedBox(width: 10.w),
                      Expanded(
                        child: Text(
                          m['label'] as String,
                          style: BookingPaymentDesign.bodyFriendly(context).copyWith(
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                          ),
                          textAlign: TextAlign.right,
                        ),
                      ),
                      Icon(m['icon'] as IconData, size: 24.sp, color: isSelected ? BookingPaymentDesign.bookingAccent : AppColors.textTertiary),
                    ],
                  ),
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildConsent(BuildContext context) {
    return Container(
      padding: BookingPaymentDesign.cardPadding,
      decoration: BoxDecoration(
        color: BookingPaymentDesign.bookingCardBg,
        borderRadius: BorderRadius.circular(BookingPaymentDesign.cardRadius),
        border: Border.all(color: AppColors.border),
        boxShadow: BookingPaymentDesign.cardShadowSoft(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            textDirection: TextDirection.rtl,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 24.w,
                height: 24.w,
                child: Checkbox(
                  value: _agreedToSession,
                  onChanged: (v) => setState(() => _agreedToSession = v ?? false),
                  activeColor: BookingPaymentDesign.bookingAccent,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6.r)),
                ),
              ),
              SizedBox(width: 10.w),
              Expanded(
                child: Text(
                  'أفهم أن هذا حجز لجلسة/موعد وأن السياسات الخاصة بالإلغاء وإعادة الجدولة تنطبق.',
                  style: BookingPaymentDesign.bodyFriendly(context).copyWith(fontSize: 14.sp),
                  textAlign: TextAlign.right,
                ),
              ),
            ],
          ),
          SizedBox(height: 12.h),
          Wrap(
            alignment: WrapAlignment.end,
            spacing: 8.w,
            runSpacing: 4.h,
            children: [
              GestureDetector(
                onTap: () {},
                child: Text('سياسة الإلغاء', style: BookingPaymentDesign.captionFriendly(context).copyWith(color: BookingPaymentDesign.bookingAccent, decoration: TextDecoration.underline)),
              ),
              Text('•', style: BookingPaymentDesign.captionFriendly(context)),
              GestureDetector(
                onTap: () {},
                child: Text('ملخص استرداد المبلغ', style: BookingPaymentDesign.captionFriendly(context).copyWith(color: BookingPaymentDesign.bookingAccent, decoration: TextDecoration.underline)),
              ),
              Text('•', style: BookingPaymentDesign.captionFriendly(context)),
              GestureDetector(
                onTap: () {},
                child: Text('الشروط', style: BookingPaymentDesign.captionFriendly(context).copyWith(color: BookingPaymentDesign.bookingAccent, decoration: TextDecoration.underline)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context) {
    final total = _getTotalForPackage(_selectedPackage) + 5.0;
    final canConfirm = _agreedToSession && !_isSubmitting;

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
      decoration: BoxDecoration(
        color: BookingPaymentDesign.bookingCardBg,
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
        child: SizedBox(
          width: double.infinity,
          height: 54.h,
          child: ElevatedButton(
            onPressed: canConfirm
                ? () async {
                    setState(() => _isSubmitting = true);
                    await Future.delayed(const Duration(milliseconds: 800));
                    if (!mounted) return;
                    context.push('/booking/confirmation');
                  }
                : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: BookingPaymentDesign.bookingAccent,
              disabledBackgroundColor: AppColors.buttonDisabled,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(BookingPaymentDesign.buttonRadius)),
              elevation: 0,
            ),
            child: _isSubmitting
                ? SizedBox(
                    width: 24.w,
                    height: 24.h,
                    child: const CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)),
                  )
                : Text(
                    'تأكيد الدفع • ${total.toStringAsFixed(0)} ج.م',
                    style: BookingPaymentDesign.bodyFriendly(context).copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 16.sp,
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}
