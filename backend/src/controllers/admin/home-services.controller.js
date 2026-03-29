import { logger } from '../../utils/logger.js';
import * as homeServicesService from '../../services/admin/home-services.service.js';

const handleServiceError = (res, error) => {
  if (!error.status) return false;
  res.status(error.status).json({
    success: false,
    error: { code: error.code, message: error.message }
  });
  return true;
};

export const getAllHomeServices = async (req, res, next) => {
  try {
    const data = await homeServicesService.getAllHomeServices(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get home services error:', error);
    next(error);
  }
};

export const getHomeServiceById = async (req, res, next) => {
  try {
    const data = await homeServicesService.getHomeServiceById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get home service by id error:', error);
    next(error);
  }
};

export const createHomeService = async (req, res, next) => {
  try {
    const data = await homeServicesService.createHomeService(req.body, req.file);
    res.status(201).json({
      success: true,
      data,
      message: 'Home service created successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Create home service error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Request body:', req.body);
    next(error);
  }
};

export const updateHomeService = async (req, res, next) => {
  try {
    const data = await homeServicesService.updateHomeService(req.params.id, req.body, req.file);
    res.json({
      success: true,
      data,
      message: 'Home service updated successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Update home service error:', error);
    next(error);
  }
};

export const deleteHomeService = async (req, res, next) => {
  try {
    await homeServicesService.deleteHomeService(req.params.id);
    res.json({
      success: true,
      message: 'Home service deleted successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Delete home service error:', error);
    next(error);
  }
};
