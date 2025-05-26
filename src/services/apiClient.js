import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 주소
  withCredentials: false, // 세션/쿠키 필요 시
});

export default apiClient;
