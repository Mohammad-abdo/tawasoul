import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';
import '../../features/shared/mock_content.dart';

enum ChildStatus {
  autism,
  speechDisorder,
}

enum ChildAgeGroup {
  under4,
  between4And15,
  over15,
}

class Child {
  final String id;
  final String? name;
  final ChildStatus? status;
  final ChildAgeGroup? ageGroup;
  final String? behavioralNotes;
  final String? profileImageUrl;
  final String? birthDate;
  
  Child({
    required this.id,
    this.name,
    this.status,
    this.ageGroup,
    this.behavioralNotes,
    this.profileImageUrl,
    this.birthDate,
  });
}

/// Children Provider - NOW USING MOCK DATA
/// No backend connection required
class ChildrenProvider extends ChangeNotifier {
  final AuthService _authService;
  
  ChildrenProvider(this._authService);
  
  bool _isLoading = false;
  String? _error;
  List<Child> _children = [];
  String? _selectedChildId;

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Child> get children => _children;
  String? get selectedChildId => _selectedChildId;

  Child? get selectedChild =>
      _selectedChildId != null ? getChildById(_selectedChildId!) : null;

  void setSelectedChildId(String? id) {
    if (_selectedChildId != id) {
      _selectedChildId = id;
      notifyListeners();
    }
  }

  Child? getChildById(String id) {
    try {
      return _children.firstWhere((c) => c.id == id);
    } catch (_) {
      return null;
    }
  }

  /// MOCK - Load child by ID
  Future<Child?> loadChildById(String id) async {
    final token = _authService.getToken();
    if (token == null) return null;
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 300));
      
      final childData = MockContent.children.firstWhere(
        (c) => c['id'] == id,
        orElse: () => {},
      );
      
      if (childData.isNotEmpty) {
        final child = _childFromMap(childData);
        final idx = _children.indexWhere((x) => x.id == id);
        if (idx >= 0) {
          _children[idx] = child;
        } else {
          _children = [..._children, child];
        }
        notifyListeners();
        return child;
      }
    } catch (e) {
      debugPrint('ChildrenProvider.loadChildById error: $e');
    }
    return getChildById(id);
  }

  /// MOCK - Update child
  Future<bool> updateChild(String id, {String? name, String? behavioralNotes}) async {
    final token = _authService.getToken();
    if (token == null) return false;
    
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 500));
      
      final idx = _children.indexWhere((c) => c.id == id);
      if (idx >= 0) {
        // Update the child locally
        _children[idx] = Child(
          id: _children[idx].id,
          name: name ?? _children[idx].name,
          status: _children[idx].status,
          ageGroup: _children[idx].ageGroup,
          behavioralNotes: behavioralNotes ?? _children[idx].behavioralNotes,
          profileImageUrl: _children[idx].profileImageUrl,
          birthDate: _children[idx].birthDate,
        );
        _isLoading = false;
        notifyListeners();
        return true;
      }
      
      _error = 'Child not found';
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// MOCK - Load all children
  Future<bool> loadChildren() async {
    final token = _authService.getToken();
    if (token == null) return false;
    
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 500));
      
      _children = MockContent.children.map((childData) {
        return _childFromMap(childData);
      }).toList();
      
      // Set first child as selected if none selected
      if (_selectedChildId == null && _children.isNotEmpty) {
        _selectedChildId = _children.first.id;
      }
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// MOCK - Add new child
  Future<Child?> addChild({
    required String name,
    required int age,
    String? status,
    String? behavioralNotes,
  }) async {
    final token = _authService.getToken();
    if (token == null) return null;
    
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 700));
      
      final newChild = Child(
        id: 'child_${DateTime.now().millisecondsSinceEpoch}',
        name: name,
        status: _parseStatus(status),
        ageGroup: _getAgeGroup(age),
        behavioralNotes: behavioralNotes,
        birthDate: DateTime.now().subtract(Duration(days: age * 365)).toIso8601String().split('T')[0],
      );
      
      _children = [..._children, newChild];
      _isLoading = false;
      notifyListeners();
      return newChild;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  /// MOCK - Delete child
  Future<bool> deleteChild(String id) async {
    final token = _authService.getToken();
    if (token == null) return false;
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 400));
      
      _children = _children.where((c) => c.id != id).toList();
      
      // Update selected child if needed
      if (_selectedChildId == id) {
        _selectedChildId = _children.isNotEmpty ? _children.first.id : null;
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// MOCK - Submit child survey (onboarding)
  Future<Child?> submitChildSurvey({
    required String status,
    required String ageGroup,
    String? behavioralNotes,
  }) async {
    final token = _authService.getToken();
    if (token == null) return null;
    
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 800));
      
      // Parse age from ageGroup
      int age = 5; // default
      if (ageGroup.contains('under4') || ageGroup == 'UNDER_4') {
        age = 3;
      } else if (ageGroup.contains('between4And15') || ageGroup == 'BETWEEN_4_AND_15') {
        age = 8;
      } else if (ageGroup.contains('over15') || ageGroup == 'OVER_15') {
        age = 16;
      }
      
      final newChild = Child(
        id: 'child_${DateTime.now().millisecondsSinceEpoch}',
        name: 'طفل جديد',
        status: _parseStatus(status),
        ageGroup: _parseAgeGroup(age),
        behavioralNotes: behavioralNotes,
        birthDate: DateTime.now().subtract(Duration(days: age * 365)).toIso8601String().split('T')[0],
      );
      
      _children = [..._children, newChild];
      
      // Set as selected child
      _selectedChildId = newChild.id;
      
      _isLoading = false;
      notifyListeners();
      return newChild;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  // Helper methods
  Child _childFromMap(Map<String, dynamic> map) {
    return Child(
      id: map['id']?.toString() ?? '',
      name: map['name']?.toString(),
      status: _parseStatus(map['status']?.toString()),
      ageGroup: _parseAgeGroup(map['age']),
      behavioralNotes: map['behavioralNotes']?.toString(),
      profileImageUrl: map['imageUrl']?.toString(),
      birthDate: map['birthDate']?.toString(),
    );
  }

  ChildStatus? _parseStatus(String? status) {
    if (status == null) return null;
    final s = status.toLowerCase();
    if (s.contains('autism') || s.contains('توحد')) return ChildStatus.autism;
    if (s.contains('speech') || s.contains('تخاطب')) return ChildStatus.speechDisorder;
    return null;
  }

  ChildAgeGroup? _parseAgeGroup(dynamic age) {
    if (age == null) return null;
    final ageInt = age is int ? age : int.tryParse(age.toString()) ?? 0;
    return _getAgeGroup(ageInt);
  }

  ChildAgeGroup _getAgeGroup(int age) {
    if (age < 4) return ChildAgeGroup.under4;
    if (age <= 15) return ChildAgeGroup.between4And15;
    return ChildAgeGroup.over15;
  }
}
