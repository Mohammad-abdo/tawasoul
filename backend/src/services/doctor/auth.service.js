import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authRepo from '../../repositories/doctor/auth.repository.js';
import { createHttpError } from '../../utils/httpError.js';
import { ONE_HOUR_SESSION_DURATION } from '../../utils/availability.js';

const signToken = (doctorId) =>
  jwt.sign(
    { doctorId, role: 'DOCTOR' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );

const getSingleSessionPriceInput = (sessionPrices) => {
  if (!Array.isArray(sessionPrices) || sessionPrices.length === 0) {
    return null;
  }

  const matchingEntry = sessionPrices.find((item) => parseInt(item?.duration, 10) === ONE_HOUR_SESSION_DURATION);
  const selectedEntry = matchingEntry || sessionPrices[0];
  const price = parseFloat(selectedEntry?.price);

  if (Number.isNaN(price) || price <= 0) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'A valid 60-minute session price is required');
  }

  return price;
};

const normalizeSessionPrices = (sessionPrices) => {
  if (!Array.isArray(sessionPrices) || sessionPrices.length === 0) {
    return [];
  }

  const preferredEntry = sessionPrices.find((item) => item.duration === ONE_HOUR_SESSION_DURATION)
    || sessionPrices[0];

  return preferredEntry
    ? [{ ...preferredEntry, duration: ONE_HOUR_SESSION_DURATION }]
    : [];
};

const normalizeDoctorSessionPrices = (doctor) => ({
  ...doctor,
  specialization: doctor.specialties?.[0]?.specialty ?? null,
  sessionPrices: normalizeSessionPrices(doctor.sessionPrices)
});

export const register = async ({ name, email, phone, password, specialization }) => {
  if (!name || !email || !phone || !password) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Name, email, phone, and password are required');
  }

  if (password.length < 6) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Password must be at least 6 characters');
  }

  const existingDoctor = await authRepo.findByEmail(email);
  if (existingDoctor) {
    throw createHttpError(409, 'EMAIL_EXISTS', 'Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const specializationValue = typeof specialization === 'string' ? specialization.trim() : '';
  const doctor = await authRepo.createDoctor({
    name,
    email,
    phone,
    password: hashedPassword,
    ...(specializationValue
      ? {
          specialties: {
            create: [{ specialty: specializationValue }]
          }
        }
      : {}),
    isActive: true,
    isApproved: false
  });

  const normalizedDoctor = normalizeDoctorSessionPrices(doctor);
  const { password: _password, ...doctorWithoutPassword } = normalizedDoctor;

  return {
    doctor: doctorWithoutPassword,
    message: 'Registration successful. Your account is pending admin approval.'
  };
};

export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw createHttpError(400, 'VALIDATION_ERROR', 'Email and password are required');
  }

  const doctor = await authRepo.findByEmailWithSpecialties(email);
  if (!doctor) {
    throw createHttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const isValidPassword = await bcrypt.compare(password, doctor.password);
  if (!isValidPassword) {
    throw createHttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const token = signToken(doctor.id);
  const normalizedDoctor = normalizeDoctorSessionPrices(doctor);
  const { password: _password, ...doctorWithoutPassword } = normalizedDoctor;

  return {
    doctor: doctorWithoutPassword,
    token
  };
};

export const getMe = async (doctorId) => {
  const doctor = await authRepo.findById(doctorId);
  if (!doctor) {
    throw createHttpError(404, 'DOCTOR_NOT_FOUND', 'Doctor not found');
  }

  const { password: _password, ...doctorWithoutPassword } = normalizeDoctorSessionPrices(doctor);
  return doctorWithoutPassword;
};

export const updateProfile = async (doctorId, body) => {
  const {
    name,
    phone,
    specialization,
    bio,
    avatar,
    specialties,
    sessionPrices
  } = body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (bio !== undefined) updateData.bio = bio;
  if (avatar !== undefined) updateData.avatar = avatar;

  const updatedDoctor = await authRepo.updateDoctor(doctorId, updateData);

  const specializationValue = typeof specialization === 'string' ? specialization.trim() : '';
  const normalizedSpecialties = Array.isArray(specialties) && specialties.length > 0
    ? specialties
    : specialization !== undefined
      ? (specializationValue ? [specializationValue] : [])
      : null;

  if (normalizedSpecialties !== null) {
    await authRepo.replaceSpecialties(doctorId, normalizedSpecialties);
  }

  // The current Prisma schema no longer exposes Doctor.sessionPrices.
  // Keep accepting the form payload for compatibility, but don't persist it here.
  void sessionPrices;

  const refreshedDoctor = await authRepo.findById(doctorId);
  return normalizeDoctorSessionPrices(refreshedDoctor || updatedDoctor);
};
