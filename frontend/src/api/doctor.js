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

  getTestById: (testId) =>
    apiClient.get(`/doctor/assessments/tests/${testId}`),
  
  getTestQuestions: (testId) =>
    apiClient.get(`/doctor/assessments/tests/${testId}/questions`),
  
  submitResult: (data) =>
    apiClient.post('/doctor/assessments/generic/submit', data),

  submitCarsResult: (data) =>
    apiClient.post('/doctor/assessments/cars/submit', data),

  // ==========================================
  // Endpoints الاختبارات الجديدة
  // ==========================================
  submitVerbalNonsenseResult: (data) =>
    apiClient.post('/doctor/assessments/verbal-nonsense/submit', data),

  submitAnalogyResult: (data) =>
    apiClient.post('/doctor/assessments/analogy/submit', data),

  submitVisualMemoryResult: (data) =>
    apiClient.post('/doctor/assessments/visual-memory/submit', data),

  submitAuditoryMemoryResult: (data) =>
    apiClient.post('/doctor/assessments/auditory-memory/submit', data),

  submitSequenceOrderResult: (data) =>
    apiClient.post('/doctor/assessments/image-sequence-order/submit', data),

  submitHelpResult: (data) =>
    apiClient.post('/doctor/assessments/help/submit', data),

  // ==========================================
  // Endpoints مقياس الـ HELP
  // ==========================================
  startHelpAssessment: (data) =>
    apiClient.post('/doctor/assessments/help/start', data),
  
  evaluateHelpAssessment: (helpAssessmentId, data) =>
    apiClient.post(`/doctor/assessments/help/${helpAssessmentId}/evaluate`, data),
  
  getHelpAssessment: (helpAssessmentId) =>
    apiClient.get(`/doctor/assessments/help/${helpAssessmentId}`),

  updateHelpAssessment: (helpAssessmentId, data) =>
    apiClient.patch(`/doctor/assessments/help/${helpAssessmentId}`, data),

  // ==========================================
  
  getChildResults: (childId) => 
    apiClient.get(`/doctor/assessments/children/${childId}/results`),

  getChildSessionDetails: (childId, sessionId) =>
    apiClient.get(`/doctor/assessments/children/${childId}/results/${sessionId}`),

  downloadChildSessionPdf: (childId, sessionId) =>
    apiClient.get(`/doctor/assessments/children/${childId}/results/${sessionId}/pdf`, { responseType: 'blob' }),
};

// Doctor messages (chat)
export const doctorMessages = {
  getConversations: (params) =>
    apiClient.get('/doctor/messages/conversations', { params }),

  getConversationMessages: (userId, params) =>
    apiClient.get(`/doctor/messages/conversation/${userId}`, { params }),

  sendMessageToUser: (data) =>
    apiClient.post('/doctor/messages/send', data),
};

export const doctorWallet = {
  get: () =>
    apiClient.get('/doctor/wallet'),

  requestWithdrawal: (data) =>
    apiClient.post('/doctor/wallet/withdraw', data),
};

export const doctorVbMapp = {
  getSkillAreas: () =>
    apiClient.get('/doctor/assessments/vbmapp/skill-areas'),
    
  getBarriers: () =>
    apiClient.get('/doctor/assessments/vbmapp/barriers'),
    
  getTransitionCriteria: () =>
    apiClient.get('/doctor/assessments/vbmapp/transition-criteria'),
    
  getEesaGroups: () =>
    apiClient.get('/doctor/assessments/vbmapp/eesa-groups'),
    
  createSession: (data) =>
    apiClient.post('/doctor/assessments/vbmapp/sessions', data),
    
  getSession: (sessionId) =>
    apiClient.get(`/doctor/assessments/vbmapp/sessions/${sessionId}`),
    
  getChildSessions: (childId) =>
    apiClient.get(`/doctor/assessments/vbmapp/children/${childId}/sessions`),
    
  updateSession: (sessionId, data) =>
    apiClient.patch(`/doctor/assessments/vbmapp/sessions/${sessionId}`, data),
    
  submitMilestones: (sessionId, data) =>
    apiClient.post(`/doctor/assessments/vbmapp/sessions/${sessionId}/milestones`, data),
    
  submitTaskSteps: (sessionId, data) =>
    apiClient.post(`/doctor/assessments/vbmapp/sessions/${sessionId}/task-steps`, data),
    
  submitBarriers: (sessionId, data) =>
    apiClient.post(`/doctor/assessments/vbmapp/sessions/${sessionId}/barriers`, data),
    
  submitTransitions: (sessionId, data) =>
    apiClient.post(`/doctor/assessments/vbmapp/sessions/${sessionId}/transitions`, data),
    
  submitEesa: (sessionId, data) =>
    apiClient.post(`/doctor/assessments/vbmapp/sessions/${sessionId}/eesa`, data),
    
  createIepGoal: (sessionId, data) =>
    apiClient.post(`/doctor/assessments/vbmapp/sessions/${sessionId}/iep-goals`, data),
    
  updateIepGoal: (goalId, data) =>
    apiClient.patch(`/doctor/assessments/vbmapp/iep-goals/${goalId}`, data),
    
  getSummary: (childId) =>
    apiClient.get(`/doctor/assessments/vbmapp/children/${childId}/summary`),
};
