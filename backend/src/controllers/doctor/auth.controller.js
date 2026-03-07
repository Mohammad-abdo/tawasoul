import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Doctor Registration
 */
export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      specialization
    } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, email, phone, and password are required'
        }
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 6 characters'
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
        specialization: specialization || null,
        isActive: true,
        isApproved: false // Requires admin approval
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
        isActive: true,
        isApproved: true,
        createdAt: true
      }
    });

    logger.info(`Doctor registered: ${doctor.email}`);

    res.status(201).json({
      success: true,
      data: {
        doctor,
        message: 'Registration successful. Your account is pending admin approval.'
      }
    });
  } catch (error) {
    logger.error('Doctor registration error:', error);
    next(error);
  }
};

/**
 * Doctor Login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        }
      });
    }

    // Find doctor
    const doctor = await prisma.doctor.findUnique({
      where: { email },
      include: {
        specialties: true
      }
    });

    if (!doctor) {
      logger.warn(`Doctor login failed: Email not found - ${email}`);
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // ... (rest of checks)

    // Verify password
    const isValidPassword = await bcrypt.compare(password, doctor.password);

    if (!isValidPassword) {
      logger.warn(`Doctor login failed: Invalid password for - ${email}`);
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Generate token
    const token = jwt.sign(
      { doctorId: doctor.id, role: 'DOCTOR' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    logger.info(`Generated token for doctor ${doctor.email} with role DOCTOR`);

    // Remove password from response
    const { password: _, ...doctorWithoutPassword } = doctor;

    logger.info(`Doctor logged in: ${doctor.email}`);

    res.json({
      success: true,
      data: {
        doctor: doctorWithoutPassword,
        token
      }
    });
  } catch (error) {
    logger.error('Doctor login error:', error);
    next(error);
  }
};

/**
 * Get Current Doctor
 */
export const getMe = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        specialties: true,
        sessionPrices: true,
        _count: {
          select: {
            bookings: true,
            articles: true
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

    const { password: _, ...doctorWithoutPassword } = doctor;

    res.json({
      success: true,
      data: doctorWithoutPassword
    });
  } catch (error) {
    logger.error('Get doctor error:', error);
    next(error);
  }
};

/**
 * Update Doctor Profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const {
      name,
      phone,
      specialization,
      bio,
      avatar,
      specialties,
      sessionPrices
    } = req.body;

    // Build update data
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (specialization) updateData.specialization = specialization;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;    // Update doctor basic info
    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: updateData,
      include: {
        specialties: true,
        sessionPrices: true
      }
    });

    // Handle specialties if provided
    if (specialties && Array.isArray(specialties)) {
      // Delete existing and add new
      await prisma.doctorSpecialty.deleteMany({
        where: { doctorId }
      });
      await prisma.doctorSpecialty.createMany({
        data: specialties.map(s => ({
          doctorId,
          specialty: s
        }))
      });
    }

    // Handle session prices if provided
    if (sessionPrices && Array.isArray(sessionPrices)) {
      for (const sp of sessionPrices) {
        await prisma.sessionPrice.upsert({
          where: {
            doctorId_duration: {
              doctorId,
              duration: parseInt(sp.duration)
            }
          },
          update: { price: parseFloat(sp.price) },
          create: {
            doctorId,
            duration: parseInt(sp.duration),
            price: parseFloat(sp.price)
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: updatedDoctor
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};
