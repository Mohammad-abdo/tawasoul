import { moderateContent, moderateText } from '../utils/contentModeration.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware to moderate content before saving
 * Checks text and optionally images
 */
export const moderateContentMiddleware = async (req, res, next) => {
  try {
    // Extract content from request body
    const content = req.body.content || req.body.text || req.body.message || '';
    const imageUrl = req.body.imageUrl || req.body.image || req.body.avatar || null;
    const title = req.body.title || '';

    // Combine title and content for moderation
    const fullText = `${title} ${content}`.trim();

    if (!fullText && !imageUrl) {
      return next(); // No content to moderate
    }

    // Moderate the content
    const result = await moderateContent({
      text: fullText,
      imageUrl: imageUrl
    });

    if (!result.isSafe) {
      logger.warn(`Content moderation blocked: ${result.reason}`, {
        userId: req.user?.id || req.doctor?.id || 'unknown',
        path: req.path,
        reason: result.reason
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'CONTENT_MODERATION_FAILED',
          message: result.message || 'المحتوى غير مناسب',
          reason: result.reason
        }
      });
    }

    // Content is safe, continue
    next();
  } catch (error) {
    logger.error('Content moderation middleware error:', error);
    // On error, be conservative and reject
    return res.status(500).json({
      success: false,
      error: {
        code: 'MODERATION_ERROR',
        message: 'حدث خطأ أثناء التحقق من المحتوى'
      }
    });
  }
};

/**
 * Middleware to moderate text only (for messages, comments, etc.)
 */
export const moderateTextMiddleware = async (req, res, next) => {
  try {
    const text = req.body.content || req.body.text || req.body.message || '';
    const title = req.body.title || '';

    const fullText = `${title} ${text}`.trim();

    if (!fullText) {
      return next();
    }

    const result = moderateText(fullText);

    if (!result.isSafe) {
      logger.warn(`Text moderation blocked: ${result.reason}`, {
        userId: req.user?.id || req.doctor?.id || 'unknown',
        path: req.path,
        reason: result.reason
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'CONTENT_MODERATION_FAILED',
          message: result.message || 'المحتوى النصي غير مناسب',
          reason: result.reason
        }
      });
    }

    next();
  } catch (error) {
    logger.error('Text moderation middleware error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'MODERATION_ERROR',
        message: 'حدث خطأ أثناء التحقق من المحتوى'
      }
    });
  }
};

