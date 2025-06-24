import api from "./config/api";

// 사용 예시 함수들
export const apiService = {
  // 매니저 관련 API
  manager: {
    getAllMatcings: (page = 0, size = 10) => api.get(`/manager/matchings?page=${page}&size=${size}`),
    getMatching: (matchingId) => api.get(`/manager/matchings/${matchingId}`),
    getAll: () => api.get('/manager/all'),
    getById: (id) => api.get(`/manager/${id}`),
    create: (data) => api.post('/manager', data),
    update: (id, data) => api.put(`/manager/${id}`, data),
    delete: (id) => api.delete(`/manager/${id}`),
    getManagerList: () => api.get('/managers/list'),
    changeStatus: (id, status) => api.patch(`/managers/${id}/status`, status),
    createProfile: (data) => api.post('/managers/profile', data),
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
  },

  // 인증 관련 API
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    refresh: () => api.post('/users/auth/refresh'),
    register: (userData) => api.post('/auth/register', userData),
    signIn: (data, config) => api.post('/auth/signin', data, config)
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
    getAll: () => api.get('/review'),
    getByUserId: (reviewer) => api.get(`/reviews/${reviewer}`),
    create: (data) => api.post('/reviews', data),
    update: (id, data) => api.put(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`),
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
    create: (data) => api.post('/managers/profile', data),
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
  },
  matching: {
    acceptMatching: (matchingId, data) => api.patch(`/manager/matchings/${matchingId}/to-customer`, data),
    getRecommendedManagers: (reservationId) => api.post(`/admin/matchings/${reservationId}/recommendations`),
  },
  workLog: {
    checkIn: (data) => api.post('/managers/work-logs', data),
    checkOut: (reservationId, data) => api.patch(`/managers/work-logs/${reservationId}`, data)
  },
};
export default apiService;