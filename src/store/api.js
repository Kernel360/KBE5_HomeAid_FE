import axios from "axios";

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoibWFuYWdlcjFAZXhhbXBsZS5jb20iLCJyb2xlIjoiUk9MRV9NQU5BR0VSIiwiaWF0IjoxNzQ5MjgzNjA3LCJleHAiOjE3NDkyODcyMDd9.H81p9WvitIdg8ZOyqQU8M0rjHgTp_Dv1ZWN7i5BHbzI';
// 요청 인터셉터 (토큰 자동 추가 등)
apiClient.interceptors.request.use(
    (config) => {
        // 로컬 스토리지나 쿠키에서 토큰 가져오기
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }  else {
            config.headers.Authorization = `Bearer ${TEST_TOKEN}`;
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
        console.log('API 응답:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('응답 에러:', error.response?.status, error.response?.data);
        
        // 401 에러 시 로그인 페이지로 리다이렉트
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            // window.location.href = '/login'; // 필요시 주석 해제
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
    }
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
        delete: (id) => api.delete(`/manager/${id}`)
    },
    
    // 사용자 관련 API
    user: {
        getProfile: () => api.get('/user/profile'),
        updateProfile: (data) => api.put('/user/profile', data),
        changePassword: (data) => api.post('/user/change-password', data)
    },
    
    // 인증 관련 API
    auth: {
        login: (credentials) => api.post('/auth/login', credentials),
        logout: () => api.post('/auth/logout'),
        refresh: () => api.post('/auth/refresh'),
        register: (userData) => api.post('/auth/register', userData)
    },
    
    // 주소 관련 API
    address: {
        getAll: () => api.get('/address'),
        create: (data) => api.post('/address', data),
        update: (id, data) => api.put(`/address/${id}`, data),
        delete: (id) => api.delete(`/address/${id}`)
    },
    
    // 서비스 관련 API
    service: {
        getAll: () => api.get('/service'),
        getById: (id) => api.get(`/service/${id}`),
        book: (data) => api.post('/service/book', data),
        cancel: (id) => api.post(`/service/${id}/cancel`)
    },

    review: {
        getAll: () => api.get('/review'),
        getByUserId: (reviewer) => api.get(`/reviews/${reviewer}`),
        create: (data) => api.post('/reviews', data),
        update: (id, data) => api.put(`/reviews/${id}`, data),
        delete: (id) => api.delete(`/reviews/${id}`)
    },

    board: {
        getAll: () => api.get('/board'),
        getById: (id) => api.get(`/board/${id}`),
        create: (data) => api.post('/board', data),
        update: (id, data) => api.put(`/board/${id}`, data),
        delete: (id) => api.delete(`/board/${id}`)
    },

    serviceOption: {
        getAll: () => api.get('/admin/service-option'),
        getById: (id) => api.get(`/service-option/${id}`),
        create: (data) => api.post('/manager/profile', data),
        update: (id, data) => api.put(`/service-option/${id}`, data),
        delete: (id) => api.delete(`/service-option/${id}`)
    },
    reservation: {
        getById: (id) => api.get(`/reservations/${id}`)
    },
    matching: {
        acceptMatching: (matchingId, data) => api.patch(`/manager/matchings/${matchingId}/to-customer`, data)
    }
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