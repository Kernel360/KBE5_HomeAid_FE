// 서비스 관련 상수 데이터
export const SERVICE_OPTIONS = {
  furniture: { name: '쇼파 등 가구 먼지제거', price: 15000 },
  floor: { name: '바닥청소(물걸레 포함)', price: 20000 },
  organization: { name: '침구, 물건 정리정돈', price: 18000 },
  kitchen: { name: '설거지 및 주방정리', price: 25000 },
  trash: { name: '일반/음식물/재활용 배출', price: 30000 },
  laundry: { name: '분류된 세탁물 세탁', price: 22000 },
};

// 기본 가격 정보
export const PRICING = {
  BASE_PRICE: 80000,
  BASE_PRICE_NAME: '기본 요금',
};

// 서비스 타입
export const SERVICE_TYPES = {
  CLEANING: '청소',
  INTERIOR: '인테리어',
  COOKING: '요리',
};

// 하위 서비스 옵션
export const SUB_SERVICE_OPTIONS = {
  TOILET_CLEANING: '화장실청소',
  BUILDING_CLEANING: '건물청소',
};

// 사용자 정보 (나중에 API에서 가져올 예정)
export const USER_INFO = {
  name: '양증진',
  greeting: '양증진 님 반가워요.',
};

// 서비스 설명
export const SERVICE_DESCRIPTIONS = {
  BASIC_SERVICE: {
    title: '기본서비스',
    duration: '(소요시간: 약 3시간)',
    note: '(1회 한정 서비스)',
  },
  MAIN_QUESTION: '지금, 어떤 도움이 필요하신가요?',
  SUB_QUESTION: '가사 서비스를 선택하셨네요!',
  SUB_MESSAGE: '하위 옵션을 선택해 주세요.',
};

// 기본 결제 정보 (장바구니를 거치지 않은 경우)
export const DEFAULT_PAYMENT_DATA = {
  serviceInfo: {
    dateTime: '2023-06-15 14:00',
    serviceType: '일회성 청소 (1인)',
    manager: '김청소 매니저',
  },
  priceList: [
    { name: '기본 요금', price: 80000 },
    { name: '찬대 물기기', price: 10000 },
    { name: '찬장 먼지 제거', price: 20000 },
    { name: '일반 배출', price: 20000 },
    { name: '음식물 배출', price: 25000 },
  ],
  totalAmount: 155000,
};
