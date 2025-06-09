// 예시: src/services/apiClient.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080', // 8080=Spring 기본 포트
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // AT 만료 시 자동으로 refresh 시도
      try {
        await refreshAccessToken();
        // 원래 요청 재시도
        return api(error.config);
      } catch (refreshError) {
        // refresh도 실패하면 로그아웃 처리
        window.location.href = '/auth/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
