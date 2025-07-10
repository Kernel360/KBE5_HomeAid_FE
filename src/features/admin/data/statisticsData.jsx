import {
  formatNumber,
  formatPercent,
  formatCurrency,
} from '../utils/statisticsUtils.js';

/**
 * 아이콘 컴포넌트들
 */
export const Icons = {
  Users: () => (
    <svg
      className="w-5 h-5 text-blue-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
  Plus: () => (
    <svg
      className="w-5 h-5 text-green-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Minus: () => (
    <svg
      className="w-5 h-5 text-red-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Check: () => (
    <svg
      className="w-5 h-5 text-purple-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Money: () => (
    <svg
      className="w-5 h-5 text-blue-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Calendar: () => (
    <svg
      className="w-5 h-5 text-blue-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Cancel: () => (
    <svg
      className="w-5 h-5 text-red-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Clock: () => (
    <svg
      className="w-5 h-5 text-purple-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  List: () => (
    <svg
      className="w-5 h-5 text-blue-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Lightning: () => (
    <svg
      className="w-5 h-5 text-purple-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Star: () => (
    <svg
      className="w-5 h-5 text-yellow-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  Chart: () => (
    <svg
      className="w-5 h-5 text-blue-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  ),
  Wallet: () => (
    <svg
      className="w-5 h-5 text-teal-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  ClipboardCheck: () => (
    <svg
      className="w-5 h-5 text-purple-600"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

/**
 * 날짜 포맷 생성 함수
 * @param {number} year - 연도
 * @param {number|null} month - 월
 * @param {number|null} day - 일
 * @returns {string} 포맷된 날짜 문자열
 */
const formatDateRange = (year, month, day) => {
  return `${year}년${month ? ` ${month}월` : ''}${day ? ` ${day}일` : ''}`;
};

/**
 * 회원 통계 카드 데이터 생성
 * @param {Object} userStats - 회원 통계 데이터
 * @param {number} year - 연도
 * @param {number|null} month - 월
 * @param {number|null} day - 일
 * @returns {Array} 카드 데이터 배열
 */
export const getUserStatsCards = (userStats, year, month, day) => {
  if (!userStats) return [];

  const withdrawRate =
    userStats.totalUsers > 0
      ? (userStats.withdrawCount / userStats.totalUsers) * 100
      : 0;

  return [
    {
      title: '누적 회원 수',
      value: formatNumber(userStats.totalUsers),
      subValue: formatDateRange(year, month, day),
      icon: <Icons.Users />,
      iconBg: 'bg-blue-100',
    },
    {
      title: '신규 가입자',
      value: formatNumber(userStats.signupCount),
      subValue: formatDateRange(year, month, day),
      icon: <Icons.Plus />,
      iconBg: 'bg-green-100',
    },
    {
      title: '탈퇴 회원',
      value: formatNumber(userStats.withdrawCount),
      subValue: `탈퇴율: ${formatPercent(withdrawRate)}`,
      icon: <Icons.Minus />,
      iconBg: 'bg-red-100',
    },
    {
      title: '활성 회원',
      value: formatNumber(userStats.totalUsers - userStats.withdrawCount),
      subValue: '누적 - 탈퇴',
      icon: <Icons.Check />,
      iconBg: 'bg-purple-100',
    },
  ];
};

/**
 * 정산 통계 카드 데이터 생성
 * @param {Object} settlementStats - 정산 통계 데이터
 * @param {number} year - 연도
 * @param {number|null} month - 월
 * @param {number|null} day - 일
 * @returns {Array} 카드 데이터 배열
 */
export const getSettlementStatsCards = (settlementStats, year, month, day) => {
  if (!settlementStats) return [];

  const completionRate =
    settlementStats.requestedCount > 0
      ? (settlementStats.paidCount / settlementStats.requestedCount) * 100
      : 0;

  return [
    {
      title: '정산 신청 수',
      value: formatNumber(settlementStats.requestedCount),
      subValue: formatDateRange(year, month, day),
      icon: <Icons.Money />,
      iconBg: 'bg-blue-100',
    },
    {
      title: '정산 완료 수',
      value: formatNumber(settlementStats.paidCount),
      subValue: formatDateRange(year, month, day),
      icon: <Icons.Check />,
      iconBg: 'bg-green-100',
    },
    {
      title: '정산 완료율',
      value: formatPercent(completionRate),
      subValue: '신청 대비 완료',
      icon: <Icons.ClipboardCheck />,
      iconBg: 'bg-purple-100',
    },
    {
      title: '정산 대기 수',
      value: formatNumber(
        settlementStats.requestedCount - settlementStats.paidCount
      ),
      subValue: '신청 - 완료',
      icon: <Icons.Clock />,
      iconBg: 'bg-orange-100',
    },
  ];
};

/**
 * 결제 통계 카드 데이터 생성
 * @param {Object} paymentStats - 결제 통계 데이터
 * @param {number} year - 연도
 * @param {number|null} month - 월
 * @param {number|null} day - 일
 * @returns {Array} 카드 데이터 배열
 */
export const getPaymentStatsCards = (paymentStats, year, month, day) => {
  if (!paymentStats) return [];

  const netAmount = paymentStats.totalAmount - paymentStats.cancelAmount;
  const cancelRate =
    paymentStats.paymentCount > 0
      ? (paymentStats.cancelCount / paymentStats.paymentCount) * 100
      : 0;

  return [
    {
      title: '총 결제 금액',
      value: formatCurrency(paymentStats.totalAmount),
      subValue: formatDateRange(year, month, day),
      icon: <Icons.Money />,
      iconBg: 'bg-blue-100',
    },
    {
      title: '취소 금액',
      value: formatCurrency(paymentStats.cancelAmount),
      subValue: `취소율: ${formatPercent(cancelRate)}`,
      icon: <Icons.Minus />,
      iconBg: 'bg-red-100',
    },
    {
      title: '순 결제 금액',
      value: formatCurrency(netAmount),
      subValue: '총 결제 - 취소',
      icon: <Icons.Check />,
      iconBg: 'bg-green-100',
    },
    {
      title: '결제 건수',
      value: formatNumber(paymentStats.paymentCount),
      subValue: `취소: ${formatNumber(paymentStats.cancelCount)}건`,
      icon: <Icons.Calendar />,
      iconBg: 'bg-purple-100',
    },
  ];
};

/**
 * 예약 통계 카드 데이터 생성
 * @param {Object} reservationStats - 예약 통계 데이터
 * @param {number} year - 연도
 * @param {number|null} month - 월
 * @param {number|null} day - 일
 * @returns {Array} 카드 데이터 배열
 */
export const getReservationStatsCards = (
  reservationStats,
  year,
  month,
  day
) => {
  if (!reservationStats) return [];

  const completedCount =
    reservationStats.reservationCount - reservationStats.cancelledCount;
  const cancelRate =
    reservationStats.reservationCount > 0
      ? (reservationStats.cancelledCount / reservationStats.reservationCount) *
        100
      : 0;

  return [
    {
      title: '총 예약 수',
      value: formatNumber(reservationStats.reservationCount),
      subValue: formatDateRange(year, month, day),
      icon: <Icons.Calendar />,
      iconBg: 'bg-blue-100',
    },
    {
      title: '취소 예약',
      value: formatNumber(reservationStats.cancelledCount),
      subValue: `취소율: ${formatPercent(cancelRate)}`,
      icon: <Icons.Cancel />,
      iconBg: 'bg-red-100',
    },
    {
      title: '완료 예약',
      value: formatNumber(completedCount),
      subValue: `성공률: ${formatPercent(reservationStats.reservationSuccessRate)}`,
      icon: <Icons.Check />,
      iconBg: 'bg-green-100',
    },
    {
      title: '평균 처리 시간',
      value: `${reservationStats.avgProcessingMinutes}분`,
      subValue: '예약 처리 소요 시간',
      icon: <Icons.Clock />,
      iconBg: 'bg-purple-100',
    },
  ];
};

/**
 * 매니저 평점 통계 카드 데이터 생성
 * @param {Object} managerRatingStats - 매니저 평점 통계 데이터
 * @param {number} year - 연도
 * @param {number|null} month - 월
 * @param {number|null} day - 일
 * @returns {Array} 카드 데이터 배열
 */
export const getManagerRatingStatsCards = (
  managerRatingStats,
  year,
  month,
  day
) => {
  if (!managerRatingStats) return [];

  return [
    {
      title: '평균 평점',
      value: `${managerRatingStats.avgRating.toFixed(2)}점`,
      subValue: formatDateRange(year, month, day),
      icon: <Icons.Star />,
      iconBg: 'bg-yellow-100',
    },
    {
      title: '리뷰 수',
      value: formatNumber(managerRatingStats.reviewCount),
      subValue: '평점 참여 건수',
      icon: <Icons.Chart />,
      iconBg: 'bg-blue-100',
    },
    {
      title: '평점 만족도',
      value:
        managerRatingStats.avgRating >= 4.5
          ? '매우 높음'
          : managerRatingStats.avgRating >= 4.0
            ? '높음'
            : managerRatingStats.avgRating >= 3.5
              ? '보통'
              : '낮음',
      subValue: `5점 만점 기준`,
      icon: <Icons.Check />,
      iconBg:
        managerRatingStats.avgRating >= 4.5
          ? 'bg-green-100'
          : managerRatingStats.avgRating >= 4.0
            ? 'bg-blue-100'
            : 'bg-orange-100',
    },
    {
      title: '평점 참여율',
      value:
        managerRatingStats.reviewCount > 1000
          ? '매우 높음'
          : managerRatingStats.reviewCount > 500
            ? '높음'
            : managerRatingStats.reviewCount > 100
              ? '보통'
              : '낮음',
      subValue: '고객 참여도',
      icon: <Icons.Users />,
      iconBg: 'bg-purple-100',
    },
  ];
};

/**
 * 매칭 통계 카드 데이터 생성
 * @param {Object} matchingStats - 매칭 통계 데이터
 * @param {number} year - 연도
 * @param {number|null} month - 월
 * @param {number|null} day - 일
 * @returns {Array} 카드 데이터 배열
 */
export const getMatchingStatsCards = (matchingStats, year, month, day) => {
  if (!matchingStats) return [];

  const successRate =
    matchingStats.totalCount > 0
      ? (matchingStats.successCount / matchingStats.totalCount) * 100
      : 0;
  const failRate =
    matchingStats.totalCount > 0
      ? (matchingStats.failCount / matchingStats.totalCount) * 100
      : 0;

  return [
    {
      title: '총 매칭 시도',
      value: formatNumber(matchingStats.totalCount),
      subValue: formatDateRange(year, month, day),
      icon: <Icons.List />,
      iconBg: 'bg-blue-100',
    },
    {
      title: '성공 매칭',
      value: formatNumber(matchingStats.successCount),
      subValue: `성공률: ${formatPercent(successRate)}`,
      icon: <Icons.Check />,
      iconBg: 'bg-green-100',
    },
    {
      title: '실패/취소 매칭',
      value: formatNumber(matchingStats.failCount),
      subValue: `실패율: ${formatPercent(failRate)}`,
      icon: <Icons.Cancel />,
      iconBg: 'bg-red-100',
    },
    {
      title: '매칭 효율성',
      value: formatPercent(successRate),
      subValue: '전체 시도 대비 성공',
      icon: <Icons.Lightning />,
      iconBg: 'bg-purple-100',
    },
  ];
};

/**
 * 전체 통계 요약 카드 데이터 생성
 * @param {Object} allStats - 모든 통계 데이터
 * @returns {Array} 카드 데이터 배열
 */
export const getAllStatsCards = (allStats) => {
  const {
    userStats,
    paymentStats,
    reservationStats,
    matchingStats,
    managerRatingStats,
    settlementStats,
  } = allStats;
  const cards = [];

  // 회원 현황 카드
  if (userStats) {
    cards.push({
      title: '총 회원 수',
      value: formatNumber(userStats.totalUsers),
      subValue: `신규: ${formatNumber(userStats.signupCount)}명`,
      icon: <Icons.Users />,
      iconBg: 'bg-blue-100',
    });
  }

  // 결제 현황 카드
  if (paymentStats) {
    cards.push({
      title: '총 결제 금액',
      value: formatCurrency(paymentStats.totalAmount),
      subValue: `결제 건수: ${formatNumber(paymentStats.paymentCount)}건`,
      icon: <Icons.Money />,
      iconBg: 'bg-green-100',
    });
  }

  // 예약 현황 카드
  if (reservationStats) {
    cards.push({
      title: '총 예약 수',
      value: formatNumber(reservationStats.reservationCount),
      subValue: `성공률: ${formatPercent(reservationStats.reservationSuccessRate)}`,
      icon: <Icons.Calendar />,
      iconBg: 'bg-purple-100',
    });
  }

  // 매니저 평점 현황 카드
  if (managerRatingStats) {
    cards.push({
      title: '평균 평점',
      value: `${managerRatingStats.avgRating.toFixed(2)}점`,
      subValue: `리뷰 수: ${formatNumber(managerRatingStats.reviewCount)}건`,
      icon: <Icons.Star />,
      iconBg: 'bg-yellow-100',
    });
  }

  // 매칭 현황 카드
  if (matchingStats) {
    const successRate =
      matchingStats.totalCount > 0
        ? (matchingStats.successCount / matchingStats.totalCount) * 100
        : 0;
    cards.push({
      title: '매칭 성공률',
      value: formatPercent(successRate),
      subValue: `총 시도: ${formatNumber(matchingStats.totalCount)}건`,
      icon: <Icons.Lightning />,
      iconBg: 'bg-orange-100',
    });
  }

  // 정산 현황 카드
  if (settlementStats) {
    const completionRate =
      settlementStats.requestedCount > 0
        ? (settlementStats.paidCount / settlementStats.requestedCount) * 100
        : 0;
    cards.push({
      title: '정산 완료율',
      value: formatPercent(completionRate),
      subValue: `완료: ${formatNumber(settlementStats.paidCount)}건`,
      icon: <Icons.Wallet />,
      iconBg: 'bg-teal-100',
    });
  }

  return cards;
};
