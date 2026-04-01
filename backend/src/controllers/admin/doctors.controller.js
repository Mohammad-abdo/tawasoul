import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { getBookingDisplayPrice } from '../../utils/booking-pricing.utils.js';

const doctorSummarySelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  rating: true,
  isVerified: true,
  isActive: true,
  isApproved: true,
  approvalNotes: true,
  createdAt: true,
  specialties: {
    select: {
      specialty: true
    },
    take: 1
  }
};

const serializeDoctorSummary = (doctor) => ({
  ...doctor,
  specialization: doctor.specialties?.[0]?.specialty || null
});

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
        { specialties: { some: { specialty: { contains: search, mode: 'insensitive' } } } }
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
        select: doctorSummarySelect
      }),
      prisma.doctor.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        doctors: doctors.map(serializeDoctorSummary),
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
        // sessionPrices: true,
        hourlyRate: true,
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
            }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          include: {
            package: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                price: true
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

    const wallet = await prisma.doctorWallet.findUnique({
      where: { doctorId: id },
      include: {
        transactions: true,
        withdrawals: true
      }
    });

    const totalEarnings = wallet?.transactions
      ?.filter((transaction) => transaction.type === 'EARNING')
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0) || 0;

    const totalWithdrawals = wallet?.transactions
      ?.filter((transaction) => transaction.type === 'WITHDRAWAL')
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0) || 0;

    const walletBalance = Number(wallet?.balance || 0);

    // Group bookings by day
    const bookingsByDay = {};
    doctor.bookings.forEach(booking => {
      const bookingWithPrice = {
        ...booking,
        // price: getBookingDisplayPrice(booking, doctor.sessionPrices)
        price: getBookingDisplayPrice({ ...booking, doctor })
      };

      if (booking.scheduledAt) {
        const date = new Date(booking.scheduledAt).toISOString().split('T')[0];
        if (!bookingsByDay[date]) {
          bookingsByDay[date] = [];
        }
        bookingsByDay[date].push(bookingWithPrice);
      }
    });

    res.json({
      success: true,
      data: {
        ...doctor,
        bookings: doctor.bookings.map((booking) => ({
          ...booking,
          // price: getBookingDisplayPrice(booking, doctor.sessionPrices)
          price: getBookingDisplayPrice({ ...booking, doctor })
        })),
        specialization: doctor.specialties?.[0]?.specialty || null,
        walletBalance,
        totalEarnings,
        totalWithdrawals,
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
    const { name, email, phone, password, specialization, isVerified, isApproved, hourlyRate } = req.body;
    const normalizedHourlyRate = hourlyRate !== undefined ? Number(hourlyRate) : undefined;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, email, and password are required'
        }
      });
    }

    if (normalizedHourlyRate !== undefined && (!Number.isFinite(normalizedHourlyRate) || normalizedHourlyRate < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'hourlyRate must be a valid non-negative number'
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
        hourlyRate: normalizedHourlyRate,
        ...(specialization
          ? {
              specialties: {
                create: [{ specialty: specialization }]
              }
            }
          : {}),
        wallet: {
          create: {
            balance: 0
          }
        },
        isVerified: isVerified !== undefined ? isVerified : false,
        isApproved: isApproved !== undefined ? isApproved : false
      },
      select: doctorSummarySelect
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
      data: serializeDoctorSummary(doctor),
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

    const specializationValue = typeof specialization === 'string' ? specialization.trim() : specialization;

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(bio !== undefined && { bio }),
        ...(isVerified !== undefined && { isVerified }),
        ...(isApproved !== undefined && { isApproved }),
        ...(isActive !== undefined && { isActive }),
        ...(specialization !== undefined
          ? {
              specialties: {
                deleteMany: {},
                ...(specializationValue
                  ? {
                      create: [{ specialty: specializationValue }]
                    }
                  : {})
              }
            }
          : {})
      },
      include: {
        specialties: {
          select: {
            specialty: true
          },
          take: 1
        }
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
      data: serializeDoctorSummary(updatedDoctor),
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


