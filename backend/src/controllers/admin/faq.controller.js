import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All FAQs
 */
export const getAllFAQs = async (req, res, next) => {
  try {
    const { isActive, category } = req.query;

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (category) {
      where.category = category;
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    logger.error('Get FAQs error:', error);
    next(error);
  }
};

/**
 * Get FAQ by ID
 */
export const getFAQById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faq = await prisma.fAQ.findUnique({
      where: { id }
    });

    if (!faq) {
      return res.status(404).json({
        success: false,
        error: { message: 'FAQ not found' }
      });
    }

    res.json({
      success: true,
      data: faq
    });
  } catch (error) {
    logger.error('Get FAQ by id error:', error);
    next(error);
  }
};

/**
 * Create FAQ
 */
export const createFAQ = async (req, res, next) => {
  try {
    const { questionAr, questionEn, answerAr, answerEn, category, order, isActive } = req.body;

    // Get max order with defensive null handling
    let nextOrder = 1;
    try {
      const maxOrder = await prisma.fAQ.aggregate({
        _max: { order: true }
      });
      nextOrder = (maxOrder?._max?.order != null ? maxOrder._max.order : 0) + 1;
    } catch (aggregateError) {
      logger.warn('Failed to get max order, using default:', aggregateError);
      const count = await prisma.fAQ.count();
      nextOrder = count + 1;
    }

    const faq = await prisma.fAQ.create({
      data: {
        questionAr,
        questionEn,
        answerAr,
        answerEn,
        category,
        order: order !== undefined ? parseInt(order) : nextOrder,
        isActive: isActive !== undefined ? (isActive === true || isActive === 'true') : true
      }
    });

    res.status(201).json({
      success: true,
      data: faq,
      message: 'FAQ created successfully'
    });
  } catch (error) {
    logger.error('Create FAQ error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Request body:', req.body);
    next(error);
  }
};

/**
 * Update FAQ
 */
export const updateFAQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionAr, questionEn, answerAr, answerEn, category, order, isActive } = req.body;

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        ...(questionAr !== undefined && { questionAr }),
        ...(questionEn !== undefined && { questionEn }),
        ...(answerAr !== undefined && { answerAr }),
        ...(answerEn !== undefined && { answerEn }),
        ...(category !== undefined && { category }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(isActive !== undefined && { isActive: isActive === true || isActive === 'true' })
      }
    });

    res.json({
      success: true,
      data: faq,
      message: 'FAQ updated successfully'
    });
  } catch (error) {
    logger.error('Update FAQ error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'FAQ not found' }
      });
    }
    next(error);
  }
};

/**
 * Delete FAQ
 */
export const deleteFAQ = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.fAQ.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    logger.error('Delete FAQ error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { message: 'FAQ not found' }
      });
    }
    next(error);
  }
};


