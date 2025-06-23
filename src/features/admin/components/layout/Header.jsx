import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // 매 분마다 업데이트 시간 갱신
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/admin/dashboard':
        return '대시보드';
      case '/admin/customers':
        return '수요자 조회';
      case '/admin/customer-payments':
        return '결제 관리';
      case '/admin/managers':
        return '매니저 조회';
      case '/admin/matches':
        return '매칭 관리';
      case '/admin/reviews':
        return '리뷰 관리';
      case '/admin/statistics':
        return '통계';
      case '/admin/settlements':
        return '매니저 정산';
      case '/admin/inquiries':
        return '1:1 문의';
      default:
        return '대시보드';
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-20 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="flex items-center justify-between h-full w-full">
        {/* Mobile Menu Button */}
        <div className="flex items-center lg:hidden px-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="ml-3 flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-semibold text-gray-900">HomeAid</span>
          </div>
        </div>

        {/* Desktop Left side - Page Title */}
        <div className="hidden lg:flex items-center px-3 xl:px-4">
          <h1
            className="text-2xl font-medium text-gray-700 tracking-normal"
            style={{
              fontFamily:
                '"Nunito", "Poppins", "Rounded", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: '500',
              borderRadius: '4px',
            }}
          >
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side - Real-time Update Indicator */}
        <div className="flex items-center px-2 lg:px-3 xl:px-4">
          <div className="text-sm text-gray-500">
            <span className="inline-flex items-center">
              <span className="w-2 h-2 rounded-full mr-2 bg-green-500"></span>
              실시간 업데이트: {lastUpdate.toLocaleString('ko-KR')}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
