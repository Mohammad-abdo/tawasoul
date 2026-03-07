import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { getFileUrl } from '../../middleware/upload.middleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get All Home Sliders
 */
export const getAllHomeSliders = async (req, res, next) => {
  try {
    const { isActive } = req.query;

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const sliders = await prisma.homeSlider.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      data: sliders
    });
  } catch (error) {
    logger.error('Get home sliders error:', error);
    next(error);
  }
};

/**
 * Get Home Slider by ID
 */
export const getHomeSliderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const slider = await prisma.homeSlider.findUnique({
      where: { id }
    });

    if (!slider) {
      return res.status(404).json({
        success: false,
        error: { message: 'Home slider not found' }
      });
    }

    res.json({
      success: true,
      data: slider
    });
  } catch (error) {
    logger.error('Get home slider by id error:', error);
    next(error);
  }
};

/**
 * Create Home Slider
 */
export const createHomeSlider = async (req, res, next) => {
  try {
    const { titleAr, titleEn, descriptionAr, descriptionEn, buttonText, buttonLink, order, isActive } = req.body;

    // Handle file upload
    let imageUrl = req.body.image; // Default to provided URL

    if (req.file) {
      // File was uploaded
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      imageUrl = `${baseUrl}/uploads/home-sliders/${req.file.filename}`;
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
      const maxOrder = await prisma.homeSlider.aggregate({
        _max: { order: true }
      });
      // Safely extract the max order value with multiple fallbacks
      nextOrder = (maxOrder?._max?.order != null ? maxOrder._max.order : 0) + 1;
    } catch (aggregateError) {
      logger.warn('Failed to get max order, using default:', aggregateError);
      // If aggregate fails, count existing records and add 1
      const count = await prisma.homeSlider.count();
      nextOrder = count + 1;
    }

    const slider = await prisma.homeSlider.create({
      data: {
        titleAr,
        titleEn,
        descriptionAr,
        descriptionEn,
        image: imageUrl,
        buttonText,
        buttonLink,
        order: order !== undefined ? parseInt(order) : nextOrder,
        isActive: isActive !== undefined ? (isActive === true || isActive === 'true') : true
      }
    });

    res.status(201).json({
      success: true,
      data: slider,
      message: 'Home slider created successfully'
    });
  } catch (error) {
    logger.error('Create home slider error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Request body:', req.body);
    next(error);
  }
};

/**
 * Update Home Slider
 */
export const updateHomeSlider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titleAr, titleEn, descriptionAr, descriptionEn, image, buttonText, buttonLink, order, isActive } = req.body;

    // Get existing item to delete old image if new one is uploaded
    const existingItem = await prisma.homeSlider.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: { message: 'Home slider not found' }
      });
    }

    // Handle file upload
    let imageUrl = image; // Default to provided URL or existing image

    if (req.file) {
      // New file was uploaded
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      imageUrl = `${baseUrl}/uploads/home-sliders/${req.file.filename}`;

      // Delete old image file if it exists and is not a URL
      if (existingItem.image && !existingItem.image.startsWith('http')) {
        try {
          const oldImagePath = path.join(__dirname, '../../uploads/home-sliders', path.basename(existingItem.image));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          logger.warn('Failed to delete old image:', err);
        }
      }
    } else if (image === undefined) {
      // No image provided, keep existing
      imageUrl = existingItem.image;
    }

    const slider = await prisma.homeSlider.update({
      where: { id },
      data: {
        ...(titleAr !== undefined && { titleAr }),
        ...(titleEn !== undefined && { titleEn }),
        ...(descriptionAr !== undefined && { descriptionAr }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(imageUrl !== undefined && { image: imageUrl }),
        ...(buttonText !== undefined && { buttonText }),
        ...(buttonLink !== undefined && { buttonLink }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      data: slider,
      message: 'Home slider updated successfully'
    });
  } catch (error) {
    logger.error('Update home slider error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Home slider not found' }
      });
    }
    next(error);
  }
};

/**
 * Delete Home Slider
 */
export const deleteHomeSlider = async (req, res, next) => {
  try {
    const { id } = req.params;

    const slider = await prisma.homeSlider.findUnique({
      where: { id }
    });

    if (!slider) {
      return res.status(404).json({
        success: false,
        error: { message: 'Home slider not found' }
      });
    }

    // Delete image file if it exists and is not a URL
    if (slider.image && !slider.image.startsWith('http')) {
      try {
        const imagePath = path.join(__dirname, '../../uploads/home-sliders', path.basename(slider.image));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        logger.warn('Failed to delete image file:', err);
      }
    }

    await prisma.homeSlider.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Home slider deleted successfully'
    });
  } catch (error) {
    logger.error('Delete home slider error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Home slider not found' }
      });
    }
    next(error);
  }
};

/**
 * Reorder Home Sliders
 */
export const reorderHomeSliders = async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { id, order }

    const updates = items.map(({ id, order }) =>
      prisma.homeSlider.update({
        where: { id },
        data: { order }
      })
    );

    await Promise.all(updates);

    res.json({
      success: true,
      message: 'Home sliders reordered successfully'
    });
  } catch (error) {
    logger.error('Reorder home sliders error:', error);
    next(error);
  }
};


