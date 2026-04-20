import { logger } from '../../utils/logger.js';
import * as addressService from '../../services/user/address.service.js';

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

export const getUserAddresses = async (req, res, next) => {
  try {
    const data = await addressService.getUserAddresses(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res, next, 'Get user addresses');
  }
};

export const getAddressById = async (req, res, next) => {
  try {
    const address = await addressService.getAddressById(req.user.id, req.params.id);
    res.json({ success: true, data: { address } });
  } catch (error) {
    handleError(error, res, next, 'Get address by id');
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const address = await addressService.createAddress(req.user.id, req.body);
    logger.info(`Address created: ${address.id} by user ${req.user.id}`);
    res.status(201).json({ success: true, data: { address } });
  } catch (error) {
    handleError(error, res, next, 'Create address');
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const address = await addressService.updateAddress(req.user.id, req.params.id, req.body);
    logger.info(`Address updated: ${req.params.id} by user ${req.user.id}`);
    res.json({ success: true, data: { address } });
  } catch (error) {
    handleError(error, res, next, 'Update address');
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    await addressService.deleteAddress(req.user.id, req.params.id);
    logger.info(`Address deleted: ${req.params.id} by user ${req.user.id}`);
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    handleError(error, res, next, 'Delete address');
  }
};