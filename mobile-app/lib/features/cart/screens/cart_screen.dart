import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_navigation_bar.dart';
import '../../../core/constants/app_colors.dart';
import '../../shared/mock_content.dart';
import 'package:go_router/go_router.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  // Simple local state for demo
  final List<Map<String, dynamic>> _cartItems = [
    {
      'id': 'prod_1',
      'name': 'مجموعة البطاقات التعليمية',
      'price': 85,
      'image': 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800',
      'quantity': 1,
    },
    {
      'id': 'prod_2',
      'name': 'لعبة الأشكال الخشبية',
      'price': 150,
      'image': 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800',
      'quantity': 2,
    },
  ];

  double get _totalPrice {
    return _cartItems.fold(0, (sum, item) => sum + (item['price'] * item['quantity']));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'سلة المشتريات',
              leading: IconButton(
                icon: Icon(Icons.arrow_back_ios, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: _cartItems.isEmpty
                  ? _buildEmptyCart()
                  : ListView.builder(
                      padding: EdgeInsets.all(20.w),
                      itemCount: _cartItems.length,
                      itemBuilder: (context, index) => _buildCartItem(_cartItems[index]),
                    ),
            ),
            if (_cartItems.isNotEmpty) _buildSummarySection(),
            AppNavigationBar(
              currentIndex: 0,
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

  Widget _buildEmptyCart() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_cart_outlined, size: 80.sp, color: AppColors.gray300),
          SizedBox(height: 16.h),
          Text(
            'سلة المشتريات فارغة',
            style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 18.sp, color: AppColors.textSecondary),
          ),
          SizedBox(height: 24.h),
          ElevatedButton(
            onPressed: () => context.push('/products'),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('تسوق الآن'),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItem(Map<String, dynamic> item) {
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: Icon(Icons.delete_outline, color: AppColors.error, size: 22.sp),
                      onPressed: () => setState(() => _cartItems.removeWhere((i) => i['id'] == item['id'])),
                    ),
                    Expanded(
                      child: Text(
                        item['name'],
                        style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 15.sp, fontWeight: FontWeight.w600),
                        textAlign: TextAlign.right,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                Text(
                  '${item['price']} ج.م',
                  style: TextStyle(fontFamily: 'Inter', fontSize: 14.sp, color: AppColors.primary, fontWeight: FontWeight.w700),
                ),
                SizedBox(height: 12.h),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.borderLight),
                    borderRadius: BorderRadius.circular(8.r),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: Icon(Icons.remove, size: 18.sp),
                        onPressed: () => setState(() => item['quantity'] > 1 ? item['quantity']-- : null),
                      ),
                      Text('${item['quantity']}', style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w700)),
                      IconButton(
                        icon: Icon(Icons.add, size: 18.sp),
                        onPressed: () => setState(() => item['quantity']++),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          SizedBox(width: 16.w),
          ClipRRect(
            borderRadius: BorderRadius.circular(10.r),
            child: Image.network(item['image'], width: 85.w, height: 85.w, fit: BoxFit.cover),
          ),
        ],
      ),
    );
  }

  Widget _buildSummarySection() {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), offset: const Offset(0, -4), blurRadius: 10)],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${_totalPrice.toInt()} ج.م', style: TextStyle(fontFamily: 'Inter', fontSize: 20.sp, fontWeight: FontWeight.w700, color: AppColors.primary)),
              Text('إجمالي المجموع', style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 16.sp, fontWeight: FontWeight.w600)),
            ],
          ),
          SizedBox(height: 16.h),
          SizedBox(
            width: double.infinity,
            height: 54.h,
            child: ElevatedButton(
              onPressed: () => context.push('/checkout'),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r))),
              child: const Text('إتمام الشراء'),
            ),
          ),
        ],
      ),
    );
  }
}
