class MaharaActivity {
  final String id;
  final String type; // 'listen_watch', 'listen_choose', 'matching', 'sequence', 'audio_association'
  final String? audioUrl;
  final String? mainImageUrl;
  final List<ActivityOption>? options;
  final List<ActivityItem>? matchingItems;
  final List<ActivityItem>? sequenceItems;
  final String? correctAnswerId;
  final List<String>? correctSequence;
  final Function(bool)? onComplete; // Callback for activity completion

  MaharaActivity({
    required this.id,
    required this.type,
    this.audioUrl,
    this.mainImageUrl,
    this.options,
    this.matchingItems,
    this.sequenceItems,
    this.correctAnswerId,
    this.correctSequence,
    this.onComplete,
  });
}

class ActivityOption {
  final String id;
  final String imageUrl;
  final bool isCorrect;

  ActivityOption({
    required this.id,
    required this.imageUrl,
    required this.isCorrect,
  });
}

class ActivityItem {
  final String id;
  final String imageUrl;
  final String? audioUrl;

  ActivityItem({
    required this.id,
    required this.imageUrl,
    this.audioUrl,
  });
}
