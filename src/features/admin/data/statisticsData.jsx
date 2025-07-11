import React from 'react';
import { formatNumber, formatCurrency } from '../utils/statisticsUtils.js';

/**
 * 전체 통계 카드 데이터
 */
export const getAllStatsCards = (allStatsData) => {
  const {
    userStats,
    settlementStats,
    paymentStats,
    reservationStats,
    managerRatingStats,
    matchingStats,
  } = allStatsData;

  return [
    // 회원 현황
    {
      title: '총 회원 수',
      value: formatNumber(userStats?.totalUsers || 0),
      subValue: `신규: ${formatNumber(userStats?.signupCount || 0)}명\n탈퇴: ${formatNumber(userStats?.withdrawCount || 0)}명`,
      icon: (
        <svg
          className="w-4 h-4 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-blue-100',
    },
    // 정산 현황
    {
      title: '정산 현황',
      value: formatNumber(settlementStats?.paidCount || 0),
      subValue: `요청: ${formatNumber(settlementStats?.requestedCount || 0)}건\n완료: ${formatNumber(settlementStats?.paidCount || 0)}건`,
      icon: (
        <svg
          className="w-4 h-4 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
      iconBg: 'bg-green-100',
    },
    // 결제 현황
    {
      title: '총 결제 금액',
      value: formatCurrency(paymentStats?.totalAmount || 0),
      subValue: `완료: ${formatNumber(paymentStats?.completedCount || 0)}건\n취소: ${formatNumber(paymentStats?.cancelledCount || 0)}건`,
      icon: (
        <svg
          className="w-4 h-4 text-purple-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
      iconBg: 'bg-purple-100',
    },
    // 예약 현황
    {
      title: '예약 현황',
      value: formatNumber(reservationStats?.totalCount || 0),
      subValue: `완료: ${formatNumber(reservationStats?.completedCount || 0)}건\n취소: ${formatNumber(reservationStats?.cancelledCount || 0)}건`,
      icon: (
        <svg
          className="w-4 h-4 text-orange-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
        </svg>
      ),
      iconBg: 'bg-orange-100',
    },
    // 매니저 평점
    {
      title: '매니저 평점',
      value: `${(managerRatingStats?.averageRating || 0).toFixed(1)}★`,
      subValue: `리뷰: ${formatNumber(managerRatingStats?.reviewCount || 0)}개`,
      icon: (
        <svg
          className="w-4 h-4 text-yellow-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      iconBg: 'bg-yellow-100',
    },
    // 매칭 현황
    {
      title: '매칭 현황',
      value: formatNumber(matchingStats?.totalCount || 0),
      subValue: `성공: ${formatNumber(matchingStats?.successCount || 0)}건\n실패: ${formatNumber(matchingStats?.failureCount || 0)}건`,
      icon: (
        <svg
          className="w-4 h-4 text-indigo-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      ),
      iconBg: 'bg-indigo-100',
    },
  ];
};

/**
 * 회원 현황 카드 데이터
 */
export const getUserStatsCards = (userStats) => {
  if (!userStats) return [];

  return [
    {
      title: '총 회원 수',
      value: formatNumber(userStats.totalUsers || 0),
      subValue: '누적 가입 회원',
      icon: (
        <svg
          className="w-4 h-4 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-blue-100',
    },
    {
      title: '신규 가입',
      value: formatNumber(userStats.signupCount || 0),
      subValue: '당일 신규 가입',
      icon: (
        <svg
          className="w-4 h-4 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
        </svg>
      ),
      iconBg: 'bg-green-100',
    },
    {
      title: '탈퇴 회원',
      value: formatNumber(userStats.withdrawCount || 0),
      subValue: '당일 탈퇴',
      icon: (
        <svg
          className="w-4 h-4 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12zM13 8a1 1 0 10-2 0v6a1 1 0 102 0V8z" />
        </svg>
      ),
      iconBg: 'bg-red-100',
    },
  ];
};

/**
 * 정산 현황 카드 데이터
 */
export const getSettlementStatsCards = (settlementStats) => {
  if (!settlementStats) return [];

  return [
    {
      title: '정산 요청',
      value: formatNumber(settlementStats.requestedCount || 0),
      subValue: '정산 요청 건수',
      icon: (
        <svg
          className="w-4 h-4 text-orange-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
      iconBg: 'bg-orange-100',
    },
    {
      title: '정산 완료',
      value: formatNumber(settlementStats.paidCount || 0),
      subValue: '정산 완료 건수',
      icon: (
        <svg
          className="w-4 h-4 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-green-100',
    },
    {
      title: '정산 금액',
      value: formatCurrency(settlementStats.totalAmount || 0),
      subValue: '총 정산 금액',
      icon: (
        <svg
          className="w-4 h-4 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
      iconBg: 'bg-blue-100',
    },
  ];
};

/**
 * 결제 현황 카드 데이터
 */
export const getPaymentStatsCards = (paymentStats) => {
  if (!paymentStats) return [];

  return [
    {
      title: '총 결제 금액',
      value: formatCurrency(paymentStats.totalAmount || 0),
      subValue: '누적 결제 금액',
      icon: (
        <svg
          className="w-4 h-4 text-purple-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
      iconBg: 'bg-purple-100',
    },
    {
      title: '완료 건수',
      value: formatNumber(paymentStats.completedCount || 0),
      subValue: '결제 완료',
      icon: (
        <svg
          className="w-4 h-4 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-green-100',
    },
    {
      title: '취소 건수',
      value: formatNumber(paymentStats.cancelledCount || 0),
      subValue: '결제 취소',
      icon: (
        <svg
          className="w-4 h-4 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
        </svg>
      ),
      iconBg: 'bg-red-100',
    },
  ];
};

/**
 * 예약 관리 카드 데이터
 */
export const getReservationStatsCards = (reservationStats) => {
  if (!reservationStats) return [];

  return [
    {
      title: '총 예약',
      value: formatNumber(reservationStats.totalCount || 0),
      subValue: '누적 예약 건수',
      icon: (
        <svg
          className="w-4 h-4 text-orange-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
        </svg>
      ),
      iconBg: 'bg-orange-100',
    },
    {
      title: '완료 예약',
      value: formatNumber(reservationStats.completedCount || 0),
      subValue: '서비스 완료',
      icon: (
        <svg
          className="w-4 h-4 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-green-100',
    },
    {
      title: '취소 예약',
      value: formatNumber(reservationStats.cancelledCount || 0),
      subValue: '예약 취소',
      icon: (
        <svg
          className="w-4 h-4 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
        </svg>
      ),
      iconBg: 'bg-red-100',
    },
  ];
};

/**
 * 매니저 평점 카드 데이터
 */
export const getManagerRatingStatsCards = (managerRatingStats) => {
  if (!managerRatingStats) return [];

  return [
    {
      title: '평균 평점',
      value: `${(managerRatingStats.averageRating || 0).toFixed(1)}★`,
      subValue: `총 ${formatNumber(managerRatingStats.reviewCount || 0)}개 리뷰`,
      icon: (
        <svg
          className="w-4 h-4 text-yellow-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      iconBg: 'bg-yellow-100',
    },
    {
      title: '5점 리뷰',
      value: formatNumber(managerRatingStats.fiveStarCount || 0),
      subValue: '최고 평점',
      icon: (
        <svg
          className="w-4 h-4 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-green-100',
    },
    {
      title: '1점 리뷰',
      value: formatNumber(managerRatingStats.oneStarCount || 0),
      subValue: '낮은 평점',
      icon: (
        <svg
          className="w-4 h-4 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
        </svg>
      ),
      iconBg: 'bg-red-100',
    },
  ];
};

/**
 * 매칭 현황 카드 데이터
 */
export const getMatchingStatsCards = (matchingStats) => {
  if (!matchingStats) return [];

  return [
    {
      title: '총 매칭',
      value: formatNumber(matchingStats.totalCount || 0),
      subValue: '매칭 시도 건수',
      icon: (
        <svg
          className="w-4 h-4 text-indigo-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      ),
      iconBg: 'bg-indigo-100',
    },
    {
      title: '성공 매칭',
      value: formatNumber(matchingStats.successCount || 0),
      subValue: '매칭 성공',
      icon: (
        <svg
          className="w-4 h-4 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-green-100',
    },
    {
      title: '실패 매칭',
      value: formatNumber(matchingStats.failureCount || 0),
      subValue: '매칭 실패',
      icon: (
        <svg
          className="w-4 h-4 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
        </svg>
      ),
      iconBg: 'bg-red-100',
    },
  ];
};
