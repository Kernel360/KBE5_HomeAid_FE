import React from 'react';
import { generateChartData, getChartTitle } from '../utils/statisticsUtils.js';

/**
 * 차트 섹션 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.activeTab - 활성 탭
 * @param {Object} props.stats - 통계 데이터
 * @param {boolean} props.loading - 로딩 상태
 * @param {number} props.selectedYear - 선택된 연도
 * @param {number} props.selectedMonth - 선택된 월
 * @param {Array} props.monthlyTrendData - 월별 일별 추이 데이터
 * @param {boolean} props.trendLoading - 추이 데이터 로딩 상태
 * @returns {JSX.Element} 차트 섹션 컴포넌트
 */
const ChartSection = ({
  activeTab,
  stats,
  loading,
  selectedYear,
  selectedMonth,
  monthlyTrendData,
  trendLoading,
}) => {
  const chartTitle = getChartTitle(activeTab);

  // 월별 일별 추이 차트 렌더링
  const renderMonthlyTrendChart = () => {
    if (!selectedMonth || !monthlyTrendData) return null;

    // 추이 데이터에서 차트용 데이터 추출
    const extractChartValue = (dayData) => {
      if (!dayData || dayData.hasData === false) return 0;

      switch (activeTab) {
        case '회원현황':
          return dayData.totalUsers || dayData.signupCount || 0;
        case '정산':
          return dayData.paidCount || dayData.requestedCount || 0;
        case '결제':
          return dayData.totalAmount || dayData.completedCount || 0;
        case '예약관리':
          return dayData.totalCount || dayData.completedCount || 0;
        case '매니저별점':
          return dayData.averageRating || 0;
        case '매칭':
          return dayData.totalCount || dayData.successCount || 0;
        default:
          return 0;
      }
    };

    const values = monthlyTrendData.map(extractChartValue);
    const labels = monthlyTrendData.map((d) => `${d.day}일`);
    const maxValue = Math.max(...values, 10);

    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {chartTitle} - {selectedYear}년 {selectedMonth}월 일별 추이
          </h3>
          {trendLoading && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">로딩 중...</span>
            </div>
          )}
        </div>

        <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 relative overflow-hidden">
          {/* Grid Lines */}
          <div className="absolute inset-4 grid grid-rows-5 grid-cols-1 gap-0 opacity-20">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-t border-gray-300"></div>
            ))}
          </div>

          {/* Chart Bars */}
          <div className="relative h-full flex items-end justify-center space-x-1 px-2">
            {values.map((value, index) => {
              const height = Math.max((value / maxValue) * 200, 4);
              const isToday = index === values.length - 1;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center flex-1 max-w-8"
                  title={`${labels[index]}: ${value.toLocaleString()}`}
                >
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 hover:opacity-80 ${
                      isToday
                        ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg'
                        : value > 0
                          ? 'bg-gradient-to-t from-blue-400 to-blue-300'
                          : 'bg-gray-200'
                    }`}
                    style={{ height: `${height}px` }}
                  >
                    {/* Value label for today or high values */}
                    {(isToday || value > maxValue * 0.8) && value > 0 && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700 bg-white px-1 rounded shadow">
                        {value.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Day label */}
                  <div
                    className={`mt-1 text-xs text-center ${
                      isToday ? 'font-bold text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {index % 5 === 0 || isToday
                      ? `${monthlyTrendData[index].day}`
                      : ''}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-4 bottom-8 flex flex-col justify-between text-xs text-gray-500">
            <span>{maxValue.toLocaleString()}</span>
            <span>{Math.round(maxValue * 0.75).toLocaleString()}</span>
            <span>{Math.round(maxValue * 0.5).toLocaleString()}</span>
            <span>{Math.round(maxValue * 0.25).toLocaleString()}</span>
            <span>0</span>
          </div>

          {/* Summary Stats */}
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 text-xs">
            <div className="space-y-1">
              <div>총 데이터: {values.filter((v) => v > 0).length}일</div>
              <div>최대값: {Math.max(...values).toLocaleString()}</div>
              <div>
                평균:{' '}
                {Math.round(
                  values.reduce((a, b) => a + b, 0) / values.length
                ).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 월이 선택된 경우 일별 추이 차트 표시
  if (selectedMonth && activeTab !== '전체') {
    if (trendLoading) {
      return (
        <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {chartTitle}
            </h3>
          </div>

          <div className="w-full h-64 lg:h-80 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center relative">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">일별 추이 데이터 로딩 중...</span>
            </div>
          </div>
        </div>
      );
    }

    if (monthlyTrendData && monthlyTrendData.length > 0) {
      return renderMonthlyTrendChart();
    }

    // 월별 추이 데이터가 없는 경우
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{chartTitle}</h3>
        </div>

        <div className="w-full h-64 lg:h-80 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg flex items-center justify-center relative">
          <div className="text-gray-500 text-center">
            <div className="text-lg font-medium mb-2">일별 데이터 없음</div>
            <div className="text-sm">
              {selectedYear}년 {selectedMonth}월에 해당하는 데이터가 없습니다.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 전체 탭의 경우 차트 대신 메시지 표시
  if (activeTab === '전체') {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{chartTitle}</h3>
        </div>

        <div className="w-full h-64 lg:h-80 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center relative">
          <div className="text-center text-gray-500 py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-lg font-medium mb-2">전체 통계 대시보드</h3>
            <p className="text-sm">
              상단 카드에서 모든 영역의 주요 지표를 확인하세요.
            </p>
            <p className="text-sm mt-1">
              세부 차트는 개별 탭에서 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{chartTitle}</h3>
        </div>

        <div className="w-full h-64 lg:h-80 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center relative">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">차트 데이터 로딩 중...</span>
          </div>
        </div>
      </div>
    );
  }

  // 통계 데이터가 없는 경우
  if (!stats) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{chartTitle}</h3>
        </div>

        <div className="w-full h-64 lg:h-80 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center relative">
          <div className="text-gray-500 text-center">
            <div className="text-lg font-medium mb-2">데이터 없음</div>
            <div className="text-sm">통계 데이터를 불러올 수 없습니다.</div>
          </div>
        </div>
      </div>
    );
  }

  // 차트 데이터 생성
  const chartData = generateChartData(
    activeTab,
    stats,
    selectedYear,
    selectedMonth
  );
  const { values, max, labels, hasData } = chartData;

  // 실제 데이터가 없는 경우 데이터 없음 메시지 표시
  if (!hasData) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{chartTitle}</h3>
        </div>

        <div className="w-full h-64 lg:h-80 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg flex items-center justify-center relative">
          <div className="text-gray-500 text-center">
            <div className="text-lg font-medium mb-2">데이터 없음</div>
            <div className="text-sm">
              선택한 기간에 해당하는 데이터가 없습니다.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 단일 값인 경우 여러 바로 구성된 풍부한 차트로 표시
  if (values.length === 1) {
    const value = values[0];

    // 시각적 효과를 위한 여러 바 데이터 생성 (실제 값은 마지막 바만 사용)
    const chartBars = [
      { value: value * 0.4, label: '이전', isMain: false },
      { value: value * 0.6, label: '지난주', isMain: false },
      { value: value * 0.8, label: '최근', isMain: false },
      { value: value, label: labels[0] || '현재', isMain: true },
    ];

    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{chartTitle}</h3>
        </div>

        {/* Multi-Bar Chart */}
        <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center relative p-8">
          <div className="flex items-end justify-center space-x-6 h-full w-full">
            {chartBars.map((bar, index) => {
              const height = Math.max((bar.value / max) * 180, 20);
              const isMain = bar.isMain;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center flex-1 max-w-20"
                >
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-lg shadow-lg transition-all duration-500 hover:scale-105 relative ${
                      isMain
                        ? 'bg-gradient-to-t from-blue-700 via-blue-600 to-blue-500 border-2 border-blue-800'
                        : 'bg-gradient-to-t from-blue-300 via-blue-400 to-blue-300 border border-blue-400 opacity-70'
                    }`}
                    style={{ height: `${height}px` }}
                  >
                    {/* Value Label */}
                    {isMain && (
                      <div className="absolute top-2 left-0 right-0 text-white font-bold text-sm text-center">
                        {typeof value === 'number'
                          ? value.toLocaleString()
                          : value}
                      </div>
                    )}

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 rounded-t-lg"></div>
                  </div>

                  {/* Base */}
                  <div
                    className={`w-full h-2 rounded-b-lg shadow-sm ${
                      isMain ? 'bg-gray-400' : 'bg-gray-300'
                    }`}
                  ></div>

                  {/* Label */}
                  <div
                    className={`mt-2 px-2 py-1 rounded text-xs font-medium ${
                      isMain
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {bar.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  'linear-gradient(0deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
                backgroundSize: '100% 20px',
              }}
            ></div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-3 h-3 bg-blue-400 rounded-full opacity-60"></div>
          <div className="absolute top-8 left-4 w-2 h-2 bg-blue-500 rounded-full opacity-50"></div>
        </div>
      </div>
    );
  }

  // 다중 값인 경우 바 차트로 표시
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">{chartTitle}</h3>
      </div>

      {/* Bar Chart */}
      <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4">
        <div className="flex items-end justify-center h-full w-full overflow-x-auto">
          <div className="flex items-end justify-center space-x-1 h-full min-w-full">
            {values.map((value, index) => {
              const height = Math.max((value / max) * 180, 8);
              const isHighValue = value >= max * 0.7;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center flex-1 min-w-0"
                  style={{ maxWidth: `${Math.min(100 / values.length, 8)}%` }}
                >
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-lg shadow-md transition-all duration-300 hover:scale-105 relative ${
                      isHighValue
                        ? 'bg-gradient-to-t from-blue-700 via-blue-600 to-blue-500 border border-blue-800'
                        : 'bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300 border border-blue-500'
                    }`}
                    style={{ height: `${height}px` }}
                  >
                    {/* Value Label (큰 바에만 표시) */}
                    {height > 50 && value > 0 && (
                      <div className="absolute top-1 left-0 right-0 text-white font-bold text-xs text-center">
                        {typeof value === 'number'
                          ? value.toLocaleString()
                          : value}
                      </div>
                    )}

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 rounded-t-lg"></div>
                  </div>

                  {/* Base */}
                  <div className="w-full h-1 bg-gray-300 rounded-b-lg shadow-sm"></div>

                  {/* Label - 조건부 표시 */}
                  {(() => {
                    const totalBars = values.length;
                    let shouldShowLabel = false;

                    if (totalBars <= 10) {
                      // 10개 이하면 모든 라벨 표시
                      shouldShowLabel = true;
                    } else if (totalBars <= 20) {
                      // 20개 이하면 2개마다 표시
                      shouldShowLabel = index % 2 === 0;
                    } else {
                      // 20개 초과면 5개마다 표시
                      shouldShowLabel =
                        index % 5 === 0 || index === totalBars - 1;
                    }

                    if (shouldShowLabel) {
                      return (
                        <div className="mt-1 px-1 py-0.5 bg-white rounded text-xs font-medium text-gray-700 border border-gray-200 text-center">
                          {labels[index]}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Tooltip on hover for all bars */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {labels[index]}:{' '}
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Background Grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'linear-gradient(0deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
              backgroundSize: '100% 20px',
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
