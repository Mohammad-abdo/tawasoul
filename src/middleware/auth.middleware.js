import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import {
  verifyGeneralJwtToken,
  verifyUserAccessToken,
  verifyUserOrDoctorToken
} from '../utils/jwt.utils.js';

/**
 * Authentication middleware for Users
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required'
        }
      });
    }

    const decoded = verifyUserAccessToken(token);

    if (decoded.role !== 'USER') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token for user access'
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        isActive: true,
        isApproved: true,
        avatar: true
      }
    });

    if (!user || !user.isActive || !user.isApproved) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Account is inactive or not approved'
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
};

/**
 * Authentication middleware for Doctors
 */
export const authenticateDoctor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required'
        }
      });
    }

    const decoded = verifyGeneralJwtToken(token);

    if (decoded.role !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token for doctor access'
        }
      });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: decoded.doctorId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        isApproved: true,
        isVerified: true,
        avatar: true
      }
    });

    if (!doctor || !doctor.isActive || !doctor.isApproved) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Account is inactive or not approved'
        }
      });
    }

    req.doctor = doctor;
    next();
  } catch (error) {
    logger.error('Doctor authentication error:', error);
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
};

/**
 * Authentication middleware for Users or Doctors
 */
export const authenticateUserOrDoctor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required'
        }
      });
    }

    const decoded = verifyUserOrDoctorToken(token);

    if (decoded.role === 'USER') {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          isActive: true,
          isApproved: true,
          avatar: true
        }
      });

      if (!user || !user.isActive || !user.isApproved) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Account is inactive or not approved'
          }
        });
      }

      req.user = user;
      req.authActor = {
        role: 'USER',
        id: user.id
      };
      return next();
    }

    if (decoded.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { id: decoded.doctorId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          isApproved: true,
          isVerified: true,
          avatar: true
        }
      });

      if (!doctor || !doctor.isActive || !doctor.isApproved) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Account is inactive or not approved'
          }
        });
      }

      req.doctor = doctor;
      req.authActor = {
        role: 'DOCTOR',
        id: doctor.id
      };
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token for Agora access'
      }
    });
  } catch (error) {
    logger.error('User/doctor authentication error:', error);
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
};

/**
 * Authentication middleware for Admins
 */
export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    logger.info('Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required'
        }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET is not set');
      return res.status(500).json({
        success: false,
        error: {
          code: 'CONFIGURATION_ERROR',
          message: 'Server configuration error'
        }
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.info('Token decoded successfully:', { 
        adminId: decoded.adminId, 
        role: decoded.role,
        adminIdType: typeof decoded.adminId 
      });
      
      // Ensure adminId is a string
      if (typeof decoded.adminId !== 'string') {
        logger.warn('adminId is not a string, converting:', decoded.adminId);
        decoded.adminId = String(decoded.adminId);
      }
    } catch (jwtError) {
      logger.error('JWT verification error:', jwtError);
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }

    // Check role
    const validRoles = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT'];
    if (!validRoles.includes(decoded.role)) {
      logger.warn('Invalid role in token:', decoded.role);
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token for admin access'
        }
      });
    }

    // Check database connection before querying
    let admin;
    const adminIdString = String(decoded.adminId);
    logger.info('Looking up admin with ID:', adminIdString);
    
    try {
      admin = await prisma.admin.findUnique({
        where: { id: adminIdString },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true
        }
      });
      
      if (admin) {
        logger.info('Admin found:', { id: admin.id, name: admin.name, role: admin.role });
      } else {
        logger.warn('Admin not found in database for ID:', adminIdString);
      }
    } catch (dbError) {
      logger.error('Database error during admin lookup:', dbError);
      // If database is not connected, allow access based on token only (for development)
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Database not connected, allowing access based on token only (dev mode)');
        req.admin = {
          id: adminIdString,
          email: decoded.email,
          role: decoded.role,
          isActive: true
        };
        return next();
      }
      return res.status(503).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database connection failed'
        }
      });
    }

    if (!admin) {
      logger.warn('Admin not found in database for ID:', adminIdString);
      
      // In development mode, allow access based on token only if database is not connected
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Admin not found, but allowing access in dev mode based on token');
        req.admin = {
          id: adminIdString,
          email: decoded.email,
          role: decoded.role,
          isActive: true
        };
        return next();
      }
      
      return res.status(403).json({
        success: false,
        error: {
          code: 'ADMIN_NOT_FOUND',
          message: 'Admin account not found'
        }
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Admin account is inactive'
        }
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    logger.error('Admin authentication error:', error);
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required'
        }
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions for this action'
        }
      });
    }

    next();
  };
};

