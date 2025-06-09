// 매칭 요청 상태
export const MATCHING_STATUS = {
  NEW_REQUEST: '신규 요청',
  ACCEPTED: '수락됨',
  REJECTED: '거절됨',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
};

// 서비스 진행 상태
export const SERVICE_STATUS = {
  WAITING_CHECKIN: '체크인 필요',
  IN_PROGRESS: '서비스 진행 중',
  COMPLETED: '서비스 완료',
  CANCELLED: '취소됨',
};

// 체크인/아웃 상태
export const CHECKIN_STATUS = {
  PENDING: '미완료',
  COMPLETED: '완료',
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
    ACCEPT_SUCCESS: '매칭 요청이 수락되었습니다.',
    ACCEPT_ERROR: '매칭 요청 수락에 실패했습니다.',
    REJECT_SUCCESS: '매칭 요청이 거절되었습니다.',
    REJECT_ERROR: '매칭 요청 거절에 실패했습니다.',
    REJECT_REASON_REQUIRED: '거절 사유를 입력해주세요.',
  },
  SERVICE: {
    CHECKIN_SUCCESS: '체크인이 완료되었습니다.',
    CHECKIN_ERROR: '체크인에 실패했습니다.',
    CHECKOUT_SUCCESS: '체크아웃이 완료되었습니다.',
    CHECKOUT_ERROR: '체크아웃에 실패했습니다.',
    FILE_UPLOAD_SUCCESS: '파일 업로드 및 체크아웃이 완료되었습니다.',
    FILE_UPLOAD_ERROR: '파일 업로드에 실패했습니다.',
    FILE_REQUIRED: '파일을 선택해주세요.',
  },
  GENERAL: {
    LOADING: '처리 중입니다...',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
    UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
  },
};

// API 엔드포인트 (실제 구현 시 사용)
export const API_ENDPOINTS = {
  MATCHING: {
    GET_REQUEST: (id) => `/api/v1/manager/matching-request/${id}`,
    ACCEPT_REQUEST: (id) => `/api/v1/manager/matching-request/${id}/accept`,
    REJECT_REQUEST: (id) => `/api/v1/manager/matching-request/${id}/reject`,
  },
  SERVICE: {
    GET_DETAILS: (id) => `/api/v1/manager/service/${id}`,
    CHECKIN: (id) => `/api/v1/manager/service/${id}/checkin`,
    CHECKOUT: (id) => `/api/v1/manager/service/${id}/checkout`,
    UPLOAD_FILE: (id) => `/api/v1/manager/service/${id}/upload`,
  },
};

// 더미 데이터 (개발용)
export const DUMMY_DATA = {
  MATCHING_REQUEST: {
    id: 1,
    status: MATCHING_STATUS.NEW_REQUEST,
    serviceType: SERVICE_TYPES.DEEP_CLEANING,
    dateTime: '2024-01-15 14:00',
    estimatedTime: ESTIMATED_DURATION.MEDIUM,
    address: '서울시 강남구 테헤란로 123',
    estimatedEarnings: 60000,
    customerRequest:
      '주방 기름때 제거에 신경써주세요. 욕실 곰팡이도 꼼꼼하게 청소 부탁드립니다.',
    customerName: '김고객',
  },
  SERVICE_DETAILS: {
    id: 1,
    customerName: '김고객',
    serviceType: SERVICE_TYPES.DEEP_CLEANING,
    dateTime: '2024-01-15 14:00',
    address: '서울시 강남구 테헤란로 123',
    checkInStatus: CHECKIN_STATUS.PENDING,
    checkOutStatus: CHECKIN_STATUS.PENDING,
  },
};
