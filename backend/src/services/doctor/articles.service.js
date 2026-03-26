import * as articlesRepo from '../../repositories/doctor/articles.repository.js';
import { createHttpError } from '../../utils/httpError.js';

export const getDoctorArticles = async (doctorId, { page = 1, limit = 20 }) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  const [articles, total] = await Promise.all([
    articlesRepo.findManyByDoctor({ doctorId, skip, take: parsedLimit }),
    articlesRepo.countByDoctor(doctorId)
  ]);

  return {
    articles,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

export const createArticle = async (doctorId, { title, content, excerpt }) => {
  if (!title || !content) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Title and content are required');
  }

  return articlesRepo.createArticle({
    title: title.trim(),
    content: content.trim(),
    excerpt: excerpt ? excerpt.trim() : null,
    authorId: doctorId
  });
};

export const updateArticle = async (doctorId, id, { title, content, excerpt }) => {
  const article = await articlesRepo.findById(id);
  if (!article) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', 'Article not found');
  }
  if (article.authorId !== doctorId) {
    throw createHttpError(403, 'FORBIDDEN', 'You can only update your own articles');
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title.trim();
  if (content !== undefined) updateData.content = content.trim();
  if (excerpt !== undefined) updateData.excerpt = excerpt ? excerpt.trim() : null;

  return articlesRepo.updateArticle(id, updateData);
};

export const deleteArticle = async (doctorId, id) => {
  const article = await articlesRepo.findById(id);
  if (!article) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', 'Article not found');
  }
  if (article.authorId !== doctorId) {
    throw createHttpError(403, 'FORBIDDEN', 'You can only delete your own articles');
  }

  await articlesRepo.deleteArticle(id);
};
