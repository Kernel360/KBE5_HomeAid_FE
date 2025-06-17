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

apiClient.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
apiClient.defaults.headers.common['Accept'] = 'application/json; charset=utf-8';

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
    console.error('=== API 응답 에러 ===');
    console.error('상태 코드:', error.response?.status);
    console.error('에러 메시지:', error.response?.data);
    console.error('요청 URL:', error.config?.url);

    // 401 에러 시 토큰 관련 처리 (주석 처리 - services/apiClient.js에서 처리)
    if (error.response?.status === 401) {
      console.log('401 에러 - 토큰 문제로 인한 인증 실패');
      // AT 만료 시 자동으로 refresh 시도
      try {
        // await refreshAccessToken();
        // 원래 요청 재시도
        return apiClient(error.config);
      } catch {
        // refresh도 실패하면 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('auth-storage');
        useAuthStore.getState().logout();
        console.log('토큰 및 사용자 정보 초기화 완료');
        window.location.href = '/auth/signin';
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

const refreshAccessToken = async () => {
  try {
    const response = await api.post('/users/auth/refresh');
    const newAccessToken =
      response.headers['authorization'] || response.headers['Authorization'];
    if (newAccessToken) {
      localStorage.setItem(
        'accessToken',
        newAccessToken.replace('Bearer ', '')
      );
      // ✅ api/config의 인스턴스 사용
      api.defaults.headers.common['Authorization'] = newAccessToken;
    }
    return newAccessToken;
  } catch (error) {
    // 리프레시 토큰도 만료된 경우, 로그인 페이지로 이동 등 처리
    window.location.href = '/auth/signin';
    throw error;
  }
};
