import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import 'package:go_router/go_router.dart';

class AddressManagementScreen extends StatefulWidget {
  const AddressManagementScreen({super.key});

  @override
  State<AddressManagementScreen> createState() => _AddressManagementScreenState();
}

class _AddressManagementScreenState extends State<AddressManagementScreen> {
  final List<Map<String, String>> _addresses = [
    {
      'id': '1',
      'title': 'المنزل',
      'address': 'الرياض، حي النرجس، شارع الملك فهد',
      'building': '123',
      'phone': '0501234567',
    },
    {
      'id': '2',
      'title': 'العمل',
      'address': 'الرياض، حي الملقا، برج المملكة',
      'building': '45',
      'phone': '0507654321',
    },
  ];

  void _showAddAddressSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildAddAddressSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'العناوين',
              leading: IconButton(
                icon: Icon(Icons.arrow_back_ios, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
              trailing: IconButton(
                icon: Icon(Icons.add, size: 24.sp, color: AppColors.primary),
                onPressed: _showAddAddressSheet,
              ),
            ),
            Expanded(
              child: _addresses.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: EdgeInsets.all(20.w),
                      itemCount: _addresses.length,
                      itemBuilder: (context, index) => _buildAddressCard(_addresses[index]),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.location_off_outlined, size: 80.sp, color: AppColors.gray300),
          SizedBox(height: 16.h),
          Text(
            'لا توجد عناوين مضافة',
            style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 18.sp, color: AppColors.textSecondary),
          ),
          SizedBox(height: 24.h),
          ElevatedButton(
            onPressed: _showAddAddressSheet,
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('إضافة عنوان جديد'),
          ),
        ],
      ),
    );
  }

  Widget _buildAddressCard(Map<String, String> address) {
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.delete_outline, size: 22.sp, color: AppColors.error),
                    onPressed: () {
                      setState(() => _addresses.removeWhere((a) => a['id'] == address['id']));
                    },
                  ),
                  IconButton(
                    icon: Icon(Icons.edit_outlined, size: 22.sp, color: AppColors.primary),
                    onPressed: () {},
                  ),
                ],
              ),
              Text(
                address['title']!,
                style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 16.sp, fontWeight: FontWeight.w700),
              ),
            ],
          ),
          SizedBox(height: 8.h),
          Text(address['address']!, textAlign: TextAlign.right, style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 14.sp, color: AppColors.textSecondary)),
          SizedBox(height: 4.h),
          Text('المبنى: ${address['building']}', textAlign: TextAlign.right, style: TextStyle(fontFamily: 'Inter', fontSize: 14.sp, color: AppColors.textTertiary)),
          SizedBox(height: 4.h),
          Text('الهاتف: ${address['phone']}', textAlign: TextAlign.right, style: TextStyle(fontFamily: 'Inter', fontSize: 14.sp, color: AppColors.textTertiary)),
        ],
      ),
    );
  }

  Widget _buildAddAddressSheet() {
    return Container(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      child: Padding(
        padding: EdgeInsets.all(20.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Center(child: Container(width: 40.w, height: 4.h, decoration: BoxDecoration(color: AppColors.gray200, borderRadius: BorderRadius.circular(2.r)))),
            SizedBox(height: 20.h),
            Text('إضافة عنوان جديد', style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 18.sp, fontWeight: FontWeight.w700)),
            SizedBox(height: 20.h),
            _buildTextField('اسم العنوان (مثال: المنزل)'),
            SizedBox(height: 12.h),
            _buildTextField('العنوان بالتفصيل'),
            SizedBox(height: 12.h),
            _buildTextField('رقم المبنى'),
            SizedBox(height: 12.h),
            _buildTextField('رقم الهاتف'),
            SizedBox(height: 24.h),
            SizedBox(
              width: double.infinity,
              height: 50.h,
              child: ElevatedButton(
                onPressed: () => context.pop(),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                child: const Text('حفظ العنوان'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(String hint) {
    return TextField(
      textAlign: TextAlign.right,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(fontFamily: 'MadaniArabic', fontSize: 14.sp, color: AppColors.textPlaceholder),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10.r), borderSide: BorderSide(color: AppColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10.r), borderSide: BorderSide(color: AppColors.border)),
      ),
    );
  }
}
