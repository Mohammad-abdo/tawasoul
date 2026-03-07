import 'package:flutter/material.dart';

/// Iconography System
/// Universal, recognizable icons
/// Consistent stroke width
/// Rounded style (child-friendly)
/// Same visual weight across all icons
class AppIcons {
  // ============================================
  // NAVIGATION ICONS
  // ============================================
  
  // Home
  static const IconData home = Icons.home_rounded;
  static const IconData homeOutline = Icons.home_outlined;
  
  // Calendar/Appointments
  static const IconData calendar = Icons.calendar_today_rounded;
  static const IconData calendarOutline = Icons.calendar_today_outlined;
  
  // Chat/Messages
  static const IconData chat = Icons.chat_bubble_rounded;
  static const IconData chatOutline = Icons.chat_bubble_outline_rounded;
  
  // Profile/Account
  static const IconData person = Icons.person_rounded;
  static const IconData personOutline = Icons.person_outline_rounded;
  
  // ============================================
  // COMMON ACTION ICONS
  // ============================================
  
  // Navigation
  static const IconData arrowBack = Icons.arrow_back_ios_rounded;
  static const IconData arrowForward = Icons.arrow_forward_ios_rounded;
  static const IconData close = Icons.close_rounded;
  static const IconData check = Icons.check_rounded;
  
  // Actions
  static const IconData add = Icons.add_rounded;
  static const IconData edit = Icons.edit_rounded;
  static const IconData delete = Icons.delete_rounded;
  static const IconData search = Icons.search_rounded;
  static const IconData filter = Icons.filter_list_rounded;
  static const IconData more = Icons.more_vert_rounded;
  static const IconData clock = Icons.access_time_rounded;
  static const IconData location = Icons.location_on_rounded;
  static const IconData money = Icons.attach_money_rounded;
  
  // Status
  static const IconData star = Icons.star_rounded;
  static const IconData starOutline = Icons.star_outline_rounded;
  static const IconData favorite = Icons.favorite_rounded;
  static const IconData favoriteOutline = Icons.favorite_outline_rounded;
  static const IconData notification = Icons.notifications_rounded;
  static const IconData notificationOutline = Icons.notifications_outlined;
  
  // Media
  static const IconData image = Icons.image_rounded;
  static const IconData video = Icons.videocam_rounded;
  static const IconData audio = Icons.volume_up_rounded;
  static const IconData mic = Icons.mic_rounded;
  
  // Communication
  static const IconData call = Icons.call_rounded;
  static const IconData message = Icons.message_rounded;
  static const IconData send = Icons.send_rounded;
  
  // Settings
  static const IconData settings = Icons.settings_rounded;
  static const IconData lock = Icons.lock_rounded;
  static const IconData unlock = Icons.lock_open_rounded;
  
  // ============================================
  // ICON SIZE STANDARDS
  // ============================================
  
  /// Small icons (16-20sp)
  /// Use for: Inline icons, list items
  static const double sizeSmall = 18.0;
  
  /// Medium icons (24sp)
  /// Use for: Standard icons, buttons
  static const double sizeMedium = 24.0;
  
  /// Large icons (32-40sp)
  /// Use for: Hero icons, important actions
  static const double sizeLarge = 32.0;
  
  /// Extra large icons (48sp+)
  /// Use for: Empty states, illustrations
  static const double sizeXL = 48.0;
  
  // ============================================
  // ICON USAGE GUIDELINES
  // ============================================
  
  /// Icon Style Rules:
  /// 
  /// 1. Always use rounded icons (Icons.*_rounded)
  /// 2. Use outline for inactive states
  /// 3. Use filled for active states
  /// 4. Maintain consistent stroke width
  /// 5. Icons must be recognizable without text
  /// 
  /// Navigation Icons:
  /// - Use filled when active
  /// - Use outline when inactive
  /// - Size: 26sp for bottom navigation
  /// 
  /// Action Icons:
  /// - Use filled for primary actions
  /// - Use outline for secondary actions
  /// - Size: 24sp standard
  /// 
  /// Status Icons:
  /// - Use filled for active/selected
  /// - Use outline for inactive/unselected
  /// - Size: 20-24sp
}
