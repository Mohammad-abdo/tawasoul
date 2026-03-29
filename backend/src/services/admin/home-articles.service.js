import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as articlesRepo from '../../repositories/admin/home-articles.repository.js';
import { createHttpError } from '../../utils/httpError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildImageUrl = (file) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/uploads/home-articles/${file.filename}`;
};

const deleteImageIfLocal = (image) => {
  if (!image || image.startsWith('http')) return;
  try {
    const imagePath = path.join(__dirname, '../../uploads/home-articles', path.basename(image));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } catch {
    // Best-effort cleanup only.
  }
};

export const getAllHomeArticles = ({ isActive }) => {
  const where = {};
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  return articlesRepo.findMany(where);
};

export const getHomeArticleById = async (id) => {
  const article = await articlesRepo.findById(id);
  if (!article) {
    throw createHttpError(404, 'HOME_ARTICLE_NOT_FOUND', 'Home article not found');
  }
  return article;
};

export const createHomeArticle = async (body, file) => {
  let imageUrl = body.image;
  if (file) {
    imageUrl = buildImageUrl(file);
  }
  if (!imageUrl) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Image is required');
  }

  let nextOrder = 1;
  try {
    const maxOrder = await articlesRepo.aggregateMaxOrder();
    nextOrder = (maxOrder?._max?.order != null ? maxOrder._max.order : 0) + 1;
  } catch {
    nextOrder = (await articlesRepo.count()) + 1;
  }

  return articlesRepo.createArticle({
    titleAr: body.titleAr,
    titleEn: body.titleEn,
    descriptionAr: body.descriptionAr,
    descriptionEn: body.descriptionEn,
    image: imageUrl,
    link: body.link,
    order: body.order !== undefined ? parseInt(body.order) : nextOrder,
    isActive: body.isActive !== undefined ? (body.isActive === true || body.isActive === 'true') : true
  });
};

export const updateHomeArticle = async (id, body, file) => {
  const existingItem = await articlesRepo.findById(id);
  if (!existingItem) {
    throw createHttpError(404, 'HOME_ARTICLE_NOT_FOUND', 'Home article not found');
  }

  let imageUrl = body.image;
  if (file) {
    imageUrl = buildImageUrl(file);
    deleteImageIfLocal(existingItem.image);
  } else if (body.image === undefined) {
    imageUrl = existingItem.image;
  }

  return articlesRepo.updateArticle(id, {
    ...(body.titleAr !== undefined && { titleAr: body.titleAr }),
    ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
    ...(body.descriptionAr !== undefined && { descriptionAr: body.descriptionAr }),
    ...(body.descriptionEn !== undefined && { descriptionEn: body.descriptionEn }),
    ...(imageUrl !== undefined && { image: imageUrl }),
    ...(body.link !== undefined && { link: body.link }),
    ...(body.order !== undefined && { order: parseInt(body.order) }),
    ...(body.isActive !== undefined && { isActive: body.isActive === true || body.isActive === 'true' })
  });
};

export const deleteHomeArticle = async (id) => {
  const article = await articlesRepo.findById(id);
  if (!article) {
    throw createHttpError(404, 'HOME_ARTICLE_NOT_FOUND', 'Home article not found');
  }

  deleteImageIfLocal(article.image);
  await articlesRepo.deleteArticle(id);
};
