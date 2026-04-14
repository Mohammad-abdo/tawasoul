import * as doctorsRepo from '../../repositories/user/doctors.repository.js';
import {
  buildSlotDate,
  formatDateKey,
  parseTimeSlots
} from '../../utils/availability.js';

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

const getDoctorSpecialization = (doctor) => doctor.specialization ?? doctor.specialties?.[0]?.specialty ?? null;

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
      { specialties: { some: { specialty: { contains: search } } } },
      { bio: { contains: search } }
    ];
  }

  const orderByMap = { rating: { rating: 'desc' }, sessions: { totalSessions: 'desc' }, newest: { createdAt: 'desc' } };
  const orderBy = orderByMap[sort] || { rating: 'desc' };

  const [doctors, total] = await Promise.all([
    doctorsRepo.findMany({ where, skip, take, orderBy }),
    doctorsRepo.count(where)
  ]);

  //   const getSingleSessionPrices = (doctor) => {
  //     const orderedPrices = [...doctor.sessionPrices].sort((a, b) => (a.duration || 0) - (b.duration || 0));
  //     const hourlyPrice = orderedPrices.find((item) => item.duration === ONE_HOUR_SESSION_DURATION) || orderedPrices[0];
  //
  //     return hourlyPrice ? [{ ...hourlyPrice, duration: ONE_HOUR_SESSION_DURATION }] : [];
  //   };
  const getDoctorPrice = (doctor) => {
    const normalizedPrice = Number(doctor?.hourlyRate);
    return Number.isFinite(normalizedPrice) ? normalizedPrice : null;
  };

  let filteredDoctors = doctors;
  if (price) {
    const maxPrice = parseFloat(price);
    filteredDoctors = doctors.filter((doctor) => {
      //       const sessionPrice = getSingleSessionPrices(doctor)[0];
      const doctorPrice = getDoctorPrice(doctor);
      return doctorPrice !== null ? doctorPrice <= maxPrice : false;
    });
  }

  const formattedDoctors = filteredDoctors.map(d => ({
    id: d.id, name: d.name, specialization: getDoctorSpecialization(d), bio: d.bio,
    avatar: d.avatar, rating: d.rating, totalSessions: d.totalSessions,
    isVerified: d.isVerified, isFeatured: d.isFeatured,
    specialties: d.specialties.map(s => s.specialty),
    //     sessionPrices: getSingleSessionPrices(d),
    price: getDoctorPrice(d),
    hourlyRate: getDoctorPrice(d),
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
    timeSlots: parseTimeSlots(a.timeSlots)
  }));

  // const orderedPrices = [...doctor.sessionPrices].sort((a, b) => (a.duration || 0) - (b.duration || 0));
  // const preferredPrice = orderedPrices.find((item) => item.duration === ONE_HOUR_SESSION_DURATION) || orderedPrices[0];
  // const sessionPrices = preferredPrice ? [{ ...preferredPrice, duration: ONE_HOUR_SESSION_DURATION }] : [];
  const doctorPrice = Number(doctor?.hourlyRate);

  return {
    id: doctor.id, name: doctor.name, email: doctor.email, phone: doctor.phone,
    specialization: getDoctorSpecialization(doctor), bio: doctor.bio, avatar: doctor.avatar,
    rating: doctor.rating, totalSessions: doctor.totalSessions, totalRatings: doctor.totalRatings,
    isVerified: doctor.isVerified, isFeatured: doctor.isFeatured,
    specialties: doctor.specialties.map(s => s.specialty),
    experiences: doctor.experiences, certificates: doctor.certificates, education: doctor.education,
    //     sessionPrices,
    price: Number.isFinite(doctorPrice) ? doctorPrice : null,
    hourlyRate: Number.isFinite(doctorPrice) ? doctorPrice : null,
    availability: formattedAvailability,
    stats: { bookings: doctor._count.bookings, articles: doctor._count.articles },
    createdAt: doctor.createdAt
  };
};

export const getAvailableSlots = async (doctorId, dateStr, options = {}) => {
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

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const [rawSlots, bookings] = await Promise.all([
    parseTimeSlots(availability.timeSlots),
    doctorsRepo.findBookingsForDate(doctorId, dayStart, dayEnd, options.excludeBookingId)
  ]);

  const now = new Date();
  const bookedSlotKeys = new Set(
    bookings
      .map((booking) => formatDateKey(new Date(booking.scheduledAt)) + '|' + new Date(booking.scheduledAt).toTimeString().slice(0, 5))
  );

  const slots = rawSlots
    .map((time) => {
      const slotDate = buildSlotDate(date, time);
      if (!slotDate) return null;

      const slotKey = `${formatDateKey(slotDate)}|${time}`;
      const isBooked = bookedSlotKeys.has(slotKey);
      const isPast = slotDate <= now;
      return {
        time,
        date: dateStr,
        available: !isBooked && !isPast
      };
    })
    .filter((slot) => slot && slot.available);

  return { slots, date: dateStr };
};

export const getDoctorAvailableSlots = async (doctorId, dateStr) => getAvailableSlots(doctorId, dateStr);
