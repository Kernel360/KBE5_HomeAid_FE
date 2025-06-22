import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  // headers: {
  //   'Content-Type': 'application/json; charset=utf-8',
  //   Accept: 'application/json; charset=utf-8',
  // },
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise = null;

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
  async (error) => {
    const originalRequest = error.config;

    console.error('=== API 응답 에러 ===');
    console.error('상태 코드:', error.response?.status);
    console.error('에러 메시지:', error.response?.data);
    console.error('요청 URL:', error.config?.url);

    // 401 에러 + JWT 만료 에러코드일 경우
    if (error.response?.status === 401 && error.response?.data?.error === 'JWT_EXPIRED') {
      if (!isRefreshing) {
        isRefreshing = true;
        // 새로운 토큰을 발급받는 비동기 작업을 Promise로 감싸 refreshPromise에 할당
        refreshPromise = (async () => {
          try {
            console.log('Access Token 재발급을 시도합니다.');
            const res = await apiClient.post('/auth/refresh/reissue');
            const newAccessToken = res.data.accessToken;

            if (!newAccessToken) {
              throw new Error('새로운 Access Token을 받지 못했습니다.');
            }

            console.log('새로운 Access Token 발급 성공.');
            localStorage.setItem('accessToken', newAccessToken);
            useAuthStore.getState().setAccessToken(newAccessToken);
            apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

            return newAccessToken;
          } catch (refreshError) {
            console.error('토큰 재발급 실패:', refreshError);
            localStorage.removeItem('accessToken');
            useAuthStore.getState().logout();
            window.location.href = '/auth/signin';
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        })();
      }

      try {
        // 진행중인 토큰 재발급 작업이 끝나기를 기다림
        const token = await refreshPromise;
        // 새로운 토큰으로 원래 요청의 헤더를 교체
        originalRequest.headers.Authorization = `Bearer ${token}`;
        // 원래 요청 재시도
        return apiClient(originalRequest);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

// API 호출 함수들
export const api = {
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
