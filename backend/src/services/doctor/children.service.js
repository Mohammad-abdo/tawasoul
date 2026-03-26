import * as childrenRepo from '../../repositories/doctor/children.repository.js';
import { createHttpError } from '../../utils/httpError.js';

export const getMyChildren = async (doctorId) => {
  const bookings = await childrenRepo.findDistinctChildrenByDoctor(doctorId);
  return bookings
    .filter((booking) => booking.child !== null)
    .map((booking) => booking.child);
};

export const getChildDetails = async (doctorId, childId) => {
  const access = await childrenRepo.findDoctorChildAccess(doctorId, childId);
  if (!access) {
    throw createHttpError(403, 'FORBIDDEN', 'You do not have access to this child');
  }

  return childrenRepo.findChildDetails(doctorId, childId);
};
