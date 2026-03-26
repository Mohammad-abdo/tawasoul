import * as settingsRepo from '../../repositories/admin/settings.repository.js';
import { createHttpError } from '../../utils/httpError.js';

const DEFAULT_SETTINGS = {
  appName: 'تواصل',
  appNameEn: 'Tawasoul',
  primaryFont: 'Cairo',
  secondaryFont: 'Tajawal',
  primaryColor: '#14b8a6'
};

const DEFAULT_SETTINGS_WITH_FLAGS = {
  ...DEFAULT_SETTINGS,
  maintenanceMode: false,
  registrationEnabled: true,
  doctorRegistrationEnabled: true,
  emailNotifications: true,
  smsNotifications: false
};

const isMissingSettingsTable = (error) =>
  error.code === 'P2021' || error.code === 'P2001' || error.message?.includes('does not exist');

export const getSettings = async () => {
  try {
    let settings = await settingsRepo.findFirst();
    if (!settings) {
      settings = await settingsRepo.createSettings(DEFAULT_SETTINGS);
    }
    return settings;
  } catch (error) {
    if (isMissingSettingsTable(error)) {
      return DEFAULT_SETTINGS_WITH_FLAGS;
    }
    throw error;
  }
};

export const updateSettings = async (body) => {
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
    emailService
  } = body;

  try {
    let settings = await settingsRepo.findFirst();

    if (!settings) {
      settings = await settingsRepo.createSettings({
        appName: appName || DEFAULT_SETTINGS.appName,
        appNameEn: appNameEn || DEFAULT_SETTINGS.appNameEn,
        primaryFont: primaryFont || DEFAULT_SETTINGS.primaryFont,
        secondaryFont: secondaryFont || DEFAULT_SETTINGS.secondaryFont,
        primaryColor: primaryColor || DEFAULT_SETTINGS.primaryColor,
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
        emailService
      });
    } else {
      settings = await settingsRepo.updateSettings(settings.id, {
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
        ...(emailService !== undefined && { emailService })
      });
    }

    return settings;
  } catch (error) {
    if (isMissingSettingsTable(error)) {
      throw createHttpError(503, 'MIGRATION_REQUIRED', 'Database migration required. Please run: npx prisma migrate dev');
    }
    throw error;
  }
};
