// // src/features/user/api.js
// import axios from 'axios';

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

// // axios 인스턴스 생성 (withCredentials 등 옵션은 상황에 따라 추가)
// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
// });

// // 회원가입 예시
// export const signUpUser = (userData) => {
//   return api.post('/api/v1/users/signup', userData);
// };

// // 로그인 예시
// export const loginUser = (loginData) => {
//   return api.post('/api/v1/users/login', loginData);
// };

// // 사용자 정보 조회 예시
// export const fetchUserProfile = () => {
//   return api.get('/api/v1/users/profile');
// };

// // 필요에 따라 더 추가
