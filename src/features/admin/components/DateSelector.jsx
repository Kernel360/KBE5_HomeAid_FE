import React from 'react';
import { CONSTANTS } from '../utils/statisticsUtils.js';

/**
 * 날짜 선택기 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {number} props.selectedYear - 선택된 연도
 * @param {number|null} props.selectedMonth - 선택된 월
 * @param {number|null} props.selectedDay - 선택된 일
 * @param {Function} props.onYearChange - 연도 변경 핸들러
 * @param {Function} props.onMonthChange - 월 변경 핸들러
 * @param {Function} props.onDayChange - 일 변경 핸들러
 * @param {Function} props.onRefresh - 새로고침 핸들러
 * @param {boolean} props.loading - 로딩 상태
 * @returns {JSX.Element} 날짜 선택기 컴포넌트
 */
const DateSelector = ({
  selectedYear,
  selectedMonth,
  selectedDay,
  onYearChange,
  onMonthChange,
  onDayChange,
  onRefresh,
  loading,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        {/* Year Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">연도:</label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {CONSTANTS.YEARS.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </div>

        {/* Month Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">월:</label>
          <select
            value={selectedMonth || ''}
            onChange={(e) =>
              onMonthChange(e.target.value ? parseInt(e.target.value) : null)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">전체</option>
            {CONSTANTS.MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}월
              </option>
            ))}
          </select>
        </div>

        {/* Day Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">일:</label>
          <select
            value={selectedDay || ''}
            onChange={(e) =>
              onDayChange(e.target.value ? parseInt(e.target.value) : null)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || !selectedMonth}
          >
            <option value="">전체</option>
            {CONSTANTS.DAYS.map((day) => (
              <option key={day} value={day}>
                {day}일
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{loading ? '로딩 중...' : '새로고침'}</span>
        </button>
      </div>
    </div>
  );
};

export default DateSelector;
