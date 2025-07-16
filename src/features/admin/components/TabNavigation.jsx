import React from 'react';
import { CONSTANTS, isTabEnabled } from '../utils/statisticsUtils.js';

/**
 * 탭 네비게이션 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.activeTab - 활성 탭
 * @param {Function} props.onTabChange - 탭 변경 핸들러
 * @param {boolean} props.loading - 로딩 상태
 * @returns {JSX.Element} 탭 네비게이션 컴포넌트
 */
const TabNavigation = ({ activeTab, onTabChange, loading }) => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex overflow-x-auto bg-white">
        {CONSTANTS.MAIN_TABS.map((tab, idx) => {
          const tabKey = tab.split(' ')[0];
          const enabled = isTabEnabled(tabKey);
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tab}
              onClick={() => enabled && onTabChange(tabKey)}
              className={
                `px-4 sm:px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap relative bg-white ` +
                (isActive
                  ? 'text-blue-600 border-2 border-blue-500 z-10 '
                  : enabled
                    ? 'text-gray-500 hover:text-gray-700 border-2 border-transparent '
                    : 'text-gray-400 border-2 border-transparent cursor-not-allowed ') +
                (idx === 0 ? 'rounded-l-2xl ' : '') +
                (idx === CONSTANTS.MAIN_TABS.length - 1 ? 'rounded-r-2xl ' : '')
              }
              disabled={loading || !enabled}
              style={isActive ? { position: 'relative', zIndex: 10 } : {}}
            >
              {tab}
              {!enabled && (
                <span className="ml-2 text-xs text-gray-400">(준비중)</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="border-b border-gray-200 bg-white"></div>
    </div>
  );
};

export default TabNavigation;
