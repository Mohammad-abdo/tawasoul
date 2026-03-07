/// Normalized model for assessment category (attention & cognitive skills).
/// Used for 12 Mahara categories with score 0-5, time, attempts, accuracy.
class AssessmentCategoryModel {
  final String id;
  final String titleAr;
  final String? titleEn;
  final String iconName;
  final int colorValue;
  final String? description;
  final String? emoji;

  const AssessmentCategoryModel({
    required this.id,
    required this.titleAr,
    this.titleEn,
    required this.iconName,
    required this.colorValue,
    this.description,
    this.emoji,
  });

  factory AssessmentCategoryModel.fromMap(Map<String, dynamic> map) {
    return AssessmentCategoryModel(
      id: map['id'] as String,
      titleAr: map['title'] as String,
      titleEn: map['titleEn'] as String?,
      iconName: map['icon'] as String? ?? 'help_outline',
      colorValue: map['color'] as int? ?? 0xFF6C9BD2,
      description: map['description'] as String?,
      emoji: map['emoji'] as String?,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'title': titleAr,
        'titleEn': titleEn,
        'icon': iconName,
        'color': colorValue,
        'description': description,
        'emoji': emoji,
      };
}
