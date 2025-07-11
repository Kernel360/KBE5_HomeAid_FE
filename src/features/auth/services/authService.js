// import api from './apiClient';
import api from '../../../api/config/api';
import { useAuthStore } from '../../../stores/authStore';
import axios from 'axios';
// 필요한 DTO 타입 정의가 있다면 여기서 임포트
// import { CustomerSignUpRequestDto, ManagerSignUpRequestDto } from '../types/auth'; // 예시

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

const apiClientInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 반드시 필요!
});

export const authService = {
  // 로그인
  signIn: async (phone, password) => {
    try {
      console.log('🌐 로그인 API 호출');
      const response = await api.post('/auth/signin', { phone, password });

      // 1. 응답 헤더에서 Access Token 추출
      const authHeader =
        response.headers.authorization || response.headers.Authorization;
      if (!authHeader) {
        throw new Error(
          'Authorization 헤더에서 Access Token을 찾을 수 없습니다.'
        );
      }

      const accessToken = authHeader.replace('Bearer ', '');

      // 2. 응답 본문에서 사용자 정보 추출
      const userData = response.data;

      // 3. 스토어와 localStorage에 Access Token 및 사용자 정보 저장
      localStorage.setItem('accessToken', accessToken);

      const { setAccessToken, setUser, setRefreshToken } =
        useAuthStore.getState();
      setAccessToken(accessToken);
      setUser(userData);
      // RT는 HttpOnly 쿠키로 관리되므로 스토어에서는 null 처리
      setRefreshToken(null);

      // 4. apiClient 기본 헤더 설정
      apiClientInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      console.log('✅ 로그인 성공 및 Access Token 저장 완료');
      return userData;
    } catch (error) {
      console.error('❌ 로그인 API 오류:', error);
      if (error.response) {
        console.error('🚨 응답 상태:', error.response.status);
        console.error('🚨 응답 데이터:', error.response.data);
      } else {
        console.error('🚨 에러 메시지:', error.message);
      }
      throw error;
    }
  },

  // 고객 회원가입 (모든 데이터를 한 번에 보냄)
  customerSignUp: async (customerData /*: CustomerSignUpRequestDto */) => {
    console.log('🔄 고객 회원가입 API 호출:', customerData);

    try {
      const response = await api.post('/auth/signup/customers', customerData);
      console.log('✅ 고객 회원가입 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 고객 회원가입 실패:', error);

      // 네트워크 오류 또는 CORS 오류 처리
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.log('🔒 백엔드 서버 연결 실패 - 더미 응답으로 진행');

        // ⭐️ 더미 응답으로 회원가입 성공 시뮬레이션
        return {
          success: true,
          message: '고객 회원가입이 성공했습니다.',
          data: {
            customerId: Date.now(),
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
          },
        };
      }

      // 다른 오류는 그대로 재발생
      throw error;
    }
  },

  // 매니저 회원가입 (모든 데이터를 한 번에 보냄)
  managerSignUp: async (managerData /*: ManagerSignUpRequestDto */) => {
    console.log('🔄 매니저 회원가입 API 호출:', managerData);

    try {
      const response = await api.post('/auth/signup/managers', managerData);
      console.log('✅ 매니저 회원가입 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 매니저 회원가입 실패:', error);

      // 네트워크 오류 또는 CORS 오류 처리
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.log('🔒 백엔드 서버 연결 실패 - 더미 응답으로 진행');
        console.log('');
        console.log('📋 백엔드 개발자에게 전달할 정보:');
        console.log('  🎯 문제: 백엔드 서버 미실행 또는 CORS 설정 누락');
        console.log(`  🌐 요청: POST url/api/v1/users/signup/managers`);
        console.log('  📦 필요한 작업:');
        console.log('    1. 백엔드 서버 실행 확인 (포트 8080)');
        console.log(
          '    2. CORS 설정 추가 (Origin: http://localhost:3001 허용)'
        );
        console.log('    3. 매니저 회원가입 API 엔드포인트 구현 확인');
        console.log('');

        // ⭐️ 더미 응답으로 회원가입 성공 시뮬레이션
        console.log('🎭 더미 응답으로 회원가입 진행:', {
          message: '매니저 회원가입이 성공했습니다.',
          managerId: Date.now(), // 임시 ID
          name: managerData.name,
        });

        return {
          success: true,
          message: '매니저 회원가입이 성공했습니다.',
          data: {
            managerId: Date.now(),
            name: managerData.name,
            email: managerData.email,
            phone: managerData.phone,
          },
        };
      }

      // 다른 오류는 그대로 재발생
      throw error;
    }
  },

  // 로그아웃
  signOut: () => {
    try {
      // 1. Zustand 스토어 초기화
      const { logout } = useAuthStore.getState();
      logout();

      // 2. 로컬 스토리지 초기화
      localStorage.removeItem('accessToken');
      localStorage.removeItem('auth-storage');

      // 3. API 헤더 초기화
      if (api.defaults.headers.common['Authorization']) {
        delete api.defaults.headers.common['Authorization'];
      }

      return true;
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
      throw error;
    }
  },

  // 회원가입 단계별 데이터 저장 (예시)
  saveSignUpStep: async (step, data) => {
    const response = await api.post(`/auth/signup/step/${step}`, data);
    return response.data;
  },

  socialSignIn: async (oauthCode) => {
    try {
      const response = await api.post('/auth/oauth/token', { oauthCode });
      const { accessToken, refreshToken, userId, username, role } = response.data;

      localStorage.setItem('accessToken', accessToken);

      const { setAccessToken, setUser, setRefreshToken } = useAuthStore.getState();
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setUser({ userId, username, role });

      if (api.defaults) {
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      }

      return { userId, username, role };
    } catch (error) {
      console.error('❌ 소셜 로그인 API 오류:', error);
      if (error.response) {
        console.error('🚨 응답 상태:', error.response.status);
        console.error('🚨 응답 데이터:', error.response.data);
      } else {
        console.error('🚨 에러 메시지:', error.message);
      }
      throw error;
    }
  }
};
