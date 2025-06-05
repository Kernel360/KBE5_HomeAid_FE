import api from './apiClient';

export const authService = {
  // 로그인
  signIn: async (phoneNumber, password) => {
    try {
      const response = await api.post('/api/v1/user/auth/signin', {
        phoneNumber,
        password,
      });
      return response.data;
    } catch (error) {
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

  // 회원가입
  signUp: async (userData) => {
    try {
      const response = await api.post('/api/v1/user/auth/signup', userData);
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