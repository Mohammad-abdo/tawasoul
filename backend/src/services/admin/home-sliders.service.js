import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as slidersRepo from '../../repositories/admin/home-sliders.repository.js';
import { createHttpError } from '../../utils/httpError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildImageUrl = (folder, file) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/uploads/${folder}/${file.filename}`;
};

const deleteImageIfLocal = (folder, image) => {
  if (!image || image.startsWith('http')) {
    return;
  }

  try {
    const imagePath = path.join(__dirname, `../../uploads/${folder}`, path.basename(image));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } catch {
    // Best-effort cleanup only.
  }
};

export const getAllHomeSliders = ({ isActive }) => {
  const where = {};
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  return slidersRepo.findMany(where);
};

export const getHomeSliderById = async (id) => {
  const slider = await slidersRepo.findById(id);
  if (!slider) {
    throw createHttpError(404, 'HOME_SLIDER_NOT_FOUND', 'Home slider not found');
  }
  return slider;
};

export const createHomeSlider = async (body, file) => {
  let imageUrl = body.image;
  if (file) {
    imageUrl = buildImageUrl('home-sliders', file);
  }

  if (!imageUrl) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Image is required');
  }

  let nextOrder = 1;
  try {
    const maxOrder = await slidersRepo.aggregateMaxOrder();
    nextOrder = (maxOrder?._max?.order != null ? maxOrder._max.order : 0) + 1;
  } catch {
    nextOrder = (await slidersRepo.count()) + 1;
  }

  return slidersRepo.createSlider({
    titleAr: body.titleAr,
    titleEn: body.titleEn,
    descriptionAr: body.descriptionAr,
    descriptionEn: body.descriptionEn,
    image: imageUrl,
    buttonText: body.buttonText,
    buttonLink: body.buttonLink,
    order: body.order !== undefined ? parseInt(body.order) : nextOrder,
    isActive: body.isActive !== undefined ? (body.isActive === true || body.isActive === 'true') : true
  });
};

export const updateHomeSlider = async (id, body, file) => {
  const existingItem = await slidersRepo.findById(id);
  if (!existingItem) {
    throw createHttpError(404, 'HOME_SLIDER_NOT_FOUND', 'Home slider not found');
  }

  let imageUrl = body.image;
  if (file) {
    imageUrl = buildImageUrl('home-sliders', file);
    deleteImageIfLocal('home-sliders', existingItem.image);
  } else if (body.image === undefined) {
    imageUrl = existingItem.image;
  }

  return slidersRepo.updateSlider(id, {
    ...(body.titleAr !== undefined && { titleAr: body.titleAr }),
    ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
    ...(body.descriptionAr !== undefined && { descriptionAr: body.descriptionAr }),
    ...(body.descriptionEn !== undefined && { descriptionEn: body.descriptionEn }),
    ...(imageUrl !== undefined && { image: imageUrl }),
    ...(body.buttonText !== undefined && { buttonText: body.buttonText }),
    ...(body.buttonLink !== undefined && { buttonLink: body.buttonLink }),
    ...(body.order !== undefined && { order: body.order }),
    ...(body.isActive !== undefined && { isActive: body.isActive })
  });
};

export const deleteHomeSlider = async (id) => {
  const slider = await slidersRepo.findById(id);
  if (!slider) {
    throw createHttpError(404, 'HOME_SLIDER_NOT_FOUND', 'Home slider not found');
  }

  deleteImageIfLocal('home-sliders', slider.image);
  await slidersRepo.deleteSlider(id);
};

export const reorderHomeSliders = async ({ items }) => {
  await Promise.all(
    items.map(({ id, order }) => slidersRepo.updateSlider(id, { order }))
  );
};
