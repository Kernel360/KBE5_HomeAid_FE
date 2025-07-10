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
  // 통계 데이터가 없거나 유효하지 않으면 빈 데이터 반환
  if (!stats) {
    return { values: [], max: 100, labels: [], hasData: false };
  }

  // 현재 날짜 기준으로 실제 데이터가 있는 날짜만 처리
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // 선택된 월이 현재 월보다 미래이거나, 같은 월에서 미래 날짜인 경우 데이터 없음 처리
  if (selectedMonth) {
    if (
      selectedYear > currentYear ||
      (selectedYear === currentYear && selectedMonth > currentMonth)
    ) {
      return { values: [], max: 100, labels: [], hasData: false };
    }

    // 현재 월인 경우 오늘까지만 라벨 생성
    const isCurrentMonth =
      selectedYear === currentYear && selectedMonth === currentMonth;
    const maxDay = isCurrentMonth
      ? currentDay
      : getDaysInMonth(selectedYear, selectedMonth);

    const labels = Array.from({ length: maxDay }, (_, i) => `${i + 1}일`);

    // 실제 데이터가 있는지 확인하고 단일 값만 반환 (더미 데이터 생성하지 않음)
    if (activeTab === '회원현황') {
      const totalUsers = Number(stats.totalUsers) || 0;
      const signupCount = Number(stats.signupCount) || 0;
      const withdrawCount = Number(stats.withdrawCount) || 0;

      if (totalUsers === 0 && signupCount === 0 && withdrawCount === 0) {
        return { values: [], max: 100, labels: [], hasData: false };
      }

      // 실제 값 하나만 표시 (오늘의 값)
      const values = [totalUsers];
      const maxValue = Math.max(totalUsers, 100);

      return {
        values,
        max: maxValue * 1.2,
        labels: labels.slice(-1), // 마지막 날짜만
        mainValue: totalUsers,
        subValues: [signupCount, withdrawCount],
        hasData: true,
      };
    } else if (activeTab === '정산') {
      const requestedCount = Number(stats.requestedCount) || 0;
      const paidCount = Number(stats.paidCount) || 0;

      if (requestedCount === 0 && paidCount === 0) {
        return { values: [], max: 100, labels: [], hasData: false };
      }

      const values = [paidCount];
      const maxValue = Math.max(requestedCount, 10);

      return {
        values,
        max: maxValue * 1.2,
        labels: labels.slice(-1),
        mainValue: requestedCount,
        subValues: [paidCount, requestedCount - paidCount],
        hasData: true,
      };
    } else if (activeTab === '결제') {
      const totalAmount = Number(stats.totalAmount) || 0;
      const cancelAmount = Number(stats.cancelAmount) || 0;

      if (totalAmount === 0 && cancelAmount === 0) {
        return { values: [], max: 100, labels: [], hasData: false };
      }

      const values = [totalAmount];
      const maxValue = Math.max(totalAmount, 1000);

      return {
        values,
        max: maxValue * 1.2,
        labels: labels.slice(-1),
        mainValue: totalAmount,
        subValues: [totalAmount - cancelAmount, cancelAmount],
        hasData: true,
      };
    } else if (activeTab === '예약관리') {
      const reservationCount = Number(stats.reservationCount) || 0;
      const cancelledCount = Number(stats.cancelledCount) || 0;

      if (reservationCount === 0 && cancelledCount === 0) {
        return { values: [], max: 100, labels: [], hasData: false };
      }

      const values = [reservationCount];
      const maxValue = Math.max(reservationCount, 100);

      return {
        values,
        max: maxValue * 1.2,
        labels: labels.slice(-1),
        mainValue: reservationCount,
        subValues: [reservationCount - cancelledCount, cancelledCount],
        hasData: true,
      };
    } else if (activeTab === '매니저별점') {
      const avgRating = Number(stats.avgRating) || 0;
      const reviewCount = Number(stats.reviewCount) || 0;

      if (avgRating === 0 && reviewCount === 0) {
        return { values: [], max: 100, labels: [], hasData: false };
      }

      const values = [avgRating];
      const maxValue = Math.max(avgRating, 5);

      return {
        values,
        max: maxValue * 1.2,
        labels: labels.slice(-1),
        mainValue: avgRating,
        subValues: [reviewCount],
        hasData: true,
      };
    } else if (activeTab === '매칭') {
      const totalCount = Number(stats.totalCount) || 0;
      const successCount = Number(stats.successCount) || 0;
      const failCount = Number(stats.failCount) || 0;

      if (totalCount === 0 && successCount === 0 && failCount === 0) {
        return { values: [], max: 100, labels: [], hasData: false };
      }

      const values = [totalCount];
      const maxValue = Math.max(totalCount, 100);

      return {
        values,
        max: maxValue * 1.2,
        labels: labels.slice(-1),
        mainValue: totalCount,
        subValues: [successCount, failCount],
        hasData: true,
      };
    }
  } else {
    // 전체 선택 시 (월별 라벨)
    const labels = [
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
    const currentMonthLabels = labels.slice(0, currentMonth);

    // 간단한 단일 값 표시
    if (activeTab === '회원현황') {
      const totalUsers = Number(stats.totalUsers) || 0;
      if (totalUsers === 0) {
        return { values: [], max: 100, labels: [], hasData: false };
      }
      return {
        values: [totalUsers],
        max: totalUsers * 1.2,
        labels: currentMonthLabels.slice(-1),
        hasData: true,
      };
    }
  }

  return { values: [], max: 100, labels: [], hasData: false };
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
