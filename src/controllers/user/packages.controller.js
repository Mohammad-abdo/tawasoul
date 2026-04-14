import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get all available packages
 */
export const getPackages = async (req, res, next) => {
  try {
    const { featured } = req.query;

    const where = {
      isActive: true
    };

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const packages = await prisma.package.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { price: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: { packages }
    });
  } catch (error) {
    logger.error('Get packages error:', error);
    next(error);
  }
};

/**
 * Get package by ID
 */
export const getPackageById = async (req, res, next) => {
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
 * Get user's active package
 */
export const getActivePackage = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const activePackage = await prisma.userPackage.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date()
        }
      },
      include: {
        package: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!activePackage) {
      return res.json({
        success: true,
        data: {
          hasActivePackage: false,
          activePackage: null
        }
      });
    }

    // Calculate remaining sessions
    const sessionsRemaining = activePackage.package.sessionsCount - activePackage.sessionsUsed;

    res.json({
      success: true,
      data: {
        hasActivePackage: true,
        activePackage: {
          id: activePackage.id,
          package: {
            id: activePackage.package.id,
            name: activePackage.package.name,
            nameAr: activePackage.package.nameAr,
            sessionsCount: activePackage.package.sessionsCount,
            content: activePackage.package.content
          },
          status: activePackage.status,
          sessionsUsed: activePackage.sessionsUsed,
          sessionsRemaining: sessionsRemaining,
          startDate: activePackage.startDate,
          endDate: activePackage.endDate,
          createdAt: activePackage.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Get active package error:', error);
    next(error);
  }
};

/**
 * Get user's all packages (active and expired)
 */
export const getUserPackages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const userPackages = await prisma.userPackage.findMany({
      where,
      include: {
        package: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format response
    const formattedPackages = userPackages.map(up => ({
      id: up.id,
      package: {
        id: up.package.id,
        name: up.package.name,
        nameAr: up.package.nameAr,
        sessionsCount: up.package.sessionsCount,
        durationMonths: up.package.durationMonths,
        content: up.package.content
      },
      status: up.status,
      sessionsUsed: up.sessionsUsed,
      sessionsRemaining: up.package.sessionsCount - up.sessionsUsed,
      startDate: up.startDate,
      endDate: up.endDate,
      createdAt: up.createdAt
    }));

    res.json({
      success: true,
      data: { packages: formattedPackages }
    });
  } catch (error) {
    logger.error('Get user packages error:', error);
    next(error);
  }
};

/**
 * Purchase/Activate a package
 */
export const purchasePackage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Package ID is required'
        }
      });
    }

    // Check if package exists
    const packageData = await prisma.package.findUnique({
      where: { id: packageId }
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

    if (!packageData.isActive) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PACKAGE_INACTIVE',
          message: 'Package is not active'
        }
      });
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + packageData.durationMonths);

    // Create user package
    const userPackage = await prisma.userPackage.create({
      data: {
        userId,
        packageId,
        status: 'ACTIVE',
        sessionsUsed: 0,
        sessionsRemaining: packageData.sessionsCount,
        startDate,
        endDate
      },
      include: {
        package: true
      }
    });

    logger.info(`Package purchased: ${packageId} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        id: userPackage.id,
        package: userPackage.package,
        status: userPackage.status,
        sessionsUsed: userPackage.sessionsUsed,
        sessionsRemaining: userPackage.sessionsRemaining,
        startDate: userPackage.startDate,
        endDate: userPackage.endDate,
        message: 'Package activated successfully'
      }
    });
  } catch (error) {
    logger.error('Purchase package error:', error);
    next(error);
  }
};

