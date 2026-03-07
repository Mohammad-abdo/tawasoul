import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Doctors
 */
export const getAllDoctors = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      isVerified,
      isApproved,
      isActive,
      sort = 'createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified === 'true';
    }

    if (isApproved !== undefined) {
      where.isApproved = isApproved === 'true';
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          specialization: true,
          avatar: true,
          rating: true,
          isVerified: true,
          isActive: true,
          isApproved: true,
          approvalNotes: true,
          createdAt: true
        }
      }),
      prisma.doctor.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        doctors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get doctors error:', error);
    next(error);
  }
};

/**
 * Get Doctor by ID
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        specialties: true,
        experiences: true,
        certificates: true,
        education: true,
        sessionPrices: true,
        availability: true,
        bookings: {
          orderBy: { scheduledAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              }
            },
            payment: {
              select: {
                id: true,
                status: true,
                amount: true,
                method: true,
              }
            }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          include: {
            booking: {
              select: {
                id: true,
                scheduledAt: true,
                user: {
                  select: {
                    username: true,
                  }
                }
              }
            }
          }
        },
        withdrawals: {
          orderBy: { createdAt: 'desc' },
        },
        articles: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            bookings: true,
            articles: true,
          }
        }
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

    // Calculate wallet balance (total payments - total withdrawals)
    const totalEarnings = await prisma.payment.aggregate({
      where: {
        doctorId: id,
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    });

    const totalWithdrawals = await prisma.withdrawal.aggregate({
      where: {
        doctorId: id,
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    });

    const walletBalance = (totalEarnings._sum.amount || 0) - (totalWithdrawals._sum.amount || 0);

    // Group bookings by day
    const bookingsByDay = {};
    doctor.bookings.forEach(booking => {
      if (booking.scheduledAt) {
        const date = new Date(booking.scheduledAt).toISOString().split('T')[0];
        if (!bookingsByDay[date]) {
          bookingsByDay[date] = [];
        }
        bookingsByDay[date].push(booking);
      }
    });

    res.json({
      success: true,
      data: {
        ...doctor,
        walletBalance,
        totalEarnings: totalEarnings._sum.amount || 0,
        totalWithdrawals: totalWithdrawals._sum.amount || 0,
        bookingsByDay
      }
    });
  } catch (error) {
    logger.error('Get doctor error:', error);
    next(error);
  }
};

/**
 * Create Doctor
 */
export const createDoctor = async (req, res, next) => {
  try {
    const { name, email, phone, password, specialization, isVerified, isApproved } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, email, and password are required'
        }
      });
    }

    // Check if email exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { email }
    });

    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already exists'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create doctor
    const doctor = await prisma.doctor.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        specialization,
        isVerified: isVerified !== undefined ? isVerified : false,
        isApproved: isApproved !== undefined ? isApproved : false
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
        isVerified: true,
        isApproved: true,
        createdAt: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'CREATE',
        entityType: 'DOCTOR',
        entityId: doctor.id,
        description: `Created doctor: ${doctor.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.status(201).json({
      success: true,
      data: doctor,
      message: 'Doctor created successfully'
    });
  } catch (error) {
    logger.error('Create doctor error:', error);
    next(error);
  }
};

/**
 * Update Doctor
 */
export const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialization, bio, isVerified, isApproved, isActive } = req.body;

    const doctor = await prisma.doctor.findUnique({ where: { id } });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DOCTOR_NOT_FOUND',
          message: 'Doctor not found'
        }
      });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(specialization && { specialization }),
        ...(bio !== undefined && { bio }),
        ...(isVerified !== undefined && { isVerified }),
        ...(isApproved !== undefined && { isApproved }),
        ...(isActive !== undefined && { isActive })
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE',
        entityType: 'DOCTOR',
        entityId: id,
        description: `Updated doctor: ${updatedDoctor.name}`,
        changes: { before: doctor, after: updatedDoctor },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: updatedDoctor,
      message: 'Doctor updated successfully'
    });
  } catch (error) {
    logger.error('Update doctor error:', error);
    next(error);
  }
};

/**
 * Approve Doctor
 */
export const approveDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        isApproved: true,
        approvalNotes: notes || null
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'APPROVE',
        entityType: 'DOCTOR',
        entityId: id,
        description: `Approved doctor: ${doctor.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: doctor,
      message: 'Doctor approved successfully'
    });
  } catch (error) {
    logger.error('Approve doctor error:', error);
    next(error);
  }
};

/**
 * Reject Doctor
 */
export const rejectDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Rejection reason is required'
        }
      });
    }

    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        isApproved: false,
        isActive: false,
        approvalNotes: notes || reason
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'REJECT',
        entityType: 'DOCTOR',
        entityId: id,
        description: `Rejected doctor: ${doctor.name}. Reason: ${reason}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: doctor,
      message: 'Doctor rejected successfully'
    });
  } catch (error) {
    logger.error('Reject doctor error:', error);
    next(error);
  }
};

/**
 * Verify Doctor
 */
export const verifyDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.update({
      where: { id },
      data: { isVerified: true }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'VERIFY',
        entityType: 'DOCTOR',
        entityId: id,
        description: `Verified doctor: ${doctor.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: doctor,
      message: 'Doctor verified successfully'
    });
  } catch (error) {
    logger.error('Verify doctor error:', error);
    next(error);
  }
};

/**
 * Unverify Doctor
 */
export const unverifyDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const doctor = await prisma.doctor.update({
      where: { id },
      data: { isVerified: false }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UNVERIFY',
        entityType: 'DOCTOR',
        entityId: id,
        description: `Unverified doctor: ${doctor.name}. Reason: ${reason || 'No reason provided'}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: doctor,
      message: 'Doctor unverified successfully'
    });
  } catch (error) {
    logger.error('Unverify doctor error:', error);
    next(error);
  }
};

/**
 * Activate Doctor
 */
export const activateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.update({
      where: { id },
      data: { isActive: true }
    });

    res.json({
      success: true,
      data: doctor,
      message: 'Doctor activated successfully'
    });
  } catch (error) {
    logger.error('Activate doctor error:', error);
    next(error);
  }
};

/**
 * Deactivate Doctor
 */
export const deactivateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const doctor = await prisma.doctor.update({
      where: { id },
      data: { isActive: false }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'DEACTIVATE',
        entityType: 'DOCTOR',
        entityId: id,
        description: `Deactivated doctor: ${doctor.name}. Reason: ${reason || 'No reason provided'}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: doctor,
      message: 'Doctor deactivated successfully'
    });
  } catch (error) {
    logger.error('Deactivate doctor error:', error);
    next(error);
  }
};

/**
 * Delete Doctor
 */
export const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({ where: { id } });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DOCTOR_NOT_FOUND',
          message: 'Doctor not found'
        }
      });
    }

    await prisma.doctor.delete({ where: { id } });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'DELETE',
        entityType: 'DOCTOR',
        entityId: id,
        description: `Deleted doctor: ${doctor.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    logger.error('Delete doctor error:', error);
    next(error);
  }
};


