import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { getFileUrl } from '../../middleware/upload.middleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get All Onboarding Items
 */
export const getAllOnboarding = async (req, res, next) => {
  try {
    const { platform, isActive } = req.query;

    const where = {};
    if (platform) {
      where.platform = platform === 'ALL' ? { in: ['ALL', 'MOBILE', 'WEB'] } : platform;
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const onboarding = await prisma.onboarding.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      data: onboarding
    });
  } catch (error) {
    logger.error('Get onboarding error:', error);
    next(error);
  }
};

/**
 * Get Onboarding by ID
 */
export const getOnboardingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const onboarding = await prisma.onboarding.findUnique({
      where: { id }
    });

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        error: { message: 'Onboarding item not found' }
      });
    }

    res.json({
      success: true,
      data: onboarding
    });
  } catch (error) {
    logger.error('Get onboarding by id error:', error);
    next(error);
  }
};

/**
 * Create Onboarding Item
 */
export const createOnboarding = async (req, res, next) => {
  try {
    const { title, titleAr, description, descriptionAr, image, order, isActive, platform } = req.body;

    // Handle file upload
    let imageUrl = image; // Default to provided URL
    
    if (req.file) {
      // File was uploaded
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      imageUrl = `${baseUrl}/uploads/onboarding/${req.file.filename}`;
    }

    // Get max order
    const maxOrder = await prisma.onboarding.aggregate({
      _max: { order: true }
    });

    // Parse order and isActive from FormData
    const parsedOrder = order !== undefined ? parseInt(order) : (maxOrder._max.order || 0) + 1;
    const parsedIsActive = isActive !== undefined 
      ? (isActive === true || isActive === 'true' || isActive === 'on') 
      : true;

    const onboarding = await prisma.onboarding.create({
      data: {
        title: title || '',
        titleAr: titleAr || '',
        description: description || null,
        descriptionAr: descriptionAr || null,
        image: imageUrl || null,
        order: parsedOrder,
        isActive: parsedIsActive,
        platform: platform || 'ALL'
      }
    });

    res.status(201).json({
      success: true,
      data: onboarding,
      message: 'Onboarding item created successfully'
    });
  } catch (error) {
    logger.error('Create onboarding error:', error);
    next(error);
  }
};

/**
 * Update Onboarding Item
 */
export const updateOnboarding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, titleAr, description, descriptionAr, image, order, isActive, platform } = req.body;

    // Get existing item to delete old image if new one is uploaded
    const existingItem = await prisma.onboarding.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: { message: 'Onboarding item not found' }
      });
    }

    // Handle file upload
    let imageUrl = existingItem.image; // Default to existing image
    
    if (req.file) {
      // New file was uploaded
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      imageUrl = `${baseUrl}/uploads/onboarding/${req.file.filename}`;
      
      // Delete old image file if it exists and is not a URL
      if (existingItem.image && !existingItem.image.startsWith('http')) {
        try {
          const oldImagePath = path.join(__dirname, '../../uploads/onboarding', path.basename(existingItem.image));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          logger.warn('Failed to delete old image:', err);
        }
      }
    } else if (image !== undefined && image !== null && image !== '') {
      // Image URL provided in form (not a file upload)
      imageUrl = image;
    }
    // If image is undefined, null, or empty string, keep existing image (already set above)

    // Build update data object
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (titleAr !== undefined) updateData.titleAr = titleAr;
    if (description !== undefined) updateData.description = description;
    if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr;
    if (imageUrl !== undefined && imageUrl !== null && imageUrl !== '') updateData.image = imageUrl;
    if (order !== undefined) updateData.order = parseInt(order);
    if (isActive !== undefined) {
      // Handle string 'true'/'false' from FormData
      updateData.isActive = isActive === true || isActive === 'true' || isActive === 'on';
    }
    if (platform !== undefined) updateData.platform = platform;

    const onboarding = await prisma.onboarding.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: onboarding,
      message: 'Onboarding item updated successfully'
    });
  } catch (error) {
    logger.error('Update onboarding error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Onboarding item not found' }
      });
    }
    next(error);
  }
};

/**
 * Delete Onboarding Item
 */
export const deleteOnboarding = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.onboarding.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Onboarding item deleted successfully'
    });
  } catch (error) {
    logger.error('Delete onboarding error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'Onboarding item not found' }
      });
    }
    next(error);
  }
};

/**
 * Reorder Onboarding Items
 */
export const reorderOnboarding = async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { id, order }

    const updates = items.map(({ id, order }) =>
      prisma.onboarding.update({
        where: { id },
        data: { order }
      })
    );

    await Promise.all(updates);

    res.json({
      success: true,
      message: 'Onboarding items reordered successfully'
    });
  } catch (error) {
    logger.error('Reorder onboarding error:', error);
    next(error);
  }
};

