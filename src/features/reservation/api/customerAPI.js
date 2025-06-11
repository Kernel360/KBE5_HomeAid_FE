/* eslint-env node */
// Base API URL - Vite 프록시 사용 (CORS 문제 해결)
const API_BASE_URL = '';

// JWT 토큰을 헤더에 추가하는 함수
const getAuthHeaders = () => {
  // accessToken 키로 통일 (authService.js와 일치)
  let token = localStorage.getItem('accessToken');

  // JWT 토큰 상태 확인
  if (token && token.startsWith('eyJ')) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔍 JWT 토큰 내용:', payload);
      console.log('🔍 토큰 발급 시간:', new Date(payload.iat * 1000));
      console.log('🔍 토큰 만료 시간:', new Date(payload.exp * 1000));
      console.log('🔍 현재 시간:', new Date());

      const isExpired = payload.exp * 1000 < Date.now();
      console.log('🔍 토큰 만료 여부:', isExpired ? '⚠️ 만료됨' : '✅ 유효함');

      if (isExpired) {
        console.warn('⚠️ 토큰이 만료되었습니다. 재로그인이 필요합니다.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('auth-storage');
        token = null;
      }
    } catch (error) {
      console.warn('🔍 JWT 토큰 파싱 실패:', error.message);
    }
  }

  // 토큰이 없으면 에러 발생
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  console.log('🔐 요청 헤더:', {
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 10)}...` : 'none',
  });

  return headers;
};

// 기본 API 호출 함수
const apiCall = async (url, options = {}) => {
  const fullUrl = `${API_BASE_URL}${url}`;
  const requestOptions = {
    headers: getAuthHeaders(),
    ...options,
  };

  console.log('🌐 API 호출:', {
    url: fullUrl,
    method: requestOptions.method || 'GET',
    headers: requestOptions.headers,
    body: requestOptions.body,
  });

  const response = await fetch(fullUrl, requestOptions);

  if (!response.ok) {
    let errorData = null;
    let errorText = '';

    try {
      errorText = await response.text();
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || `HTTP ${response.status}` };
    }

    console.error('❌ API 에러 응답:', {
      status: response.status,
      statusText: response.statusText,
      errorData: errorData,
      responseText: errorText,
    });

    // 400 에러의 경우 더 자세한 정보 제공
    if (response.status === 400) {
      const detailedMessage =
        errorData?.message ||
        errorData?.error ||
        errorText ||
        '요청 형식이 잘못되었습니다.';
      throw new Error(`Bad Request (400): ${detailedMessage}`);
    }

    throw new Error(
      errorData?.message ||
        errorData?.error ||
        `HTTP error! status: ${response.status}`
    );
  }

  const result = await response.json();

  // Spring Boot CommonApiResponse 구조 처리
  if (result && typeof result === 'object' && 'data' in result) {
    return result.data;
  }

  return result;
};

// ==================== 서비스 관련 API ====================

// 고객 서비스 목록 조회 (하위 옵션 포함)
export const getCustomerServices = async () => {
  // 📊 Mock 데이터 - 화면의 "빨래, 청소, 육아"와 일치하도록 수정
  const mockServices = [
    {
      id: 1,
      name: '빨래',
      basePrice: 15000,
      duration: 90, // 분 단위
      description: '세탁 및 건조 서비스',
    },
    {
      id: 2,
      name: '청소',
      basePrice: 25000,
      duration: 120, // 분 단위
      description: '집안 전체 청소 서비스',
    },
    {
      id: 3,
      name: '육아',
      basePrice: 30000,
      duration: 180, // 분 단위
      description: '아이 돌봄 서비스',
    },
  ];

  // 약간의 로딩 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    content: mockServices,
    totalElements: mockServices.length,
  };
};

// ==================== 주소 관련 API ====================

// 기존 주소 목록 조회 (임시 목업 데이터 포함)
export const getCustomerAddresses = async () => {
  // 📊 Mock 주소 데이터 - 백엔드 구현 전까지 사용
  const mockAddresses = [
    {
      id: 1,
      type: '집',
      main: '서울시 강남구 테헤란로 123',
      detail: '101동 202호',
      isDefault: true,
    },
    {
      id: 2,
      type: '회사',
      main: '서울시 서초구 서초대로 456',
      detail: '5층',
      isDefault: false,
    },
    {
      id: 3,
      type: '기타',
      main: '서울시 마포구 홍대입구역 12번 출구',
      detail: '2층 카페 앞',
      isDefault: false,
    },
  ];

  // 약간의 로딩 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 100));

  return mockAddresses;
};

// 주소 등록
export const createCustomerAddress = async (addressData) => {
  return apiCall('/api/v1/customers/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData),
  });
};

// 주소 삭제
export const deleteCustomerAddress = async (addressId) => {
  return apiCall(`/api/v1/customers/addresses/${addressId}`, {
    method: 'DELETE',
  });
};

// ==================== 예약 관련 API ====================

// 고객의 예약 목록 조회 (페이징)
export const getCustomerReservations = async (page = 0, size = 10) => {
  return apiCall(`/api/v1/reservations/customer?page=${page}&size=${size}`);
};

// 예약에 매니저 할당 (단순화된 방식)
export const assignManagerToReservation = async (reservationId, managerId) => {
  try {
    // 방법 1: 매니저 할당 전용 엔드포인트
    try {
      const response = await apiCall(
        `/api/v1/reservations/${reservationId}/assign-manager`,
        {
          method: 'POST',
          body: JSON.stringify({ managerId: managerId }),
        }
      );
      return response;
    } catch {
      // 방법 2: 예약 상태 업데이트와 함께 매니저 할당
      try {
        const response = await apiCall(
          `/api/v1/reservations/${reservationId}/status`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              status: 'CONFIRMED',
              managerId: managerId,
            }),
          }
        );
        return response;
      } catch {
        // 방법 3: 간단한 매니저 할당
        const response = await apiCall(`/api/v1/managers/${managerId}/assign`, {
          method: 'POST',
          body: JSON.stringify({ reservationId: reservationId }),
        });
        return response;
      }
    }
  } catch (error) {
    console.log('❌ 모든 매니저 할당 방법 실패:', error.message);
    throw error;
  }
};

// 서비스 예약
export const createCustomerReservation = async (reservationData) => {
  try {
    console.log('🔄 Spring Boot ReservationRequestDto 형식으로 변환');

    // ⭐️ UserServiceRequest.jsx에서 전송하는 데이터 구조 그대로 사용
    const springBootData = {
      requestedDate: reservationData.requestedDate, // LocalDate (yyyy-MM-dd)
      requestedTime: reservationData.requestedTime, // LocalTime (HH:mm:ss)
      subOptionId: reservationData.subOptionId, // Long
      customerId: reservationData.customerId, // Long (필수)
      address: reservationData.address, // String
      addressDetail: reservationData.addressDetail, // String
      totalPrice: reservationData.totalPrice, // Integer
      totalDuration: reservationData.totalDuration, // Integer
      customerMemo: reservationData.customerMemo || '', // String (TEXT)
    };

    console.log('📤 Spring Boot로 전송할 데이터:', springBootData);

    const response = await apiCall('/api/v1/reservations', {
      method: 'POST',
      body: JSON.stringify(springBootData),
    });

    console.log('✅ 백엔드 응답:', response);
    return response;
  } catch (error) {
    console.error('❌ Spring Boot DB 저장 실패:', error.message);

    // 400 Bad Request의 구체적인 원인 분석
    if (error.message.includes('400')) {
      console.log('🔍 400 오류 원인 분석:');
      console.log('- requestedDate 필드 확인 (yyyy-MM-dd 형식)');
      console.log('- requestedTime 필드 확인 (HH:mm:ss 형식)');
      console.log('- subOptionId 필드 확인 (Long 타입)');
      console.log('📝 원본 데이터:', JSON.stringify(reservationData, null, 2));
    }

    // 실제 DB 저장 실패를 나타내는 에러를 다시 throw
    throw new Error(`Spring Boot DB 저장 실패: ${error.message}`);
  }
};

// 예약 완료 조회
export const getCustomerReservation = async (reservationId) => {
  return apiCall(`/api/v1/reservations/${reservationId}`);
};

// 예약 취소
export const cancelCustomerReservation = async (reservationId) => {
  return apiCall(`/api/v1/reservations/${reservationId}/cancel`, {
    method: 'POST',
  });
};

// ==================== 매니저 관련 API ====================

// 매니저 매칭 정보 조회
export const getMatchedManagers = async (reservationId) => {
  return apiCall(`/api/v1/reservations/${reservationId}/matching`);
};

// 매니저 상세 정보 조회
export const getManagerProfile = async (managerId) => {
  return apiCall(`/managers/${managerId}/profile`);
};

// 매니저 메모 전달
export const sendManagerMemo = async (reservationId, memoData) => {
  return apiCall(`/customers/reservations/${reservationId}/memo`, {
    method: 'PUT',
    body: JSON.stringify(memoData),
  });
};

// ==================== 결제 관련 API ====================

// 결제 요청
export const requestPayment = async (reservationId, paymentData) => {
  return apiCall(`/api/v1/payments`, {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

// ==================== 에러 처리 헬퍼 함수 ====================

export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.message.includes('401')) {
    // 인증 에러 - 로그인 페이지로 리다이렉트
    window.location.href = '/login';
    return;
  }

  if (error.message.includes('403')) {
    // 권한 에러
    alert('접근 권한이 없습니다.');
    return;
  }

  if (error.message.includes('404')) {
    // 리소스 없음
    alert('요청한 정보를 찾을 수 없습니다.');
    return;
  }

  if (error.message.includes('500')) {
    // 서버 에러
    alert('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  // 기타 에러
  alert('오류가 발생했습니다. 다시 시도해주세요.');
};

// 고객 서비스 API
export const customerAPI = {
  // 서비스 목록 조회
  getServices: () => apiCall('/api/v1/services'),

  // 서비스 세부 옵션 조회
  getServiceOptions: (serviceId) =>
    apiCall(`/api/v1/services/${serviceId}/options`),

  // 서비스 추가 옵션 조회 (서브 옵션)
  getServiceSubOptions: (serviceId) =>
    apiCall(`/api/v1/services/${serviceId}/sub-options`),

  // 고객 주소 목록 조회
  getCustomerAddresses: () => apiCall('/api/v1/customers/addresses'),

  // 고객 주소 추가
  addCustomerAddress: (addressData) =>
    apiCall('/api/v1/customers/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    }),

  // 예약 생성 (Spring Boot 컨트롤러와 매칭)
  createReservation: (reservationData) =>
    apiCall('/api/v1/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    }),

  // 예약 목록 조회
  getReservations: () => apiCall('/api/v1/reservations'),

  // 특정 예약 조회
  getReservation: (reservationId) =>
    apiCall(`/api/v1/reservations/${reservationId}`),

  // 매니저 매칭 요청
  requestManagerMatching: (reservationId) =>
    apiCall(`/api/v1/reservations/${reservationId}/matching`, {
      method: 'POST',
    }),

  // 결제 처리
  processPayment: (paymentData) =>
    apiCall('/api/v1/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

  // 결제 상태 확인
  getPaymentStatus: (paymentId) => apiCall(`/api/v1/payments/${paymentId}`),
};
