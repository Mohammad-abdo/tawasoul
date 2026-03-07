import 'package:intl/intl.dart';

class DateFormatter {
  static String formatDate(DateTime date, {String? locale}) {
    final formatter = DateFormat('d MMMM', locale ?? 'ar');
    return formatter.format(date);
  }

  static String formatDateTime(DateTime date, {String? locale}) {
    final formatter = DateFormat('EEEE، d MMMM، h:mm a', locale ?? 'ar');
    return formatter.format(date);
  }

  static String formatTime(DateTime date, {String? locale}) {
    final formatter = DateFormat('h:mm a', locale ?? 'ar');
    return formatter.format(date);
  }

  static String formatShortDate(DateTime date, {String? locale}) {
    final formatter = DateFormat('d MMMM', locale ?? 'ar');
    return formatter.format(date);
  }

  static String formatRelativeTime(DateTime date, {String? locale}) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inMinutes < 1) {
      return 'منذ لحظات';
    } else if (difference.inMinutes < 60) {
      return 'منذ ${difference.inMinutes} دقيقة';
    } else if (difference.inHours < 24) {
      return 'منذ ${difference.inHours} ساعة';
    } else if (difference.inDays < 7) {
      return 'منذ ${difference.inDays} يوم';
    } else {
      return formatDate(date, locale: locale);
    }
  }

  static String formatAppointmentDate(DateTime date, {String? locale}) {
    final formatter = DateFormat('EEEE d MMMM • h:mm a', locale ?? 'ar');
    return formatter.format(date);
  }
}
