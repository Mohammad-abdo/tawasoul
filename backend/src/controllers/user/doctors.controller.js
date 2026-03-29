import { logger } from '../../utils/logger.js';
import * as doctorsService from '../../services/user/doctors.service.js';

const handleError = (error, res, next, context) => {
  if (error.status) {
    return res.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.message }
    });
  }
  logger.error(`${context} error:`, error);
  next(error);
};

export const getAllDoctors = async (req, res, next) => {
  try {
    const data = await doctorsService.getAllDoctors(req.user?.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res, next, 'Get doctors');
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const data = await doctorsService.getDoctorById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res, next, 'Get doctor');
  }
};

export const getDoctorAvailableSlots = async (req, res, next) => {
  try {
    const data = await doctorsService.getDoctorAvailableSlots(req.params.id, req.query.date);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res, next, 'Get doctor available slots');
  }
};
