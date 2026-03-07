import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get Doctor Bookings
 */
export const getDoctorBookings = async (req, res, next) => {
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

    // Get bookings
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { scheduledAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              phone: true
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
      user: booking.user,
      childId: booking.childId,
      sessionType: booking.sessionType,
      duration: booking.duration,
      price: booking.price,
      status: booking.status,
      scheduledAt: booking.scheduledAt,
      completedAt: booking.completedAt,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      videoLink: booking.videoLink,
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
    logger.error('Get doctor bookings error:', error);
    next(error);
  }
};

/**
 * Get Booking by ID
 */
export const getBookingById = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            phone: true,
            email: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            avatar: true,
            phone: true,
            email: true,
            rating: true
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

    // Check if booking belongs to doctor
    if (booking.doctorId !== doctorId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only view your own bookings'
        }
      });
    }

    logger.info(`Sending booking details for ${id}. VideoLink: ${booking.videoLink}`);

    res.json({
      success: true,
      data: {
        id: booking.id,
        user: booking.user,
        doctor: booking.doctor,
        childId: booking.childId,
        sessionType: booking.sessionType,
        duration: booking.duration,
        price: booking.price,
        status: booking.status,
        scheduledAt: booking.scheduledAt,
        completedAt: booking.completedAt,
        cancelledAt: booking.cancelledAt,
        cancellationReason: booking.cancellationReason,
        videoLink: booking.videoLink,
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
 * Confirm Booking
 */
export const confirmBooking = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { id } = req.params;

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

    // Check if booking belongs to doctor
    if (booking.doctorId !== doctorId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only confirm your own bookings'
        }
      });
    }

    // Check if booking can be confirmed
    if (booking.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Only pending bookings can be confirmed'
        }
      });
    }

    // Confirm booking
    const confirmedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED'
      }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'BOOKING_CONFIRMED',
        title: 'تم تأكيد الحجز',
        message: `تم تأكيد حجزك مع الطبيب`
      }
    });

    logger.info(`Booking confirmed: ${id} by doctor ${doctorId}`);

    res.json({
      success: true,
      data: {
        id: confirmedBooking.id,
        status: confirmedBooking.status,
        message: 'Booking confirmed successfully'
      }
    });
  } catch (error) {
    logger.error('Confirm booking error:', error);
    next(error);
  }
};

/**
 * Cancel Booking
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
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

    // Check if booking belongs to doctor
    if (booking.doctorId !== doctorId) {
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
        cancellationReason: reason || 'Cancelled by doctor'
      }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'BOOKING_CANCELLED',
        title: 'تم إلغاء الحجز',
        message: `تم إلغاء حجزك من قبل الطبيب`
      }
    });

    logger.info(`Booking cancelled: ${id} by doctor ${doctorId}`);

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
 * Complete Booking (Finish Session)
 */
export const completeBooking = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { id } = req.params;
    const { notes, rating } = req.body;

    // Check if booking exists and belongs to doctor
    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking || booking.doctorId !== doctorId) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }    // Complete booking
    const completedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        notes: notes,
        rating: rating ? parseInt(rating) : undefined
      }
    });

    res.json({
      success: true,
      data: completedBooking
    });
  } catch (error) {
    logger.error('Complete booking error:', error);
    next(error);
  }
};
