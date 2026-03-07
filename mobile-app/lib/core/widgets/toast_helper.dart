import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// Child-friendly toast notifications (no alerts).
/// Uses SnackBar with rounded, soft styling.
class ToastHelper {
  ToastHelper._();

  static void show(
    BuildContext context, {
    required String message,
    bool success = false,
    bool error = false,
    Duration duration = const Duration(seconds: 3),
  }) {
    final color = error
        ? AppColors.error
        : success
            ? AppColors.success
            : AppColors.primary;
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 15,
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
        ),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        duration: duration,
      ),
    );
  }

  static void success(BuildContext context, String message) =>
      show(context, message: message, success: true);

  static void error(BuildContext context, String message) =>
      show(context, message: message, error: true);
}
