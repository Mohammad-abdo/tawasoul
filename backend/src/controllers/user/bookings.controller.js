import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get User Bookings
 */
export const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = { userId };
    if (status) {
      where.status = status;
    }

    // Get bookings
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { scheduledAt: 'desc' },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
              avatar: true,
              rating: true,
              isVerified: true
            }
          },
          payment: {
            select: {
              id: true,
              status: true,
              method: true,
              amount: true
            }
          }
        }
      }),
      prisma.booking.count({ where })
    ]);

    // Format response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      doctor: booking.doctor,
      sessionType: booking.sessionType,
      duration: booking.duration,
      price: booking.price,
      status: booking.status,
      scheduledAt: booking.scheduledAt,
      completedAt: booking.completedAt,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      rating: booking.rating,
      review: booking.review,
      payment: booking.payment,
      createdAt: booking.createdAt
    }));

    res.json({
      success: true,
      data: {
        bookings: formattedBookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get bookings error:', error);
    next(error);
  }
};

/**
 * Create Booking
 */
export const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      doctorId,
      childId,
      sessionType,
      duration,
      scheduledAt,
      scheduledMonth,
      scheduledDay,
      scheduledTime,
      notes
    } = req.body;

    // Validation
    if (!doctorId || !sessionType || !duration) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Doctor ID, session type, and duration are required'
        }
      });
    }

    // Either scheduledAt (full datetime) or month/day/time must be provided
    if (!scheduledAt && (!scheduledMonth || !scheduledDay || !scheduledTime)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Either scheduledAt (full datetime) or month/day/time must be provided'
        }
      });
    }

    // Validate session type
    if (!['VIDEO', 'AUDIO', 'TEXT'].includes(sessionType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid session type. Must be VIDEO, AUDIO, or TEXT'
        }
      });
    }

    // Validate duration
    if (![30, 45, 60].includes(parseInt(duration))) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid duration. Must be 30, 45, or 60 minutes'
        }
      });
    }

    // Check if doctor exists and is active
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        sessionPrices: true
      }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DOCTOR_NOT_FOUND',
          message: 'Doctor not found'
        }
      });
    }

    if (!doctor.isActive || !doctor.isApproved) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'DOCTOR_UNAVAILABLE',
          message: 'Doctor is not available for bookings'
        }
      });
    }

    // Get session price
    const sessionPrice = doctor.sessionPrices.find(
      sp => sp.duration === parseInt(duration)
    );

    if (!sessionPrice) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DURATION',
          message: 'Doctor does not offer sessions of this duration'
        }
      });
    }

    // Parse scheduled date
    let scheduledDate;
    let month, day, time;

    if (scheduledAt) {
      scheduledDate = new Date(scheduledAt);
      month = scheduledDate.getMonth() + 1; // 1-12
      day = scheduledDate.getDate();
      time = scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } else {
      // Build date from month/day/time
      const currentYear = new Date().getFullYear();
      const [hours, minutes, period] = scheduledTime.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || [];
      
      if (!hours || !minutes || !period) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TIME_FORMAT',
            message: 'Time must be in format: HH:MM AM/PM'
          }
        });
      }

      let hour24 = parseInt(hours);
      if (period.toUpperCase() === 'PM' && hour24 !== 12) hour24 += 12;
      if (period.toUpperCase() === 'AM' && hour24 === 12) hour24 = 0;

      scheduledDate = new Date(currentYear, parseInt(scheduledMonth) - 1, parseInt(scheduledDay), hour24, parseInt(minutes));
      month = parseInt(scheduledMonth);
      day = parseInt(scheduledDay);
      time = scheduledTime;
    }

    // Validate scheduled time (must be in the future)
    if (scheduledDate < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TIME',
          message: 'Scheduled time must be in the future'
        }
      });
    }

    // Validate month and day
    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MONTH',
          message: 'Month must be between 1 and 12'
        }
      });
    }

    if (day < 1 || day > 31) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DAY',
          message: 'Day must be between 1 and 31'
        }
      });
    }

    // Check if child exists and belongs to user (if provided)
    if (childId) {
      const child = await prisma.child.findUnique({
        where: { id: childId }
      });

      if (!child || child.userId !== userId) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CHILD_NOT_FOUND',
            message: 'Child profile not found'
          }
        });
      }
    }

    // Check doctor availability (simplified - you may want to add more complex logic)
    // TODO: Add proper availability checking

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        doctorId,
        childId: childId || null,
        sessionType,
        duration: parseInt(duration),
        price: sessionPrice.price,
        scheduledAt: scheduledDate,
        scheduledMonth: month,
        scheduledDay: day,
        scheduledTime: time,
        notes: notes || null,
        status: 'PENDING'
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            avatar: true
          }
        }
      }
    });

    logger.info(`Booking created: ${booking.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        id: booking.id,
        doctor: booking.doctor,
        sessionType: booking.sessionType,
        duration: booking.duration,
        price: booking.price,
        status: booking.status,
        scheduledAt: booking.scheduledAt,
        createdAt: booking.createdAt
      }
    });
  } catch (error) {
    logger.error('Create booking error:', error);
    next(error);
  }
};

/**
 * Get Booking by ID
 */
export const getBookingById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            avatar: true,
            rating: true,
            isVerified: true,
            phone: true
          }
        },
        payment: {
          select: {
            id: true,
            status: true,
            method: true,
            amount: true,
            transactionId: true,
            createdAt: true
          }
        }
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

    // Check if booking belongs to user
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only view your own bookings'
        }
      });
    }

    res.json({
      success: true,
      data: {
        id: booking.id,
        doctor: booking.doctor,
        sessionType: booking.sessionType,
        duration: booking.duration,
        price: booking.price,
        status: booking.status,
        scheduledAt: booking.scheduledAt,
        completedAt: booking.completedAt,
        cancelledAt: booking.cancelledAt,
        cancellationReason: booking.cancellationReason,
        rating: booking.rating,
        review: booking.review,
        payment: booking.payment,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }
    });
  } catch (error) {
    logger.error('Get booking error:', error);
    next(error);
  }
};

/**
 * Cancel Booking
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    // Check if booking exists
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

    // Check if booking belongs to user
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only cancel your own bookings'
        }
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_CANCELLED',
          message: 'Booking is already cancelled'
        }
      });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_CANCEL',
          message: 'Cannot cancel a completed booking'
        }
      });
    }

    // Cancel booking
    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason || 'Cancelled by user'
      }
    });

    logger.info(`Booking cancelled: ${id} by user ${userId}`);

    res.json({
      success: true,
      data: {
        id: cancelledBooking.id,
        status: cancelledBooking.status,
        cancelledAt: cancelledBooking.cancelledAt,
        message: 'Booking cancelled successfully'
      }
    });
  } catch (error) {
    logger.error('Cancel booking error:', error);
    next(error);
  }
};

/**
 * Reschedule Booking
 */
export const rescheduleBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      scheduledAt,
      scheduledMonth,
      scheduledDay,
      scheduledTime
    } = req.body;

    // Check if booking exists
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

    // Check if booking belongs to user
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only reschedule your own bookings'
        }
      });
    }

    // Check if booking can be rescheduled
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_RESCHEDULE',
          message: 'Cannot reschedule a cancelled booking'
        }
      });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_RESCHEDULE',
          message: 'Cannot reschedule a completed booking'
        }
      });
    }

    // Parse new scheduled date
    let scheduledDate;
    let month, day, time;

    if (scheduledAt) {
      scheduledDate = new Date(scheduledAt);
      month = scheduledDate.getMonth() + 1;
      day = scheduledDate.getDate();
      time = scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } else if (scheduledMonth && scheduledDay && scheduledTime) {
      const currentYear = new Date().getFullYear();
      const [hours, minutes, period] = scheduledTime.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || [];
      
      if (!hours || !minutes || !period) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TIME_FORMAT',
            message: 'Time must be in format: HH:MM AM/PM'
          }
        });
      }

      let hour24 = parseInt(hours);
      if (period.toUpperCase() === 'PM' && hour24 !== 12) hour24 += 12;
      if (period.toUpperCase() === 'AM' && hour24 === 12) hour24 = 0;

      scheduledDate = new Date(currentYear, parseInt(scheduledMonth) - 1, parseInt(scheduledDay), hour24, parseInt(minutes));
      month = parseInt(scheduledMonth);
      day = parseInt(scheduledDay);
      time = scheduledTime;
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Either scheduledAt or month/day/time must be provided'
        }
      });
    }

    // Validate scheduled time (must be in the future)
    if (scheduledDate < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TIME',
          message: 'Scheduled time must be in the future'
        }
      });
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        scheduledAt: scheduledDate,
        scheduledMonth: month,
        scheduledDay: day,
        scheduledTime: time,
        status: 'PENDING' // Reset to pending when rescheduled
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            avatar: true,
            rating: true
          }
        },
        child: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    logger.info(`Booking rescheduled: ${id} by user ${userId}`);

    res.json({
      success: true,
      data: {
        id: updatedBooking.id,
        doctor: updatedBooking.doctor,
        child: updatedBooking.child,
        sessionType: updatedBooking.sessionType,
        duration: updatedBooking.duration,
        price: updatedBooking.price,
        status: updatedBooking.status,
        scheduledAt: updatedBooking.scheduledAt,
        scheduledMonth: updatedBooking.scheduledMonth,
        scheduledDay: updatedBooking.scheduledDay,
        scheduledTime: updatedBooking.scheduledTime,
        message: 'Booking rescheduled successfully'
      }
    });
  } catch (error) {
    logger.error('Reschedule booking error:', error);
    next(error);
  }
};

