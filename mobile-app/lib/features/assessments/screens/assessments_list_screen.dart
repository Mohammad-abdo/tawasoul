import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/assessment_provider.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_widget.dart' as app_error;
import '../../../core/widgets/empty_state.dart';

class AssessmentsListScreen extends StatefulWidget {
  final String childId;

  const AssessmentsListScreen({
    super.key,
    required this.childId,
  });

  @override
  State<AssessmentsListScreen> createState() => _AssessmentsListScreenState();
}

class _AssessmentsListScreenState extends State<AssessmentsListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AssessmentProvider>().fetchTests();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الاختبارات التقييمية'),
        centerTitle: true,
      ),
      body: Consumer<AssessmentProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.tests.isEmpty) {
            return const LoadingIndicator();
          }

          if (provider.error != null && provider.tests.isEmpty) {
            return app_error.AppErrorWidget(
              message: provider.error!,
              onRetry: () => provider.fetchTests(),
            );
          }

          if (provider.tests.isEmpty) {
            return const EmptyState(
              message: 'لا توجد اختبارات متاحة حالياً',
            );
          }

          return ListView.builder(
            padding: EdgeInsets.all(16.w),
            itemCount: provider.tests.length,
            itemBuilder: (context, index) {
              final test = provider.tests[index];
              final isAuditory = test['category'] == 'AUDITORY';
              
              return Card(
                margin: EdgeInsets.only(bottom: 12.h),
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: InkWell(
                  onTap: () {
                    context.push(
                      '/assessments/test/${test['id']}?childId=${widget.childId}',
                    );
                  },
                  borderRadius: BorderRadius.circular(12.r),
                  child: Padding(
                    padding: EdgeInsets.all(16.w),
                    child: Row(
                      children: [
                        Container(
                          width: 60.w,
                          height: 60.w,
                          decoration: BoxDecoration(
                            color: isAuditory
                                ? Colors.blue.shade50
                                : Colors.purple.shade50,
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                          child: Icon(
                            isAuditory ? Icons.volume_up : Icons.image,
                            color: isAuditory
                                ? Colors.blue.shade700
                                : Colors.purple.shade700,
                            size: 30.sp,
                          ),
                        ),
                        SizedBox(width: 16.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                test['title'] ?? 'اختبار',
                                style: TextStyle(
                                  fontSize: 18.sp,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey.shade900,
                                ),
                              ),
                              SizedBox(height: 4.h),
                              Text(
                                isAuditory ? 'اختبار سمعي' : 'اختبار بصري',
                                style: TextStyle(
                                  fontSize: 14.sp,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                              if (test['description'] != null) ...[
                                SizedBox(height: 4.h),
                                Text(
                                  test['description'],
                                  style: TextStyle(
                                    fontSize: 12.sp,
                                    color: Colors.grey.shade500,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ],
                          ),
                        ),
                        Icon(
                          Icons.arrow_back_ios,
                          size: 20.sp,
                          color: Colors.grey.shade400,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
