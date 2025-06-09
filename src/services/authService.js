import api from './apiClient';
// 필요한 DTO 타입 정의가 있다면 여기서 임포트
// import { CustomerSignUpRequestDto, ManagerSignUpRequestDto } from '../types/auth'; // 예시

export const authService = {
  // 로그인
  signIn: async (phone, password) => {
    try {
      const response = await api.post('/api/v1/auth/signin', { phone, password });

      // headers의 key는 소문자!
      const accessToken = response.headers['authorization'];
      if (accessToken) {
        // Bearer 접두사 제거 후 저장
        const token = accessToken.replace('Bearer ', '');
        localStorage.setItem('accessToken', token);
        api.defaults.headers.common['Authorization'] = accessToken;
        console.log('AT 저장됨:', token);
      } else {
        console.log('AT 헤더 없음:', response.headers);
      }

      // RT는 httpOnly 쿠키로 자동 저장(프론트에서 접근 불가)
      // 사용자 정보는 response.data로 받음
      return response.data;
    } catch (error) {
      console.error('로그인 API 오류:', error);
      throw error;
    }
  },

  // 고객 회원가입 (모든 데이터를 한 번에 보냄)
  customerSignUp: async (customerData /*: CustomerSignUpRequestDto */) => {
    try {
      const response = await api.post('/api/v1/users/signup/customers', customerData);
      return response.data;
    } catch (error) {
      console.error('고객 회원가입 API 오류:', error);
      throw error;
    }
  },

  // 매니저 회원가입 (모든 데이터를 한 번에 보냄)
  managerSignUp: async (managerData /*: ManagerSignUpRequestDto */) => {
    try {
      const response = await api.post('/api/v1/users/signup/managers', managerData);
      return response.data;
    } catch (error) {
      console.error('매니저 회원가입 API 오류:', error);
      throw error;
    }
  },

  // 로그아웃
  signOut: async () => {
    try {
      const response = await api.post('/api/v1/auth/signout');
      // accessToken 삭제
      localStorage.removeItem('accessToken');
      // axios 기본 헤더에서도 삭제
      delete api.defaults.headers.common['Authorization'];
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 회원가입 단계별 데이터 저장 (예시)
  saveSignUpStep: async (step, data) => {
    try {
      const response = await api.post(`/api/v1/users/signup/step/${step}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}; 

// apiClient.js에 추가
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      localStorage.removeItem('token');
      // 로그인 페이지로 리다이렉트
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
); 

// AT 만료 시, 새로운 AT 요청
const refreshAccessToken = async () => {
  try {
    const response = await api.post('/api/v1/users/auth/refresh');
    const newAccessToken = response.headers['authorization'] || response.headers['Authorization'];
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken.replace('Bearer ', ''));
      api.defaults.headers.common['Authorization'] = newAccessToken;
    }
    return newAccessToken;
  } catch (error) {
    // 리프레시 토큰도 만료된 경우, 로그인 페이지로 이동 등 처리
    window.location.href = '/auth/signin';
  }
}; 