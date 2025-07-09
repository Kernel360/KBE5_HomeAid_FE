import React, { useState, useEffect } from 'react';
import DateSelector from '../components/DateSelector.jsx';
import TabNavigation from '../components/TabNavigation.jsx';
import ChartSection from '../components/ChartSection.jsx';
import DistributionChart from '../components/DistributionChart.jsx';
import {
  fetchAllStats,
  fetchUserStats,
  fetchSettlementStats,
  fetchPaymentStats,
  fetchReservationStats,
  fetchManagerRatingStats,
  fetchMatchingStats,
} from '../services/statisticsAPI.js';
import {
  getUserStatsCards,
  getSettlementStatsCards,
  getPaymentStatsCards,
  getReservationStatsCards,
  getManagerRatingStatsCards,
  getMatchingStatsCards,
  getAllStatsCards,
} from '../data/statisticsData.jsx';

const StatCard = ({ title, value, subValue, icon, iconBg, loading }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px] flex flex-col">
    <div className="flex items-start justify-between mb-3 min-h-0">
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
        <span className="text-xs text-gray-600 truncate flex-1">{title}</span>
      </div>
      <div
        className={`w-8 h-8 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0 ml-2`}
      >
        {icon}
      </div>
    </div>
    <div className="flex-1 flex flex-col justify-center min-h-0">
      {loading ? (
        <div className="w-20 h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
      ) : (
        <div className="text-lg font-bold text-gray-900 mb-1 truncate">
          {value}
        </div>
      )}
      {subValue && (
        <div className="text-xs text-gray-500">
          {loading ? (
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            subValue.split('\n').map((line, index) => (
              <div key={index} className="truncate">
                {line}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  </div>
);

const Statistics = () => {
  const [activeMainTab, setActiveMainTab] = useState('전체');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(null);

  // 통계 데이터 상태
  const [userStats, setUserStats] = useState(null);
  const [settlementStats, setSettlementStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [reservationStats, setReservationStats] = useState(null);
  const [managerRatingStats, setManagerRatingStats] = useState(null);
  const [matchingStats, setMatchingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 통계 데이터 로드
  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 통계 로딩 시작:', {
        selectedYear,
        selectedMonth,
        selectedDay,
      });

      if (activeMainTab === '전체') {
        const allStats = await fetchAllStats(
          selectedYear,
          selectedMonth,
          selectedDay
        );
        console.log('📈 받은 전체 통계 데이터:', allStats);

        // 모든 통계 데이터를 각각의 상태에 설정
        if (allStats.userStats) setUserStats(allStats.userStats);
        if (allStats.settlementStats)
          setSettlementStats(allStats.settlementStats);
        if (allStats.paymentStats) setPaymentStats(allStats.paymentStats);
        if (allStats.reservationStats)
          setReservationStats(allStats.reservationStats);
        if (allStats.managerRatingStats)
          setManagerRatingStats(allStats.managerRatingStats);
        if (allStats.matchingStats) setMatchingStats(allStats.matchingStats);
      } else if (activeMainTab === '회원현황') {
        const stats = await fetchUserStats(
          selectedYear,
          selectedMonth,
          selectedDay
        );
        console.log('📈 받은 회원 통계 데이터:', stats);
        setUserStats(stats);
      } else if (activeMainTab === '정산') {
        const stats = await fetchSettlementStats(
          selectedYear,
          selectedMonth,
          selectedDay
        );
        console.log('📈 받은 정산 통계 데이터:', stats);
        setSettlementStats(stats);
      } else if (activeMainTab === '결제') {
        const stats = await fetchPaymentStats(
          selectedYear,
          selectedMonth,
          selectedDay
        );
        console.log('📈 받은 결제 통계 데이터:', stats);
        setPaymentStats(stats);
      } else if (activeMainTab === '예약관리') {
        const stats = await fetchReservationStats(
          selectedYear,
          selectedMonth,
          selectedDay
        );
        console.log('📈 받은 예약 통계 데이터:', stats);
        setReservationStats(stats);
      } else if (activeMainTab === '매니저별점') {
        const stats = await fetchManagerRatingStats(
          selectedYear,
          selectedMonth,
          selectedDay
        );
        console.log('📈 받은 매니저별점 통계 데이터:', stats);
        setManagerRatingStats(stats);
      } else if (activeMainTab === '매칭') {
        const stats = await fetchMatchingStats(
          selectedYear,
          selectedMonth,
          selectedDay
        );
        console.log('📈 받은 매칭 통계 데이터:', stats);
        setMatchingStats(stats);
      }
    } catch (err) {
      console.error('💥 통계 로딩 실패:', err);
      setError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 및 연도/월/일 변경 시 데이터 로드
  useEffect(() => {
    loadStats();
  }, [selectedYear, selectedMonth, selectedDay, activeMainTab]);

  // 현재 탭에 따른 통계 카드 반환
  const getCurrentStatsCards = () => {
    const allStatsData = {
      userStats,
      settlementStats,
      paymentStats,
      reservationStats,
      managerRatingStats,
      matchingStats,
    };

    switch (activeMainTab) {
      case '전체':
        return getAllStatsCards(allStatsData);
      case '회원현황':
        return getUserStatsCards(
          userStats,
          selectedYear,
          selectedMonth,
          selectedDay
        );
      case '정산':
        return getSettlementStatsCards(
          settlementStats,
          selectedYear,
          selectedMonth,
          selectedDay
        );
      case '결제':
        return getPaymentStatsCards(
          paymentStats,
          selectedYear,
          selectedMonth,
          selectedDay
        );
      case '예약관리':
        return getReservationStatsCards(
          reservationStats,
          selectedYear,
          selectedMonth,
          selectedDay
        );
      case '매니저별점':
        return getManagerRatingStatsCards(
          managerRatingStats,
          selectedYear,
          selectedMonth,
          selectedDay
        );
      case '매칭':
        return getMatchingStatsCards(
          matchingStats,
          selectedYear,
          selectedMonth,
          selectedDay
        );
      default:
        return [];
    }
  };

  // 현재 탭에 따른 통계 데이터 반환
  const getCurrentStats = () => {
    switch (activeMainTab) {
      case '회원현황':
        return userStats;
      case '정산':
        return settlementStats;
      case '결제':
        return paymentStats;
      case '예약관리':
        return reservationStats;
      case '매니저별점':
        return managerRatingStats;
      case '매칭':
        return matchingStats;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white">
        <div className="max-w-none space-y-6">
          {/* Header with Controls */}
          <DateSelector
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedDay={selectedDay}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
            onDayChange={setSelectedDay}
            onRefresh={loadStats}
            loading={loading}
          />

          {/* Error Message */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    오류 발생
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button
                    onClick={loadStats}
                    className="mt-2 text-sm text-red-800 underline hover:no-underline"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Tabs */}
          <TabNavigation
            activeTab={activeMainTab}
            onTabChange={setActiveMainTab}
            loading={loading}
          />

          <div className="w-full p-6">
            {/* Stats Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
              {getCurrentStatsCards().map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  subValue={stat.subValue}
                  icon={stat.icon}
                  iconBg={stat.iconBg}
                  loading={loading}
                />
              ))}
            </div>

            {/* Chart Section */}
            <ChartSection
              activeTab={activeMainTab}
              stats={getCurrentStats()}
              loading={loading}
            />

            {/* Distribution Chart */}
            <DistributionChart
              activeTab={activeMainTab}
              stats={getCurrentStats()}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
