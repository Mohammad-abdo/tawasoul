import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get Settings
 */
export const getSettings = async (req, res, next) => {
  try {
    let settings;
    
    try {
      settings = await prisma.appSettings.findFirst();

      // If no settings exist, create default
      if (!settings) {
        settings = await prisma.appSettings.create({
          data: {
            appName: 'تواصل',
            appNameEn: 'Tawasoul',
            primaryFont: 'Cairo',
            secondaryFont: 'Tajawal',
            primaryColor: '#14b8a6',
          }
        });
      }
    } catch (dbError) {
      // If table doesn't exist yet (migration not run), return default settings
      if (dbError.code === 'P2021' || dbError.code === 'P2001' || dbError.message?.includes('does not exist')) {
        logger.warn('AppSettings table does not exist yet. Please run database migration.');
        settings = {
          appName: 'تواصل',
          appNameEn: 'Tawasoul',
          primaryFont: 'Cairo',
          secondaryFont: 'Tajawal',
          primaryColor: '#14b8a6',
          maintenanceMode: false,
          registrationEnabled: true,
          doctorRegistrationEnabled: true,
          emailNotifications: true,
          smsNotifications: false,
        };
      } else {
        throw dbError;
      }
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('Get settings error:', error);
    next(error);
  }
};

/**
 * Update Settings
 */
export const updateSettings = async (req, res, next) => {
  try {
    const {
      appName,
      appNameEn,
      logo,
      logoMobile,
      favicon,
      primaryFont,
      secondaryFont,
      primaryColor,
      secondaryColor,
      maintenanceMode,
      registrationEnabled,
      doctorRegistrationEnabled,
      emailNotifications,
      smsNotifications,
      maxPostLength,
      maxFileSize,
      allowedFileTypes,
      paymentGateway,
      emailService,
    } = req.body;

    let settings;
    
    try {
      // Get or create settings
      settings = await prisma.appSettings.findFirst();

      if (!settings) {
        settings = await prisma.appSettings.create({
          data: {
            appName: appName || 'تواصل',
            appNameEn: appNameEn || 'Tawasoul',
            primaryFont: primaryFont || 'Cairo',
            secondaryFont: secondaryFont || 'Tajawal',
            primaryColor: primaryColor || '#14b8a6',
            logo,
            logoMobile,
            favicon,
            secondaryColor,
            maintenanceMode: maintenanceMode !== undefined ? maintenanceMode : false,
            registrationEnabled: registrationEnabled !== undefined ? registrationEnabled : true,
            doctorRegistrationEnabled: doctorRegistrationEnabled !== undefined ? doctorRegistrationEnabled : true,
            emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
            smsNotifications: smsNotifications !== undefined ? smsNotifications : false,
            maxPostLength,
            maxFileSize,
            allowedFileTypes: allowedFileTypes ? JSON.parse(JSON.stringify(allowedFileTypes)) : null,
            paymentGateway,
            emailService,
          }
        });
      } else {
        settings = await prisma.appSettings.update({
          where: { id: settings.id },
          data: {
            ...(appName !== undefined && { appName }),
            ...(appNameEn !== undefined && { appNameEn }),
            ...(logo !== undefined && { logo }),
            ...(logoMobile !== undefined && { logoMobile }),
            ...(favicon !== undefined && { favicon }),
            ...(primaryFont !== undefined && { primaryFont }),
            ...(secondaryFont !== undefined && { secondaryFont }),
            ...(primaryColor !== undefined && { primaryColor }),
            ...(secondaryColor !== undefined && { secondaryColor }),
            ...(maintenanceMode !== undefined && { maintenanceMode }),
            ...(registrationEnabled !== undefined && { registrationEnabled }),
            ...(doctorRegistrationEnabled !== undefined && { doctorRegistrationEnabled }),
            ...(emailNotifications !== undefined && { emailNotifications }),
            ...(smsNotifications !== undefined && { smsNotifications }),
            ...(maxPostLength !== undefined && { maxPostLength }),
            ...(maxFileSize !== undefined && { maxFileSize }),
            ...(allowedFileTypes !== undefined && { allowedFileTypes: allowedFileTypes ? JSON.parse(JSON.stringify(allowedFileTypes)) : null }),
            ...(paymentGateway !== undefined && { paymentGateway }),
            ...(emailService !== undefined && { emailService }),
          }
        });
      }
    } catch (dbError) {
      // If table doesn't exist yet (migration not run), return error with helpful message
      if (dbError.code === 'P2021' || dbError.code === 'P2001' || dbError.message?.includes('does not exist')) {
        return res.status(503).json({
          success: false,
          error: {
            message: 'Database migration required. Please run: npx prisma migrate dev',
            code: 'MIGRATION_REQUIRED'
          }
        });
      } else {
        throw dbError;
      }
    }

    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    logger.error('Update settings error:', error);
    next(error);
  }
};


