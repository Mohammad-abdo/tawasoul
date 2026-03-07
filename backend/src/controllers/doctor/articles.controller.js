import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get Doctor Articles
 */
export const getDoctorArticles = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get articles
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: { authorId: doctorId },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.article.count({ where: { authorId: doctorId } })
    ]);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get doctor articles error:', error);
    next(error);
  }
};

/**
 * Create Article
 */
export const createArticle = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const {
      title,
      content,
      excerpt
    } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and content are required'
        }
      });
    }

    // Create article
    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt ? excerpt.trim() : null,
        authorId: doctorId
      }
    });

    logger.info(`Article created: ${article.id} by doctor ${doctorId}`);

    res.status(201).json({
      success: true,
      message: 'تم نشر المقال بنجاح',
      data: article
    });
  } catch (error) {
    logger.error('Create article error:', error);
    next(error);
  }
};

/**
 * Update Article
 */
export const updateArticle = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { id } = req.params;
    const {
      title,
      content,
      excerpt
    } = req.body;

    // Check if article exists and belongs to doctor
    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ARTICLE_NOT_FOUND',
          message: 'Article not found'
        }
      });
    }

    if (article.authorId !== doctorId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your own articles'
        }
      });
    }

    // Build update data
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (excerpt !== undefined) updateData.excerpt = excerpt ? excerpt.trim() : null;

    // Update article
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: updateData
    });

    logger.info(`Article updated: ${id} by doctor ${doctorId}`);

    res.json({
      success: true,
      message: 'تم تحديث المقال بنجاح',
      data: updatedArticle
    });
  } catch (error) {
    logger.error('Update article error:', error);
    next(error);
  }
};

/**
 * Delete Article
 */
export const deleteArticle = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { id } = req.params;

    // Check if article exists and belongs to doctor
    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ARTICLE_NOT_FOUND',
          message: 'Article not found'
        }
      });
    }

    if (article.authorId !== doctorId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own articles'
        }
      });
    }

    // Delete article
    await prisma.article.delete({
      where: { id }
    });

    logger.info(`Article deleted: ${id} by doctor ${doctorId}`);

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    logger.error('Delete article error:', error);
    next(error);
  }
};

