import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get Page by Type (Public)
 */
export const getPageByType = async (req, res, next) => {
  try {
    const { pageType } = req.params;

    // Validate page type
    const validPageTypes = [
      'PRIVACY_POLICY',
      'TERMS_AND_CONDITIONS',
      'ABOUT_APP',
      'COMMUNITY_GUIDELINES',
      'HELP_CENTER'
    ];

    if (!validPageTypes.includes(pageType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAGE_TYPE',
          message: 'Invalid page type'
        }
      });
    }

    const page = await prisma.pageContent.findUnique({
      where: { pageType },
      select: {
        id: true,
        pageType: true,
        titleAr: true,
        titleEn: true,
        contentAr: true,
        contentEn: true,
        updatedAt: true
      }
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAGE_NOT_FOUND',
          message: 'Page not found'
        }
      });
    }

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    logger.error('Get public page error:', error);
    next(error);
  }
};

/**
 * Get All Public Pages (List)
 */
export const getAllPages = async (req, res, next) => {
  try {
    const pages = await prisma.pageContent.findMany({
      where: {
        pageType: {
          in: ['PRIVACY_POLICY', 'TERMS_AND_CONDITIONS', 'ABOUT_APP', 'COMMUNITY_GUIDELINES', 'HELP_CENTER']
        }
      },
      select: {
        pageType: true,
        titleAr: true,
        titleEn: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: { pages }
    });
  } catch (error) {
    logger.error('Get all public pages error:', error);
    next(error);
  }
};

