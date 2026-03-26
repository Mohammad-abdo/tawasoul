import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authRepo from '../../repositories/doctor/auth.repository.js';
import { createHttpError } from '../../utils/httpError.js';

const signToken = (doctorId) =>
  jwt.sign(
    { doctorId, role: 'DOCTOR' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );

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
  const doctor = await authRepo.createDoctor({
    name,
    email,
    phone,
    password: hashedPassword,
    specialization: specialization || null,
    isActive: true,
    isApproved: false
  });

  return {
    doctor,
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
  const { password: _password, ...doctorWithoutPassword } = doctor;

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

  const { password: _password, ...doctorWithoutPassword } = doctor;
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
  if (specialization) updateData.specialization = specialization;
  if (bio !== undefined) updateData.bio = bio;
  if (avatar !== undefined) updateData.avatar = avatar;

  const updatedDoctor = await authRepo.updateDoctor(doctorId, updateData);

  if (specialties && Array.isArray(specialties)) {
    await authRepo.replaceSpecialties(doctorId, specialties);
  }

  if (sessionPrices && Array.isArray(sessionPrices)) {
    await Promise.all(
      sessionPrices.map((sessionPrice) =>
        authRepo.upsertSessionPrice(
          doctorId,
          parseInt(sessionPrice.duration),
          parseFloat(sessionPrice.price)
        )
      )
    );
  }

  return updatedDoctor;
};
