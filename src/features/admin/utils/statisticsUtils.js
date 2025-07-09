/**
 * 숫자 포맷팅 함수
 * @param {number} number - 포맷팅할 숫자
 * @returns {string} 포맷팅된 숫자 문자열
 */
export const formatNumber = (number) => {
  if (!number || isNaN(number) || !isFinite(number)) return '0';
  return Number(number).toLocaleString();
};

/**
 * 퍼센트 포맷팅 함수
 * @param {number} percent - 포맷팅할 퍼센트 값
 * @returns {string} 포맷팅된 퍼센트 문자열
 */
export const formatPercent = (percent) => {
  if (!percent || isNaN(percent) || !isFinite(percent)) return '0%';
  return `${Number(percent).toFixed(1)}%`;
};

/**
 * 금액 포맷팅 함수
 * @param {number} amount - 포맷팅할 금액
 * @returns {string} 포맷팅된 금액 문자열
 */
export const formatCurrency = (amount) => {
  if (!amount) return '₩0';
  return `₩${amount.toLocaleString()}`;
};

/**
 * SVG 차트 좌표 계산 함수
 * @param {number[]} values - 차트 값 배열
 * @param {number} max - 최대값
 * @returns {string} SVG 경로 문자열
 */
export const generateChartPath = (values, max) => {
  if (!values || !values.length || !max || max <= 0) return '';

  const width = 700;
  const height = 160;
  const padding = 50;
  const stepX = width / (values.length - 1);

  return values
    .map((value, index) => {
      const safeValue = isNaN(value) || !isFinite(value) ? 0 : Number(value);
      const safeMax =
        isNaN(max) || !isFinite(max) || max <= 0 ? 100 : Number(max);

      const x = padding + index * stepX;
      const y = height - (safeValue / safeMax) * height + 40;

      const safeX = isNaN(x) || !isFinite(x) ? padding : x;
      const safeY = isNaN(y) || !isFinite(y) ? height + 40 : y;

      return `${index === 0 ? 'M' : 'L'}${safeX},${safeY}`;
    })
    .join(' ');
};

/**
 * 차트 데이터 생성 함수
 * @param {string} activeTab - 활성 탭
 * @param {Object} stats - 통계 데이터
 * @returns {Object} 차트 데이터
 */
export const generateChartData = (activeTab, stats) => {
  if (activeTab === '회원현황' && stats) {
    const totalUsers = Number(stats.totalUsers) || 100;
    const signupCount = Number(stats.signupCount) || 0;
    const withdrawCount = Number(stats.withdrawCount) || 0;
    const maxValue = Math.max(totalUsers, 100);

    return {
      values: [
        totalUsers * 0.7,
        totalUsers * 0.75,
        totalUsers * 0.8,
        totalUsers * 0.85,
        totalUsers * 0.9,
        totalUsers * 0.95,
        totalUsers,
        totalUsers,
      ],
      max: maxValue * 1.2,
      labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월'],
      mainValue: totalUsers,
      subValues: [signupCount, withdrawCount],
    };
  } else if (activeTab === '정산' && stats) {
    const requestedCount = Number(stats.requestedCount) || 10;
    const paidCount = Number(stats.paidCount) || 0;
    const maxValue = Math.max(requestedCount, 10);

    return {
      values: [
        paidCount * 0.3,
        paidCount * 0.5,
        paidCount * 0.65,
        paidCount * 0.75,
        paidCount * 0.85,
        paidCount * 0.9,
        paidCount * 0.95,
        paidCount,
      ],
      max: maxValue * 1.2,
      labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월'],
      mainValue: requestedCount,
      subValues: [paidCount, requestedCount - paidCount],
    };
  } else if (activeTab === '결제' && stats) {
    const totalAmount = Number(stats.totalAmount) || 1000;
    const cancelAmount = Number(stats.cancelAmount) || 0;
    const maxValue = Math.max(totalAmount, 1000);

    return {
      values: [
        totalAmount * 0.4,
        totalAmount * 0.55,
        totalAmount * 0.7,
        totalAmount * 0.8,
        totalAmount * 0.85,
        totalAmount * 0.9,
        totalAmount * 0.95,
        totalAmount,
      ],
      max: maxValue * 1.2,
      labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월'],
      mainValue: totalAmount,
      subValues: [totalAmount - cancelAmount, cancelAmount],
    };
  } else if (activeTab === '예약관리' && stats) {
    const reservationCount = Number(stats.reservationCount) || 100;
    const cancelledCount = Number(stats.cancelledCount) || 0;
    const maxValue = Math.max(reservationCount, 100);

    return {
      values: [
        reservationCount * 0.3,
        reservationCount * 0.45,
        reservationCount * 0.6,
        reservationCount * 0.75,
        reservationCount * 0.8,
        reservationCount * 0.85,
        reservationCount * 0.95,
        reservationCount,
      ],
      max: maxValue * 1.2,
      labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월'],
      mainValue: reservationCount,
      subValues: [reservationCount - cancelledCount, cancelledCount],
    };
  } else if (activeTab === '매니저별점' && stats) {
    const avgRating = Number(stats.avgRating) || 4.0;
    const reviewCount = Number(stats.reviewCount) || 100;
    const maxValue = Math.max(avgRating, 5);

    return {
      values: [
        avgRating * 0.7,
        avgRating * 0.75,
        avgRating * 0.8,
        avgRating * 0.85,
        avgRating * 0.9,
        avgRating * 0.95,
        avgRating * 0.98,
        avgRating,
      ],
      max: maxValue * 1.2,
      labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월'],
      mainValue: avgRating,
      subValues: [reviewCount],
    };
  } else if (activeTab === '매칭' && stats) {
    const totalCount = Number(stats.totalCount) || 100;
    const successCount = Number(stats.successCount) || 0;
    const maxValue = Math.max(totalCount, 100);

    return {
      values: [
        totalCount * 0.25,
        totalCount * 0.4,
        totalCount * 0.55,
        totalCount * 0.7,
        totalCount * 0.8,
        totalCount * 0.9,
        totalCount * 0.95,
        totalCount,
      ],
      max: maxValue * 1.2,
      labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월'],
      mainValue: totalCount,
      subValues: [successCount, stats.failCount],
    };
  }

  return { values: [], max: 100, labels: [] };
};

/**
 * 차트 제목 반환 함수
 * @param {string} activeTab - 활성 탭
 * @returns {string} 차트 제목
 */
export const getChartTitle = (activeTab) => {
  switch (activeTab) {
    case '회원현황':
      return '회원 증가 추이';
    case '정산':
      return '정산 처리 추이';
    case '결제':
      return '결제 금액 추이';
    case '예약관리':
      return '예약 수 추이';
    case '매니저별점':
      return '매니저 평점 추이';
    case '매칭':
      return '매칭 시도 추이';
    default:
      return '통계 추이';
  }
};

/**
 * 분포 제목 반환 함수
 * @param {string} activeTab - 활성 탭
 * @returns {string} 분포 제목
 */
export const getDistributionTitle = (activeTab) => {
  switch (activeTab) {
    case '회원현황':
      return '회원 분포';
    case '정산':
      return '정산 상태 분포';
    case '결제':
      return '결제 수단 분포';
    case '예약관리':
      return '예약 상태 분포';
    case '매니저별점':
      return '평점 분포';
    case '매칭':
      return '매칭 결과 분포';
    default:
      return '분포';
  }
};

/**
 * 탭 활성화 여부 확인 함수
 * @param {string} tabName - 탭 이름
 * @returns {boolean} 활성화 여부
 */
export const isTabEnabled = (tabName) => {
  const enabledTabs = [
    '전체',
    '회원현황',
    '정산',
    '결제',
    '예약관리',
    '매니저별점',
    '매칭',
  ];
  return enabledTabs.includes(tabName);
};

/**
 * 상수 정의
 */
export const CONSTANTS = {
  YEARS: [2023, 2024, 2025],
  MONTHS: Array.from({ length: 12 }, (_, i) => i + 1),
  DAYS: Array.from({ length: 31 }, (_, i) => i + 1),
  MAIN_TABS: [
    '전체 통계',
    '회원현황 통계',
    '정산 통계',
    '결제 통계',
    '예약관리 통계',
    '매니저별점 통계',
    '매칭 통계',
  ],
};
