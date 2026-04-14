import { logger } from '../../utils/logger.js';
import * as withdrawalsService from '../../services/admin/withdrawals.service.js';

const handleServiceError = (res, error) => {
  if (!error.status) return false;
  res.status(error.status).json({
    success: false,
    error: { code: error.code, message: error.message }
  });
  return true;
};

export const getAllWithdrawals = async (req, res, next) => {
  try {
    const data = await withdrawalsService.getAllWithdrawals(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get withdrawals error:', error);
    next(error);
  }
};

export const getWithdrawalById = async (req, res, next) => {
  try {
    const data = await withdrawalsService.getWithdrawalById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Get withdrawal by ID error:', error);
    next(error);
  }
};

export const approveWithdrawal = async (req, res, next) => {
  try {
    const data = await withdrawalsService.approveWithdrawal(req.params.id, req.body, {
      adminId: req.admin.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    res.json({
      success: true,
      data,
      message: 'Withdrawal approved successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Approve withdrawal error:', error);
    next(error);
  }
};

export const rejectWithdrawal = async (req, res, next) => {
  try {
    const data = await withdrawalsService.rejectWithdrawal(req.params.id, req.body, {
      adminId: req.admin.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    res.json({
      success: true,
      data,
      message: 'Withdrawal rejected successfully'
    });
  } catch (error) {
    if (handleServiceError(res, error)) return;
    logger.error('Reject withdrawal error:', error);
    next(error);
  }
};
