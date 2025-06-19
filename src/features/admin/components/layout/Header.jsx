import React from 'react';
import { useAuthStore } from '../../../../stores/authStore';

const Header = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">관리자 대시보드</p>
          </div>
        </div>

        {/* Right side - User info */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">관리자</p>
            <p className="text-xs text-gray-500">
              {user?.email || 'admin@company.com'}
            </p>
          </div>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">관</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
