import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/app_header.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/providers/auth_provider.dart';

class ProfileUpdateScreen extends StatefulWidget {
  const ProfileUpdateScreen({super.key});

  @override
  State<ProfileUpdateScreen> createState() => _ProfileUpdateScreenState();
}

class _ProfileUpdateScreenState extends State<ProfileUpdateScreen> {
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final TextEditingController _phoneController;
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _emailController = TextEditingController();
    _phoneController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadUser());
  }

  void _loadUser() {
    if (_initialized || !mounted) return;
    final ap = context.read<AuthProvider>();
    final u = ap.user;
    if (u != null) {
      _nameController.text = (u['fullName'] ?? u['name'] ?? '').toString();
      _emailController.text = (u['email'] ?? '').toString();
      _phoneController.text = (u['phone'] ?? '').toString();
    }
    _initialized = true;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    _loadUser();
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            AppHeader(
              title: 'تعديل الملف الشخصي',
              leading: IconButton(
                icon: Icon(Icons.arrow_back_ios, size: 24.sp, color: AppColors.textPrimary),
                onPressed: () => context.pop(),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(20.w),
                child: Column(
                  children: [
                    Stack(
                      children: [
                        CircleAvatar(
                          radius: 60.r,
                          backgroundImage: const NetworkImage('https://via.placeholder.com/120'),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            padding: EdgeInsets.all(8.w),
                            decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                            child: Icon(Icons.camera_alt, color: AppColors.white, size: 20.sp),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 40.h),
                    _buildInputLabel('الاسم الكامل'),
                    _buildTextField(_nameController),
                    SizedBox(height: 20.h),
                    _buildInputLabel('البريد الإلكتروني'),
                    _buildTextField(_emailController),
                    SizedBox(height: 20.h),
                    _buildInputLabel('رقم الهاتف'),
                    _buildTextField(_phoneController),
                    SizedBox(height: 40.h),
                    Consumer<AuthProvider>(
                      builder: (context, ap, _) {
                        return SizedBox(
                          width: double.infinity,
                          height: 54.h,
                          child: ElevatedButton(
                            onPressed: ap.isLoading
                                ? null
                                : () async {
                                    final ok = await ap.updateProfile(
                                      fullName: _nameController.text.trim().isEmpty ? null : _nameController.text.trim(),
                                      email: _emailController.text.trim().isEmpty ? null : _emailController.text.trim(),
                                    );
                                    if (mounted && ok) context.pop();
                                  },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                            ),
                            child: ap.isLoading
                                ? const SizedBox(
                                    height: 24,
                                    width: 24,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                  )
                                : const Text('حفظ التغييرات'),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputLabel(String label) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Align(
        alignment: Alignment.centerRight,
        child: Text(
          label,
          style: TextStyle(fontFamily: 'MadaniArabic', fontSize: 14.sp, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller) {
    return TextField(
      controller: controller,
      textAlign: TextAlign.right,
      decoration: InputDecoration(
        filled: true,
        fillColor: AppColors.white,
        contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r), borderSide: BorderSide(color: AppColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r), borderSide: BorderSide(color: AppColors.border)),
      ),
    );
  }
}
