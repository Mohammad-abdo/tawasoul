import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

/// Notification sound preferences and playback.
/// - Mute preference stored in SharedPreferences.
/// - playNewNotification(important) plays once per new alert when not muted.
/// To add actual sound: use audioplayers and asset files for regular/important.
class NotificationSoundService {
  NotificationSoundService(this._prefs);

  final SharedPreferences _prefs;

  bool get isMuted =>
      _prefs.getBool(AppConfig.keyNotificationSoundMuted) ?? false;

  Future<void> setMuted(bool value) async {
    await _prefs.setBool(AppConfig.keyNotificationSoundMuted, value);
  }

  /// Call when a new notification arrives. Respects mute; plays once per call.
  /// [important] – use different sound for important vs regular (when assets added).
  void playNewNotification({bool important = false}) {
    if (isMuted) return;
    // TODO: Add audioplayers + assets for regular/important sounds.
    // Example: AudioPlayer().play(AssetSource(important ? 'sounds/alert_important.mp3' : 'sounds/notification_soft.mp3'));
  }
}
