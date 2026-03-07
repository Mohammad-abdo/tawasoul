import '../models/activity_model.dart';

class MaharaMockData {
  static List<MaharaActivity> getSampleActivities() {
    return [
      // LISTEN & WATCH
      MaharaActivity(
        id: 'mahara_1',
        type: 'listen_watch',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        mainImageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
      ),
      // LISTEN & CHOOSE
      MaharaActivity(
        id: 'mahara_2',
        type: 'listen_choose',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        options: [
          ActivityOption(
            id: 'opt_1',
            imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
            isCorrect: true,
          ),
          ActivityOption(
            id: 'opt_2',
            imageUrl: 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800',
            isCorrect: false,
          ),
          ActivityOption(
            id: 'opt_3',
            imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800',
            isCorrect: false,
          ),
        ],
        correctAnswerId: 'opt_1',
      ),
      // MATCHING
      MaharaActivity(
        id: 'mahara_3',
        type: 'matching',
        matchingItems: [
          ActivityItem(
            id: 'match_1',
            imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          ),
          ActivityItem(
            id: 'match_2',
            imageUrl: 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          ),
          ActivityItem(
            id: 'match_3',
            imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
          ),
        ],
      ),
      // SEQUENCE
      MaharaActivity(
        id: 'mahara_4',
        type: 'sequence',
        sequenceItems: [
          ActivityItem(
            id: 'seq_1',
            imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
          ),
          ActivityItem(
            id: 'seq_2',
            imageUrl: 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800',
          ),
          ActivityItem(
            id: 'seq_3',
            imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800',
          ),
        ],
        correctSequence: ['seq_1', 'seq_2', 'seq_3'],
      ),
      // AUDIO ASSOCIATION
      MaharaActivity(
        id: 'mahara_5',
        type: 'audio_association',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        mainImageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
      ),
    ];
  }
}
