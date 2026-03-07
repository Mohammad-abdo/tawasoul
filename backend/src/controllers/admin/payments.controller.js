import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Payments
 */
export const getAllPayments = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      method,
      dateFrom,
      dateTo,
      sort = 'createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (status) {
      where.status = status;
    }

    if (method) {
      where.method = method;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: 'desc' },
        include: {
          booking: {
            include: {
              doctor: {
                select: {
                  id: true,
                  name: true
                }
              },
              user: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get payments error:', error);
    next(error);
  }
};

/**
 * Update Payment Status
 */
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status is required'
        }
      });
    }

    const payment = await prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found'
        }
      });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: { status }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE',
        entityType: 'PAYMENT',
        entityId: id,
        description: `Updated payment status to ${status}`,
        changes: { before: payment.status, after: status },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: updatedPayment,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    logger.error('Update payment error:', error);
    next(error);
  }
};


