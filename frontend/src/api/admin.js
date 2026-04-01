import apiClient from './client';

// Authentication
export const adminAuth = {
  login: (credentials) =>
    apiClient.post('/admin/auth/login', credentials),

  logout: () =>
    apiClient.post('/admin/auth/logout'),

  getMe: () =>
    apiClient.get('/admin/auth/me'),
};

// Dashboard
export const dashboard = {
  getStats: () =>
    apiClient.get('/admin/dashboard'),

  getAnalytics: (params) =>
    apiClient.get('/admin/dashboard/analytics', { params }),
};

// Users
export const users = {
  getAll: (params) =>
    apiClient.get('/admin/users', { params }),

  getById: (id) =>
    apiClient.get(`/admin/users/${id}`),

  create: (data) =>
    apiClient.post('/admin/users', data),

  update: (id, data) =>
    apiClient.put(`/admin/users/${id}`, data),

  approve: (id) =>
    apiClient.put(`/admin/users/${id}/approve`),

  reject: (id, reason) =>
    apiClient.put(`/admin/users/${id}/reject`, { reason }),

  activate: (id) =>
    apiClient.put(`/admin/users/${id}/activate`),

  deactivate: (id, reason) =>
    apiClient.put(`/admin/users/${id}/deactivate`, { reason }),

  delete: (id) =>
    apiClient.delete(`/admin/users/${id}`),
};

// Doctors
export const doctors = {
  getAll: (params) =>
    apiClient.get('/admin/doctors', { params }),

  getById: (id) =>
    apiClient.get(`/admin/doctors/${id}`),

  create: (data) =>
    apiClient.post('/admin/doctors', data),

  update: (id, data) =>
    apiClient.put(`/admin/doctors/${id}`, data),

  approve: (id, notes) =>
    apiClient.put(`/admin/doctors/${id}/approve`, { notes }),

  reject: (id, data) =>
    apiClient.put(`/admin/doctors/${id}/reject`, data),

  verify: (id) =>
    apiClient.put(`/admin/doctors/${id}/verify`),

  unverify: (id) =>
    apiClient.put(`/admin/doctors/${id}/unverify`),

  activate: (id) =>
    apiClient.put(`/admin/doctors/${id}/activate`),

  deactivate: (id, reason) =>
    apiClient.put(`/admin/doctors/${id}/deactivate`, { reason }),
};

// Posts
export const posts = {
  getAll: (params) =>
    apiClient.get('/admin/posts', { params }),

  moderate: (id, data) =>
    apiClient.put(`/admin/posts/${id}/moderate`, data),

  delete: (id) =>
    apiClient.delete(`/admin/posts/${id}`),
};

// Bookings
export const bookings = {
  getAll: (params) =>
    apiClient.get('/admin/bookings', { params }),

  getById: (id) =>
    apiClient.get(`/admin/bookings/${id}`),

  updateStatus: (id, data) =>
    apiClient.put(`/admin/bookings/${id}/status`, data),

  cancel: (id, data) =>
    apiClient.put(`/admin/bookings/${id}/cancel`, data),
};

// Payments & Withdrawals
export const payments = {
  getAll: (params) =>
    apiClient.get('/admin/payments', { params }),

  updateStatus: (id, data) =>
    apiClient.put(`/admin/payments/${id}/status`, data),
};

export const withdrawals = {
  getAll: (params) =>
    apiClient.get('/admin/withdrawals', { params }),

  getById: (id) =>
    apiClient.get(`/admin/withdrawals/${id}`),

  approve: (id, notes) =>
    apiClient.put(`/admin/withdrawals/${id}/approve`, { notes }),

  reject: (id, data) =>
    apiClient.put(`/admin/withdrawals/${id}/reject`, data),
};

export const wallet = {
  getWithdrawalRequests: (params) =>
    apiClient.get('/admin/wallet/withdrawal-requests', { params }),

  resolveWithdrawalRequest: (id, data) =>
    apiClient.patch(`/admin/wallet/withdrawal-requests/${id}/resolve`, data),
};

// Support
export const support = {
  getTickets: (params) =>
    apiClient.get('/admin/support/tickets', { params }),

  getTicket: (id) =>
    apiClient.get(`/admin/support/tickets/${id}`),

  addReply: (id, data) =>
    apiClient.post(`/admin/support/tickets/${id}/replies`, data),

  updateStatus: (id, data) =>
    apiClient.put(`/admin/support/tickets/${id}/status`, data),

  assignTicket: (id, data) =>
    apiClient.put(`/admin/support/tickets/${id}/assign`, data),
};

// Reports
export const reports = {
  getAll: (params) =>
    apiClient.get('/admin/reports', { params }),

  getById: (id) =>
    apiClient.get(`/admin/reports/${id}`),

  generate: (data) =>
    apiClient.post('/admin/reports/generate', data),

  download: (id) =>
    apiClient.get(`/admin/reports/${id}/download`, { responseType: 'blob' }),

  delete: (id) =>
    apiClient.delete(`/admin/reports/${id}`),
};

// Page Content
export const pages = {
  getAll: () =>
    apiClient.get('/admin/pages'),

  getByType: (type) =>
    apiClient.get(`/admin/pages/${type}`),

  update: (type, data) =>
    apiClient.put(`/admin/pages/${type}`, data),

  initialize: () =>
    apiClient.post('/admin/pages/initialize'),
};

// Interests
export const interests = {
  getAll: (params) =>
    apiClient.get('/admin/interests', { params }),

  getById: (id) =>
    apiClient.get(`/admin/interests/${id}`),

  create: (data) =>
    apiClient.post('/admin/interests', data),

  update: (id, data) =>
    apiClient.put(`/admin/interests/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/admin/interests/${id}`),

  activate: (id) =>
    apiClient.put(`/admin/interests/${id}/activate`),

  deactivate: (id) =>
    apiClient.put(`/admin/interests/${id}/deactivate`),
};

// Tags
export const tags = {
  getAll: (params) =>
    apiClient.get('/admin/tags', { params }),

  getById: (id) =>
    apiClient.get(`/admin/tags/${id}`),

  getPopular: () =>
    apiClient.get('/admin/tags/popular'),

  create: (data) =>
    apiClient.post('/admin/tags', data),

  update: (id, data) =>
    apiClient.put(`/admin/tags/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/admin/tags/${id}`),

  merge: (data) =>
    apiClient.post('/admin/tags/merge', data),
};


// Activity Logs
export const activityLogs = {
  getAll: (params) =>
    apiClient.get('/admin/activity-logs', { params }),

  getById: (id) =>
    apiClient.get(`/admin/activity-logs/${id}`),

  getStats: (params) =>
    apiClient.get('/admin/activity-logs/stats', { params }),

  export: (params) =>
    apiClient.get('/admin/activity-logs/export', { params, responseType: 'blob' }),
};

// Coupons
export const coupons = {
  getAll: (params) =>
    apiClient.get('/admin/coupons', { params }),

  getById: (id) =>
    apiClient.get(`/admin/coupons/${id}`),

  getUsage: (id) =>
    apiClient.get(`/admin/coupons/${id}/usage`),

  create: (data) =>
    apiClient.post('/admin/coupons', data),

  update: (id, data) =>
    apiClient.put(`/admin/coupons/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/admin/coupons/${id}`),

  activate: (id) =>
    apiClient.put(`/admin/coupons/${id}/activate`),

  deactivate: (id) =>
    apiClient.put(`/admin/coupons/${id}/deactivate`),
};

// Admins (SUPER_ADMIN only)
export const admins = {
  getAll: (params) =>
    apiClient.get('/admin/admins', { params }),

  getById: (id) =>
    apiClient.get(`/admin/admins/${id}`),

  create: (data) =>
    apiClient.post('/admin/admins', data),

  update: (id, data) =>
    apiClient.put(`/admin/admins/${id}`, data),

  changePassword: (id, data) =>
    apiClient.put(`/admin/admins/${id}/password`, data),

  activate: (id) =>
    apiClient.put(`/admin/admins/${id}/activate`),

  deactivate: (id) =>
    apiClient.put(`/admin/admins/${id}/deactivate`),

  delete: (id) =>
    apiClient.delete(`/admin/admins/${id}`),
};

// Settings
export const settings = {
  get: () =>
    apiClient.get('/admin/settings'),

  update: (data) =>
    apiClient.put('/admin/settings', data),
};

// Onboarding
export const onboarding = {
  getAll: (params) =>
    apiClient.get('/admin/onboarding', { params }),

  getById: (id) =>
    apiClient.get(`/admin/onboarding/${id}`),

  create: (data) =>
    apiClient.post('/admin/onboarding', data),

  update: (id, data) =>
    apiClient.put(`/admin/onboarding/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/admin/onboarding/${id}`),

  reorder: (items) =>
    apiClient.post('/admin/onboarding/reorder', { items }),
};

// Home Sliders
export const homeSliders = {
  getAll: (params) =>
    apiClient.get('/admin/home-sliders', { params }),

  getById: (id) =>
    apiClient.get(`/admin/home-sliders/${id}`),

  create: (data) =>
    apiClient.post('/admin/home-sliders', data),

  update: (id, data) =>
    apiClient.put(`/admin/home-sliders/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/admin/home-sliders/${id}`),

  reorder: (items) =>
    apiClient.post('/admin/home-sliders/reorder', { items }),
};

// Home Services
export const homeServices = {
  getAll: (params) =>
    apiClient.get('/admin/home-services', { params }),

  getById: (id) =>
    apiClient.get(`/admin/home-services/${id}`),

  create: (data) =>
    apiClient.post('/admin/home-services', data),

  update: (id, data) =>
    apiClient.put(`/admin/home-services/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/admin/home-services/${id}`),
};

// Home Articles
export const homeArticles = {
  getAll: (params) =>
    apiClient.get('/admin/home-articles', { params }),

  getById: (id) =>
    apiClient.get(`/admin/home-articles/${id}`),

  create: (data) =>
    apiClient.post('/admin/home-articles', data),

  update: (id, data) =>
    apiClient.put(`/admin/home-articles/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/admin/home-articles/${id}`),
};

// FAQs
export const faqs = {
  getAll: (params) =>
    apiClient.get('/admin/faqs', { params }),

  getById: (id) =>
    apiClient.get(`/admin/faqs/${id}`),

  create: (data) =>
    apiClient.post('/admin/faqs', data),

  update: (id, data) =>
    apiClient.put(`/admin/faqs/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/admin/faqs/${id}`),
};

// Notifications
export const notifications = {
  getAll: (params) =>
    apiClient.get('/admin/notifications', { params }),

  markAsRead: (id) =>
    apiClient.put(`/admin/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.put('/admin/notifications/read-all'),

  delete: (id) =>
    apiClient.delete(`/admin/notifications/${id}`),

  clearAll: () =>
    apiClient.delete('/admin/notifications/clear-all'),
};

// Content Moderation

// Children
export const children = {
  getAll: (params) =>
    apiClient.get('/admin/children', { params }),

  getById: (id) =>
    apiClient.get(`/admin/children/${id}`),

  delete: (id) =>
    apiClient.delete(`/admin/children/${id}`),
};

// Packages
export const packages = {
  getAll: (params) =>
    apiClient.get('/admin/packages', { params }),

  getById: (id) =>
    apiClient.get(`/admin/packages/${id}`),

  create: (data) =>
    apiClient.post('/admin/packages', data),

  update: (id, data) =>
    apiClient.put(`/admin/packages/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/admin/packages/${id}`),

  activate: (id) =>
    apiClient.put(`/admin/packages/${id}/activate`),

  deactivate: (id) =>
    apiClient.put(`/admin/packages/${id}/deactivate`),
};

// Products
export const products = {
  getAll: (params) =>
    apiClient.get('/admin/products', { params }),

  getById: (id) =>
    apiClient.get(`/admin/products/${id}`),

  create: (data) =>
    apiClient.post('/admin/products', data),

  update: (id, data) =>
    apiClient.put(`/admin/products/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/admin/products/${id}`),

  activate: (id) =>
    apiClient.put(`/admin/products/${id}/activate`),

  deactivate: (id) =>
    apiClient.put(`/admin/products/${id}/deactivate`),
};

// Orders
export const orders = {
  getAll: (params) =>
    apiClient.get('/admin/orders', { params }),

  getById: (id) =>
    apiClient.get(`/admin/orders/${id}`),

  updateStatus: (id, data) =>
    apiClient.put(`/admin/orders/${id}/status`, data),

  cancel: (id, data) =>
    apiClient.put(`/admin/orders/${id}/cancel`, data),
};

// Assessments
// Assessments
export const assessments = {
  // Categories
  getCategories: (params) => apiClient.get('/admin/assessments/categories', { params }),
  getCategoryById: (id) => apiClient.get(`/admin/assessments/categories/${id}`),
  createCategory: (data) => apiClient.post('/admin/assessments/categories', data),
  updateCategory: (id, data) => apiClient.put(`/admin/assessments/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/admin/assessments/categories/${id}`),

  // Tests
  getTests: (params) =>
    apiClient.get('/admin/assessments/tests', { params }),

  getAllTests: (params) =>
    apiClient.get('/admin/assessments/tests', { params }),

  getTestById: (id) =>
    apiClient.get(`/admin/assessments/tests/${id}`),

  createTest: (data) =>
    apiClient.post('/admin/assessments/tests', data),

  updateTest: (id, data) =>
    apiClient.patch(`/admin/assessments/tests/${id}`, data),

  deleteTest: (id) =>
    apiClient.delete(`/admin/assessments/tests/${id}`),

  uploadAssessmentImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/admin/assessments/upload/image', formData);
  },

  uploadAssessmentAudio: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/admin/assessments/upload/audio', formData);
  },

  // Specialized question management
  createCarsQuestion: (testId, data) =>
    apiClient.post(`/admin/assessments/cars/${testId}/questions`, data),

  updateCarsQuestion: (questionId, data) =>
    apiClient.patch(`/admin/assessments/cars/questions/${questionId}`, data),

  createAnalogyQuestion: (testId, data) =>
    apiClient.post(`/admin/assessments/analogy/${testId}/questions`, data),

  updateAnalogyQuestion: (questionId, data) =>
    apiClient.patch(`/admin/assessments/analogy/questions/${questionId}`, data),

  createVisualMemoryBatch: (testId, data) =>
    apiClient.post(`/admin/assessments/visual-memory/${testId}/batches`, data),

  updateVisualMemoryBatch: (batchId, data) =>
    apiClient.patch(`/admin/assessments/visual-memory/batches/${batchId}`, data),

  deleteVisualMemoryBatch: (testId, batchId) =>
    apiClient.delete(`/admin/assessments/tests/${testId}/batches/${batchId}`),

  createAuditoryMemoryQuestion: (testId, data) =>
    apiClient.post(`/admin/assessments/auditory-memory/${testId}/questions`, data),

  updateAuditoryMemoryQuestion: (questionId, data) =>
    apiClient.patch(`/admin/assessments/auditory-memory/questions/${questionId}`, data),

  createVerbalNonsenseQuestion: (testId, data) =>
    apiClient.post(`/admin/assessments/verbal-nonsense/${testId}/questions`, data),

  updateVerbalNonsenseQuestion: (questionId, data) =>
    apiClient.patch(`/admin/assessments/verbal-nonsense/questions/${questionId}`, data),

  createImageSequenceOrderQuestion: (testId, data) =>
    apiClient.post(`/admin/assessments/image-sequence-order/${testId}/questions`, data),

  updateImageSequenceOrderQuestion: (questionId, data) =>
    apiClient.patch(`/admin/assessments/image-sequence-order/questions/${questionId}`, data),

  deleteTestQuestion: (testId, questionId) =>
    apiClient.delete(`/admin/assessments/tests/${testId}/questions/${questionId}`),

  // HELP developmental skills (global catalog; shown under the HELP test in admin)
  getHelpSkills: (params) => apiClient.get('/admin/assessments/help/skills', { params }),
  createHelpSkill: (data) => apiClient.post('/admin/assessments/help/skills', data),
  updateHelpSkill: (skillId, data) => apiClient.patch(`/admin/assessments/help/skills/${skillId}`, data),
  deleteHelpSkill: (skillId) => apiClient.delete(`/admin/assessments/help/skills/${skillId}`),
};

// Mahara Kids Activities
export const mahara = {
  // Categories
  getCategories: (params) =>
    apiClient.get('/admin/mahara/categories', { params }),

  getCategoryById: (id) =>
    apiClient.get(`/admin/mahara/categories/${id}`),

  createCategory: (data) =>
    apiClient.post('/admin/mahara/categories', data),

  updateCategory: (id, data) =>
    apiClient.put(`/admin/mahara/categories/${id}`, data),

  deleteCategory: (id) =>
    apiClient.delete(`/admin/mahara/categories/${id}`),

  // Skill Groups
  getSkillGroups: (params) =>
    apiClient.get('/admin/mahara/skill-groups', { params }),

  getSkillGroupById: (id) =>
    apiClient.get(`/admin/mahara/skill-groups/${id}`),

  createSkillGroup: (data) =>
    apiClient.post('/admin/mahara/skill-groups', data),

  updateSkillGroup: (id, data) =>
    apiClient.put(`/admin/mahara/skill-groups/${id}`, data),

  deleteSkillGroup: (id) =>
    apiClient.delete(`/admin/mahara/skill-groups/${id}`),

  // Activities
  getActivities: (params) =>
    apiClient.get('/admin/mahara/activities', { params }),

  getActivityById: (id) =>
    apiClient.get(`/admin/mahara/activities/${id}`),

  createActivity: (formData) =>
    apiClient.post('/admin/mahara/activities', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  updateActivity: (id, formData) =>
    apiClient.put(`/admin/mahara/activities/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  deleteActivity: (id) =>
    apiClient.delete(`/admin/mahara/activities/${id}`),
};
