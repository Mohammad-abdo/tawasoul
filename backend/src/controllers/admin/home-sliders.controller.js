import { logger } from '../../utils/logger.js';
import * as slidersService from '../../services/admin/home-sliders.service.js';

const handleServiceError = (res, error) => {
  if (!error.status) return false;
  res.status(error.status).json({
    success: false,
    error: { code: error.code, message: error.message }
  });
  return true;
};

export const getAllHomeSliders = async (req, res, next) => {
  try {
    const data = await slidersService.getAllHomeSliders(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get home sliders error:', error);
    next(error);
  }
};

export const getHomeSliderById = async (req, res, next) => {
  try {
    const data = await slidersService.getHomeSliderById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get home slider by id error:', error);
    next(error);
  }
};

export const createHomeSlider = async (req, res, next) => {
  try {
    const data = await slidersService.createHomeSlider(req.body, req.file);
    res.status(201).json({
      success: true,
      data,
      message: 'Home slider created successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Create home slider error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Request body:', req.body);
    next(error);
  }
};

export const updateHomeSlider = async (req, res, next) => {
  try {
    const data = await slidersService.updateHomeSlider(req.params.id, req.body, req.file);
    res.json({
      success: true,
      data,
      message: 'Home slider updated successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Update home slider error:', error);
    next(error);
  }
};

export const deleteHomeSlider = async (req, res, next) => {
  try {
    await slidersService.deleteHomeSlider(req.params.id);
    res.json({
      success: true,
      message: 'Home slider deleted successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Delete home slider error:', error);
    next(error);
  }
};

export const reorderHomeSliders = async (req, res, next) => {
  try {
    await slidersService.reorderHomeSliders(req.body);
    res.json({
      success: true,
      message: 'Home sliders reordered successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Reorder home sliders error:', error);
    next(error);
  }
};
