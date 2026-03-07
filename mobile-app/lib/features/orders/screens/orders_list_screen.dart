import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_navigation_bar.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import 'package:go_router/go_router.dart';

/// Orders List Screen
/// Shows all orders with status
/// Tap to view details or track
class OrdersListScreen extends StatelessWidget {
  const OrdersListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Mock orders
    final orders = [
      {
        'id': 'order_1',
        'orderNumber': '#12345',
        'date': '15 يناير 2024',
        'total': '410 ج.م',
        'status': 'delivered',
        'itemsCount': 3,
      },
      {
        'id': 'order_2',
        'orderNumber': '#12346',
        'date': '10 يناير 2024',
        'total': '250 ج.م',
        'status': 'shipped',
        'itemsCount': 2,
      },
      {
        'id': 'order_3',
        'orderNumber': '#12347',
        'date': '5 يناير 2024',
        'total': '150 ج.م',
        'status': 'cancelled',
        'itemsCount': 1,
      },
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            AppHeader(
              title: 'الطلبات',
              leading: IconButton(
                icon: Icon(
                  AppIcons.arrowBack,
                  size: 24.sp,
                  color: AppColors.textPrimary,
                ),
                onPressed: () => context.pop(),
              ),
            ),
            // Filter Tabs
            Container(
              height: 48.h,
              padding: EdgeInsets.symmetric(horizontal: 20.w),
              child: Row(
                children: [
                  _buildFilterChip(context, 'الكل', 'all'),
                  SizedBox(width: 12.w),
                  _buildFilterChip(context, 'قيد التوصيل', 'shipped'),
                  SizedBox(width: 12.w),
                  _buildFilterChip(context, 'مكتملة', 'delivered'),
                  SizedBox(width: 12.w),
                  _buildFilterChip(context, 'ملغاة', 'cancelled'),
                ],
              ),
            ),
            // Content
            Expanded(
              child: orders.isEmpty
                  ? _buildEmptyState(context)
                  : ListView.builder(
                      padding: EdgeInsets.all(20.w),
                      itemCount: orders.length,
                      itemBuilder: (context, index) {
                        return Padding(
                          padding: EdgeInsets.only(bottom: 12.h),
                          child: _buildOrderCard(context, orders[index]),
                        );
                      },
                    ),
            ),
            // Bottom Navigation
            AppNavigationBar(
              currentIndex: 4,
              onTap: (index) {
                switch (index) {
                  case 0:
                    context.push('/home');
                    break;
                  case 1:
                    context.push('/appointments');
                    break;
                  case 2:
                    context.push('/assessments/categories?childId=mock_child_1');
                    break;
                  case 3:
                    context.push('/chat');
                    break;
                  case 4:
                    break; // Already on account section
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(BuildContext context, String label, String value) {
    return GestureDetector(
      onTap: () {
        // TODO: Filter orders
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(color: AppColors.border),
        ),
        child: Text(
          label,
          style: AppTypography.bodyMedium(context),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.shopping_bag_outlined,
            size: 80.sp,
            color: AppColors.gray300,
          ),
          SizedBox(height: 16.h),
          Text(
            'لا توجد طلبات',
            style: AppTypography.headingM(context).copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 24.h),
          ElevatedButton(
            onPressed: () => context.push('/products'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: EdgeInsets.symmetric(horizontal: 32.w, vertical: 16.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16.r),
              ),
            ),
            child: Text(
              'تسوق الآن',
              style: AppTypography.bodyLarge(context).copyWith(
                color: AppColors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderCard(BuildContext context, Map<String, dynamic> order) {
    final status = order['status'] as String;
    Color statusColor;
    String statusText;
    IconData statusIcon;
    
    switch (status) {
      case 'delivered':
        statusColor = AppColors.success;
        statusText = 'تم التوصيل';
        statusIcon = Icons.check_circle_rounded;
        break;
      case 'shipped':
        statusColor = AppColors.info;
        statusText = 'قيد الشحن';
        statusIcon = Icons.local_shipping_rounded;
        break;
      case 'cancelled':
        statusColor = AppColors.error;
        statusText = 'ملغى';
        statusIcon = Icons.cancel_rounded;
        break;
      default:
        statusColor = AppColors.warning;
        statusText = 'قيد المعالجة';
        statusIcon = Icons.schedule_rounded;
    }

    return GestureDetector(
      onTap: () {
        if (status == 'shipped' || status == 'delivered') {
          context.push('/orders/${order['id']}/tracking');
        } else {
          // TODO: Show order details
        }
      },
      child: Container(
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
                Row(
                  children: [
                    if (status == 'shipped' || status == 'delivered')
                      TextButton(
                        onPressed: () {
                          context.push('/orders/${order['id']}/tracking');
                        },
                        child: Text(
                          'تتبع الطلب',
                          style: AppTypography.bodySmall(context).copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            statusIcon,
                            size: 14.sp,
                            color: statusColor,
                          ),
                          SizedBox(width: 4.w),
                          Text(
                            statusText,
                            style: AppTypography.bodySmall(context).copyWith(
                              color: statusColor,
                              fontWeight: AppTypography.semiBold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      order['orderNumber'] as String,
                      style: AppTypography.headingS(context),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 4.h),
                    Text(
                      order['date'] as String,
                      style: AppTypography.bodySmall(context).copyWith(
                        color: AppColors.textTertiary,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  ],
                ),
              ],
            ),
            SizedBox(height: 16.h),
            Divider(color: AppColors.border),
            SizedBox(height: 16.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  order['total'] as String,
                  style: AppTypography.headingM(context).copyWith(
                    color: AppColors.primary,
                  ),
                ),
                Row(
                  children: [
                    Text(
                      '${order['itemsCount']} منتج',
                      style: AppTypography.bodyMedium(context).copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(width: 8.w),
                    Icon(
                      Icons.shopping_bag_rounded,
                      size: 20.sp,
                      color: AppColors.textTertiary,
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
