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
 * 해당 년도/월의 일수를 반환하는 함수
 * @param {number} year - 연도
 * @param {number} month - 월 (1-12)
 * @returns {number} 해당 월의 일수
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

/**
 * 선택된 월의 일별 라벨을 생성하는 함수
 * @param {number} year - 선택된 연도
 * @param {number} month - 선택된 월 (1-12)
 * @returns {string[]} 일별 라벨 배열
 */
export const generateDailyLabels = (year, month) => {
  if (!month) {
    // 월이 선택되지 않은 경우 월별 라벨 반환
    return [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ];
  }

  const daysInMonth = getDaysInMonth(year, month);
  return Array.from({ length: daysInMonth }, (_, i) => `${i + 1}일`);
};

/**
 * 선택된 월의 일별 더미 데이터를 생성하는 함수
 * @param {number} baseValue - 기준값
 * @param {number} daysCount - 일수
 * @returns {number[]} 일별 더미 데이터 배열
 */
export const generateDailyValues = (baseValue, daysCount) => {
  return Array.from({ length: daysCount }, (_, i) => {
    // 월 초부터 점진적으로 증가하는 패턴
    const progress = i / (daysCount - 1);
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8~1.2 사이의 랜덤값
    return Math.round(baseValue * (0.3 + progress * 0.7) * randomFactor);
  });
};

/**
 * 차트 데이터 생성 함수
 * @param {string} activeTab - 활성 탭
 * @param {Object} stats - 통계 데이터
 * @param {number} selectedYear - 선택된 연도
 * @param {number} selectedMonth - 선택된 월
 * @returns {Object} 차트 데이터
 */
export const generateChartData = (
  activeTab,
  stats,
  selectedYear,
  selectedMonth
) => {
  // 라벨 생성 (월별 또는 일별)
  const labels = generateDailyLabels(selectedYear, selectedMonth);
  const dataCount = labels.length;

  if (activeTab === '회원현황' && stats) {
    const totalUsers = Number(stats.totalUsers) || 100;
    const signupCount = Number(stats.signupCount) || 0;
    const withdrawCount = Number(stats.withdrawCount) || 0;
    const maxValue = Math.max(totalUsers, 100);

    return {
      values: generateDailyValues(totalUsers, dataCount),
      max: maxValue * 1.2,
      labels,
      mainValue: totalUsers,
      subValues: [signupCount, withdrawCount],
    };
  } else if (activeTab === '정산' && stats) {
    const requestedCount = Number(stats.requestedCount) || 10;
    const paidCount = Number(stats.paidCount) || 0;
    const maxValue = Math.max(requestedCount, 10);

    return {
      values: generateDailyValues(paidCount, dataCount),
      max: maxValue * 1.2,
      labels,
      mainValue: requestedCount,
      subValues: [paidCount, requestedCount - paidCount],
    };
  } else if (activeTab === '결제' && stats) {
    const totalAmount = Number(stats.totalAmount) || 1000;
    const cancelAmount = Number(stats.cancelAmount) || 0;
    const maxValue = Math.max(totalAmount, 1000);

    return {
      values: generateDailyValues(totalAmount, dataCount),
      max: maxValue * 1.2,
      labels,
      mainValue: totalAmount,
      subValues: [totalAmount - cancelAmount, cancelAmount],
    };
  } else if (activeTab === '예약관리' && stats) {
    const reservationCount = Number(stats.reservationCount) || 100;
    const cancelledCount = Number(stats.cancelledCount) || 0;
    const maxValue = Math.max(reservationCount, 100);

    return {
      values: generateDailyValues(reservationCount, dataCount),
      max: maxValue * 1.2,
      labels,
      mainValue: reservationCount,
      subValues: [reservationCount - cancelledCount, cancelledCount],
    };
  } else if (activeTab === '매니저별점' && stats) {
    const avgRating = Number(stats.avgRating) || 4.0;
    const reviewCount = Number(stats.reviewCount) || 100;
    const maxValue = Math.max(avgRating, 5);

    return {
      values: generateDailyValues(avgRating, dataCount),
      max: maxValue * 1.2,
      labels,
      mainValue: avgRating,
      subValues: [reviewCount],
    };
  } else if (activeTab === '매칭' && stats) {
    const totalCount = Number(stats.totalCount) || 100;
    const successCount = Number(stats.successCount) || 0;
    const maxValue = Math.max(totalCount, 100);

    return {
      values: generateDailyValues(totalCount, dataCount),
      max: maxValue * 1.2,
      labels,
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
