// src/features/home/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="text-blue-600">ant</span>work
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="text-gray-600 hover:text-gray-900"
              >
                프로필
              </button>
              <button
                onClick={() => navigate('/auth/signin')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 예약 관리 카드 */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4">예약 관리</h2>
            <p className="text-gray-600 mb-4">현재 예약 현황을 확인하고 관리하세요.</p>
            <button
              onClick={() => navigate('/reservation')}
              className="text-blue-600 hover:text-blue-800"
            >
              자세히 보기 →
            </button>
          </div>

          {/* 일정 관리 카드 */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4">일정 관리</h2>
            <p className="text-gray-600 mb-4">업무 일정을 확인하고 관리하세요.</p>
            <button
              onClick={() => navigate('/schedule')}
              className="text-blue-600 hover:text-blue-800"
            >
              자세히 보기 →
            </button>
          </div>

          {/* 결제 관리 카드 */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4">결제 관리</h2>
            <p className="text-gray-600 mb-4">결제 내역을 확인하고 관리하세요.</p>
            <button
              onClick={() => navigate('/payment')}
              className="text-blue-600 hover:text-blue-800"
            >
              자세히 보기 →
            </button>
          </div>

          {/* 리뷰 관리 카드 */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4">리뷰 관리</h2>
            <p className="text-gray-600 mb-4">고객 리뷰를 확인하고 관리하세요.</p>
            <button
              onClick={() => navigate('/review')}
              className="text-blue-600 hover:text-blue-800"
            >
              자세히 보기 →
            </button>
          </div>

          {/* 정산 관리 카드 */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4">정산 관리</h2>
            <p className="text-gray-600 mb-4">정산 내역을 확인하고 관리하세요.</p>
            <button
              onClick={() => navigate('/settlement')}
              className="text-blue-600 hover:text-blue-800"
            >
              자세히 보기 →
            </button>
          </div>

          {/* 통계 카드 */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-4">통계</h2>
            <p className="text-gray-600 mb-4">업무 통계를 확인하세요.</p>
            <button
              onClick={() => navigate('/statistics')}
              className="text-blue-600 hover:text-blue-800"
            >
              자세히 보기 →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;