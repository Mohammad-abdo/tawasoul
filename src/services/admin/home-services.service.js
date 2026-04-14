import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as servicesRepo from '../../repositories/admin/home-services.repository.js';
import { createHttpError } from '../../utils/httpError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildImageUrl = (file) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/uploads/home-services/${file.filename}`;
};

const deleteImageIfLocal = (image) => {
  if (!image || image.startsWith('http')) return;
  try {
    const imagePath = path.join(__dirname, '../../uploads/home-services', path.basename(image));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } catch {
    // Best-effort cleanup only.
  }
};

export const getAllHomeServices = ({ isActive }) => {
  const where = {};
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  return servicesRepo.findMany(where);
};

export const getHomeServiceById = async (id) => {
  const service = await servicesRepo.findById(id);
  if (!service) {
    throw createHttpError(404, 'HOME_SERVICE_NOT_FOUND', 'Home service not found');
  }
  return service;
};

export const createHomeService = async (body, file) => {
  let imageUrl = body.image;
  if (file) {
    imageUrl = buildImageUrl(file);
  }
  if (!imageUrl) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Image is required');
  }

  let nextOrder = 1;
  try {
    const maxOrder = await servicesRepo.aggregateMaxOrder();
    nextOrder = (maxOrder?._max?.order != null ? maxOrder._max.order : 0) + 1;
  } catch {
    nextOrder = (await servicesRepo.count()) + 1;
  }

  return servicesRepo.createService({
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

export const updateHomeService = async (id, body, file) => {
  const existingItem = await servicesRepo.findById(id);
  if (!existingItem) {
    throw createHttpError(404, 'HOME_SERVICE_NOT_FOUND', 'Home service not found');
  }

  let imageUrl = body.image;
  if (file) {
    imageUrl = buildImageUrl(file);
    deleteImageIfLocal(existingItem.image);
  } else if (body.image === undefined) {
    imageUrl = existingItem.image;
  }

  return servicesRepo.updateService(id, {
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

export const deleteHomeService = async (id) => {
  const service = await servicesRepo.findById(id);
  if (!service) {
    throw createHttpError(404, 'HOME_SERVICE_NOT_FOUND', 'Home service not found');
  }

  deleteImageIfLocal(service.image);
  await servicesRepo.deleteService(id);
};
