import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import 'package:go_router/go_router.dart';

/// Checkout Screen - Step 1: Address Selection
/// Step-by-step flow (address → payment → review)
/// Visual feedback on each step
class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  int _currentStep = 1; // 1: Address, 2: Payment, 3: Review
  String? _selectedAddressId;

  final List<Map<String, dynamic>> _addresses = [
    {
      'id': 'addr_1',
      'name': 'المنزل',
      'address': '123 شارع النصر، القاهرة',
      'phone': '01234567890',
      'isDefault': true,
    },
    {
      'id': 'addr_2',
      'name': 'العمل',
      'address': '456 شارع التحرير، الجيزة',
      'phone': '01234567891',
      'isDefault': false,
    },
  ];

  @override
  void initState() {
    super.initState();
    _selectedAddressId = _addresses.firstWhere((a) => a['isDefault'] as bool)['id'] as String;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            AppHeader(
              title: 'إتمام الشراء',
              leading: IconButton(
                icon: Icon(
                  AppIcons.arrowBack,
                  size: 24.sp,
                  color: AppColors.textPrimary,
                ),
                onPressed: () => context.pop(),
              ),
            ),
            // Progress Indicator
            _buildProgressIndicator(),
            // Content
            Expanded(
              child: _buildStepContent(),
            ),
            // Footer
            if (_currentStep < 3) _buildFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
      child: Row(
        children: [
          _buildProgressStep(1, 'العنوان', _currentStep >= 1),
          Expanded(
            child: Container(
              height: 2,
              color: _currentStep >= 2 ? AppColors.primary : AppColors.gray200,
            ),
          ),
          _buildProgressStep(2, 'الدفع', _currentStep >= 2),
          Expanded(
            child: Container(
              height: 2,
              color: _currentStep >= 3 ? AppColors.primary : AppColors.gray200,
            ),
          ),
          _buildProgressStep(3, 'المراجعة', _currentStep >= 3),
        ],
      ),
    );
  }

  Widget _buildProgressStep(int step, String label, bool isActive) {
    return Column(
      children: [
        Container(
          width: 40.w,
          height: 40.w,
          decoration: BoxDecoration(
            color: isActive ? AppColors.primary : AppColors.gray200,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: isActive
                ? Icon(
                    Icons.check_rounded,
                    color: AppColors.white,
                    size: 20.sp,
                  )
                : Text(
                    '$step',
                    style: AppTypography.bodyMedium(context).copyWith(
                      color: AppColors.white,
                      fontWeight: AppTypography.semiBold,
                    ),
                  ),
          ),
        ),
        SizedBox(height: 8.h),
        Text(
          label,
          style: AppTypography.bodySmall(context).copyWith(
            color: isActive ? AppColors.primary : AppColors.textTertiary,
            fontWeight: isActive ? AppTypography.semiBold : AppTypography.regular,
          ),
        ),
      ],
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 1:
        return _buildAddressStep();
      case 2:
        return _buildPaymentStep();
      case 3:
        return _buildReviewStep();
      default:
        return _buildAddressStep();
    }
  }

  Widget _buildAddressStep() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(20.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'اختر عنوان التوصيل',
            style: AppTypography.headingM(context),
            textAlign: TextAlign.right,
          ),
          SizedBox(height: 16.h),
          ..._addresses.map((address) {
            return Padding(
              padding: EdgeInsets.only(bottom: 12.h),
              child: _buildAddressCard(address),
            );
          }),
          SizedBox(height: 16.h),
          OutlinedButton.icon(
            onPressed: () {
              // TODO: Add new address
            },
            icon: Icon(
              AppIcons.add,
              size: 20.sp,
              color: AppColors.primary,
            ),
            label: Text(
              'إضافة عنوان جديد',
              style: AppTypography.bodyLarge(context).copyWith(
                color: AppColors.primary,
              ),
            ),
            style: OutlinedButton.styleFrom(
              padding: EdgeInsets.symmetric(vertical: 16.h),
              side: const BorderSide(color: AppColors.primary, width: 2),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16.r),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddressCard(Map<String, dynamic> address) {
    final isSelected = _selectedAddressId == address['id'];
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedAddressId = address['id'] as String;
        });
      },
      child: Container(
        padding: EdgeInsets.all(20.w),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.radio_button_checked_rounded : Icons.radio_button_unchecked_rounded,
              color: isSelected ? AppColors.primary : AppColors.gray400,
              size: 24.sp,
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      if (address['isDefault'] as bool)
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8.r),
                          ),
                          child: Text(
                            'افتراضي',
                            style: AppTypography.bodySmall(context).copyWith(
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      SizedBox(width: 8.w),
                      Text(
                        address['name'] as String,
                        style: AppTypography.headingS(context),
                        textAlign: TextAlign.right,
                      ),
                    ],
                  ),
                  SizedBox(height: 8.h),
                  Text(
                    address['address'] as String,
                    style: AppTypography.bodyMedium(context).copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.right,
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    address['phone'] as String,
                    style: AppTypography.bodySmall(context).copyWith(
                      color: AppColors.textTertiary,
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

  Widget _buildPaymentStep() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(20.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'اختر طريقة الدفع',
            style: AppTypography.headingM(context),
            textAlign: TextAlign.right,
          ),
          SizedBox(height: 16.h),
          _buildPaymentMethodCard(
            'الدفع عند الاستلام',
            Icons.money_rounded,
            true,
          ),
          SizedBox(height: 12.h),
          _buildPaymentMethodCard(
            'بطاقة ائتمانية',
            Icons.credit_card_rounded,
            false,
          ),
          SizedBox(height: 12.h),
          _buildPaymentMethodCard(
            'محفظة إلكترونية',
            Icons.account_balance_wallet_rounded,
            false,
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodCard(String title, IconData icon, bool isSelected) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(
          color: isSelected ? AppColors.primary : AppColors.border,
          width: isSelected ? 2 : 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            isSelected ? Icons.radio_button_checked_rounded : Icons.radio_button_unchecked_rounded,
            color: isSelected ? AppColors.primary : AppColors.gray400,
            size: 24.sp,
          ),
          SizedBox(width: 16.w),
          Expanded(
            child: Text(
              title,
              style: AppTypography.bodyLarge(context),
              textAlign: TextAlign.right,
            ),
          ),
          SizedBox(width: 16.w),
          Icon(
            icon,
            size: 28.sp,
            color: AppColors.primary,
          ),
        ],
      ),
    );
  }

  Widget _buildReviewStep() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(20.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Order Summary
          Text(
            'ملخص الطلب',
            style: AppTypography.headingM(context),
            textAlign: TextAlign.right,
          ),
          SizedBox(height: 16.h),
          Container(
            padding: EdgeInsets.all(20.w),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(20.r),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _buildSummaryRow('المجموع الفرعي', '385 ج.م'),
                SizedBox(height: 12.h),
                _buildSummaryRow('التوصيل', '25 ج.م'),
                SizedBox(height: 12.h),
                Divider(color: AppColors.border),
                SizedBox(height: 12.h),
                _buildSummaryRow('الإجمالي', '410 ج.م', isTotal: true),
              ],
            ),
          ),
          SizedBox(height: 24.h),
          // Address Summary
          Text(
            'عنوان التوصيل',
            style: AppTypography.headingM(context),
            textAlign: TextAlign.right,
          ),
          SizedBox(height: 16.h),
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
                Text(
                  _addresses.firstWhere((a) => a['id'] == _selectedAddressId)['name'] as String,
                  style: AppTypography.headingS(context),
                  textAlign: TextAlign.right,
                ),
                SizedBox(height: 8.h),
                Text(
                  _addresses.firstWhere((a) => a['id'] == _selectedAddressId)['address'] as String,
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

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          value,
          style: isTotal
              ? AppTypography.headingM(context).copyWith(
                  color: AppColors.primary,
                )
              : AppTypography.bodyLarge(context),
        ),
        Text(
          label,
          style: isTotal
              ? AppTypography.headingS(context)
              : AppTypography.bodyMedium(context).copyWith(
                  color: AppColors.textSecondary,
                ),
          textAlign: TextAlign.right,
        ),
      ],
    );
  }

  Widget _buildFooter() {
    return Container(
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
            if (_currentStep < 3) {
              setState(() {
                _currentStep++;
              });
            } else {
              // Place order
              context.push('/order-confirmation');
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16.r),
            ),
          ),
          child: Text(
            _currentStep < 3 ? 'التالي' : 'تأكيد الطلب',
            style: AppTypography.bodyLarge(context).copyWith(
              color: AppColors.white,
              fontWeight: AppTypography.semiBold,
            ),
          ),
        ),
      ),
    );
  }
}
