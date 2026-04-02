import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
// import { getBookingDisplayPrice, omitDoctorSessionPrices } from '../../utils/booking-pricing.utils.js';
import { getBookingDisplayPrice, stripDoctorPricing } from '../../utils/booking-pricing.utils.js';
import { creditDoctorWalletForCompletedBooking } from '../../utils/wallet.utils.js';

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
  doctor: serializeBookingDoctor(stripDoctorPricing(booking.doctor)),
  price: getBookingDisplayPrice(booking)
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
            select: {
              ...bookingDoctorSelect,
              // sessionPrices: {
              //   select: {
              //     duration: true,
              //     price: true
              //   }
              // }
              hourlyRate: true
            }
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
            specialties: true,
            // sessionPrices: {
            //   select: {
            //     duration: true,
            //     price: true
            //   }
            // }
          }
        },
        user: true
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

    if (status === 'COMPLETED' && booking.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Booking is already completed'
        }
      });
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      let nextBooking;

      if (status === 'COMPLETED') {
        const completedAt = new Date();
        const updateResult = await tx.booking.updateMany({
          where: {
            id,
            status: {
              not: 'COMPLETED'
            }
          },
          data: {
            status,
            completedAt
          }
        });

        if (updateResult.count === 0) {
          const transactionError = new Error('BOOKING_ALREADY_COMPLETED');
          transactionError.status = 400;
          throw transactionError;
        }

        nextBooking = await tx.booking.findUnique({
          where: { id },
          include: {
            doctor: {
              select: {
                hourlyRate: true
              }
            }
          }
        });

        if (!nextBooking) {
          const transactionError = new Error('BOOKING_NOT_FOUND');
          transactionError.status = 404;
          throw transactionError;
        }

        await creditDoctorWalletForCompletedBooking({
          tx,
          booking: nextBooking,
          completedAt
        });
      } else {
        nextBooking = await tx.booking.update({
          where: { id },
          data: {
            status,
            ...(status === 'COMPLETED' ? { completedAt: new Date() } : {})
          }
        });
      }

      await tx.activityLog.create({
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

      return nextBooking;
    });

    res.json({
      success: true,
      data: updatedBooking,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    if (error.message === 'BOOKING_ALREADY_COMPLETED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Booking is already completed'
        }
      });
    }

    if (error.message === 'BOOKING_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }

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
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id }
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


