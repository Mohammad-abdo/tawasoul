export const ONE_HOUR_SESSION_DURATION = 60;

const pad = (value) => String(value).padStart(2, '0');

export const normalizeTimeSlotValue = (value) => {
  const rawValue = typeof value === 'string'
    ? value
    : value?.time ?? value?.start ?? value?.startTime ?? '';
  const trimmed = String(rawValue || '').trim();

  if (!trimmed) {
    return null;
  }

  const hourMinuteMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (hourMinuteMatch) {
    const hours = parseInt(hourMinuteMatch[1], 10);
    const minutes = parseInt(hourMinuteMatch[2], 10);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${pad(hours)}:${pad(minutes)}`;
    }
  }

  const meridiemMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (meridiemMatch) {
    let hours = parseInt(meridiemMatch[1], 10);
    const minutes = parseInt(meridiemMatch[2], 10);
    const meridiem = meridiemMatch[3].toUpperCase();

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      return null;
    }

    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return `${pad(hours)}:${pad(minutes)}`;
  }

  return null;
};

export const parseTimeSlots = (timeSlots) => {
  let parsed = timeSlots;

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed || '[]');
    } catch {
      parsed = [];
    }
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return [...new Set(parsed.map(normalizeTimeSlotValue).filter(Boolean))].sort();
};

export const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

export const buildSlotDate = (date, time) => {
  const normalizedTime = normalizeTimeSlotValue(time);
  if (!normalizedTime) {
    return null;
  }

  const [hours, minutes] = normalizedTime.split(':').map((part) => parseInt(part, 10));
  const slotDate = new Date(date);
  slotDate.setHours(hours, minutes, 0, 0);
  return slotDate;
};

