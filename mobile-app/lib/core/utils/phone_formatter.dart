/// Utility class for phone number formatting
class PhoneFormatter {
  /// Format phone number for backend (remove spaces, ensure proper format)
  static String formatPhone(String phone) {
    // Remove all spaces and non-digit characters except +
    String cleaned = phone.replaceAll(RegExp(r'[^\d+]'), '');
    
    // If phone doesn't start with +, assume it's local format
    // For Egypt: add +20 if it starts with 0
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('0')) {
        cleaned = '+20' + cleaned.substring(1);
      } else if (cleaned.length == 10) {
        // Assume it's a 10-digit local number
        cleaned = '+20' + cleaned;
      }
    }
    
    return cleaned;
  }
  
  /// Validate phone number format
  static bool isValidPhone(String phone) {
    // Remove spaces for validation
    String cleaned = phone.replaceAll(RegExp(r'[\s-]'), '');
    
    // Check if it's a valid phone number (10-15 digits, optionally with country code)
    return RegExp(r'^\+?[1-9]\d{9,14}$').hasMatch(cleaned);
  }
  
  /// Extract digits only from phone number
  static String digitsOnly(String phone) {
    return phone.replaceAll(RegExp(r'[^\d]'), '');
  }
}


