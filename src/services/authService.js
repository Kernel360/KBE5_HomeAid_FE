import api from './apiClient';
// 필요한 DTO 타입 정의가 있다면 여기서 임포트
// import { CustomerSignUpRequestDto, ManagerSignUpRequestDto } from '../types/auth'; // 예시

export const authService = {
  // 로그인
  signIn: async (phone, password) => {
    try {
      const response = await api.post('/api/v1/user/auth/signin', {
        phone,
        password,
      });

      // AT 저장 시엔 필요할 듯
      // // Authorization 헤더에서 토큰 추출
      // const token = response.headers['authorization'];
      // if (token) {
      //   // 토큰을 localStorage나 다른 저장소에 저장
      //   localStorage.setItem('token', token);
      //   // axios 기본 헤더에 토큰 설정
      //   api.defaults.headers.common['Authorization'] = token;
      // }
      
      return response.data;
    } catch (error) {
      console.error('로그인 API 오류:', error);
      throw error;
    }
  },

  // 고객 회원가입 (모든 데이터를 한 번에 보냄)
  customerSignUp: async (customerData /*: CustomerSignUpRequestDto */) => {
    try {
      const response = await api.post('/api/v1/user/auth/signup/customer', customerData);
      return response.data;
    } catch (error) {
      console.error('고객 회원가입 API 오류:', error);
      throw error;
    }
  },

  // 매니저 회원가입 (모든 데이터를 한 번에 보냄)
  managerSignUp: async (managerData /*: ManagerSignUpRequestDto */) => {
    try {
      const response = await api.post('/api/v1/user/auth/signup/manager', managerData);
      return response.data;
    } catch (error) {
      console.error('매니저 회원가입 API 오류:', error);
      throw error;
    }
  },

  // 로그아웃
  signOut: async () => {
    try {
      const response = await api.post('/api/v1/user/auth/signout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 회원가입 단계별 데이터 저장 (예시)
  saveSignUpStep: async (step, data) => {
    try {
      const response = await api.post(`/api/v1/user/auth/signup/step/${step}`, data);
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