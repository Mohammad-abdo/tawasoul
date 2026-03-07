import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import 'package:go_router/go_router.dart';

/// Order Tracking Screen
/// Status timeline (ordered, shipped, delivered)
/// Estimated delivery date
/// Tap on order → see details
class OrderTrackingScreen extends StatelessWidget {
  final String orderId;

  const OrderTrackingScreen({
    super.key,
    required this.orderId,
  });

  @override
  Widget build(BuildContext context) {
    // Mock order data
    final order = {
      'id': orderId,
      'status': 'shipped', // ordered, shipped, delivered, cancelled
      'orderDate': '2024-01-15',
      'estimatedDelivery': '2024-01-20',
      'trackingNumber': 'TRK123456789',
      'items': [
        {'name': 'مجموعة البطاقات التعليمية', 'quantity': 1, 'price': 85},
        {'name': 'لعبة الأشكال الخشبية', 'quantity': 2, 'price': 150},
      ],
      'total': 410,
      'address': '123 شارع النصر، القاهرة',
    };

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            AppHeader(
              title: 'تتبع الطلب',
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
                padding: EdgeInsets.all(20.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Order Info Card
                    _buildOrderInfoCard(context, order),
                    SizedBox(height: 24.h),
                    // Timeline
                    Text(
                      'حالة الطلب',
                      style: AppTypography.headingM(context),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 16.h),
                    _buildTimeline(context, order['status'] as String),
                    SizedBox(height: 24.h),
                    // Items List
                    Text(
                      'المنتجات',
                      style: AppTypography.headingM(context),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 16.h),
                    ...(order['items'] as List).map((item) {
                      return _buildOrderItem(context, item);
                    }).toList(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderInfoCard(BuildContext context, Map<String, dynamic> order) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20.r),
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
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                order['trackingNumber'] as String,
                style: AppTypography.bodySmall(context).copyWith(
                  color: AppColors.textTertiary,
                ),
              ),
              Text(
                'رقم الطلب: ${order['id']}',
                style: AppTypography.headingS(context),
                textAlign: TextAlign.right,
              ),
            ],
          ),
          SizedBox(height: 16.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${order['total']} ج.م',
                style: AppTypography.headingM(context).copyWith(
                  color: AppColors.primary,
                ),
              ),
              Text(
                'الإجمالي',
                style: AppTypography.bodyMedium(context).copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.right,
              ),
            ],
          ),
          SizedBox(height: 12.h),
          Divider(color: AppColors.border),
          SizedBox(height: 12.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                order['estimatedDelivery'] as String,
                style: AppTypography.bodyMedium(context).copyWith(
                  color: AppColors.primary,
                ),
              ),
              Row(
                children: [
                  Icon(
                    AppIcons.calendar,
                    size: 18.sp,
                    color: AppColors.textSecondary,
                  ),
                  SizedBox(width: 8.w),
                  Text(
                    'التوصيل المتوقع',
                    style: AppTypography.bodyMedium(context).copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.right,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimeline(BuildContext context, String currentStatus) {
    final steps = [
      {'id': 'ordered', 'title': 'تم الطلب', 'date': '15 يناير'},
      {'id': 'shipped', 'title': 'تم الشحن', 'date': '18 يناير'},
      {'id': 'delivered', 'title': 'تم التوصيل', 'date': '20 يناير'},
    ];

    int currentIndex = steps.indexWhere((s) => s['id'] == currentStatus);
    if (currentIndex == -1) currentIndex = 0;

    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: List.generate(steps.length, (index) {
          final step = steps[index];
          final isCompleted = index <= currentIndex;
          final isCurrent = index == currentIndex;

          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Timeline line
              if (index < steps.length - 1)
                Container(
                  width: 2,
                  height: 60.h,
                  color: isCompleted ? AppColors.primary : AppColors.gray200,
                  margin: EdgeInsets.only(left: 20.w),
                )
              else
                SizedBox(width: 2, height: 60.h),
              // Step content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          step['date'] as String,
                          style: AppTypography.bodySmall(context).copyWith(
                            color: isCompleted ? AppColors.primary : AppColors.textTertiary,
                          ),
                        ),
                        SizedBox(width: 12.w),
                        Container(
                          width: 24.w,
                          height: 24.w,
                          decoration: BoxDecoration(
                            color: isCompleted ? AppColors.primary : AppColors.gray200,
                            shape: BoxShape.circle,
                            border: isCurrent
                                ? Border.all(color: AppColors.primary, width: 3)
                                : null,
                          ),
                          child: isCompleted && !isCurrent
                              ? Icon(
                                  Icons.check_rounded,
                                  size: 16.sp,
                                  color: AppColors.white,
                                )
                              : null,
                        ),
                      ],
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      step['title'] as String,
                      style: AppTypography.bodyLarge(context).copyWith(
                        color: isCompleted ? AppColors.textPrimary : AppColors.textTertiary,
                        fontWeight: isCurrent ? AppTypography.semiBold : AppTypography.regular,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  ],
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildOrderItem(BuildContext context, Map<String, dynamic> item) {
    return Container(
      margin: EdgeInsets.only(bottom: 12.h),
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${item['price']} ج.م',
                style: AppTypography.headingS(context).copyWith(
                  color: AppColors.primary,
                ),
              ),
              SizedBox(height: 4.h),
              Text(
                'الكمية: ${item['quantity']}',
                style: AppTypography.bodySmall(context).copyWith(
                  color: AppColors.textTertiary,
                ),
              ),
            ],
          ),
          SizedBox(width: 16.w),
          Expanded(
            child: Text(
              item['name'] as String,
              style: AppTypography.bodyLarge(context),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }
}
