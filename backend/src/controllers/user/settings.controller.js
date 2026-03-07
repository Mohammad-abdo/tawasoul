import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get User Settings
 */
export const getUserSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        avatar: true,
        allowPrivateMsg: true,
        isAnonymous: true,
        interests: {
          include: {
            interest: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get user settings error:', error);
    next(error);
  }
};

/**
 * Update User Settings
 */
export const updateUserSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      email,
      phone,
      avatar,
      allowPrivateMsg,
      isAnonymous,
      interests
    } = req.body;

    // Build update data
    const updateData = {};

    if (email !== undefined) {
      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already exists'
          }
        });
      }

      updateData.email = email;
    }

    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (allowPrivateMsg !== undefined) updateData.allowPrivateMsg = allowPrivateMsg;
    if (isAnonymous !== undefined) updateData.isAnonymous = isAnonymous;

    // Update interests if provided
    if (interests) {
      // Delete existing interests
      await prisma.userInterest.deleteMany({
        where: { userId }
      });

      // Create new interests
      if (interests.length > 0) {
        await prisma.userInterest.createMany({
          data: interests.map(interestId => ({
            userId,
            interestId
          }))
        });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        interests: {
          include: {
            interest: true
          }
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        avatar: true,
        allowPrivateMsg: true,
        isAnonymous: true,
        interests: {
          include: {
            interest: true
          }
        }
      }
    });

    logger.info(`User settings updated: ${userId}`);

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    logger.error('Update user settings error:', error);
    next(error);
  }
};

/**
 * Change Password
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Current password and new password are required'
        }
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'New password must be at least 6 characters'
        }
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect'
        }
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword
      }
    });

    logger.info(`Password changed for user: ${userId}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};

