import { validationResult } from 'express-validator';
import { logger } from '../../utils/logger.js';
import * as walletService from '../../services/admin/wallet.service.js';

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return false;
  }

  res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: errors.array()[0].msg
    }
  });

  return true;
};

const handleServiceError = (res, error) => {
  if (!error.status) {
    return false;
  }

  res.status(error.status).json({
    success: false,
    error: {
      code: error.code,
      message: error.message
    }
  });

  return true;
};

export const getWithdrawalRequests = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const data = await walletService.getWithdrawalRequests(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }

    logger.error('Get wallet withdrawal requests error:', error);
    next(error);
  }
};

export const resolveWithdrawalRequest = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const data = await walletService.resolveWithdrawalRequest(req.params.id, req.body);
    res.json({
      success: true,
      data,
      message: `Withdrawal request ${req.body.status === 'APPROVED' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    if (handleServiceError(res, error)) {
      return;
    }

    logger.error('Resolve wallet withdrawal request error:', error);
    next(error);
  }
};
