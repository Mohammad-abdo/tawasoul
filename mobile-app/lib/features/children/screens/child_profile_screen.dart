import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/theme/app_icons.dart';
import '../../../core/providers/children_provider.dart';
import '../theme/child_profile_design.dart';
import '../../shared/mock_content.dart';

/// Child Profile – Main Page (redesigned).
/// Card-based, child-friendly, Arabic RTL.
/// Sections: Basic Info, Health Overview, Performance Snapshot, Quick Actions.
/// Tabs: Info Details | Assessment History | Progress Reports | Sessions | Notes | Messages.
class ChildProfileScreen extends StatefulWidget {
  final String childId;

  const ChildProfileScreen({super.key, required this.childId});

  @override
  State<ChildProfileScreen> createState() => _ChildProfileScreenState();
}

class _ChildProfileScreenState extends State<ChildProfileScreen> {
  int _tabIndex = 0;

  static String _ageGroupDisplay(ChildAgeGroup? ageGroup) {
    if (ageGroup == null) return '';
    switch (ageGroup) {
      case ChildAgeGroup.under4:
        return 'أقل من 4 سنوات';
      case ChildAgeGroup.between4And15:
        return '4 سنوات إلى 15 سنة';
      case ChildAgeGroup.over15:
        return 'أكبر من 15 سنة';
    }
  }

  static String _statusDisplay(ChildStatus? status) {
    if (status == null) return '';
    switch (status) {
      case ChildStatus.autism:
        return 'توحد';
      case ChildStatus.speechDisorder:
        return 'تخاطب';
    }
  }

  static Color _statusColor(String statusKey) {
    switch (statusKey) {
      case 'active':
        return ChildProfileDesign.statusActive;
      case 'improving':
        return ChildProfileDesign.statusImproving;
      case 'needs_attention':
        return ChildProfileDesign.statusNeedsAttention;
      default:
        return ChildProfileDesign.statusActive;
    }
  }

  @override
  Widget build(BuildContext context) {
    final providerChild = context.watch<ChildrenProvider>().getChildById(widget.childId);
    final mock = MockContent.childProfile;
    final name = providerChild?.name ?? (mock['name'] as String? ?? 'طفل');
    final age = providerChild != null ? _ageGroupDisplay(providerChild.ageGroup) : (mock['age'] as String? ?? '');
    final condition = providerChild != null ? _statusDisplay(providerChild.status) : (mock['status'] as String? ?? '');
    final progress = (mock['progress'] as num?)?.toDouble() ?? 0.0;
    final childId = widget.childId;

    return Scaffold(
      backgroundColor: ChildProfileDesign.profileBg,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'ملف الطفل',
              leading: IconButton(
                icon: Icon(AppIcons.arrowBack, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildBasicInfoCard(context, name, age, condition, progress, childId),
                    SizedBox(height: 16.h),
                    _buildHealthOverviewCard(context, condition, providerChild?.behavioralNotes),
                    SizedBox(height: 16.h),
                    _buildPerformanceSnapshot(context, progress),
                    SizedBox(height: 20.h),
                    _buildQuickActions(context, childId),
                    SizedBox(height: 24.h),
                    _buildTabBar(context),
                    SizedBox(height: 16.h),
                    _buildTabContent(context, childId),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBasicInfoCard(
    BuildContext context,
    String name,
    String age,
    String condition,
    double progress,
    String childId,
  ) {
    const statusKey = 'improving';
    final statusColor = _statusColor(statusKey);
    final statusLabel = statusKey == 'active'
        ? 'نشط'
        : statusKey == 'improving'
            ? 'يتحسن'
            : 'يحتاج متابعة';

    return Container(
      padding: ChildProfileDesign.cardPadding,
      decoration: BoxDecoration(
        color: ChildProfileDesign.profileCardBg,
        borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadius),
        border: Border.all(color: AppColors.border),
        boxShadow: ChildProfileDesign.cardShadow(context),
      ),
      child: Column(
        children: [
          Row(
            textDirection: TextDirection.rtl,
            children: [
              GestureDetector(
                onTap: () {}, // TODO: edit avatar
                child: Container(
                  width: 80.w,
                  height: 80.w,
                  decoration: BoxDecoration(
                    color: ChildProfileDesign.profileAccentLight,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Icon(
                    Icons.child_care_rounded,
                    size: 40.sp,
                    color: ChildProfileDesign.profileAccent,
                  ),
                ),
              ),
              SizedBox(width: 16.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(name, style: ChildProfileDesign.titleLarge(context), textAlign: TextAlign.right),
                    SizedBox(height: 6.h),
                    Text(
                      '$age • $condition',
                      style: ChildProfileDesign.bodyFriendly(context),
                      textAlign: TextAlign.right,
                    ),
                    SizedBox(height: 8.h),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                          decoration: BoxDecoration(
                            color: statusColor.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(20.r),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.trending_up_rounded, size: 14.sp, color: statusColor),
                              SizedBox(width: 4.w),
                              Text(
                                statusLabel,
                                style: ChildProfileDesign.captionFriendly(context).copyWith(
                                  color: statusColor,
                                  fontWeight: AppTypography.semiBold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 16.h),
          Divider(height: 1, color: AppColors.border),
          SizedBox(height: 12.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('المستوى', style: ChildProfileDesign.captionFriendly(context), textAlign: TextAlign.right),
              Text('المرحلة ٢', style: ChildProfileDesign.titleMedium(context).copyWith(fontSize: 16.sp), textAlign: TextAlign.left),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHealthOverviewCard(BuildContext context, String condition, String? notes) {
    return Container(
      padding: ChildProfileDesign.cardPadding,
      decoration: BoxDecoration(
        color: ChildProfileDesign.profileCardBg,
        borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadius),
        border: Border.all(color: AppColors.border),
        boxShadow: ChildProfileDesign.cardShadowSoft(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            textDirection: TextDirection.rtl,
            children: [
              Icon(Icons.favorite_rounded, size: 22.sp, color: ChildProfileDesign.profileAccent),
              SizedBox(width: 8.w),
              Text('ملخص الحالة', style: ChildProfileDesign.titleMedium(context), textAlign: TextAlign.right),
            ],
          ),
          SizedBox(height: 12.h),
          Text(
            notes?.isNotEmpty == true
                ? notes!
                : 'ملخص قصير وواضح عن حالة الطفل بلغة بسيطة. يمكن إضافة ملاحظات من شاشة التحديد أو من الاختصاصي.',
            style: ChildProfileDesign.bodyFriendly(context),
            textAlign: TextAlign.right,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildPerformanceSnapshot(BuildContext context, double progress) {
    final completed = 8;
    final total = 12;
    final strengths = ['التمييز السمعي', 'النطق'];
    final improvements = ['الترتيب والتسلسل'];

    return Container(
      padding: ChildProfileDesign.cardPadding,
      decoration: BoxDecoration(
        color: ChildProfileDesign.profileCardBg,
        borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadius),
        border: Border.all(color: AppColors.border),
        boxShadow: ChildProfileDesign.cardShadowSoft(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            textDirection: TextDirection.rtl,
            children: [
              Icon(Icons.bar_chart_rounded, size: 22.sp, color: ChildProfileDesign.profileAccent),
              SizedBox(width: 8.w),
              Text('لمحة الأداء', style: ChildProfileDesign.titleMedium(context), textAlign: TextAlign.right),
            ],
          ),
          SizedBox(height: 16.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildProgressRing(context, progress, 'التقدم'),
              Column(
                children: [
                  Text('$completed / $total', style: ChildProfileDesign.titleMedium(context)),
                  Text('اختبارات مكتملة', style: ChildProfileDesign.captionFriendly(context)),
                ],
              ),
            ],
          ),
          if (strengths.isNotEmpty || improvements.isNotEmpty) ...[
            SizedBox(height: 16.h),
            Divider(height: 1, color: AppColors.border),
            SizedBox(height: 12.h),
            if (strengths.isNotEmpty)
              Row(
                textDirection: TextDirection.rtl,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.thumb_up_rounded, size: 18.sp, color: ChildProfileDesign.statusActive),
                  SizedBox(width: 6.w),
                  Expanded(
                    child: Text(
                      'نقاط القوة: ${strengths.join('، ')}',
                      style: ChildProfileDesign.bodyFriendly(context),
                      textAlign: TextAlign.right,
                    ),
                  ),
                ],
              ),
            if (improvements.isNotEmpty) ...[
              SizedBox(height: 8.h),
              Row(
                textDirection: TextDirection.rtl,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.trending_up_rounded, size: 18.sp, color: ChildProfileDesign.statusNeedsAttention),
                  SizedBox(width: 6.w),
                  Expanded(
                    child: Text(
                      'تحتاج تحسين: ${improvements.join('، ')}',
                      style: ChildProfileDesign.bodyFriendly(context),
                      textAlign: TextAlign.right,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ],
      ),
    );
  }

  Widget _buildProgressRing(BuildContext context, double value, String label) {
    return Column(
      children: [
        SizedBox(
          width: 64.w,
          height: 64.w,
          child: Stack(
            alignment: Alignment.center,
            children: [
              CircularProgressIndicator(
                value: value,
                strokeWidth: 6.w,
                backgroundColor: AppColors.gray200,
                valueColor: AlwaysStoppedAnimation<Color>(ChildProfileDesign.profileAccent),
              ),
              Text(
                '${(value * 100).toInt()}%',
                style: ChildProfileDesign.titleMedium(context).copyWith(fontSize: 16.sp),
              ),
            ],
          ),
        ),
        SizedBox(height: 4.h),
        Text(label, style: ChildProfileDesign.captionFriendly(context)),
      ],
    );
  }

  Widget _buildQuickActions(BuildContext context, String childId) {
    final actions = [
      {'label': 'اختبار جديد', 'icon': Icons.quiz_rounded, 'route': '/assessments/categories?childId=$childId'},
      {'label': 'سجل الاختبارات', 'icon': Icons.history_rounded, 'route': '/children/$childId/evaluation'},
      {'label': 'حجز جلسة', 'icon': Icons.event_rounded, 'route': '/appointments/booking?childId=$childId'},
      {'label': 'رسالة للاختصاصي', 'icon': Icons.chat_rounded, 'route': '/chat'},
      {'label': 'التقارير', 'icon': Icons.description_rounded, 'route': '/children/$childId/reports'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('إجراءات سريعة', style: ChildProfileDesign.titleMedium(context), textAlign: TextAlign.right),
        SizedBox(height: 12.h),
        Wrap(
          alignment: WrapAlignment.end,
          spacing: 10.w,
          runSpacing: 10.h,
          children: actions.map((a) {
            return SizedBox(
              width: (MediaQuery.of(context).size.width - 40.w - 40.w) / 2 - 6.w,
              child: Material(
                color: ChildProfileDesign.profileCardBg,
                borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadiusSmall),
                shadowColor: Colors.black,
                elevation: 0,
                child: InkWell(
                  onTap: () => context.push(a['route'] as String),
                  borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadiusSmall),
                  child: Container(
                    padding: ChildProfileDesign.cardPaddingSmall,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadiusSmall),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Expanded(
                          child: Text(
                            a['label'] as String,
                            style: ChildProfileDesign.bodyFriendly(context).copyWith(fontSize: 14.sp),
                            textAlign: TextAlign.right,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        SizedBox(width: 8.w),
                        Container(
                          padding: EdgeInsets.all(8.w),
                          decoration: BoxDecoration(
                            color: ChildProfileDesign.profileAccentLight,
                            borderRadius: BorderRadius.circular(10.r),
                          ),
                          child: Icon(
                            a['icon'] as IconData,
                            size: 22.sp,
                            color: ChildProfileDesign.profileAccent,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildTabBar(BuildContext context) {
    const labels = [
      'المعلومات',
      'سجل الاختبارات',
      'التقارير',
      'الجلسات',
      'الملاحظات',
      'الرسائل',
    ];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      reverse: true,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: List.generate(
          labels.length,
          (i) => Padding(
            padding: EdgeInsets.only(left: 8.w),
            child: ChoiceChip(
              label: Text(labels[i]),
              selected: _tabIndex == i,
              onSelected: (_) => setState(() => _tabIndex = i),
              selectedColor: ChildProfileDesign.profileAccentLight,
              labelStyle: ChildProfileDesign.captionFriendly(context).copyWith(
                color: _tabIndex == i ? ChildProfileDesign.profileAccent : AppColors.textSecondary,
                fontWeight: _tabIndex == i ? AppTypography.semiBold : AppTypography.regular,
              ),
              padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
              side: BorderSide(
                color: _tabIndex == i ? ChildProfileDesign.profileAccent : AppColors.border,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTabContent(BuildContext context, String childId) {
    switch (_tabIndex) {
      case 0:
        return _buildInfoDetailsTab(context, childId);
      case 1:
        return _buildAssessmentHistoryTab(context, childId);
      case 2:
        return _buildProgressReportsTab(context, childId);
      case 3:
        return _buildSessionsTab(context, childId);
      case 4:
        return _buildNotesTab(context, childId);
      case 5:
        return _buildMessagesTab(context, childId);
      default:
        return _buildInfoDetailsTab(context, childId);
    }
  }

  Widget _buildInfoDetailsTab(BuildContext context, String childId) {
    return _TabCard(
      icon: Icons.person_outline_rounded,
      title: 'تفاصيل المعلومات',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _detailRow(context, 'الاسم', 'طفل من الاستبيان'),
          _detailRow(context, 'الفئة العمرية', '4 سنوات إلى 15 سنة'),
          _detailRow(context, 'نوع الحالة', 'تخاطب'),
          _detailRow(context, 'تاريخ الإضافة', '2025/01/15'),
        ],
      ),
    );
  }

  Widget _buildAssessmentHistoryTab(BuildContext context, String childId) {
    final items = [
      {'name': 'تمييز الأصوات', 'date': '2025/01/20', 'score': '85%'},
      {'name': 'النطق والتكرار', 'date': '2025/01/18', 'score': '78%'},
    ];
    return _TabCard(
      icon: Icons.assignment_rounded,
      title: 'سجل الاختبارات',
      child: Column(
        children: items.map((e) => Padding(
          padding: EdgeInsets.only(bottom: 12.h),
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: Icon(Icons.check_circle_rounded, color: ChildProfileDesign.statusActive, size: 22.sp),
            title: Text(e['name']!, style: ChildProfileDesign.bodyFriendly(context), textAlign: TextAlign.right),
            subtitle: Text(e['date']!, style: ChildProfileDesign.captionFriendly(context), textAlign: TextAlign.right),
            trailing: Text(e['score']!, style: ChildProfileDesign.titleMedium(context).copyWith(fontSize: 14.sp)),
          ),
        )).toList(),
      ),
    );
  }

  Widget _buildProgressReportsTab(BuildContext context, String childId) {
    return _TabCard(
      icon: Icons.pie_chart_outline_rounded,
      title: 'تقارير التقدم',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'يمكنك عرض التقارير الدورية والتفصيلية من قسم التقارير.',
            style: ChildProfileDesign.bodyFriendly(context),
            textAlign: TextAlign.right,
          ),
          SizedBox(height: 16.h),
          OutlinedButton.icon(
            onPressed: () => context.push('/children/$childId/reports'),
            icon: Icon(Icons.open_in_new_rounded, size: 18.sp),
            label: const Text('فتح التقارير'),
          ),
        ],
      ),
    );
  }

  Widget _buildSessionsTab(BuildContext context, String childId) {
    final sessions = [
      {'specialist': 'د/ سارة أحمد', 'date': '25 مارس 2024', 'time': '09:00', 'status': 'confirmed'},
      {'specialist': 'د/ محمود علي', 'date': '28 مارس 2024', 'time': '14:00', 'status': 'pending'},
    ];
    return _TabCard(
      icon: Icons.event_note_rounded,
      title: 'الجلسات المحجوزة',
      child: Column(
        children: sessions.map((s) => Padding(
          padding: EdgeInsets.only(bottom: 12.h),
          child: Container(
            padding: ChildProfileDesign.cardPaddingSmall,
            decoration: BoxDecoration(
              color: AppColors.gray50,
              borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadiusSmall),
            ),
            child: Row(
              textDirection: TextDirection.rtl,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(s['specialist']!, style: ChildProfileDesign.titleMedium(context).copyWith(fontSize: 15.sp), textAlign: TextAlign.right),
                      Text('${s['date']} - ${s['time']}', style: ChildProfileDesign.captionFriendly(context), textAlign: TextAlign.right),
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                  decoration: BoxDecoration(
                    color: (s['status'] == 'confirmed' ? ChildProfileDesign.statusActive : ChildProfileDesign.statusNeedsAttention).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8.r),
                  ),
                  child: Text(
                    s['status'] == 'confirmed' ? 'مؤكدة' : 'قيد الانتظار',
                    style: ChildProfileDesign.captionFriendly(context).copyWith(
                      fontWeight: AppTypography.semiBold,
                      color: s['status'] == 'confirmed' ? ChildProfileDesign.statusActive : ChildProfileDesign.statusNeedsAttention,
                    ),
                  ),
                ),
              ],
            ),
          ),
        )).toList(),
      ),
    );
  }

  Widget _buildNotesTab(BuildContext context, String childId) {
    return _TabCard(
      icon: Icons.note_alt_outlined,
      title: 'الملاحظات والتوصيات',
      child: Text(
        'ملاحظات وتوصيات من الاختصاصي تظهر هنا بعد الجلسات والتقييمات.',
        style: ChildProfileDesign.bodyFriendly(context),
        textAlign: TextAlign.right,
      ),
    );
  }

  Widget _buildMessagesTab(BuildContext context, String childId) {
    return _TabCard(
      icon: Icons.chat_bubble_outline_rounded,
      title: 'الرسائل والتواصل',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'محادثاتك مع الاختصاصيين المعنيين بملف الطفل.',
            style: ChildProfileDesign.bodyFriendly(context),
            textAlign: TextAlign.right,
          ),
          SizedBox(height: 16.h),
          OutlinedButton.icon(
            onPressed: () => context.push('/chat'),
            icon: Icon(Icons.chat_rounded, size: 18.sp),
            label: const Text('فتح المحادثات'),
          ),
        ],
      ),
    );
  }

  Widget _detailRow(BuildContext context, String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        textDirection: TextDirection.rtl,
        children: [
          Text(value, style: ChildProfileDesign.bodyFriendly(context), textAlign: TextAlign.right),
          Text(label, style: ChildProfileDesign.captionFriendly(context), textAlign: TextAlign.right),
        ],
      ),
    );
  }
}

class _TabCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Widget child;

  const _TabCard({required this.icon, required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: ChildProfileDesign.cardPadding,
      decoration: BoxDecoration(
        color: ChildProfileDesign.profileCardBg,
        borderRadius: BorderRadius.circular(ChildProfileDesign.cardRadius),
        border: Border.all(color: AppColors.border),
        boxShadow: ChildProfileDesign.cardShadowSoft(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            textDirection: TextDirection.rtl,
            children: [
              Icon(icon, size: 22.sp, color: ChildProfileDesign.profileAccent),
              SizedBox(width: 8.w),
              Text(title, style: ChildProfileDesign.titleMedium(context), textAlign: TextAlign.right),
            ],
          ),
          SizedBox(height: 16.h),
          child,
        ],
      ),
    );
  }
}
