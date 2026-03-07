/**
 * Banned Words Configuration
 * قائمة الكلمات المحظورة
 * 
 * This file contains lists of inappropriate words and phrases
 * that should be blocked in user-generated content.
 */

// Arabic inappropriate words (add your list here)
// ملاحظة: يجب إضافة الكلمات المحظورة حسب سياسة المحتوى الخاصة بك
const ARABIC_BANNED_WORDS = [
  // أضف الكلمات المحظورة العربية هنا
  // مثال: 'كلمة1', 'كلمة2'
  // يمكنك إضافة قائمة شاملة من الكلمات غير المناسبة
  'وغد',
];

// English inappropriate words
const ENGLISH_BANNED_WORDS = [
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard',
  'porn', 'xxx', 'sex', 'nude', 'naked', 'pornography',
  'drugs', 'cocaine', 'heroin', 'marijuana',
  // Add more as needed
];

// Sensitive topics and patterns
const SENSITIVE_PATTERNS = [
  // URLs to adult/inappropriate content
  /(?:https?:\/\/)?(?:www\.)?(?:porn|xxx|adult|sex|nude|erotic|explicit)/i,
  /(?:https?:\/\/)?(?:www\.)?(?:جنس|إباحي|عري|شهواني|محتوى.*حساس)/i,
  
  // Add more patterns as needed
];

// Spam indicators
const SPAM_INDICATORS = {
  maxCapsRatio: 0.7, // Maximum ratio of capital letters
  maxRepetition: 10, // Maximum repeated characters
  minLengthForCapsCheck: 20, // Minimum length to check caps
};

export {
  ARABIC_BANNED_WORDS,
  ENGLISH_BANNED_WORDS,
  SENSITIVE_PATTERNS,
  SPAM_INDICATORS
};

