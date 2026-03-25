import * as doctorsRepo from '../../repositories/user/doctors.repository.js';

const childStatusToSpecialty = {
  AUTISM: 'توحد',
  SPEECH_DISORDER: 'تخاطب',
  BEHAVIOR_MODIFICATION: 'سلوك',
  LEARNING_DIFFICULTIES: 'تعليم',
  SKILLS_DEVELOPMENT: 'مهارات',
  PSYCHOLOGICAL_TESTS: 'نفسي',
  DOWN_SYNDROME: 'داون',
  COCHLEAR_IMPLANTS: 'سمع',
  OTHER: null
};

export const getAllDoctors = async (userId, query) => {
  const { page = 1, limit = 20, specialty, rating, price, sort = 'rating', search, recommendedForChildId } = query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = { isActive: true, isApproved: true };

  if (recommendedForChildId && userId) {
    const child = await doctorsRepo.findChild(recommendedForChildId, userId);
    if (child?.status) {
      const keyword = childStatusToSpecialty[child.status];
      if (keyword) {
        where.specialties = { some: { specialty: { contains: keyword } } };
      }
    }
  } else if (specialty) {
    where.specialties = { some: { specialty: { contains: specialty } } };
  }

  if (rating) where.rating = { gte: parseFloat(rating) };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { specialization: { contains: search } },
      { bio: { contains: search } }
    ];
  }

  const orderByMap = { rating: { rating: 'desc' }, sessions: { totalSessions: 'desc' }, newest: { createdAt: 'desc' } };
  const orderBy = orderByMap[sort] || { rating: 'desc' };

  const [doctors, total] = await Promise.all([
    doctorsRepo.findMany({ where, skip, take, orderBy }),
    doctorsRepo.count(where)
  ]);

  let filteredDoctors = doctors;
  if (price) {
    const maxPrice = parseFloat(price);
    filteredDoctors = doctors.filter(d => Math.min(...d.sessionPrices.map(sp => sp.price)) <= maxPrice);
  }

  const formattedDoctors = filteredDoctors.map(d => ({
    id: d.id, name: d.name, specialization: d.specialization, bio: d.bio,
    avatar: d.avatar, rating: d.rating, totalSessions: d.totalSessions,
    isVerified: d.isVerified, isFeatured: d.isFeatured,
    specialties: d.specialties.map(s => s.specialty),
    sessionPrices: d.sessionPrices,
    stats: { bookings: d._count.bookings },
    createdAt: d.createdAt
  }));

  return {
    doctors: formattedDoctors,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: filteredDoctors.length, pages: Math.ceil(filteredDoctors.length / parseInt(limit)) }
  };
};

export const getDoctorById = async (id) => {
  const doctor = await doctorsRepo.findById(id);

  if (!doctor) {
    const err = new Error('Doctor not found'); err.code = 'DOCTOR_NOT_FOUND'; err.status = 404; throw err;
  }

  const formattedAvailability = doctor.availability.map(a => ({
    dayOfWeek: a.dayOfWeek,
    timeSlots: JSON.parse(a.timeSlots || '[]')
  }));

  return {
    id: doctor.id, name: doctor.name, email: doctor.email, phone: doctor.phone,
    specialization: doctor.specialization, bio: doctor.bio, avatar: doctor.avatar,
    rating: doctor.rating, totalSessions: doctor.totalSessions, totalRatings: doctor.totalRatings,
    isVerified: doctor.isVerified, isFeatured: doctor.isFeatured,
    specialties: doctor.specialties.map(s => s.specialty),
    experiences: doctor.experiences, certificates: doctor.certificates, education: doctor.education,
    sessionPrices: [...doctor.sessionPrices].sort((a, b) => (a.duration || 0) - (b.duration || 0)),
    availability: formattedAvailability,
    stats: { bookings: doctor._count.bookings, articles: doctor._count.articles },
    createdAt: doctor.createdAt
  };
};

export const getDoctorAvailableSlots = async (doctorId, dateStr) => {
  if (!dateStr) {
    const err = new Error('Query param "date" (YYYY-MM-DD) is required'); err.code = 'BAD_REQUEST'; err.status = 400; throw err;
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    const err = new Error('Invalid date format. Use YYYY-MM-DD'); err.code = 'BAD_REQUEST'; err.status = 400; throw err;
  }

  const dayOfWeek = date.getDay();
  const availability = await doctorsRepo.findAvailability(doctorId, dayOfWeek);

  if (!availability) return { slots: [], date: dateStr };

  let rawSlots = [];
  try {
    rawSlots = typeof availability.timeSlots === 'string'
      ? JSON.parse(availability.timeSlots || '[]')
      : availability.timeSlots || [];
  } catch { rawSlots = []; }

  const slots = (Array.isArray(rawSlots) ? rawSlots : [])
    .map(s => ({ time: String(typeof s === 'string' ? s : (s?.time ?? s?.start ?? '')), date: dateStr, available: true }))
    .filter(s => s.time && s.time.trim());

  return { slots, date: dateStr };
};
