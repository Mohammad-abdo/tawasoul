import apiClient from './client';

// Authentication
export const doctorAuth = {
  login: (credentials) => 
    apiClient.post('/doctor/auth/login', credentials),
  
  getMe: () => 
    apiClient.get('/doctor/auth/me'),

  updateProfile: (data) => 
    apiClient.put('/doctor/auth/profile', data),
};

// Dashboard
export const doctorDashboard = {
  getStats: () => 
    apiClient.get('/doctor/dashboard'),
};

// Children & Assessments
export const doctorChildren = {
  getAll: (params) => 
    apiClient.get('/doctor/children', { params }),
  
  getById: (id) => 
    apiClient.get(`/doctor/children/${id}`),
};

// Bookings
export const doctorBookings = {
  getAll: (params) => 
    apiClient.get('/doctor/bookings', { params }),
  
  getById: (id) => 
    apiClient.get(`/doctor/bookings/${id}`),
  
  confirm: (id) => 
    apiClient.put(`/doctor/bookings/${id}/confirm`),
  
  cancel: (id, reason) => 
    apiClient.put(`/doctor/bookings/${id}/cancel`, { reason }),
  
  complete: (id, data) =>
    apiClient.put(`/doctor/bookings/${id}/complete`, data),
};

// Availability
export const doctorAvailability = {
  get: () => 
    apiClient.get('/doctor/availability'),
  
  update: (data) => 
    apiClient.put('/doctor/availability', data),
};

// Assessments
export const doctorAssessments = {
  getTests: () => 
    apiClient.get('/doctor/assessments/tests'),
  
  getTestQuestions: (testId) =>
    apiClient.get(`/doctor/assessments/tests/${testId}/questions`),
  
  submitResult: (data) =>
    apiClient.post('/doctor/assessments/submit-result', data),
  
  getChildResults: (childId) => 
    apiClient.get(`/doctor/children/${childId}/results`),
};
