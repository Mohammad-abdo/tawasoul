import { logger } from '../../utils/logger.js';
import * as faqService from '../../services/admin/faq.service.js';

const handleServiceError = (res, error) => {
  if (!error.status) {
    return false;
  }

  const payload = { success: false };
  if (error.code) {
    payload.error = { code: error.code, message: error.message };
  } else {
    payload.error = { message: error.message };
  }
  res.status(error.status).json(payload);
  return true;
};

export const getAllFAQs = async (req, res, next) => {
  try {
    const data = await faqService.getAllFAQs(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get FAQs error:', error);
    next(error);
  }
};

export const getFAQById = async (req, res, next) => {
  try {
    const data = await faqService.getFAQById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get FAQ by id error:', error);
    next(error);
  }
};

export const createFAQ = async (req, res, next) => {
  try {
    const data = await faqService.createFAQ(req.body);
    res.status(201).json({
      success: true,
      data,
      message: 'FAQ created successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Create FAQ error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Request body:', req.body);
    next(error);
  }
};

export const updateFAQ = async (req, res, next) => {
  try {
    const data = await faqService.updateFAQ(req.params.id, req.body);
    res.json({
      success: true,
      data,
      message: 'FAQ updated successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Update FAQ error:', error);
    next(error);
  }
};

export const deleteFAQ = async (req, res, next) => {
  try {
    await faqService.deleteFAQ(req.params.id);
    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Delete FAQ error:', error);
    next(error);
  }
};
