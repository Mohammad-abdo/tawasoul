import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/rating_widget.dart';
import '../../shared/mock_content.dart';

class SpecialistSearchScreen extends StatefulWidget {
  const SpecialistSearchScreen({super.key});

  @override
  State<SpecialistSearchScreen> createState() => _SpecialistSearchScreenState();
}

class _SpecialistSearchScreenState extends State<SpecialistSearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Map<String, dynamic>> _filteredDoctors = MockContent.doctors;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredDoctors = MockContent.doctors.where((doc) {
        final name = doc['name'].toString().toLowerCase();
        final specialty = doc['specialty'].toString().toLowerCase();
        return name.contains(query) || specialty.contains(query);
      }).toList();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'البحث عن أخصائي',
              leading: IconButton(
                icon: Icon(Icons.arrow_back_ios, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(20.w),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'ابحث بالاسم أو التخصص...',
                  hintStyle: TextStyle(
                    fontFamily: 'MadaniArabic',
                    fontSize: 14.sp,
                    color: AppColors.textTertiary,
                  ),
                  prefixIcon: Icon(Icons.search, size: 24.sp, color: AppColors.textTertiary),
                  filled: true,
                  fillColor: AppColors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(color: AppColors.borderLight),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(color: AppColors.borderLight),
                  ),
                  contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                ),
                textDirection: TextDirection.rtl,
              ),
            ),
            Expanded(
              child: _filteredDoctors.isEmpty
                  ? Center(
                      child: Text(
                        'لا يوجد أخصائيين يطابقون بحثك',
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 16.sp,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    )
                  : ListView.builder(
                      padding: EdgeInsets.symmetric(horizontal: 20.w),
                      itemCount: _filteredDoctors.length,
                      itemBuilder: (context, index) {
                        return _buildDoctorCard(_filteredDoctors[index]);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDoctorCard(Map<String, dynamic> doctor) {
    return GestureDetector(
      onTap: () => context.push('/specialist/${doctor['id']}'),
      child: Container(
        margin: EdgeInsets.only(bottom: 16.h),
        padding: EdgeInsets.all(12.w),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(16.r),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              offset: const Offset(0, 4),
              blurRadius: 10,
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(Icons.arrow_back_ios, size: 20.sp, color: AppColors.primary),
            SizedBox(width: 12.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    doctor['name']?.toString() ?? '',
                    style: TextStyle(
                      fontFamily: 'MadaniArabic',
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    doctor['specialty']?.toString() ?? '',
                    style: TextStyle(
                      fontFamily: 'MadaniArabic',
                      fontSize: 12.sp,
                      color: AppColors.primary,
                    ),
                  ),
                  SizedBox(height: 8.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        '(${doctor['reviewsCount']})',
                        style: TextStyle(
                          fontFamily: 'MadaniArabic',
                          fontSize: 12.sp,
                          color: AppColors.textTertiary,
                        ),
                      ),
                      SizedBox(width: 4.w),
                      RatingWidget(rating: (doctor['rating'] as num?)?.toDouble() ?? 0.0, size: 14.sp),
                    ],
                  ),
                ],
              ),
            ),
            SizedBox(width: 16.w),
            ClipRRect(
              borderRadius: BorderRadius.circular(12.r),
              child: Image.network(
                doctor['image']?.toString() ?? '',
                width: 70.w,
                height: 70.w,
                fit: BoxFit.cover,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
