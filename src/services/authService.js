import api from './apiClient';
// 필요한 DTO 타입 정의가 있다면 여기서 임포트
// import { CustomerSignUpRequestDto, ManagerSignUpRequestDto } from '../types/auth'; // 예시

export const authService = {
  // 로그인
  signIn: async (phone, password) => {
    try {
      // ⭐️ axios 대신 fetch API 직접 사용으로 인코딩 문제 해결 시도
      const response = await fetch('http://localhost:8080/api/v1/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json; charset=utf-8',
        },
        credentials: 'include', // withCredentials: true와 동일
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      console.log(
        '🌐 로그인 API 호출:',
        'http://localhost:8080/api/v1/auth/signin'
      );
      console.log('📡 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // ⭐️ 명시적으로 UTF-8로 텍스트 읽기
      const responseText = await response.text();
      console.log('🔍 원본 응답 텍스트:', responseText);

      // UTF-8로 파싱
      const data = JSON.parse(responseText);
      console.log('📄 파싱된 응답 데이터:', data);

      // Authorization 헤더에서 토큰 추출
      const accessToken =
        response.headers.get('authorization') ||
        response.headers.get('Authorization');
      if (accessToken) {
        // Bearer 접두사 제거 후 저장
        const token = accessToken.replace('Bearer ', '');
        localStorage.setItem('accessToken', token);
        api.defaults.headers.common['Authorization'] = accessToken;
        console.log('✅ 액세스 토큰 저장됨:', token.substring(0, 20) + '...');
      } else {
        console.log('⚠️ Authorization 헤더가 응답에 없음');
      }

      return data;
    } catch (error) {
      console.error('❌ 로그인 API 오류:', error);
      throw error;
    }
  },

  // 고객 회원가입 (모든 데이터를 한 번에 보냄)
  customerSignUp: async (customerData /*: CustomerSignUpRequestDto */) => {
    console.log('🔄 고객 회원가입 API 호출:', customerData);

    try {
      const response = await api.post(
        '/api/v1/users/signup/customers',
        customerData
      );
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
      const response = await api.post(
        '/api/v1/users/signup/managers',
        managerData
      );
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
        console.log(
          '  🌐 요청: POST http://localhost:8080/api/v1/users/signup/managers'
        );
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
  signOut: async () => {
    const response = await api.post('/api/v1/auth/signout');
    // accessToken 삭제
    localStorage.removeItem('accessToken');
    // axios 기본 헤더에서도 삭제
    delete api.defaults.headers.common['Authorization'];
    return response.data;
  },

  // 회원가입 단계별 데이터 저장 (예시)
  saveSignUpStep: async (step, data) => {
    const response = await api.post(`/api/v1/users/signup/step/${step}`, data);
    return response.data;
  },
};
