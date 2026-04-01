const normalizePrice = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value?.toNumber === 'function') {
    const numericValue = value.toNumber();
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const getBookingDisplayPrice = (booking, sessionPrices = booking?.doctor?.sessionPrices) => {
  if (!Array.isArray(sessionPrices) || sessionPrices.length === 0) {
    return null;
  }

  const duration = Number(booking?.duration);
  const matchedSessionPrice =
    sessionPrices.find((entry) => Number(entry?.duration) === duration) || sessionPrices[0];

  return normalizePrice(matchedSessionPrice?.price);
};

export const omitDoctorSessionPrices = (doctor) => {
  if (!doctor) {
    return doctor;
  }

  const { sessionPrices, ...doctorWithoutSessionPrices } = doctor;
  return doctorWithoutSessionPrices;
};
