import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get Doctor Withdrawals
 */
export const getDoctorWithdrawals = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { status, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = { doctorId };
    if (status) {
      where.status = status;
    }

    // Get withdrawals
    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.withdrawal.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get doctor withdrawals error:', error);
    next(error);
  }
};

/**
 * Request Withdrawal
 */
export const requestWithdrawal = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const {
      amount,
      method,
      accountDetails
    } = req.body;

    // Validation
    if (!amount || !method || !accountDetails) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount, method, and account details are required'
        }
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount must be greater than 0'
        }
      });
    }

    // Validate method
    if (!['BANK_ACCOUNT', 'E_WALLET', 'PAYPAL'].includes(method)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid withdrawal method'
        }
      });
    }

    // Check available balance
    const completedEarnings = await prisma.payment.aggregate({
      where: {
        doctorId,
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    });

    const totalWithdrawals = await prisma.withdrawal.aggregate({
      where: {
        doctorId,
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    });

    const availableBalance = (completedEarnings._sum.amount || 0) - (totalWithdrawals._sum.amount || 0);

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Insufficient balance for withdrawal'
        }
      });
    }

    // Check for pending withdrawals
    const pendingWithdrawals = await prisma.withdrawal.count({
      where: {
        doctorId,
        status: { in: ['PENDING', 'PROCESSING'] }
      }
    });

    if (pendingWithdrawals > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PENDING_WITHDRAWAL',
          message: 'You have a pending withdrawal request'
        }
      });
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        doctorId,
        amount: parseFloat(amount),
        method,
        accountDetails: JSON.stringify(accountDetails),
        status: 'PENDING'
      }
    });

    logger.info(`Withdrawal requested: ${withdrawal.id} by doctor ${doctorId}`);

    res.status(201).json({
      success: true,
      data: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        method: withdrawal.method,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt,
        message: 'Withdrawal request submitted successfully'
      }
    });
  } catch (error) {
    logger.error('Request withdrawal error:', error);
    next(error);
  }
};

