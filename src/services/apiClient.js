// 예시: src/services/apiClient.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080', // 8080=Spring 기본 포트
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json; charset=utf-8',
  },
});

console.log('🔧 API Client 설정:');
console.log('  - baseURL:', api.defaults.baseURL);
console.log('  - withCredentials:', api.defaults.withCredentials);

// AT 만료 시, 새로운 AT 요청
const refreshAccessToken = async () => {
  try {
    const response = await api.post('/api/v1/users/auth/refresh');
    const newAccessToken =
      response.headers['authorization'] || response.headers['Authorization'];
    if (newAccessToken) {
      localStorage.setItem(
        'accessToken',
        newAccessToken.replace('Bearer ', '')
      );
      api.defaults.headers.common['Authorization'] = newAccessToken;
    }
    return newAccessToken;
  } catch (error) {
    // 리프레시 토큰도 만료된 경우, 로그인 페이지로 이동 등 처리
    window.location.href = '/auth/signin';
    throw error;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // AT 만료 시 자동으로 refresh 시도
      try {
        await refreshAccessToken();
        // 원래 요청 재시도
        return api(error.config);
      } catch {
        // refresh도 실패하면 로그아웃 처리
        window.location.href = '/auth/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
