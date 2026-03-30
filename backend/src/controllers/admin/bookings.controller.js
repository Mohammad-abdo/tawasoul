import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

const bookingDoctorSelect = {
  id: true,
  name: true,
  avatar: true,
  specialties: {
    select: {
      specialty: true
    },
    take: 1
  }
};

const serializeBookingDoctor = (doctor) => {
  if (!doctor) return doctor;

  return {
    ...doctor,
    specialization: doctor.specialties?.[0]?.specialty || null
  };
};

const serializeBooking = (booking) => ({
  ...booking,
  doctor: serializeBookingDoctor(booking.doctor)
});

/**
 * Get All Bookings
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status,
      doctorId,
      userId,
      sort = 'createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (status) {
      where.status = status;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { doctor: { name: { contains: search, mode: 'insensitive' } } },
        { user: { username: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: 'desc' },
        include: {
          doctor: {
            select: bookingDoctorSelect
          },
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        bookings: bookings.map(serializeBooking),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get bookings error:', error);
    next(error);
  }
};

/**
 * Get Booking by ID
 */
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            specialties: true
          }
        },
        user: true,
        payment: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }

    res.json({
      success: true,
      data: serializeBooking(booking)
    });
  } catch (error) {
    logger.error('Get booking error:', error);
    next(error);
  }
};

/**
 * Update Booking Status
 */
export const updateBookingStatus = async (req, res, next) => {
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

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE',
        entityType: 'BOOKING',
        entityId: id,
        description: `Updated booking status to ${status}`,
        changes: { before: booking.status, after: status },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: updatedBooking,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    logger.error('Update booking error:', error);
    next(error);
  }
};

/**
 * Cancel Booking
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, refund = true } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { payment: true }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason
      }
    });

    // Process refund if needed
    if (refund && booking.payment && booking.payment.status === 'COMPLETED') {
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: { status: 'REFUNDED' }
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'CANCEL',
        entityType: 'BOOKING',
        entityId: id,
        description: `Cancelled booking. Reason: ${reason || 'No reason provided'}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: updatedBooking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    logger.error('Cancel booking error:', error);
    next(error);
  }
};


