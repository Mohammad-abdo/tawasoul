import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get All Home Services
 */
export const getAllHomeServices = async (req, res, next) => {
  try {
    const { isActive } = req.query;

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const services = await prisma.homeService.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    logger.error('Get home services error:', error);
    next(error);
  }
};

/**
 * Get Home Service by ID
 */
export const getHomeServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await prisma.homeService.findUnique({
      where: { id }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: { message: 'Home service not found' }
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    logger.error('Get home service by id error:', error);
    next(error);
  }
};

/**
 * Create Home Service
 */
export const createHomeService = async (req, res, next) => {
  try {
    const { titleAr, titleEn, descriptionAr, descriptionEn, image, link, order, isActive } = req.body;

    // Handle file upload
    let imageUrl = image; // Default to provided URL

    if (req.file) {
      // File was uploaded
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      imageUrl = `${baseUrl}/uploads/home-services/${req.file.filename}`;
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
      const maxOrder = await prisma.homeService.aggregate({
        _max: { order: true }
      });
      // Safely extract the max order value with multiple fallbacks
      nextOrder = (maxOrder?._max?.order != null ? maxOrder._max.order : 0) + 1;
    } catch (aggregateError) {
      logger.warn('Failed to get max order, using default:', aggregateError);
      const count = await prisma.homeService.count();
      nextOrder = count + 1;
    }

    const service = await prisma.homeService.create({
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
      data: service,
      message: 'Home service created successfully'
    });
  } catch (error) {
    logger.error('Create home service error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Request body:', req.body);
    next(error);
  }
};

/**
 * Update Home Service
 */
export const updateHomeService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titleAr, titleEn, descriptionAr, descriptionEn, image, link, order, isActive } = req.body;

    // Get existing item
    const existingItem = await prisma.homeService.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: { message: 'Home service not found' }
      });
    }

    // Handle file upload
    let imageUrl = image;

    if (req.file) {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      imageUrl = `${baseUrl}/uploads/home-services/${req.file.filename}`;

      // Delete old image
      if (existingItem.image && !existingItem.image.startsWith('http')) {
        try {
          const oldImagePath = path.join(__dirname, '../../uploads/home-services', path.basename(existingItem.image));
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

    const service = await prisma.homeService.update({
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
      data: service,
      message: 'Home service updated successfully'
    });
  } catch (error) {
    logger.error('Update home service error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Home service not found' }
      });
    }
    next(error);
  }
};

/**
 * Delete Home Service
 */
export const deleteHomeService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await prisma.homeService.findUnique({
      where: { id }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: { message: 'Home service not found' }
      });
    }

    // Delete image file
    if (service.image && !service.image.startsWith('http')) {
      try {
        const imagePath = path.join(__dirname, '../../uploads/home-services', path.basename(service.image));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        logger.warn('Failed to delete image file:', err);
      }
    }

    await prisma.homeService.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Home service deleted successfully'
    });
  } catch (error) {
    logger.error('Delete home service error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Home service not found' }
      });
    }
    next(error);
  }
};


