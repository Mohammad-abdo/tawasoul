# Child Survey API Documentation

## Overview
This API endpoint handles the child survey screen that appears after account creation. It collects child status, age group, and behavioral notes, then saves them to the child's profile.

## Endpoint

### POST `/api/user/children/survey`

Submit child survey data after account creation.

**Authentication:** Required (User token)

**Request Body:**
```json
{
  "name": "string (optional)",
  "status": "string (required)",
  "ageGroup": "string (required)",
  "behavioralNotes": "string (optional, max 250 characters)"
}
```

## Field Mappings

### Status (حالة الطفل)
The API accepts both Arabic text and enum values:

| Arabic Text | Enum Value | Description |
|------------|------------|-------------|
| "توحد" | AUTISM | Autism |
| "تخاطب" | SPEECH_DISORDER | Speech Therapy |

**Accepted values:**
- Arabic: `"توحد"` or `"تخاطب"`
- English: `"AUTISM"` or `"SPEECH_DISORDER"`
- Case-insensitive: `"autism"`, `"speech_disorder"`, etc.

### Age Group (عمر الطفل)
The API accepts both Arabic text and enum values:

| Arabic Text | Enum Value | Description |
|------------|------------|-------------|
| "اقل من 4 سنوات" | UNDER_4 | Less than 4 years |
| "4 سنوات الي 15 سنه" | BETWEEN_5_15 | 4 to 15 years |
| "اكبر من 15 سنه" | OVER_15 | Over 15 years |

**Accepted values:**
- Arabic: `"اقل من 4 سنوات"`, `"4 سنوات الي 15 سنه"`, `"اكبر من 15 سنه"`
- English: `"UNDER_4"`, `"BETWEEN_5_15"`, `"OVER_15"`
- Case-insensitive variations

### Behavioral Notes (ملاحظات السلوك)
- **Type:** String (optional)
- **Max Length:** 250 characters
- **Description:** Observations about the child's behavior and status

### Name (اسم الطفل)
- **Type:** String (optional)
- **Default:** If not provided, will use `"طفل 1"`, `"طفل 2"`, etc. based on child count

## Example Requests

### Example 1: Arabic Text Input
```json
{
  "name": "أحمد محمد",
  "status": "توحد",
  "ageGroup": "4 سنوات الي 15 سنه",
  "behavioralNotes": "ملاحظات حول سلوك الطفل وملاحظات عن الحالة"
}
```

### Example 2: Enum Values Input
```json
{
  "name": "Ahmed Mohamed",
  "status": "AUTISM",
  "ageGroup": "BETWEEN_5_15",
  "behavioralNotes": "Some behavioral observations"
}
```

### Example 3: Minimal Required Fields
```json
{
  "status": "تخاطب",
  "ageGroup": "اقل من 4 سنوات"
}
```

## Response

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "تم حفظ بيانات الاستبيان بنجاح",
  "messageEn": "Survey data saved successfully",
  "data": {
    "child": {
      "id": "uuid",
      "name": "string",
      "status": "AUTISM" | "SPEECH_DISORDER",
      "ageGroup": "UNDER_4" | "BETWEEN_5_15" | "OVER_15",
      "behavioralNotes": "string | null",
      "createdAt": "ISO datetime"
    },
    "surveyCompleted": true
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "حالة الطفل وعمر الطفل مطلوبان",
    "messageEn": "Child status and age are required"
  }
}
```

#### 400 Bad Request - Invalid Status
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "حالة الطفل غير صحيحة. يجب أن تكون \"توحد\" أو \"تخاطب\"",
    "messageEn": "Invalid child status. Must be \"توحد\" (Autism) or \"تخاطب\" (Speech Therapy)"
  }
}
```

#### 400 Bad Request - Invalid Age Group
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "فئة العمر غير صحيحة. يجب أن تكون \"اقل من 4 سنوات\" أو \"4 سنوات الي 15 سنه\" أو \"اكبر من 15 سنه\"",
    "messageEn": "Invalid age group"
  }
}
```

#### 400 Bad Request - Notes Too Long
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ملاحظات السلوك يجب ألا تتجاوز 250 حرفاً. الحروف المدخلة: 300",
    "messageEn": "Behavioral notes must not exceed 250 characters. Current length: 300"
  }
}
```

## Mobile App Integration

### Flutter/Dart Example
```dart
Future<void> submitChildSurvey({
  String? name,
  required String status,
  required String ageGroup,
  String? behavioralNotes,
}) async {
  try {
    final response = await http.post(
      Uri.parse('$baseUrl/api/user/children/survey'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $userToken',
      },
      body: jsonEncode({
        if (name != null) 'name': name,
        'status': status, // "توحد" or "تخاطب"
        'ageGroup': ageGroup, // "اقل من 4 سنوات", etc.
        if (behavioralNotes != null) 'behavioralNotes': behavioralNotes,
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      print('Survey submitted successfully: ${data['data']['child']['id']}');
      return data['data']['child'];
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error']['message']);
    }
  } catch (e) {
    print('Error submitting survey: $e');
    rethrow;
  }
}
```

### Usage in Survey Screen
```dart
// When user taps "التالي" (Next) button
onPressed: () async {
  if (_selectedStatus == null || _selectedAgeGroup == null) {
    // Show error: required fields missing
    return;
  }

  if (_behavioralNotes.length > 250) {
    // Show error: notes too long
    return;
  }

  try {
    final child = await submitChildSurvey(
      name: _childName, // if collected
      status: _selectedStatus!, // "توحد" or "تخاطب"
      ageGroup: _selectedAgeGroup!, // Arabic text from UI
      behavioralNotes: _behavioralNotes.isEmpty ? null : _behavioralNotes,
    );

    // Navigate to next screen or show success
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => HomeScreen()),
    );
  } catch (e) {
    // Show error message
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(e.toString())),
    );
  }
}
```

## Notes

1. **Name Field:** The name is optional. If not provided, the system will auto-generate a name like "طفل 1", "طفل 2", etc.

2. **Character Limits:** Behavioral notes are limited to 250 characters as shown in the UI.

3. **Status Values:** The API accepts both Arabic text and enum values for flexibility. Use Arabic text from the UI directly.

4. **Age Group Values:** The API accepts both Arabic text and enum values. Use Arabic text from the UI directly.

5. **Multiple Children:** Users can submit multiple surveys to create multiple child profiles.

6. **After Submission:** After successful submission, navigate to the home screen or child profile screen.
