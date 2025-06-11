/* eslint-env node */
// Base API URL - 환경변수 사용
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// API 기본 URL 구성
const getBaseUrl = () => {
  const baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;
  return baseUrl;
};

// JWT 토큰을 헤더에 추가하는 함수
const getAuthHeaders = () => {
  // accessToken 키로 통일 (authService.js와 일치)
  let token = localStorage.getItem('accessToken');

  // JWT 토큰 상태 확인
  if (token && token.startsWith('eyJ')) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('auth-storage');
        token = null;
      }
    } catch (error) {
      console.warn('JWT 토큰 파싱 실패:', error.message);
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

  return headers;
};

// 기본 API 호출 함수
const apiCall = async (url, options = {}) => {
  // 전체 URL 구성
  const fullUrl = `${getBaseUrl()}${url}`;

  const requestOptions = {
    headers: getAuthHeaders(),
    ...options,
  };

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

// 기존 주소 목록 조회 (백엔드에서만 가져오기)
export const getCustomerAddresses = async () => {
  try {
    // ⭐️ URL 중복 수정: /api/v1 제거 (getBaseUrl에서 이미 추가됨)
    const response = await apiCall('/customers/addresses');

    if (response && response.length > 0) {
      // 백엔드 CustomerAddressResponseDto[]를 프론트엔드 형식으로 변환
      const transformedAddresses = response.map((address, index) => {
        const transformed = {
          id: address.id,
          type: index === 0 ? '집' : index === 1 ? '회사' : '기타', // 임시 타입 할당
          main: address.address, // ⭐️ 백엔드 address 필드
          detail: address.addressDetail || '', // ⭐️ 백엔드 addressDetail 필드
          address: address.address, // 백업용 필드
          addressDetail: address.addressDetail || '', // 백업용 필드
          isDefault: index === 0, // 첫 번째 주소를 기본값으로 설정
          fullAddress: address.fullAddress,
          // 백엔드에서 위도/경도가 제외되어 있으므로 기본값 설정
          coordinates: {
            lat: null,
            lng: null,
          },
        };

        return transformed;
      });

      return transformedAddresses;
    } else {
      return [];
    }
  } catch {
    // ⭐️ 에러 시에도 빈 배열 반환
    return [];
  }
};

// 주소 등록
export const createCustomerAddress = async (addressData) => {
  try {
    // 백엔드 CustomerAddressSaveRequestDto 구조에 맞게 데이터 변환
    const backendAddressData = {
      address: addressData.main || addressData.address || '', // 기본 주소
      addressDetail: addressData.detail || addressData.addressDetail || '', // 상세 주소
      latitude: addressData.coordinates?.lat || addressData.latitude || null, // 위도
      longitude: addressData.coordinates?.lng || addressData.longitude || null, // 경도
    };

    // ⭐️ URL 중복 수정: /api/v1 제거
    const response = await apiCall('/customers/addresses', {
      method: 'POST',
      body: JSON.stringify(backendAddressData),
    });

    // 백엔드 CustomerAddressResponseDto를 프론트엔드 형식으로 변환
    const transformedResponse = {
      id: response.id,
      type: '새 주소', // 기본 타입
      main: response.address,
      detail: response.addressDetail || '',
      isDefault: false,
      fullAddress: response.fullAddress,
      // 위도/경도는 응답에서 제외되어 있지만 원본 데이터에서 가져옴
      coordinates: {
        lat: backendAddressData.latitude,
        lng: backendAddressData.longitude,
      },
    };

    return transformedResponse;
  } catch (error) {
    // 백엔드 연결 실패 시 상세 에러 메시지
    if (error.message.includes('403')) {
      throw new Error('주소 저장 권한이 없습니다. 로그인 상태를 확인해주세요.');
    } else if (error.message.includes('400')) {
      throw new Error(
        '주소 정보가 올바르지 않습니다. 필수 정보를 확인해주세요.'
      );
    } else if (error.message.includes('409')) {
      throw new Error('이미 동일한 주소가 저장되어 있습니다.');
    } else {
      throw new Error(`주소 저장에 실패했습니다: ${error.message}`);
    }
  }
};

// 주소 삭제
export const deleteCustomerAddress = async (addressId) => {
  return apiCall(`/customer/addresses/${addressId}`, {
    method: 'DELETE',
  });
};

// ==================== 예약 관련 API ====================

// 고객의 예약 목록 조회 (페이징)
export const getCustomerReservations = async (page = 0, size = 10) => {
  return apiCall(`/reservations/customer?page=${page}&size=${size}`);
};

// 예약에 매니저 할당 (단순화된 방식)
export const assignManagerToReservation = async (reservationId, managerId) => {
  // 방법 1: 매니저 할당 전용 엔드포인트
  try {
    const response = await apiCall(
      `/reservations/${reservationId}/assign-manager`,
      {
        method: 'POST',
        body: JSON.stringify({ managerId: managerId }),
      }
    );
    return response;
  } catch {
    // 방법 2: 예약 상태 업데이트와 함께 매니저 할당
    try {
      const response = await apiCall(`/reservations/${reservationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'CONFIRMED',
          managerId: managerId,
        }),
      });
      return response;
    } catch {
      // 방법 3: 간단한 매니저 할당
      const response = await apiCall(`/managers/${managerId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ reservationId: reservationId }),
      });
      return response;
    }
  }
};

// 서비스 예약
export const createCustomerReservation = async (reservationData) => {
  // ⭐️ CustomerAddress ID 방식으로 변경 (address, addressDetail 제거)
  const springBootData = {
    requestedDate: reservationData.requestedDate, // LocalDate (yyyy-MM-dd)
    requestedTime: reservationData.requestedTime, // LocalTime (HH:mm:ss)
    subOptionId: reservationData.subOptionId, // Long
    customerId: reservationData.customerId, // Long (필수)
    addressId: reservationData.addressId, // Long (CustomerAddress 테이블의 ID)
    totalPrice: reservationData.totalPrice, // Integer
    totalDuration: reservationData.totalDuration, // Integer
    customerMemo: reservationData.customerMemo || '', // String (TEXT)
  };

  try {
    const response = await apiCall('/reservations', {
      method: 'POST',
      body: JSON.stringify(springBootData),
    });

    return response;
  } catch (error) {
    // JWT 토큰 관련 에러 상세 처리
    if (
      error.message.includes('401') ||
      error.message.includes('JWT_INVALID')
    ) {
      throw new Error(
        'JWT_TOKEN_INVALID: JWT 토큰이 유효하지 않습니다. 백엔드 JWT 설정을 확인해주세요.'
      );
    }

    // 403 Forbidden 에러 처리
    if (error.message.includes('403')) {
      throw new Error(
        'BACKEND_AUTH_ERROR: 백엔드 권한 설정에 문제가 있습니다. Spring Security 설정을 확인해주세요.'
      );
    }

    // 실제 DB 저장 실패를 나타내는 에러를 다시 throw
    throw new Error(`Spring Boot DB 저장 실패: ${error.message}`);
  }
};

// 예약 완료 조회
export const getCustomerReservation = async (reservationId) => {
  return apiCall(`/reservations/${reservationId}`);
};

// 예약 취소
export const cancelCustomerReservation = async (reservationId) => {
  return apiCall(`/reservations/${reservationId}/cancel`, {
    method: 'POST',
  });
};

// ==================== 매니저 관련 API ====================

// 매니저 매칭 정보 조회
export const getMatchedManagers = async (reservationId) => {
  return apiCall(`/reservations/${reservationId}/matching`);
};

// 매니저 상세 정보 조회
export const getManagerProfile = async (managerId) => {
  return apiCall(`/managers/${managerId}/profile`);
};

// 매니저 메모 전달
export const sendManagerMemo = async (reservationId, memoData) => {
  return apiCall(`/customer/reservations/${reservationId}/memo`, {
    method: 'PUT',
    body: JSON.stringify(memoData),
  });
};

// ==================== 결제 관련 API ====================

// 결제 요청
export const requestPayment = async (reservationId, paymentData) => {
  return apiCall(`/payments`, {
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
  getServices: () => apiCall('/services'),

  // 서비스 세부 옵션 조회
  getServiceOptions: (serviceId) => apiCall(`/services/${serviceId}/options`),

  // 서비스 추가 옵션 조회 (서브 옵션)
  getServiceSubOptions: (serviceId) =>
    apiCall(`/services/${serviceId}/sub-options`),

  // 고객 주소 목록 조회
  getCustomerAddresses: () => apiCall('/customer/addresses'),

  // 고객 주소 추가
  addCustomerAddress: (addressData) =>
    apiCall('/customer/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    }),

  // 예약 생성 (Spring Boot 컨트롤러와 매칭)
  createReservation: (reservationData) =>
    apiCall('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    }),

  // 예약 목록 조회
  getReservations: () => apiCall('/reservations'),

  // 특정 예약 조회
  getReservation: (reservationId) => apiCall(`/reservations/${reservationId}`),

  // 매니저 매칭 요청
  requestManagerMatching: (reservationId) =>
    apiCall(`/reservations/${reservationId}/matching`, {
      method: 'POST',
    }),

  // 결제 처리
  processPayment: (paymentData) =>
    apiCall('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

  // 결제 상태 확인
  getPaymentStatus: (paymentId) => apiCall(`/payments/${paymentId}`),
};
