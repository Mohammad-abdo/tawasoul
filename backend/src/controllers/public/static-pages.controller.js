import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get static page by type
 */
export const getStaticPage = async (req, res, next) => {
  try {
    const { pageType } = req.params;

    const page = await prisma.staticPage.findUnique({
      where: { pageType }
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

    if (!page.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAGE_INACTIVE',
          message: 'Page is not active'
        }
      });
    }

    res.json({
      success: true,
      data: { page }
    });
  } catch (error) {
    logger.error('Get static page error:', error);
    next(error);
  }
};

/**
 * Get onboarding slides (for mobile app)
 */
export const getOnboardingSlides = async (req, res, next) => {
  try {
    const { platform = 'MOBILE' } = req.query;

    const slides = await prisma.onboarding.findMany({
      where: {
        isActive: true,
        OR: [
          { platform: 'ALL' },
          { platform: platform.toUpperCase() }
        ]
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        image: true,
        title: true,        // English title
        titleAr: true,      // Arabic title
        description: true,  // English description
        descriptionAr: true, // Arabic description
        order: true
      }
    });

    // Format for mobile app
    const formattedSlides = slides.map(slide => ({
      id: slide.id,
      imageUrl: slide.image || '',
      title: slide.titleAr || slide.title || '', // Prefer Arabic, fallback to English
      description: slide.descriptionAr || slide.description || '',
      order: slide.order
    }));

    res.json({
      success: true,
      data: formattedSlides
    });
  } catch (error) {
    logger.error('Get onboarding slides error:', error);
    next(error);
  }
};

/**
 * Get all onboarding pages (legacy)
 */
export const getOnboardingPages = async (req, res, next) => {
  try {
    const { platform = 'MOBILE' } = req.query;

    const pages = await prisma.onboarding.findMany({
      where: {
        isActive: true,
        OR: [
          { platform: 'ALL' },
          { platform: platform.toUpperCase() }
        ]
      },
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      data: { pages }
    });
  } catch (error) {
    logger.error('Get onboarding pages error:', error);
    next(error);
  }
};

/**
 * Get home page 1
 */
export const getHomePage1 = async (req, res, next) => {
  try {
    const page = await prisma.staticPage.findUnique({
      where: { pageType: 'HOME_PAGE_1' }
    });

    if (!page || !page.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAGE_NOT_FOUND',
          message: 'Home page 1 not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        image: page.image,
        title: page.titleAr,
        titleEn: page.titleEn
      }
    });
  } catch (error) {
    logger.error('Get home page 1 error:', error);
    next(error);
  }
};

/**
 * Get home page 2
 */
export const getHomePage2 = async (req, res, next) => {
  try {
    const page = await prisma.staticPage.findUnique({
      where: { pageType: 'HOME_PAGE_2' }
    });

    if (!page || !page.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAGE_NOT_FOUND',
          message: 'Home page 2 not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        slider: page.sliderItems || [],
        title: page.titleAr,
        titleEn: page.titleEn,
        description: page.contentAr,
        descriptionEn: page.contentEn
      }
    });
  } catch (error) {
    logger.error('Get home page 2 error:', error);
    next(error);
  }
};

