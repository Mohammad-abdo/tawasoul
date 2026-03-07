import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants/app_colors.dart';

/// Placeholder style for fallback when image fails or URL is empty.
enum AppImagePlaceholderStyle {
  /// Generic image icon (products, sliders, articles).
  generic,
  /// Person/avatar (doctors, profile).
  avatar,
}

/// Unified network image with loading, error, and fallback states.
/// - Fixed size/ratio to prevent layout jump.
/// - Loading: shimmer or skeleton.
/// - Error / null / empty URL: placeholder (no broken icon).
/// - Optional initials badge for avatar style.
class AppNetworkImage extends StatelessWidget {
  final String? imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final AppImagePlaceholderStyle placeholderStyle;
  /// Optional initials for avatar (e.g. "د.س" for doctor).
  final String? initials;

  const AppNetworkImage({
    super.key,
    this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.placeholderStyle = AppImagePlaceholderStyle.generic,
    this.initials,
  });

  bool get _hasValidUrl =>
      imageUrl != null &&
      imageUrl!.trim().isNotEmpty &&
      !imageUrl!.toLowerCase().contains('placeholder');

  @override
  Widget build(BuildContext context) {
    final w = width ?? 100.w;
    final h = height ?? 100.w;
    final child = _hasValidUrl
        ? Image.network(
            imageUrl!,
            width: w,
            height: h,
            fit: fit,
            loadingBuilder: (context, child, loadingProgress) {
              if (loadingProgress == null) return child;
              return _buildShimmer(w, h);
            },
            errorBuilder: (_, __, ___) => _buildPlaceholder(w, h),
          )
        : _buildPlaceholder(w, h);

    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: child,
      );
    }
    return child;
  }

  Widget _buildShimmer(double w, double h) {
    return Container(
      width: w,
      height: h,
      decoration: BoxDecoration(
        color: AppColors.gray100,
        borderRadius: borderRadius ?? BorderRadius.circular(12.r),
      ),
      child: Center(
        child: SizedBox(
          width: 24.w,
          height: 24.w,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: AppColors.primary.withValues(alpha: 0.6),
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholder(double w, double h) {
    final useAvatar = placeholderStyle == AppImagePlaceholderStyle.avatar;
    return Container(
      width: w,
      height: h,
      decoration: BoxDecoration(
        color: AppColors.gray100,
        borderRadius: borderRadius ?? BorderRadius.circular(12.r),
      ),
      child: useAvatar
          ? _buildAvatarPlaceholder(w, h)
          : _buildGenericPlaceholder(w, h),
    );
  }

  Widget _buildAvatarPlaceholder(double w, double h) {
    final initialStr = initials?.trim();
    final hasInitials = initialStr != null && initialStr.isNotEmpty;
    return Center(
      child: hasInitials
          ? Text(
              initialStr,
              style: TextStyle(
                fontSize: (w * 0.35).clamp(14.0, 28.0),
                fontWeight: FontWeight.w600,
                color: AppColors.gray500,
              ),
            )
          : Icon(
              Icons.person_rounded,
              size: (w * 0.5).clamp(24.0, 48.0),
              color: AppColors.gray400,
            ),
    );
  }

  Widget _buildGenericPlaceholder(double w, double h) {
    return Center(
      child: Icon(
        Icons.image_outlined,
        size: (w * 0.4).clamp(24.0, 48.0),
        color: AppColors.gray400,
      ),
    );
  }
}
