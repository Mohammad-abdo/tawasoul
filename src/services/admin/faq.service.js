import * as faqRepo from '../../repositories/admin/faq.repository.js';
import { createHttpError } from '../../utils/httpError.js';

export const getAllFAQs = async ({ isActive, category }) => {
  const where = {};
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  if (category) {
    where.category = category;
  }

  return faqRepo.findMany(where);
};

export const getFAQById = async (id) => {
  const faq = await faqRepo.findById(id);
  if (!faq) {
    throw createHttpError(404, 'FAQ_NOT_FOUND', 'FAQ not found');
  }
  return faq;
};

export const createFAQ = async ({ questionAr, questionEn, answerAr, answerEn, category, order, isActive }) => {
  let nextOrder = 1;
  try {
    const maxOrder = await faqRepo.aggregateMaxOrder();
    nextOrder = (maxOrder?._max?.order != null ? maxOrder._max.order : 0) + 1;
  } catch {
    const count = await faqRepo.count();
    nextOrder = count + 1;
  }

  return faqRepo.createFaq({
    questionAr,
    questionEn,
    answerAr,
    answerEn,
    category,
    order: order !== undefined ? parseInt(order) : nextOrder,
    isActive: isActive !== undefined ? (isActive === true || isActive === 'true') : true
  });
};

export const updateFAQ = async (id, { questionAr, questionEn, answerAr, answerEn, category, order, isActive }) => {
  try {
    return await faqRepo.updateFaq(id, {
      ...(questionAr !== undefined && { questionAr }),
      ...(questionEn !== undefined && { questionEn }),
      ...(answerAr !== undefined && { answerAr }),
      ...(answerEn !== undefined && { answerEn }),
      ...(category !== undefined && { category }),
      ...(order !== undefined && { order: parseInt(order) }),
      ...(isActive !== undefined && { isActive: isActive === true || isActive === 'true' })
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw createHttpError(404, 'FAQ_NOT_FOUND', 'FAQ not found');
    }
    throw error;
  }
};

export const deleteFAQ = async (id) => {
  try {
    await faqRepo.deleteFaq(id);
  } catch (error) {
    if (error.code === 'P2025') {
      throw createHttpError(404, 'FAQ_NOT_FOUND', 'FAQ not found');
    }
    throw error;
  }
};
