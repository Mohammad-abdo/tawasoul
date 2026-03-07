import 'package:flutter/material.dart';
import '../models/activity.dart';
import '../services/mahara_service.dart';

class MaharaProvider extends ChangeNotifier {
  final MaharaService _maharaService = MaharaService();
  
  Activity? _currentActivity;
  bool _isLoading = false;
  String? _error;
  bool _isCompleted = false;

  Activity? get currentActivity => _currentActivity;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isCompleted => _isCompleted;

  void resetCompletion() {
    _isCompleted = false;
    notifyListeners();
  }

  Future<void> fetchCurrentActivity(String childId, String token) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentActivity = await _maharaService.getCurrentActivity(childId, token);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> submitInteraction({
    required String childId,
    required String token,
    String? event,
    String? selectedImageId,
    List<Map<String, String>>? matches,
    List<String>? sequence,
  }) async {
    if (_currentActivity == null) return false;

    try {
      final response = await _maharaService.submitInteraction(
        childId: childId,
        activityId: _currentActivity!.id,
        token: token,
        event: event,
        selectedImageId: selectedImageId,
        matches: matches,
        sequence: sequence,
      );

      if (response['success'] == true) {
        if (response['completed'] == true) {
          _isCompleted = true;
          notifyListeners();
          return true;
        }
      }
      return false;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> loadNextActivity(String childId, String token) async {
    _isCompleted = false;
    await fetchCurrentActivity(childId, token);
  }
}
