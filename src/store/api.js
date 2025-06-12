import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// 요청 인터셉터 (토큰 자동 추가 등)
apiClient.interceptors.request.use(
  (config) => {
    // 1. localStorage에서 토큰 가져오기 (authService.js에서 저장)
    const localStorageToken = localStorage.getItem('accessToken');

    // 2. authStore에서 토큰 가져오기
    const authStoreToken = useAuthStore.getState().accessToken;

    // 3. 우선순위: localStorage > authStore
    const token = localStorageToken || authStoreToken;

    console.log('=== 토큰 확인 ===');
    console.log('localStorage 토큰:', localStorageToken ? '있음' : '없음');
    console.log('authStore 토큰:', authStoreToken ? '있음' : '없음');
    console.log('사용할 토큰:', token ? '있음' : '없음');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('토큰 사용:', token.substring(0, 20) + '...');
    } else {
      console.log('토큰이 없습니다. 로그인이 필요할 수 있습니다.');
    }

    console.log('API 요청:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리 등)
apiClient.interceptors.response.use(
  (response) => {
    console.log('API 응답 성공:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('=== API 응답 에러 ===');
    console.error('상태 코드:', error.response?.status);
    console.error('에러 메시지:', error.response?.data);
    console.error('요청 URL:', error.config?.url);

    // 401 에러 시 토큰 관련 처리
    if (error.response?.status === 401) {
      console.log('401 에러 - 토큰 문제로 인한 인증 실패');

      // localStorage와 authStore에서 토큰 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('auth-storage'); // Zustand persist 데이터도 삭제

      // authStore 초기화
      useAuthStore.getState().logout();

      console.log('토큰 및 사용자 정보 초기화 완료');

      // 로그인 페이지로 리다이렉트는 컴포넌트에서 처리하도록 함
      // window.location.href = '/auth/signin';
    }

    return Promise.reject(error);
  }
);

// API 호출 함수들
const api = {
  // GET 요청
  get: (url, config = {}) => {
    return apiClient.get(url, config);
  },

  // POST 요청
  post: (url, data = {}, config = {}) => {
    return apiClient.post(url, data, config);
  },

  // PUT 요청
  put: (url, data = {}, config = {}) => {
    return apiClient.put(url, data, config);
  },

  // PATCH 요청
  patch: (url, data = {}, config = {}) => {
    return apiClient.patch(url, data, config);
  },

  // DELETE 요청
  delete: (url, config = {}) => {
    return apiClient.delete(url, config);
  },
};

// 사용 예시 함수들
export const apiService = {
  // 매니저 관련 API
  manager: {
    getAllMatcings: () => api.get('/manager/matchings'),
    getAll: () => api.get('/manager/all'),
    getById: (id) => api.get(`/manager/${id}`),
    create: (data) => api.post('/manager', data),
    update: (id, data) => api.put(`/manager/${id}`, data),
    delete: (id) => api.delete(`/manager/${id}`),
  },

  // 사용자 관련 API
  user: {
    getProfile: () => api.get('/customers/profile'),
    updateProfile: (userId, data) => api.put(`/users/${userId}`, data),
    changePassword: (data) => api.post('/user/change-password', data),
  },

  // 인증 관련 API
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    refresh: () => api.post('/auth/refresh'),
    register: (userData) => api.post('/auth/register', userData),
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
    acceptMatching: (matchingId, data) =>
      api.patch(`/manager/matchings/${matchingId}/to-customer`, data),
  },
  workLog: {
    checkIn: (data) => api.post('/managers/work-logs', data),
    checkOut: (data) => api.patch('/managers/work-logs', data),
  },
};

// 기본 api 객체도 export (직접 사용하고 싶을 때)
export default api;

// 사용법 예시:
/*
// 1. 직접 사용
import api from './api';
const response = await api.post('/manager/all');

// 2. 서비스 함수 사용
import { apiService } from './api';
const managers = await apiService.manager.getAll();

// 3. async/await 사용
try {
    const response = await api.post('/manager/all', { name: 'test' });
    console.log(response.data);
} catch (error) {
    console.error('API 에러:', error.response?.data || error.message);
}

// 4. .then/.catch 사용
api.post('/manager/all')
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
*/
