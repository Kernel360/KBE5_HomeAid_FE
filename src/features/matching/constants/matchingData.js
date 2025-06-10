// 매칭 상태 상수
export const MATCHING_STATUS = {
  // 매니저 응답 대기
  PENDING_MANAGER_RESPONSE: 'PENDING_MANAGER_RESPONSE',
  // 고객 응답 대기 (매니저가 승인 후)
  PENDING_CUSTOMER_RESPONSE: 'PENDING_CUSTOMER_RESPONSE',
  // 최종 매칭 완료 (매니저, 고객 모두 승인)
  CONFIRMED: 'CONFIRMED',
  // 매니저가 거절
  REJECTED_BY_MANAGER: 'REJECTED_BY_MANAGER',
  // 고객이 거절
  REJECTED_BY_CUSTOMER: 'REJECTED_BY_CUSTOMER',
};

// 매니저 액션
export const MANAGER_ACTION = {
  ACCEPT: 'ACCEPT',
  REJECT: 'REJECT',
};

// 고객 액션
export const CUSTOMER_ACTION = {
  CONFIRM: 'CONFIRM',
  REJECT: 'REJECT',
};

// 서비스 상태
export const SERVICE_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};

// 체크인 상태
export const CHECKIN_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
};

// 매칭 상태별 한글 표시명
export const MATCHING_STATUS_LABELS = {
  [MATCHING_STATUS.PENDING_MANAGER_RESPONSE]: '매칭 대기',
  [MATCHING_STATUS.PENDING_CUSTOMER_RESPONSE]: '고객 응답 대기',
  [MATCHING_STATUS.CONFIRMED]: '매칭 완료',
  [MATCHING_STATUS.REJECTED_BY_MANAGER]: '매니저 거절',
  [MATCHING_STATUS.REJECTED_BY_CUSTOMER]: '고객 거절',
};

// 매칭 상태별 색상
export const MATCHING_STATUS_COLORS = {
  [MATCHING_STATUS.PENDING_MANAGER_RESPONSE]: 'waiting',
  [MATCHING_STATUS.PENDING_CUSTOMER_RESPONSE]: 'pending',
  [MATCHING_STATUS.CONFIRMED]: 'matched',
  [MATCHING_STATUS.REJECTED_BY_MANAGER]: 'rejected',
  [MATCHING_STATUS.REJECTED_BY_CUSTOMER]: 'rejected',
};

// 서비스 유형
export const SERVICE_TYPES = {
  STUDIO: '원룸',
  ONE_ROOM: '투룸',
  TWO_ROOM: '쓰리룸',
  DEEP_CLEANING: '대청소',
  REGULAR_CLEANING: '일반청소',
  MOVE_IN_CLEANING: '입주청소',
  MOVE_OUT_CLEANING: '이사청소',
};

// 예상 소요 시간 옵션
export const ESTIMATED_DURATION = {
  SHORT: '1-2시간',
  MEDIUM: '2-3시간',
  LONG: '3-4시간',
  EXTRA_LONG: '4시간 이상',
};

// 매니저 정보
export const MANAGER_INFO = {
  name: '김매니저',
  rating: 4.8,
  completedServices: 247,
  joinDate: '2023-03-15',
};

// 기본 서비스 설명
export const SERVICE_DESCRIPTIONS = {
  DEEP_CLEANING: {
    title: '대청소',
    description: '전체적인 청소와 정리 정돈',
    basePrice: 50000,
    baseDuration: 180, // 분 단위
  },
  REGULAR_CLEANING: {
    title: '일반청소',
    description: '기본적인 청소 서비스',
    basePrice: 30000,
    baseDuration: 120,
  },
  MOVE_IN_CLEANING: {
    title: '입주청소',
    description: '새 집 입주 전 전문 청소',
    basePrice: 80000,
    baseDuration: 240,
  },
  MOVE_OUT_CLEANING: {
    title: '이사청소',
    description: '이사 전 원상복구 청소',
    basePrice: 80000,
    baseDuration: 240,
  },
};

// 일반적인 거절 사유 템플릿
export const REJECTION_REASONS = [
  '다른 예약과 시간이 겹칩니다',
  '해당 지역 서비스가 어렵습니다',
  '요청하신 서비스 범위가 예상보다 큽니다',
  '개인 사정으로 서비스가 어렵습니다',
  '기타 사유',
];

// 지역 정보
export const SERVICE_AREAS = {
  GANGNAM: '강남구',
  SEOCHO: '서초구',
  SONGPA: '송파구',
  GANGDONG: '강동구',
  MAPO: '마포구',
  YONGSAN: '용산구',
  JUNG: '중구',
  JONGNO: '종로구',
};

// 알림 메시지
export const NOTIFICATION_MESSAGES = {
  MATCHING: {
    ACCEPT_SUCCESS: '매칭 요청을 수락했습니다.',
    ACCEPT_ERROR: '매칭 수락 중 오류가 발생했습니다.',
    REJECT_SUCCESS: '매칭 요청을 거절했습니다.',
    REJECT_ERROR: '매칭 거절 중 오류가 발생했습니다.',
    REJECT_REASON_REQUIRED: '거절 사유를 입력해주세요.',
    LOAD_ERROR: '매칭 정보를 불러올 수 없습니다.',
  },
  SERVICE: {
    CHECKIN_SUCCESS: '체크인이 완료되었습니다.',
    CHECKIN_ERROR: '체크인 중 오류가 발생했습니다.',
    CHECKOUT_SUCCESS: '체크아웃이 완료되었습니다.',
    CHECKOUT_ERROR: '체크아웃 중 오류가 발생했습니다.',
    FILE_REQUIRED: '파일을 선택해주세요.',
    FILE_UPLOAD_SUCCESS: '파일 업로드가 완료되었습니다.',
    FILE_UPLOAD_ERROR: '파일 업로드 중 오류가 발생했습니다.',
  },
  GENERAL: {
    LOADING: '로딩 중...',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
    UNEXPECTED_ERROR: '예상치 못한 오류가 발생했습니다.',
  },
};

// API 엔드포인트
export const API_ENDPOINTS = {
  // 매니저 매칭 응답
  MANAGER_RESPONSE: (matchingId) =>
    `/manager/matchings/${matchingId}/to-customer`,
  // 고객 매칭 응답
  CUSTOMER_RESPONSE: (matchingId) =>
    `/customer/matchings/${matchingId}/to-manager`,
  // 매칭 상세 조회
  MATCHING_DETAIL: (matchingId) => `/matchings/${matchingId}`,
  // 매니저 매칭 목록
  MANAGER_MATCHING_LIST: '/manager/matchings',
  // 서비스 체크인/아웃
  SERVICE_CHECKIN: (matchingId) => `/manager/services/${matchingId}/checkin`,
  SERVICE_CHECKOUT: (matchingId) => `/manager/services/${matchingId}/checkout`,
};

// 더미 데이터 (개발용)
export const DUMMY_MATCHING_DATA = {
  matchingId: 1001,
  serviceType: '대청소',
  reservedDate: '2023-06-15',
  reservedTime: '14:00',
  estimatedDuration: 3,
  latitude: 37.498095,
  longitude: 127.02761,
  customerRequest:
    '주방 기름때 제거에 신경써주세요. 욕실 곰팡이도 깔끔하게 청소 부탁드립니다.',
  status: MATCHING_STATUS.PENDING_MANAGER_RESPONSE,
};
