// 예시: src/services/apiClient.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080', // 8080=Spring 기본 포트
  withCredentials: true,
});

export default api;
