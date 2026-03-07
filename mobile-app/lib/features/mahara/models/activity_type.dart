enum ActivityType {
  LISTEN_WATCH,
  LISTEN_CHOOSE_IMAGE,
  MATCHING,
  SEQUENCE_ORDER,
  AUDIO_ASSOCIATION,
}

extension ActivityTypeExtension on ActivityType {
  String get name {
    switch (this) {
      case ActivityType.LISTEN_WATCH:
        return 'LISTEN_WATCH';
      case ActivityType.LISTEN_CHOOSE_IMAGE:
        return 'LISTEN_CHOOSE_IMAGE';
      case ActivityType.MATCHING:
        return 'MATCHING';
      case ActivityType.SEQUENCE_ORDER:
        return 'SEQUENCE_ORDER';
      case ActivityType.AUDIO_ASSOCIATION:
        return 'AUDIO_ASSOCIATION';
    }
  }

  static ActivityType fromString(String type) {
    switch (type) {
      case 'LISTEN_WATCH':
        return ActivityType.LISTEN_WATCH;
      case 'LISTEN_CHOOSE_IMAGE':
        return ActivityType.LISTEN_CHOOSE_IMAGE;
      case 'MATCHING':
        return ActivityType.MATCHING;
      case 'SEQUENCE_ORDER':
        return ActivityType.SEQUENCE_ORDER;
      case 'AUDIO_ASSOCIATION':
        return ActivityType.AUDIO_ASSOCIATION;
      default:
        return ActivityType.LISTEN_WATCH;
    }
  }
}
