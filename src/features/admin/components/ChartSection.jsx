import React from 'react';
import {
  generateChartData,
  generateChartPath,
  getChartTitle,
} from '../utils/statisticsUtils.js';

/**
 * 차트 섹션 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.activeTab - 활성 탭
 * @param {Object} props.stats - 통계 데이터
 * @param {boolean} props.loading - 로딩 상태
 * @returns {JSX.Element} 차트 섹션 컴포넌트
 */
const ChartSection = ({ activeTab, stats, loading }) => {
  const chartTitle = getChartTitle(activeTab);

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
  const chartData = generateChartData(activeTab, stats);
  const { values, max, labels } = chartData;
  const chartPath = generateChartPath(values, max);
  const fillPath = chartPath + ' L750,200 L50,200 Z';

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">{chartTitle}</h3>
      </div>

      {/* Chart */}
      <div className="w-full h-64 lg:h-80 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center relative">
        <svg viewBox="0 0 800 200" className="w-full h-full max-w-full">
          <defs>
            <linearGradient
              id="chartGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{
                  stopColor: '#3B82F6',
                  stopOpacity: 0.8,
                }}
              />
              <stop
                offset="100%"
                style={{
                  stopColor: '#3B82F6',
                  stopOpacity: 0.1,
                }}
              />
            </linearGradient>
          </defs>
          <path d={chartPath} fill="none" stroke="#3B82F6" strokeWidth="3" />
          <path d={fillPath} fill="url(#chartGradient)" />
          {values.map((value, index) => {
            const x = 50 + index * (700 / (values.length - 1));
            const y = 160 - (value / max) * 160 + 40;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3B82F6"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        <div className="absolute bottom-4 left-6 flex justify-between w-full pr-12 text-sm text-gray-600">
          {labels.slice(0, 5).map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
