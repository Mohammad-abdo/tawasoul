import * as addressRepo from '../../repositories/doctor/address.repository.js';

const notFound = () => {
  const err = new Error('Address not found');
  err.code = 'ADDRESS_NOT_FOUND';
  err.status = 404;
  return err;
};

const forbidden = () => {
  const err = new Error('You can only access your own addresses');
  err.code = 'FORBIDDEN';
  err.status = 403;
  return err;
};

const validationError = (message, code = 'VALIDATION_ERROR') => {
  const err = new Error(message);
  err.code = code;
  err.status = 400;
  return err;
};

const formatAddress = (address) => ({
  id: address.id,
  label: address.label,
  fullAddress: address.fullAddress,
  latitude: address.latitude,
  longitude: address.longitude,
  city: address.city,
  country: address.country,
  isDefault: address.isDefault,
  createdAt: address.createdAt,
  updatedAt: address.updatedAt
});

export const getDoctorAddresses = async (doctorId) => {
  const addresses = await addressRepo.findAllByDoctorId(doctorId);
  return {
    addresses: addresses.map(formatAddress),
    pagination: { total: addresses.length }
  };
};

export const getAddressById = async (doctorId, id) => {
  const address = await addressRepo.findById(id);
  if (!address) throw notFound();
  if (address.doctorId !== doctorId) throw forbidden();
  return formatAddress(address);
};

export const createAddress = async (doctorId, data) => {
  const { label, fullAddress, latitude, longitude, city, country, isDefault } = data;

  if (!label || !label.trim()) {
    throw validationError('Label is required');
  }
  if (!fullAddress || !fullAddress.trim()) {
    throw validationError('Full address is required');
  }
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw validationError('Latitude and longitude must be valid numbers');
  }
  if (!city || !city.trim()) {
    throw validationError('City is required');
  }
  if (!country || !country.trim()) {
    throw validationError('Country is required');
  }

  const address = await addressRepo.createAddress({
    doctorId,
    label: label.trim(),
    fullAddress: fullAddress.trim(),
    latitude,
    longitude,
    city: city.trim(),
    country: country.trim(),
    isDefault: isDefault || false
  });

  if (isDefault) {
    await addressRepo.setDefaultForDoctor(doctorId, address.id);
    return formatAddress({ ...address, isDefault: true });
  }

  return formatAddress(address);
};

export const updateAddress = async (doctorId, id, data) => {
  const existing = await addressRepo.findByIdSimple(id);
  if (!existing) throw notFound();
  if (existing.doctorId !== doctorId) throw forbidden();

  const { label, fullAddress, latitude, longitude, city, country, isDefault } = data;

  if (label !== undefined && !label.trim()) {
    throw validationError('Label cannot be empty');
  }
  if (fullAddress !== undefined && !fullAddress.trim()) {
    throw validationError('Full address cannot be empty');
  }
  if (latitude !== undefined && typeof latitude !== 'number') {
    throw validationError('Latitude must be a valid number');
  }
  if (longitude !== undefined && typeof longitude !== 'number') {
    throw validationError('Longitude must be a valid number');
  }
  if (city !== undefined && !city.trim()) {
    throw validationError('City cannot be empty');
  }
  if (country !== undefined && !country.trim()) {
    throw validationError('Country cannot be empty');
  }

  const updateData = {};
  if (label !== undefined) updateData.label = label.trim();
  if (fullAddress !== undefined) updateData.fullAddress = fullAddress.trim();
  if (latitude !== undefined) updateData.latitude = latitude;
  if (longitude !== undefined) updateData.longitude = longitude;
  if (city !== undefined) updateData.city = city.trim();
  if (country !== undefined) updateData.country = country.trim();
  if (isDefault !== undefined) updateData.isDefault = isDefault;

  const updated = await addressRepo.updateAddress(id, updateData);

  if (isDefault) {
    await addressRepo.setDefaultForDoctor(doctorId, id);
  }

  return formatAddress(updated);
};

export const deleteAddress = async (doctorId, id) => {
  const address = await addressRepo.findByIdSimple(id);
  if (!address) throw notFound();
  if (address.doctorId !== doctorId) throw forbidden();
  await addressRepo.deleteAddress(id);
};