import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get Children associated with Doctor (via bookings)
 */
export const getMyChildren = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;

    // Find children who have bookings with this doctor
    const bookings = await prisma.booking.findMany({
      where: { doctorId },
      include: {
        child: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
                avatar: true
              }
            }
          }
        }
      },
      distinct: ['childId']
    });

    const children = bookings
      .filter(b => b.child !== null)
      .map(b => b.child);

    res.json({
      success: true,
      data: children
    });
  } catch (error) {
    logger.error('Get doctor children error:', error);
    next(error);
  }
};

/**
 * Get Child Details and Assessment History for Doctor
 */
export const getChildDetails = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { childId } = req.params;

    // Verify doctor has access (at least one booking)
    const access = await prisma.booking.findFirst({
      where: { doctorId, childId }
    });

    if (!access) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لبيانات هذا الطفل'
      });
    }

    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        user: {
          select: {
            fullName: true,
            phone: true,
            email: true,
            avatar: true,
            relationType: true
          }
        },
        assessmentResults: {
          include: {
            question: {
              include: {
                test: true
              }
            }
          },
          orderBy: { timestamp: 'desc' }
        },
        bookings: {
          where: { doctorId },
          orderBy: { scheduledAt: 'desc' },
          take: 5
        }
      }
    });

    res.json({
      success: true,
      data: child
    });
  } catch (error) {
    logger.error('Get doctor child details error:', error);
    next(error);
  }
};
