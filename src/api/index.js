import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import useReservationListStore from '../../stores/reservationListStore';

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

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리 등)
apiClient.interceptors.response.use(
  (response) => {
    // 예약 목록 API 응답이면 zustand store에 저장
    if (
      response.config.url &&
      response.config.url.includes('/reservations') &&
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data.content)
    ) {
      const reservationList = response.data.data.content;
      // 상태별로 분류
      const categorized = {
        pending: reservationList.filter(
          (r) => r.status === 'REQUESTED' || r.status === 'MATCHING'
        ),
        completed: reservationList.filter((r) => r.status === 'MATCHED'),
        visited: reservationList.filter((r) => r.status === 'COMPLETED'),
        cancelled: reservationList.filter((r) => r.status === 'CANCELLED'),
      };
      useReservationListStore.getState().setReservations(categorized);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 + JWT 만료 에러코드일 경우
    if (
      error.response?.status === 401 &&
      error.response?.data?.error === 'JWT_EXPIRED'
    ) {
      try {
        // 진행중인 토큰 재발급 작업이 끝나기를 기다림
        // const token = await refreshPromise;
        const token = await refreshAccessToken();
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

export const getMyReviews = (page = 0, size = 10) =>
  api.get(`/reviews/my?page=${page}&size=${size}`);

// 공통 토큰 재발급 함수
const refreshAccessToken = async () => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        console.log('Access Token 재발급을 시도합니다.');

        // 1. 본문 없이 재발급 요청 (HttpOnly 쿠키 자동 전송)
        const res = await apiClient.post('/auth/refresh/reissue');

        // 2. 응답 헤더에서 새로 발급된 Access Token 추출
        const authHeader =
          res.headers.authorization || res.headers.Authorization;
        if (!authHeader) {
          throw new Error('재발급 응답 헤더에 Access Token이 없습니다.');
        }

        const newAccessToken = authHeader.replace('Bearer ', '');

        console.log('새로운 Access Token 발급 성공.');

        // 3. 새로운 Access Token 저장
        localStorage.setItem('accessToken', newAccessToken);
        useAuthStore.getState().setAccessToken(newAccessToken);

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        return newAccessToken;
      } catch (refreshError) {
        console.error('토큰 재발급 실패:', refreshError);
        // 재발급 실패 시 Access Token 정보만 삭제
        localStorage.removeItem('accessToken');
        useAuthStore.getState().logout(); // user, accessToken, refreshToken 모두 null로
        window.location.href = '/auth/signin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();
  }

  // 진행중인 토큰 재발급 작업이 끝나기를 기다림
  return await refreshPromise;
};

// export로 내보내기
export { refreshAccessToken };
