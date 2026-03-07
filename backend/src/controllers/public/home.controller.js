import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get Home Page Data (Sliders, Services, Articles)
 */
export const getHomePageData = async (req, res, next) => {
  try {
    // Get active sliders
    const sliders = await prisma.homeSlider.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        descriptionAr: true,
        descriptionEn: true,
        image: true,
        buttonText: true,
        buttonLink: true,
      }
    });

    // Get active services
    const services = await prisma.homeService.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        descriptionAr: true,
        descriptionEn: true,
        image: true,
        link: true,
      }
    });

    // Get active articles
    const articles = await prisma.homeArticle.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        descriptionAr: true,
        descriptionEn: true,
        image: true,
        link: true,
      }
    });

    res.json({
      success: true,
      data: {
        sliders: sliders.map(s => ({
          id: s.id,
          title: s.titleAr || s.titleEn || '',
          description: s.descriptionAr || s.descriptionEn || '',
          imageUrl: s.image,
          buttonText: s.buttonText,
          buttonLink: s.buttonLink,
        })),
        services: services.map(s => ({
          id: s.id,
          title: s.titleAr || s.titleEn || '',
          description: s.descriptionAr || s.descriptionEn || '',
          imageUrl: s.image,
          link: s.link,
        })),
        articles: articles.map(a => ({
          id: a.id,
          title: a.titleAr || a.titleEn || '',
          description: a.descriptionAr || a.descriptionEn || '',
          imageUrl: a.image,
          link: a.link,
        })),
      }
    });
  } catch (error) {
    logger.error('Get home page data error:', error);
    next(error);
  }
};

/**
 * Get FAQs (Public)
 */
export const getFAQs = async (req, res, next) => {
  try {
    const { category } = req.query;

    const where = { isActive: true };
    if (category) {
      where.category = category;
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: { order: 'asc' },
      select: {
        id: true,
        questionAr: true,
        questionEn: true,
        answerAr: true,
        answerEn: true,
        category: true,
      }
    });

    res.json({
      success: true,
      data: faqs.map(faq => ({
        id: faq.id,
        question: faq.questionAr || faq.questionEn || '',
        answer: faq.answerAr || faq.answerEn || '',
        category: faq.category,
      }))
    });
  } catch (error) {
    logger.error('Get FAQs error:', error);
    next(error);
  }
};


