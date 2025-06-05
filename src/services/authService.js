import api from './apiClient';
// 필요한 DTO 타입 정의가 있다면 여기서 임포트
// import { CustomerSignUpRequestDto, ManagerSignUpRequestDto } from '../types/auth'; // 예시

export const authService = {
  // 로그인
  signIn: async (phoneNumber, password) => {
    try {
      const response = await api.post('/api/v1/user/auth/signin', {
        phoneNumber,
        password,
      });
      return response.data; // axios는 응답 데이터를 data 속성에 담아줍니다.
    } catch (error) {
      console.error('로그인 API 오류:', error);
      throw error; // 오류 처리는 호출하는 쪽에서 할 수 있도록 다시 throw
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