import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/theme/app_typography.dart';

/// Login – Email/Phone + Password. Minimal, professional.
/// Actions: Login, Forgot password, Create account.
/// No onboarding distractions. Arabic-first.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final id = _identifierController.text.trim();
    final pass = _passwordController.text.trim();
    if (id.isEmpty || pass.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('أدخل البريد أو رقم الهاتف وكلمة المرور')),
      );
      return;
    }
    if (_isLoading) return;
    setState(() => _isLoading = true);
    final auth = context.read<AuthProvider>();
    final ok = await auth.login(identifier: id, password: pass);
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (ok) {
      context.go('/splash');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.error ?? 'فشل تسجيل الدخول'), backgroundColor: AppColors.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 32.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(height: 40.h),
              Text(
                'تسجيل الدخول',
                style: AppTypography.headingL(context),
                textAlign: TextAlign.right,
              ),
              SizedBox(height: 8.h),
              Text(
                'أدخل بياناتك للوصول إلى حسابك',
                style: AppTypography.bodyMedium(context).copyWith(color: AppColors.textSecondary),
                textAlign: TextAlign.right,
              ),
              SizedBox(height: 40.h),
              _buildInput(
                controller: _identifierController,
                hint: 'البريد الإلكتروني أو رقم الهاتف',
                icon: Icons.person_outline_rounded,
                keyboardType: TextInputType.emailAddress,
              ),
              SizedBox(height: 16.h),
              _buildInput(
                controller: _passwordController,
                hint: 'كلمة المرور',
                icon: Icons.lock_outline_rounded,
                obscure: _obscurePassword,
                suffix: IconButton(
                  icon: Icon(
                    _obscurePassword ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                    size: 22.sp,
                    color: AppColors.textTertiary,
                  ),
                  onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                ),
              ),
              SizedBox(height: 12.h),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {},
                  child: Text(
                    'نسيت كلمة المرور؟',
                    style: AppTypography.bodyMedium(context).copyWith(color: AppColors.primary),
                  ),
                ),
              ),
              SizedBox(height: 24.h),
              SizedBox(
                width: double.infinity,
                height: 52.h,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    disabledBackgroundColor: AppColors.buttonDisabled,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)),
                        )
                      : Text(
                          'تسجيل الدخول',
                          style: AppTypography.bodyLarge(context).copyWith(
                            color: Colors.white,
                            fontWeight: AppTypography.semiBold,
                          ),
                        ),
                ),
              ),
              SizedBox(height: 28.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'ليس لديك حساب؟ ',
                    style: AppTypography.bodyMedium(context).copyWith(color: AppColors.textSecondary),
                  ),
                  TextButton(
                    onPressed: () => context.push('/register'),
                    child: Text(
                      'إنشاء حساب',
                      style: AppTypography.bodyMedium(context).copyWith(
                        color: AppColors.primary,
                        fontWeight: AppTypography.semiBold,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 24.h),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInput({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    bool obscure = false,
    Widget? suffix,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: AppColors.border),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        keyboardType: keyboardType,
        textDirection: TextDirection.rtl,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(fontFamily: AppTypography.primaryFont, fontSize: 15.sp, color: AppColors.textPlaceholder),
          prefixIcon: Icon(icon, size: 22.sp, color: AppColors.textTertiary),
          suffixIcon: suffix,
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
        ),
        style: TextStyle(fontFamily: AppTypography.primaryFont, fontSize: 15.sp, color: AppColors.textPrimary),
      ),
    );
  }
}
