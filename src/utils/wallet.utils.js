import { Prisma } from '@prisma/client';
import { createHttpError } from './httpError.js';
import { getBookingScheduledDate } from './booking-schedule.utils.js';

const toDecimal = (value) => new Prisma.Decimal(value || 0);

export const ensureDoctorWallet = (tx, doctorId) =>
  tx.doctorWallet.upsert({
    where: { doctorId },
    update: {},
    create: { doctorId }
  });

export const calculateSessionDurationMinutes = ({ scheduledYear, scheduledMonth, scheduledDay, scheduledTime, completedAt, duration }) => {
  const scheduledDate = getBookingScheduledDate({ scheduledYear, scheduledMonth, scheduledDay, scheduledTime });

  if (scheduledDate && completedAt) {
    const diffMs = new Date(completedAt).getTime() - scheduledDate.getTime();
    const diffMinutes = Math.round(diffMs / 60000);

    if (Number.isFinite(diffMinutes) && diffMinutes > 0) {
      return diffMinutes;
    }
  }

  const fallbackDuration = Number(duration);
  return Number.isFinite(fallbackDuration) && fallbackDuration > 0 ? fallbackDuration : 0;
};

export const calculateWalletEarningAmount = ({ hourlyRate, sessionDurationMinutes }) => {
  const safeHourlyRate = Number(hourlyRate || 0);
  const safeDuration = Number(sessionDurationMinutes || 0);

  if (!Number.isFinite(safeHourlyRate) || safeHourlyRate < 0) {
    throw createHttpError(422, 'INVALID_HOURLY_RATE', 'Doctor hourlyRate must be a valid non-negative number');
  }

  if (!Number.isFinite(safeDuration) || safeDuration < 0) {
    throw createHttpError(422, 'INVALID_DURATION', 'Session duration must be a valid non-negative number');
  }

  return Number(((safeHourlyRate * safeDuration) / 60).toFixed(2));
};

export const creditDoctorWalletForCompletedBooking = async ({ tx, booking, completedAt = new Date() }) => {
  if (!booking?.doctorId) {
    throw createHttpError(422, 'INVALID_BOOKING', 'Booking doctorId is required');
  }

  const wallet = await ensureDoctorWallet(tx, booking.doctorId);
  const durationMinutes = calculateSessionDurationMinutes({
    scheduledYear: booking.scheduledYear,
    scheduledMonth: booking.scheduledMonth,
    scheduledDay: booking.scheduledDay,
    scheduledTime: booking.scheduledTime,
    completedAt,
    duration: booking.duration
  });
  const earningAmount = calculateWalletEarningAmount({
    hourlyRate: booking.doctor?.hourlyRate,
    sessionDurationMinutes: durationMinutes
  });
  const normalizedAmount = toDecimal(earningAmount);

  await tx.doctorWallet.update({
    where: { id: wallet.id },
    data: {
      balance: {
        increment: normalizedAmount
      }
    }
  });

  await tx.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: 'EARNING',
      amount: normalizedAmount,
      description: `Session earning for booking ${booking.id}`
    }
  });

  return {
    walletId: wallet.id,
    earningAmount
  };
};
