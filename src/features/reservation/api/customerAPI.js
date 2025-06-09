/* eslint-env node */
// Base API URL - Spring Boot 백엔드 연결 (포트 8080)
const API_BASE_URL = 'http://localhost:8080';

// JWT 토큰을 헤더에 추가하는 함수
const getAuthHeaders = () => {
  const token = localStorage.getItem('jwtToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// 기본 API 호출 함수
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: getAuthHeaders(),
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    // Spring Boot CommonApiResponse 구조 처리
    // { success: true, message: "성공", data: {...} } 형태의 응답을 처리
    if (result && typeof result === 'object' && 'data' in result) {
      return result.data; // 실제 데이터만 반환
    }

    return result; // 래핑되지 않은 응답은 그대로 반환
  } catch (error) {
    console.error('API 호출 실패:', error);
    throw error;
  }
};

// ==================== 서비스 관련 API ====================

// 서비스 옵션 조회 (임시 목업 데이터 포함)
export const getCustomerServices = async () => {
  try {
    // return await apiCall('/api/v1/services');
    return await apiCall('/api/v1/reservations');
  } catch (error) {
    // 백엔드가 없을 때 임시 목업 데이터 반환
    console.warn(
      '백엔드 서버에 연결할 수 없습니다. 목업 데이터를 사용합니다:',
      error.message
    );
    return [
      {
        id: 1,
        name: '청소 서비스',
        description: '원룸, 투룸, 쓰리룸 청소',
        price: 50000,
        duration: 120,
      },
      {
        id: 2,
        name: '대청소 서비스',
        description: '깊은 청소 서비스',
        price: 80000,
        duration: 180,
      },
    ];
  }
};

// ==================== 주소 관련 API ====================

// 기존 주소 목록 조회 (임시 목업 데이터 포함)
export const getCustomerAddresses = async () => {
  try {
    return await apiCall('/api/v1/customers/addresses');
  } catch (error) {
    // 백엔드가 없을 때 임시 목업 데이터 반환
    console.warn(
      '백엔드 서버에 연결할 수 없습니다. 목업 주소 데이터를 사용합니다:',
      error.message
    );
    return [
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
    ];
  }
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

// 서비스 예약
export const createCustomerReservation = async (reservationData) => {
  return apiCall('/api/v1/reservations', {
    method: 'POST',
    body: JSON.stringify(reservationData),
  });
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
