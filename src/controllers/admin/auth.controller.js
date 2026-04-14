import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Admin Login
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

    // Find admin
    let admin;
    try {
      admin = await prisma.admin.findUnique({
        where: { email }
      });
    } catch (dbError) {
      logger.error('Database error during login:', dbError);
      // If database is not connected, check if it's a connection error
      if (dbError.code === 'P1000' || dbError.message?.includes('Authentication failed')) {
        return res.status(503).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database connection failed. Please check database configuration.'
          }
        });
      }
      throw dbError;
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Admin account is inactive'
        }
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({
        success: false,
        error: {
          code: 'CONFIGURATION_ERROR',
          message: 'Server configuration error'
        }
      });
    }

    // Validate admin data
    if (!admin.id) {
      logger.error('Admin ID is missing:', admin);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Invalid admin data'
        }
      });
    }

    // Generate JWT token
    // Ensure admin.id is a string
    const adminId = String(admin.id);
    logger.info('Creating token for admin:', { 
      id: adminId, 
      idType: typeof adminId,
      originalId: admin.id,
      originalIdType: typeof admin.id,
      role: admin.role, 
      email: admin.email 
    });
    
    const token = jwt.sign(
      {
        adminId: adminId,
        role: admin.role,
        email: admin.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    const { password: _, ...adminData } = admin;

    // Log activity (skip if database is not connected)
    try {
      await prisma.activityLog.create({
        data: {
          adminId: admin.id,
          action: 'LOGIN',
          entityType: 'ADMIN',
          entityId: admin.id,
          description: 'Admin logged in',
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
    } catch (logError) {
      logger.warn('Failed to log activity (database may be disconnected):', logError);
      // Continue without logging
    }

    res.json({
      success: true,
      data: {
        admin: adminData,
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    logger.error('Admin login error:', error);
    next(error);
  }
};

/**
 * Admin Logout
 */
export const logout = async (req, res, next) => {
  try {
    // Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin.id,
        action: 'LOGOUT',
        entityType: 'ADMIN',
        entityId: req.admin.id,
        description: 'Admin logged out',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Admin logout error:', error);
    next(error);
  }
};

/**
 * Get Current Admin
 */
export const getMe = async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    logger.error('Get admin error:', error);
    next(error);
  }
};

