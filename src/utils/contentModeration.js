import { logger } from './logger.js';
import {
  ARABIC_BANNED_WORDS,
  ENGLISH_BANNED_WORDS,
  SENSITIVE_PATTERNS,
  SPAM_INDICATORS
} from '../config/bannedWords.js';

/**
 * Content Moderation Service
 * Filters inappropriate content in text and images
 */

// Combine all banned words
const BANNED_WORDS = [
  ...ARABIC_BANNED_WORDS,
  ...ENGLISH_BANNED_WORDS
];

/**
 * Check if text contains inappropriate content
 * @param {string} text - Text to check
 * @returns {Object} - { isSafe: boolean, reason?: string, message?: string }
 */
export const moderateText = (text) => {
  if (!text || typeof text !== 'string') {
    return { isSafe: true };
  }

  const lowerText = text.toLowerCase();
  const arabicText = text;

  // Check for banned words
  for (const word of BANNED_WORDS) {
    if (word && (lowerText.includes(word.toLowerCase()) || arabicText.includes(word))) {
      logger.warn(`Content moderation: Banned word detected: ${word}`);
      return {
        isSafe: false,
        reason: 'INAPPROPRIATE_CONTENT',
        message: 'المحتوى يحتوي على كلمات غير مناسبة'
      };
    }
  }

  // Check for sensitive patterns
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(text)) {
      logger.warn(`Content moderation: Sensitive pattern detected`);
      return {
        isSafe: false,
        reason: 'SENSITIVE_CONTENT',
        message: 'المحتوى يحتوي على روابط أو محتوى حساس'
      };
    }
  }

  // Check for excessive caps (spam indicator)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > SPAM_INDICATORS.maxCapsRatio && text.length > SPAM_INDICATORS.minLengthForCapsCheck) {
    logger.warn(`Content moderation: Excessive caps detected`);
    return {
      isSafe: false,
      reason: 'SPAM_LIKE',
      message: 'المحتوى يحتوي على أحرف كبيرة بشكل مفرط'
    };
  }

  // Check for repetitive characters (spam indicator)
  const repetitionPattern = new RegExp(`(.)\\1{${SPAM_INDICATORS.maxRepetition},}`, 'g');
  if (repetitionPattern.test(text)) {
    logger.warn(`Content moderation: Repetitive characters detected`);
    return {
      isSafe: false,
      reason: 'SPAM_LIKE',
      message: 'المحتوى يحتوي على تكرار مفرط'
    };
  }

  return { isSafe: true };
};

/**
 * Moderate image using external API (placeholder for future implementation)
 * @param {string} imageUrl - URL or base64 of image
 * @returns {Promise<Object>} - { isSafe: boolean, reason?: string, categories?: Array }
 */
export const moderateImage = async (imageUrl) => {
  try {
    // TODO: Integrate with image moderation API
    // Options:
    // 1. Google Cloud Vision API - SafeSearch
    // 2. AWS Rekognition - Content Moderation
    // 3. Azure Content Moderator
    // 4. Sightengine API
    
    // For now, return safe (you should implement actual image moderation)
    // Example with Google Cloud Vision:
    /*
    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();
    
    const [result] = await client.safeSearchDetection(imageUrl);
    const detections = result.safeSearchAnnotation;
    
    const isSafe = 
      detections.adult !== 'VERY_LIKELY' &&
      detections.violence !== 'VERY_LIKELY' &&
      detections.racy !== 'VERY_LIKELY';
    
    return {
      isSafe,
      categories: {
        adult: detections.adult,
        violence: detections.violence,
        racy: detections.racy
      }
    };
    */

    // Placeholder - always return safe for now
    return { isSafe: true };
  } catch (error) {
    logger.error('Image moderation error:', error);
    // On error, be conservative and reject
    return {
      isSafe: false,
      reason: 'MODERATION_ERROR',
      message: 'فشل التحقق من الصورة'
    };
  }
};

/**
 * Moderate content (text and optional image)
 * @param {Object} content - { text: string, imageUrl?: string }
 * @returns {Promise<Object>} - { isSafe: boolean, reason?: string }
 */
export const moderateContent = async (content) => {
  const { text, imageUrl } = content;

  // Moderate text
  const textResult = moderateText(text);
  if (!textResult.isSafe) {
    return textResult;
  }

  // Moderate image if provided
  if (imageUrl) {
    const imageResult = await moderateImage(imageUrl);
    if (!imageResult.isSafe) {
      return imageResult;
    }
  }

  return { isSafe: true };
};

/**
 * Get moderation statistics
 */
export const getModerationStats = () => {
  return {
    bannedWordsCount: BANNED_WORDS.length,
    arabicWordsCount: ARABIC_BANNED_WORDS.length,
    englishWordsCount: ENGLISH_BANNED_WORDS.length,
    patternsCount: SENSITIVE_PATTERNS.length,
    features: {
      textModeration: true,
      imageModeration: false, // Set to true when implemented
      spamDetection: true
    },
    spamIndicators: SPAM_INDICATORS
  };
};
