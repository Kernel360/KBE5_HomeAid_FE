import React from 'react';
import { useLocation } from 'react-router-dom';

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/admin/dashboard':
        return '대시보드';
      case '/admin/customers':
        return '수요자 조회';
      case '/admin/managers':
        return '매니저 조회';
      case '/admin/matches':
        return '매칭 관리';
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
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white border-b border-gray-200 z-50 shadow-sm">
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
          <h1 className="text-lg font-semibold text-gray-900">
            {getPageTitle()}
          </h1>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-md mx-2 lg:mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="검색어를 입력하세요..."
              className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right side - User Profile */}
        <div className="flex items-center space-x-2 px-2 lg:px-3 xl:px-4">
          {/* User Profile */}
          <div className="flex items-center space-x-2 lg:space-x-3 pl-2 lg:pl-3 border-l border-gray-200">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-medium text-gray-900">관리자</p>
              <p className="text-xs text-gray-500">admin@homeaid.com</p>
            </div>
            <div className="relative">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow">
                <span className="text-xs lg:text-sm font-medium text-white">
                  관
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-2 h-2 lg:w-3 lg:h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
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
