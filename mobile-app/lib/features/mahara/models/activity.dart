import 'activity_type.dart';

class Activity {
  final String id;
  final String skillGroupId;
  final ActivityType type;
  final int levelOrder;
  final String? correctImageId;
  final List<ActivityImage> images;
  final List<ActivityAudio> audios;
  final List<ActivityMatchPair> matchPairs;
  final List<ActivitySequenceItem> sequenceItems;

  Activity({
    required this.id,
    required this.skillGroupId,
    required this.type,
    required this.levelOrder,
    this.correctImageId,
    required this.images,
    required this.audios,
    required this.matchPairs,
    required this.sequenceItems,
  });

  factory Activity.fromJson(Map<String, dynamic> json) {
    return Activity(
      id: json['id'],
      skillGroupId: json['skillGroupId'],
      type: ActivityTypeExtension.fromString(json['type']),
      levelOrder: json['levelOrder'],
      correctImageId: json['correctImageId'],
      images: (json['images'] as List? ?? [])
          .map((i) => ActivityImage.fromJson(i))
          .toList(),
      audios: (json['audios'] as List? ?? [])
          .map((i) => ActivityAudio.fromJson(i))
          .toList(),
      matchPairs: (json['matchPairs'] as List? ?? [])
          .map((i) => ActivityMatchPair.fromJson(i))
          .toList(),
      sequenceItems: (json['sequenceItems'] as List? ?? [])
          .map((i) => ActivitySequenceItem.fromJson(i))
          .toList(),
    );
  }
}

class ActivityImage {
  final String id;
  final String url;
  final int sortOrder;

  ActivityImage({
    required this.id,
    required this.url,
    required this.sortOrder,
  });

  factory ActivityImage.fromJson(Map<String, dynamic> json) {
    return ActivityImage(
      id: json['id'],
      url: json['url'], // The backend should return the full URL
      sortOrder: json['sortOrder'] ?? 0,
    );
  }
}

class ActivityAudio {
  final String id;
  final String url;
  final int sortOrder;

  ActivityAudio({
    required this.id,
    required this.url,
    required this.sortOrder,
  });

  factory ActivityAudio.fromJson(Map<String, dynamic> json) {
    return ActivityAudio(
      id: json['id'],
      url: json['url'], // The backend should return the full URL
      sortOrder: json['sortOrder'] ?? 0,
    );
  }
}

class ActivityMatchPair {
  final String id;
  final String imageId;
  final String audioId;

  ActivityMatchPair({
    required this.id,
    required this.imageId,
    required this.audioId,
  });

  factory ActivityMatchPair.fromJson(Map<String, dynamic> json) {
    return ActivityMatchPair(
      id: json['id'],
      imageId: json['imageId'],
      audioId: json['audioId'],
    );
  }
}

class ActivitySequenceItem {
  final String id;
  final String imageId;
  final int position;

  ActivitySequenceItem({
    required this.id,
    required this.imageId,
    required this.position,
  });

  factory ActivitySequenceItem.fromJson(Map<String, dynamic> json) {
    return ActivitySequenceItem(
      id: json['id'],
      imageId: json['imageId'],
      position: json['position'],
    );
  }
}
