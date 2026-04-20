import { formatDateKey, normalizeTimeSlotValue } from './availability.js';

const pad = (value) => String(value).padStart(2, '0');

export const bookingScheduleOrderBy = (direction = 'desc') => ([
  { scheduledYear: direction },
  { scheduledMonth: direction },
  { scheduledDay: direction },
  { scheduledTime: direction }
]);

export const buildBookingOrderBy = (field = 'createdAt', direction = 'desc') =>
  ['scheduledYear', 'scheduledMonth', 'scheduledDay', 'scheduledTime'].includes(field)
    ? bookingScheduleOrderBy(direction)
    : { [field]: direction };

export const formatScheduledTime = (normalizedTime) => {
  const [hours, minutes] = normalizedTime.split(':').map((part) => parseInt(part, 10));
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${pad(hour12)}:${pad(minutes)} ${period}`;
};

export const buildScheduledDate = ({ scheduledYear, scheduledMonth, scheduledDay, scheduledTime }) => {
  const year = parseInt(scheduledYear, 10);
  const month = parseInt(scheduledMonth, 10);
  const day = parseInt(scheduledDay, 10);
  const normalizedTime = normalizeTimeSlotValue(scheduledTime);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) || !normalizedTime) {
    return null;
  }

  const [hours, minutes] = normalizedTime.split(':').map((part) => parseInt(part, 10));
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return {
    date,
    year,
    month,
    day,
    normalizedTime,
    displayTime: formatScheduledTime(normalizedTime),
    dateKey: formatDateKey(date)
  };
};

export const getBookingScheduledDate = (booking) =>
  buildScheduledDate({
    scheduledYear: booking?.scheduledYear,
    scheduledMonth: booking?.scheduledMonth,
    scheduledDay: booking?.scheduledDay,
    scheduledTime: booking?.scheduledTime
  })?.date ?? null;

export const getBookingScheduleDateKey = (booking) =>
  buildScheduledDate({
    scheduledYear: booking?.scheduledYear,
    scheduledMonth: booking?.scheduledMonth,
    scheduledDay: booking?.scheduledDay,
    scheduledTime: booking?.scheduledTime
  })?.dateKey ?? null;
