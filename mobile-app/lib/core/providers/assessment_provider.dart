import 'package:flutter/foundation.dart';
import '../../features/assessments/data/mock_assessments.dart';
import '../../features/assessments/data/assessment_results_repository.dart';
import '../../features/assessments/models/category_score_model.dart';

class AssessmentProvider with ChangeNotifier {
  AssessmentProvider();

  List<dynamic> _tests = [];
  List<dynamic> _questions = [];
  Map<String, int> _scores = {};
  bool _isLoading = false;
  String? _error;
  dynamic _currentTest;
  int _currentQuestionIndex = 0;
  String? _sessionId;
  String? _currentCategoryId;
  String? _currentChildId;
  DateTime? _sessionStartedAt;
  int _attempts = 0;
  Map<String, double> _categoryProgress = {};
  List<CategoryScoreModel> _childScores = [];

  List<dynamic> get tests => _tests;
  List<dynamic> get questions => _questions;
  Map<String, int> get scores => _scores;
  bool get isLoading => _isLoading;
  String? get error => _error;
  dynamic get currentTest => _currentTest;
  int get currentQuestionIndex => _currentQuestionIndex;
  String? get sessionId => _sessionId;
  String? get currentCategoryId => _currentCategoryId;
  String? get currentChildId => _currentChildId;
  int get sessionDurationSeconds =>
      _sessionStartedAt != null ? DateTime.now().difference(_sessionStartedAt!).inSeconds : 0;
  int get attempts => _attempts;
  List<CategoryScoreModel> get childScores => _childScores;

  double getCategoryProgress(String categoryId) =>
      _categoryProgress[categoryId] ?? 0.0;

  /// Load category progress for dashboard/carousel
  Future<void> loadCategoryProgress(String childId) async {
    final byCategory = await AssessmentResultsRepository.getLatestByCategory(childId);
    _categoryProgress = {};
    for (final e in byCategory.entries) {
      _categoryProgress[e.key] = 1.0; // has completed at least one
    }
    _childScores = await AssessmentResultsRepository.getScores(childId);
    notifyListeners();
  }

  // Get all available tests
  Future<void> fetchTests() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await Future.delayed(const Duration(milliseconds: 500));
      _tests = MockAssessmentsData.tests;
      _error = null;
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) {
        print('Error fetching tests: $e');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Start session (track time, category)
  void startSession(String childId, String? categoryId, String testId) {
    _currentChildId = childId;
    _currentCategoryId = categoryId;
    _sessionId = 'session_${DateTime.now().millisecondsSinceEpoch}';
    _sessionStartedAt = DateTime.now();
    _attempts = 0;
    notifyListeners();
  }

  void incrementAttempts() {
    _attempts++;
    notifyListeners();
  }

  // Get test questions (now using activities)
  Future<void> fetchTestQuestions(String testId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await Future.delayed(const Duration(milliseconds: 400));
      _questions = MockAssessmentsData.activitiesByTestId[testId] ?? [];
      _currentQuestionIndex = 0;
      _scores = {};
      if (_sessionId == null) {
        _sessionId = 'session_${DateTime.now().millisecondsSinceEpoch}';
      }
      _error = null;
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) {
        print('Error fetching questions: $e');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Set current test
  void setCurrentTest(dynamic test) {
    _currentTest = test;
    notifyListeners();
  }

  // Set score for a question
  void setScore(String questionId, int score) {
    _scores[questionId] = score;
    notifyListeners();
  }

  /// Copy scores from test screen before saving category result
  void setScoresFromTest(Map<String, int> scores) {
    _scores.clear();
    _scores.addAll(scores);
    notifyListeners();
  }

  // Get score for a question
  int? getScore(String questionId) {
    return _scores[questionId];
  }

  // Move to next question
  void nextQuestion() {
    if (_currentQuestionIndex < _questions.length - 1) {
      _currentQuestionIndex++;
      notifyListeners();
    }
  }

  // Move to previous question
  void previousQuestion() {
    if (_currentQuestionIndex > 0) {
      _currentQuestionIndex--;
      notifyListeners();
    }
  }

  // Get current question
  dynamic get currentQuestion {
    if (_questions.isEmpty || _currentQuestionIndex >= _questions.length) {
      return null;
    }
    return _questions[_currentQuestionIndex];
  }

  // Check if all questions are answered
  bool get allQuestionsAnswered {
    return _scores.length == _questions.length;
  }

  // Submit assessment result
  Future<bool> submitResult(String childId, String questionId, int score) async {
    try {
      await Future.delayed(const Duration(milliseconds: 200));
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      if (kDebugMode) {
        print('Error submitting result: $e');
      }
      return false;
    }
  }

  // Submit all results
  Future<bool> submitAllResults(String childId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      bool allSuccess = true;
      for (var entry in _scores.entries) {
        final questionId = entry.key;
        final score = entry.value;
        
        final success = await submitResult(childId, questionId, score);
        if (!success) {
          allSuccess = false;
        }
      }

      if (allSuccess) {
        // Reset state
        _questions = [];
        _scores = {};
        _currentQuestionIndex = 0;
        _currentTest = null;
        _sessionId = null;
      }

      return allSuccess;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Save category score (0-5, time, attempts, accuracy) and reset
  Future<void> saveCategoryScoreAndReset(String childId, String categoryId) async {
    final totalSteps = _questions.length;
    final correctSteps = _scores.values.where((s) => s >= 5).length;
    final totalScore = _scores.values.fold<int>(0, (sum, s) => sum + s);
    final rawMax = totalSteps > 0 ? totalSteps * 10 : 1;
    final accuracy = totalSteps > 0 ? (correctSteps / totalSteps) : 0.0;
    final combined = totalSteps > 0
        ? (correctSteps / totalSteps * 0.6 + (totalScore / rawMax).clamp(0.0, 1.0) * 0.4)
        : 0.0;
    final score0to5 = (combined * 5).round().clamp(0, 5);
    final timeSeconds = _sessionStartedAt != null
        ? DateTime.now().difference(_sessionStartedAt!).inSeconds
        : 0;
    final model = CategoryScoreModel(
      childId: childId,
      categoryId: categoryId,
      sessionId: _sessionId ?? '',
      score: score0to5,
      timeSeconds: timeSeconds,
      attempts: _attempts,
      accuracy: accuracy,
      completedAt: DateTime.now(),
    );
    await AssessmentResultsRepository.addScore(model);
    reset();
  }

  // Reset assessment
  void reset() {
    _questions = [];
    _scores = {};
    _currentQuestionIndex = 0;
    _currentTest = null;
    _sessionId = null;
    _currentCategoryId = null;
    _currentChildId = null;
    _sessionStartedAt = null;
    _attempts = 0;
    _error = null;
    notifyListeners();
  }

  // Get progress percentage
  double get progress {
    if (_questions.isEmpty) return 0.0;
    return (_currentQuestionIndex + 1) / _questions.length;
  }

  // Check if can go to next
  bool get canGoNext {
    return _currentQuestionIndex < _questions.length - 1;
  }

  // Check if can go to previous
  bool get canGoPrevious {
    return _currentQuestionIndex > 0;
  }

  // Check if is last question
  bool get isLastQuestion {
    return _currentQuestionIndex == _questions.length - 1;
  }
}
