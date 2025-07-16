import api from './config/api';

// 사용 예시 함수들
export const apiService = {
  // 매니저 관련 API
  manager: {
    getAllMatcings: (page = 0, size = 10) =>
      api.get(`/manager/matchings?page=${page}&size=${size}`),
    getMatching: (matchingId) => api.get(`/manager/matchings/${matchingId}`),
    getAll: () => api.get('/manager/all'),
    getById: (id) => api.get(`/manager/${id}`),
    create: (data) => api.post('/manager', data),
    update: (id, data) => api.put(`/manager/${id}`, data),
    delete: (id) => api.delete(`/manager/${id}`),
    getManagerList: () => api.get('/managers/list'),
    changeStatus: (id, status) => api.patch(`/managers/${id}/status`, status),
    createProfile: (data) => api.post('/manager/profile', data),
    uploadCertifications: (formData) =>
      api.post('/manager/profile/certifications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    updateCertifications: (formData) =>
      api.put('/manager/profile/certifications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    getCertifications: () => api.get('/manager/profile/certifications'),
  },

  // 사용자 관련 API
  user: {
    getProfile: () => api.get('/customers/profile'),
    updateProfile: (userId, data) => api.put(`/users/${userId}`, data),
    changePassword: (data) => api.post('/user/change-password', data),
    getMyProfile: () => api.get('/users/my'),
    updateMyProfile: (data) => api.put('/users/my', data),
    uploadProfileImage: (formData) => api.post('/users/my/image', formData),
    deleteProfileImage: () => api.delete('/users/my/image'),
    requestWithdrawal: (data) => api.post('/my/withdrawal', data),
  },

  // 인증 관련 API
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    refresh: () => api.post('/users/auth/refresh'),
    register: (userData) => api.post('/auth/register', userData),
    signIn: (data, config) => api.post('/auth/signin', data, config),
  },

  // 주소 관련 API
  address: {
    getAll: () => api.get('/address'),
    create: (data) => api.post('/address', data),
    update: (id, data) => api.put(`/address/${id}`, data),
    delete: (id) => api.delete(`/address/${id}`),
  },

  // 서비스 관련 API
  service: {
    getAll: () => api.get('/service'),
    getById: (id) => api.get(`/service/${id}`),
    book: (data) => api.post('/service/book', data),
    cancel: (id) => api.post(`/service/${id}/cancel`),
  },

  review: {
    getMyReviews: (page = 0, size = 10) =>
      api.get(`/reviews/my?page=${page}&size=${size}`),
    create: (data) => api.post('/reviews', data),
    update: (id, data) => api.put(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`),
    getReviewTarget: (reservationId) =>
      api.get(`/reviews/${reservationId}/review-target`),
  },

  board: {
    getAll: () => api.get('/board'),
    getById: (id) => api.get(`/board/${id}`),
    create: (data) => api.post('/board', data),
    update: (id, data) => api.put(`/board/${id}`, data),
    delete: (id) => api.delete(`/board/${id}`),
  },

  serviceOption: {
    getAll: () => api.get('/admin/service-option'),
    getById: (id) => api.get(`/service-option/${id}`),
    create: (data) => api.post('/manager/profile', data),
    update: (id, data) => api.put(`/service-option/${id}`, data),
    delete: (id) => api.delete(`/service-option/${id}`),
  },
  reservation: {
    getAll: () => api.get('/reservations'),
    getById: (id) => api.get(`/reservations/${id}`),
    create: (data) => api.post('/reservations', data),
    update: (id, data) => api.put(`/reservations/${id}`, data),
    delete: (id) => api.delete(`/reservations/${id}`),
    cancel: (id) => api.post(`/reservations/${id}/cancel`),
    getAllForManager: () => api.get('/reservations/manager'),
  },
  matching: {
    acceptMatching: (matchingId, data) =>
      api.patch(`/manager/matchings/${matchingId}/to-customer`, data),
    getRecommendedManagers: (reservationId) =>
      api.post(`admin/matchings/${reservationId}/recommendations`),
    createMatching: (reservationId, managerId) =>
      api.post('/admin/matchings', { reservationId, managerId }),
  },
  workLog: {
    checkIn: (matchingId, data) =>
      api.patch(`/managers/work-logs/matchings/${matchingId}/check-in`, data),
    checkOut: (matchingId, data) =>
      api.patch(`/managers/work-logs/matchings/${matchingId}/check-out`, data),
    getWorkLog: (matchingId) =>
      api.get(`/managers/work-logs/matchings/${matchingId}`),
  },
  settlement: {
    getManagerSettlements: (managerId, params = {}) => {
      const queryParams = new URLSearchParams(params);
      return api.get(`/admin/settlements/managers/${managerId}?${queryParams}`);
    },
    getMySettlements: (startDate) => {
      return api.get(`/my/settlement/weekly?start=${startDate}`);
    },
    getMyMonthlySettlements: (year, month) => {
      return api.get(`/my/settlement/monthly?year=${year}&month=${month}`);
    },
    getAdminMonthlySettlements: (year, month) => {
      return api.get(`/admin/settlements/monthly?year=${year}&month=${month}`);
    },
    getSettlementPayments: (settlementId) => {
      return api.get(`/my/settlement/${settlementId}/payments`);
    },
  },
  alert: {
    updateReadStatus: (alertId) => api.patch(`/alerts/${alertId}`),
    getUnReadAlerts: () => api.get('/alerts'),
    sseDisconnect: () => api.post('/alerts/disconnect'),
  },
};
export default apiService;
