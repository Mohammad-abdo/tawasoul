import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Get All Doctors
 */
/** Map ChildStatus to specialty keywords for doctor matching (ترشيح المختصين حسب حالة الطفل) */
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

export const getAllDoctors = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      specialty,
      rating,
      price,
      available,
      sort = 'rating',
      search,
      recommendedForChildId
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      isActive: true,
      isApproved: true
    };

    // ترشيح المختصين بناءً على حالة الطفل (بعد استبيان الطفل)
    if (recommendedForChildId && req.user?.id) {
      const child = await prisma.child.findFirst({
        where: { id: recommendedForChildId, userId: req.user.id },
        select: { status: true }
      });
      if (child?.status) {
        const keyword = childStatusToSpecialty[child.status];
        if (keyword) {
          where.specialties = {
            some: {
              specialty: { contains: keyword }
            }
          };
        }
      }
    } else if (specialty) {
      where.specialties = {
        some: {
          specialty: { contains: specialty }
        }
      };
    }

    if (rating) {
      where.rating = { gte: parseFloat(rating) };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { specialization: { contains: search } },
        { bio: { contains: search } }
      ];
    }

    // Build orderBy
    let orderBy = {};
    switch (sort) {
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'sessions':
        orderBy = { totalSessions: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { rating: 'desc' };
    }

    // Get doctors
    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          specialties: {
            select: {
              specialty: true
            }
          },
          sessionPrices: {
            select: {
              duration: true,
              price: true
            }
          },
          _count: {
          select: {
            bookings: true
          }
          }
        }
      }),
      prisma.doctor.count({ where })
    ]);

    // Filter by price if provided
    let filteredDoctors = doctors;
    if (price) {
      const maxPrice = parseFloat(price);
      filteredDoctors = doctors.filter(doctor => {
        const minPrice = Math.min(...doctor.sessionPrices.map(sp => sp.price));
        return minPrice <= maxPrice;
      });
    }

    // Format response
    const formattedDoctors = filteredDoctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      bio: doctor.bio,
      avatar: doctor.avatar,
      rating: doctor.rating,
      totalSessions: doctor.totalSessions,
      isVerified: doctor.isVerified,
      isFeatured: doctor.isFeatured,
      specialties: doctor.specialties.map(s => s.specialty),
      sessionPrices: doctor.sessionPrices,
      stats: {
        bookings: doctor._count.bookings,
        tips: doctor._count.tips
      },
      createdAt: doctor.createdAt
    }));

    res.json({
      success: true,
      data: {
        doctors: formattedDoctors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredDoctors.length,
          pages: Math.ceil(filteredDoctors.length / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get doctors error:', error);
    next(error);
  }
};

/**
 * Get Doctor by ID
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        specialties: {
          select: {
            specialty: true
          }
        },
        experiences: {
          orderBy: { startDate: 'desc' },
          select: {
            id: true,
            title: true,
            workplace: true,
            startDate: true,
            endDate: true
          }
        },
        certificates: {
          orderBy: { startDate: 'desc' },
          select: {
            id: true,
            title: true,
            issuer: true,
            startDate: true,
            endDate: true,
            certificateLink: true
          }
        },
        education: {
          orderBy: { startDate: 'desc' },
          select: {
            id: true,
            degree: true,
            institution: true,
            startDate: true,
            endDate: true
          }
        },
        sessionPrices: {
          select: {
            duration: true,
            price: true
          }
        },
        availability: {
          where: { isActive: true },
          select: {
            dayOfWeek: true,
            timeSlots: true
          }
        },
        _count: {
          select: {
            bookings: true,
            tips: true,
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

    // Parse availability time slots
    const formattedAvailability = doctor.availability.map(avail => ({
      dayOfWeek: avail.dayOfWeek,
      timeSlots: JSON.parse(avail.timeSlots || '[]')
    }));

    const formattedDoctor = {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      bio: doctor.bio,
      avatar: doctor.avatar,
      rating: doctor.rating,
      totalSessions: doctor.totalSessions,
      totalRatings: doctor.totalRatings,
      isVerified: doctor.isVerified,
      isFeatured: doctor.isFeatured,
      specialties: doctor.specialties.map(s => s.specialty),
      experiences: doctor.experiences,
      certificates: doctor.certificates,
      education: doctor.education,
      sessionPrices: [...doctor.sessionPrices].sort((a, b) => (a.duration || 0) - (b.duration || 0)),
      availability: formattedAvailability,
      stats: {
        bookings: doctor._count.bookings,
        articles: doctor._count.articles
      },
      createdAt: doctor.createdAt
    };

    res.json({
      success: true,
      data: formattedDoctor
    });
  } catch (error) {
    logger.error('Get doctor error:', error);
    next(error);
  }
};

/**
 * GET /doctors/:id/available-slots?date=YYYY-MM-DD
 * Returns available time slots for a doctor on a given date.
 */
export const getDoctorAvailableSlots = async (req, res, next) => {
  try {
    const { id: doctorId } = req.params;
    const dateStr = req.query.date; // YYYY-MM-DD

    if (!dateStr) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Query param "date" (YYYY-MM-DD) is required' }
      });
    }

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid date format. Use YYYY-MM-DD' }
      });
    }

    // 0=Sunday, 1=Monday, ... 6=Saturday (JS getDay())
    const dayOfWeek = date.getDay();

    const availability = await prisma.availability.findFirst({
      where: { doctorId, dayOfWeek, isActive: true }
    });

    if (!availability) {
      return res.json({
        success: true,
        data: { slots: [], date: dateStr }
      });
    }

    let rawSlots = [];
    try {
      rawSlots = typeof availability.timeSlots === 'string'
        ? JSON.parse(availability.timeSlots || '[]')
        : availability.timeSlots || [];
    } catch {
      rawSlots = [];
    }

    const slots = (Array.isArray(rawSlots) ? rawSlots : []).map((s) => {
      const time = typeof s === 'string' ? s : (s?.time ?? s?.start ?? '');
      return {
        time: String(time),
        date: dateStr,
        available: true
      };
    }).filter((s) => s.time && s.time.trim());

    res.json({
      success: true,
      data: { slots, date: dateStr }
    });
  } catch (error) {
    logger.error('Get doctor available slots error:', error);
    next(error);
  }
};

