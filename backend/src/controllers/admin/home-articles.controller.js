import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get All Home Articles
 */
export const getAllHomeArticles = async (req, res, next) => {
  try {
    const { isActive } = req.query;

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const articles = await prisma.homeArticle.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    logger.error('Get home articles error:', error);
    next(error);
  }
};

/**
 * Get Home Article by ID
 */
export const getHomeArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await prisma.homeArticle.findUnique({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: { message: 'Home article not found' }
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    logger.error('Get home article by id error:', error);
    next(error);
  }
};

/**
 * Create Home Article
 */
export const createHomeArticle = async (req, res, next) => {
  try {
    const { titleAr, titleEn, descriptionAr, descriptionEn, image, link, order, isActive } = req.body;

    // Handle file upload
    let imageUrl = image;

    if (req.file) {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      imageUrl = `${baseUrl}/uploads/home-articles/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: { message: 'Image is required' }
      });
    }

    // Get max order with defensive null handling
    let nextOrder = 1;
    try {
      const maxOrder = await prisma.homeArticle.aggregate({
        _max: { order: true }
      });
      nextOrder = (maxOrder?._max?.order != null ? maxOrder._max.order : 0) + 1;
    } catch (aggregateError) {
      logger.warn('Failed to get max order, using default:', aggregateError);
      const count = await prisma.homeArticle.count();
      nextOrder = count + 1;
    }

    const article = await prisma.homeArticle.create({
      data: {
        titleAr,
        titleEn,
        descriptionAr,
        descriptionEn,
        image: imageUrl,
        link,
        order: order !== undefined ? parseInt(order) : nextOrder,
        isActive: isActive !== undefined ? (isActive === true || isActive === 'true') : true
      }
    });

    res.status(201).json({
      success: true,
      data: article,
      message: 'Home article created successfully'
    });
  } catch (error) {
    logger.error('Create home article error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Request body:', req.body);
    next(error);
  }
};

/**
 * Update Home Article
 */
export const updateHomeArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titleAr, titleEn, descriptionAr, descriptionEn, image, link, order, isActive } = req.body;

    const existingItem = await prisma.homeArticle.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: { message: 'Home article not found' }
      });
    }

    // Handle file upload
    let imageUrl = image;

    if (req.file) {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      imageUrl = `${baseUrl}/uploads/home-articles/${req.file.filename}`;

      // Delete old image
      if (existingItem.image && !existingItem.image.startsWith('http')) {
        try {
          const oldImagePath = path.join(__dirname, '../../uploads/home-articles', path.basename(existingItem.image));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          logger.warn('Failed to delete old image:', err);
        }
      }
    } else if (image === undefined) {
      imageUrl = existingItem.image;
    }

    const article = await prisma.homeArticle.update({
      where: { id },
      data: {
        ...(titleAr !== undefined && { titleAr }),
        ...(titleEn !== undefined && { titleEn }),
        ...(descriptionAr !== undefined && { descriptionAr }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(imageUrl !== undefined && { image: imageUrl }),
        ...(link !== undefined && { link }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(isActive !== undefined && { isActive: isActive === true || isActive === 'true' })
      }
    });

    res.json({
      success: true,
      data: article,
      message: 'Home article updated successfully'
    });
  } catch (error) {
    logger.error('Update home article error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Home article not found' }
      });
    }
    next(error);
  }
};

/**
 * Delete Home Article
 */
export const deleteHomeArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await prisma.homeArticle.findUnique({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: { message: 'Home article not found' }
      });
    }

    // Delete image file
    if (article.image && !article.image.startsWith('http')) {
      try {
        const imagePath = path.join(__dirname, '../../uploads/home-articles', path.basename(article.image));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        logger.warn('Failed to delete image file:', err);
      }
    }

    await prisma.homeArticle.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Home article deleted successfully'
    });
  } catch (error) {
    logger.error('Delete home article error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Home article not found' }
      });
    }
    next(error);
  }
};


