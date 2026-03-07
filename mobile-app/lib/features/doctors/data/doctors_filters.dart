/// Filter state and specialty options for Doctors & Specialists.
/// State-driven; does not change API.

enum AvailabilityFilter {
  all,
  online,
  offline,
}

extension AvailabilityFilterX on AvailabilityFilter {
  String get label {
    switch (this) {
      case AvailabilityFilter.all:
        return 'الكل';
      case AvailabilityFilter.online:
        return 'متصل الآن';
      case AvailabilityFilter.offline:
        return 'غير متصل';
    }
  }
}

/// Specialty filter values (match mock/API specialty text).
const List<Map<String, String>> specialtyOptions = [
  {'value': 'all', 'label': 'الكل'},
  {'value': 'تخاطب', 'label': 'تخاطب ونطق'},
  {'value': 'تنمية مهارات', 'label': 'تنمية مهارات'},
  {'value': 'نفسي', 'label': 'نفسي'},
  {'value': 'مهني', 'label': 'علاج مهني'},
];

/// Rating filter: minimum stars.
const List<Map<String, dynamic>> ratingOptions = [
  {'value': 0.0, 'label': 'أي تقييم'},
  {'value': 4.0, 'label': '٤+ نجوم'},
  {'value': 4.5, 'label': '٤.٥+ نجوم'},
  {'value': 4.8, 'label': '٤.٨+ نجوم'},
];

/// Experience filter: minimum years (string like "5 سنوات" or number).
const List<Map<String, dynamic>> experienceOptions = [
  {'value': 0, 'label': 'أي خبرة'},
  {'value': 5, 'label': '٥+ سنوات'},
  {'value': 8, 'label': '٨+ سنوات'},
  {'value': 10, 'label': '١٠+ سنوات'},
];

int? parseExperienceYears(dynamic exp) {
  if (exp == null) return null;
  if (exp is int) return exp;
  final s = exp.toString().trim();
  final match = RegExp(r'(\d+)').firstMatch(s);
  return match != null ? int.tryParse(match.group(1) ?? '') : null;
}
