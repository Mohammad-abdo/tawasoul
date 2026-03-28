import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Bulk Approve Users
 */
export const bulkApproveUsers = async (req, res, next) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'User IDs array is required'
        }
      });
    }

    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds }
      },
      data: {
        isApproved: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'BULK_APPROVE',
        entityType: 'USER',
        description: `Bulk approved ${result.count} users`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: { count: result.count },
      message: `${result.count} users approved successfully`
    });
  } catch (error) {
    logger.error('Bulk approve users error:', error);
    next(error);
  }
};

/**
 * Bulk Reject Users
 */
export const bulkRejectUsers = async (req, res, next) => {
  try {
    const { userIds, reason } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'User IDs array is required'
        }
      });
    }

    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds }
      },
      data: {
        isApproved: false,
        isActive: false
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'BULK_REJECT',
        entityType: 'USER',
        description: `Bulk rejected ${result.count} users. Reason: ${reason || 'No reason provided'}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: { count: result.count },
      message: `${result.count} users rejected successfully`
    });
  } catch (error) {
    logger.error('Bulk reject users error:', error);
    next(error);
  }
};

/**
 * Bulk Approve Doctors
 */
export const bulkApproveDoctors = async (req, res, next) => {
  try {
    const { doctorIds, notes } = req.body;

    if (!doctorIds || !Array.isArray(doctorIds) || doctorIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Doctor IDs array is required'
        }
      });
    }

    const result = await prisma.doctor.updateMany({
      where: {
        id: { in: doctorIds }
      },
      data: {
        isApproved: true,
        approvalNotes: notes || null
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'BULK_APPROVE',
        entityType: 'DOCTOR',
        description: `Bulk approved ${result.count} doctors`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: { count: result.count },
      message: `${result.count} doctors approved successfully`
    });
  } catch (error) {
    logger.error('Bulk approve doctors error:', error);
    next(error);
  }
};

/**
 * Bulk Reject Doctors
 */
export const bulkRejectDoctors = async (req, res, next) => {
  try {
    const { doctorIds, reason } = req.body;

    if (!doctorIds || !Array.isArray(doctorIds) || doctorIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Doctor IDs array is required'
        }
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Rejection reason is required'
        }
      });
    }

    const result = await prisma.doctor.updateMany({
      where: {
        id: { in: doctorIds }
      },
      data: {
        isApproved: false,
        isActive: false,
        approvalNotes: reason
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'BULK_REJECT',
        entityType: 'DOCTOR',
        description: `Bulk rejected ${result.count} doctors. Reason: ${reason}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: { count: result.count },
      message: `${result.count} doctors rejected successfully`
    });
  } catch (error) {
    logger.error('Bulk reject doctors error:', error);
    next(error);
  }
};

/**
 * Bulk Cancel Bookings
 */
export const bulkCancelBookings = async (req, res, next) => {
  try {
    const { bookingIds, reason, refund = true } = req.body;

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking IDs array is required'
        }
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cancellation reason is required'
        }
      });
    }

    // Update bookings
    const result = await prisma.booking.updateMany({
      where: {
        id: { in: bookingIds }
      },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason
      }
    });

    // Process refunds if needed
    if (refund) {
      await prisma.payment.updateMany({
        where: {
          bookingId: { in: bookingIds },
          status: 'COMPLETED'
        },
        data: {
          status: 'REFUNDED'
        }
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'BULK_CANCEL',
        entityType: 'BOOKING',
        description: `Bulk cancelled ${result.count} bookings. Reason: ${reason}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: { count: result.count },
      message: `${result.count} bookings cancelled successfully`
    });
  } catch (error) {
    logger.error('Bulk cancel bookings error:', error);
    next(error);
  }
};

/**
 * Bulk Update Order Status
 */
export const bulkUpdateOrderStatus = async (req, res, next) => {
  try {
    const { orderIds, status } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Order IDs array is required'
        }
      });
    }

    if (!status || !['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid status is required'
        }
      });
    }

    const result = await prisma.order.updateMany({
      where: {
        id: { in: orderIds }
      },
      data: {
        status
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'BULK_UPDATE',
        entityType: 'ORDER',
        description: `Bulk updated ${result.count} orders to status: ${status}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: { count: result.count },
      message: `${result.count} orders updated to ${status} successfully`
    });
  } catch (error) {
    logger.error('Bulk update order status error:', error);
    next(error);
  }
};


