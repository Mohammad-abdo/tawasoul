import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Packages (Admin)
 */
export const getAllPackages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isActive } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              userPackages: true
            }
          }
        }
      }),
      prisma.package.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        packages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get all packages error:', error);
    next(error);
  }
};

/**
 * Get Package by ID (Admin)
 */
export const getPackageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const packageData = await prisma.package.findUnique({
      where: { id },
      include: {
        userPackages: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                phone: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            userPackages: true
          }
        }
      }
    });

    if (!packageData) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PACKAGE_NOT_FOUND',
          message: 'Package not found'
        }
      });
    }

    res.json({
      success: true,
      data: { package: packageData }
    });
  } catch (error) {
    logger.error('Get package error:', error);
    next(error);
  }
};

/**
 * Create Package (Admin)
 */
export const createPackage = async (req, res, next) => {
  try {
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      price,
      sessionsCount,
      durationMonths,
      content,
      isActive = true,
      isFeatured = false
    } = req.body;

    // Validation
    if (!name || !nameAr || !price || !sessionsCount || !durationMonths) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, nameAr, price, sessionsCount, and durationMonths are required'
        }
      });
    }

    const packageData = await prisma.package.create({
      data: {
        name,
        nameAr,
        description: description || null,
        descriptionAr: descriptionAr || null,
        price: parseFloat(price),
        sessionsCount: parseInt(sessionsCount),
        durationMonths: parseInt(durationMonths),
        content: content || null,
        isActive,
        isFeatured
      }
    });

    logger.info(`Package created: ${packageData.id}`);

    res.status(201).json({
      success: true,
      data: { package: packageData }
    });
  } catch (error) {
    logger.error('Create package error:', error);
    next(error);
  }
};

/**
 * Update Package (Admin)
 */
export const updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      price,
      sessionsCount,
      durationMonths,
      content,
      isActive,
      isFeatured
    } = req.body;

    const packageData = await prisma.package.findUnique({
      where: { id }
    });

    if (!packageData) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PACKAGE_NOT_FOUND',
          message: 'Package not found'
        }
      });
    }

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(nameAr && { nameAr }),
        ...(description !== undefined && { description }),
        ...(descriptionAr !== undefined && { descriptionAr }),
        ...(price && { price: parseFloat(price) }),
        ...(sessionsCount && { sessionsCount: parseInt(sessionsCount) }),
        ...(durationMonths && { durationMonths: parseInt(durationMonths) }),
        ...(content !== undefined && { content }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured })
      }
    });

    logger.info(`Package updated: ${id}`);

    res.json({
      success: true,
      data: { package: updatedPackage }
    });
  } catch (error) {
    logger.error('Update package error:', error);
    next(error);
  }
};

/**
 * Delete Package (Admin)
 */
export const deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const packageData = await prisma.package.findUnique({
      where: { id }
    });

    if (!packageData) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PACKAGE_NOT_FOUND',
          message: 'Package not found'
        }
      });
    }

    await prisma.package.delete({
      where: { id }
    });

    logger.info(`Package deleted: ${id}`);

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    logger.error('Delete package error:', error);
    next(error);
  }
};

/**
 * Activate Package (Admin)
 */
export const activatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const packageData = await prisma.package.update({
      where: { id },
      data: { isActive: true }
    });

    logger.info(`Package activated: ${id}`);

    res.json({
      success: true,
      data: { package: packageData }
    });
  } catch (error) {
    logger.error('Activate package error:', error);
    next(error);
  }
};

/**
 * Deactivate Package (Admin)
 */
export const deactivatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const packageData = await prisma.package.update({
      where: { id },
      data: { isActive: false }
    });

    logger.info(`Package deactivated: ${id}`);

    res.json({
      success: true,
      data: { package: packageData }
    });
  } catch (error) {
    logger.error('Deactivate package error:', error);
    next(error);
  }
};

