import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/widgets/app_navigation_bar.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import 'package:go_router/go_router.dart';

/// History Screen
/// Shows history of appointments, orders, assessments.
/// Filters: All, Sessions, Orders, Assessments. Empty state with reset when no results.
class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  /// 'all' | 'appointment' | 'order' | 'assessment'
  String _selectedFilter = 'all';

  static final List<Map<String, dynamic>> _history = [
    {
      'type': 'appointment',
      'id': 'app_1',
      'title': 'جلسة استشارية',
      'date': '15 يناير 2024',
      'status': 'completed',
    },
    {
      'type': 'order',
      'id': 'order_1',
      'title': 'طلب #12345',
      'date': '10 يناير 2024',
      'status': 'delivered',
    },
    {
      'type': 'assessment',
      'id': 'assess_1',
      'title': 'اختبار التمييز السمعي',
      'date': '5 يناير 2024',
      'status': 'completed',
    },
  ];

  List<Map<String, dynamic>> get _filteredHistory {
    if (_selectedFilter == 'all') return _history;
    return _history.where((e) => e['type'] == _selectedFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredHistory;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'السجل',
              leading: IconButton(
                icon: Icon(
                  AppIcons.arrowBack,
                  size: 24.sp,
                  color: AppColors.textPrimary,
                ),
                onPressed: () => context.pop(),
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
              child: Row(
                children: [
                  _buildFilterChip(context, 'الكل', 'all'),
                  SizedBox(width: 12.w),
                  _buildFilterChip(context, 'الجلسات', 'appointment'),
                  SizedBox(width: 12.w),
                  _buildFilterChip(context, 'الطلبات', 'order'),
                  SizedBox(width: 12.w),
                  _buildFilterChip(context, 'الاختبارات', 'assessment'),
                ],
              ),
            ),
            Expanded(
              child: filtered.isEmpty
                  ? _buildEmptyState(context, isFiltered: _selectedFilter != 'all')
                  : ListView.builder(
                      padding: EdgeInsets.symmetric(horizontal: 20.w),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        return _buildHistoryCard(context, filtered[index]);
                      },
                    ),
            ),
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
                    break; // Already on history (account section)
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(BuildContext context, String label, String value) {
    final isSelected = _selectedFilter == value;
    return GestureDetector(
      onTap: () => setState(() => _selectedFilter = value),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.white,
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: AppTypography.bodyMedium(context).copyWith(
            color: isSelected ? AppColors.white : AppColors.textPrimary,
            fontWeight: isSelected ? AppTypography.semiBold : AppTypography.regular,
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, {required bool isFiltered}) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isFiltered ? Icons.filter_list_off_rounded : Icons.history_rounded,
              size: 80.sp,
              color: AppColors.gray300,
            ),
            SizedBox(height: 16.h),
            Text(
              isFiltered
                  ? 'لا توجد عناصر تطابق التصفية'
                  : 'لا يوجد سجل',
              style: AppTypography.headingM(context).copyWith(
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            if (isFiltered) ...[
              SizedBox(height: 16.h),
              TextButton.icon(
                onPressed: () => setState(() => _selectedFilter = 'all'),
                icon: Icon(Icons.filter_alt_off_rounded, size: 20.sp),
                label: const Text('عرض الكل'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryCard(BuildContext context, Map<String, dynamic> item) {
    final type = item['type'] as String? ?? '';
    final status = item['status'] as String? ?? '';

    IconData icon;
    Color statusColor;
    String statusText;

    switch (type) {
      case 'appointment':
        icon = Icons.calendar_today_rounded;
        break;
      case 'order':
        icon = Icons.shopping_bag_rounded;
        break;
      case 'assessment':
        icon = Icons.quiz_rounded;
        break;
      default:
        icon = Icons.history_rounded;
    }

    switch (status) {
      case 'completed':
      case 'delivered':
        statusColor = AppColors.success;
        statusText = 'مكتمل';
        break;
      case 'cancelled':
        statusColor = AppColors.error;
        statusText = 'ملغى';
        break;
      default:
        statusColor = AppColors.warning;
        statusText = 'قيد الانتظار';
    }

    return Container(
      margin: EdgeInsets.only(bottom: 12.h),
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
      child: Row(
        children: [
          Container(
            width: 48.w,
            height: 48.w,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Icon(icon, size: 24.sp, color: AppColors.primary),
          ),
          SizedBox(width: 16.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  item['title']?.toString() ?? '',
                  style: AppTypography.headingS(context),
                  textAlign: TextAlign.right,
                ),
                SizedBox(height: 6.h),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8.r),
                      ),
                      child: Text(
                        statusText,
                        style: AppTypography.bodySmall(context).copyWith(
                          color: statusColor,
                          fontWeight: AppTypography.semiBold,
                        ),
                      ),
                    ),
                    SizedBox(width: 12.w),
                    Icon(AppIcons.calendar, size: 14.sp, color: AppColors.textTertiary),
                    SizedBox(width: 4.w),
                    Text(
                      item['date']?.toString() ?? '',
                      style: AppTypography.bodySmall(context).copyWith(
                        color: AppColors.textTertiary,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(width: 12.w),
          Icon(AppIcons.arrowForward, size: 20.sp, color: AppColors.textTertiary),
        ],
      ),
    );
  }
}
