import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get Doctor Availability
 */
export const getAvailability = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;

    const availability = await prisma.availability.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' }
    });

    // Format response
    const formattedAvailability = availability.map(avail => ({
      id: avail.id,
      dayOfWeek: avail.dayOfWeek,
      timeSlots: JSON.parse(avail.timeSlots || '[]'),
      isActive: avail.isActive,
      createdAt: avail.createdAt,
      updatedAt: avail.updatedAt
    }));

    res.json({
      success: true,
      data: formattedAvailability
    });
  } catch (error) {
    logger.error('Get availability error:', error);
    next(error);
  }
};

/**
 * Update Doctor Availability
 */
export const updateAvailability = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { availability } = req.body;

    // Validation
    if (!Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Availability must be an array'
        }
      });
    }

    // Validate each availability entry
    for (const avail of availability) {
      if (typeof avail.dayOfWeek !== 'number' || avail.dayOfWeek < 0 || avail.dayOfWeek > 6) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid dayOfWeek. Must be 0-6 (Sunday=0)'
          }
        });
      }

      if (!Array.isArray(avail.timeSlots)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'timeSlots must be an array'
          }
        });
      }
    }

    // Delete existing availability
    await prisma.availability.deleteMany({
      where: { doctorId }
    });

    // Create new availability
    const createdAvailability = await Promise.all(
      availability.map(avail =>
        prisma.availability.create({
          data: {
            doctorId,
            dayOfWeek: avail.dayOfWeek,
            timeSlots: JSON.stringify(avail.timeSlots),
            isActive: avail.isActive !== undefined ? avail.isActive : true
          }
        })
      )
    );

    logger.info(`Availability updated for doctor: ${doctorId}`);

    // Format response
    const formattedAvailability = createdAvailability.map(avail => ({
      id: avail.id,
      dayOfWeek: avail.dayOfWeek,
      timeSlots: JSON.parse(avail.timeSlots),
      isActive: avail.isActive,
      createdAt: avail.createdAt,
      updatedAt: avail.updatedAt
    }));

    res.json({
      success: true,
      data: formattedAvailability,
      message: 'Availability updated successfully'
    });
  } catch (error) {
    logger.error('Update availability error:', error);
    next(error);
  }
};

