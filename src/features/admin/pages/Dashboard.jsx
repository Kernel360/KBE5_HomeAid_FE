import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore.js';

const StatCard = ({
  title,
  value,
  subValue,
  icon,
  change,
  changeType = 'increase',
  loading = false,
}) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px] flex flex-col">
    <div className="flex items-start justify-between mb-3 min-h-0">
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}
        ></div>
        <span className="text-xs text-gray-600 truncate flex-1">{title}</span>
      </div>
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ml-2 ${loading ? 'bg-gray-100 animate-pulse' : 'bg-green-100'}`}
      >
        {loading ? (
          <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
        ) : (
          icon
        )}
      </div>
    </div>
    <div className="flex-1 flex flex-col justify-center min-h-0">
      <div
        className={`text-lg font-bold mb-1 truncate ${loading ? 'bg-gray-200 animate-pulse rounded h-6' : 'text-gray-900'}`}
      >
        {loading ? '' : value}
      </div>
      {subValue && (
        <div
          className={`text-xs mb-1 ${loading ? 'space-y-1' : 'text-gray-500'}`}
        >
          {loading ? (
            <>
              <div className="bg-gray-200 animate-pulse rounded h-3 w-3/4"></div>
              <div className="bg-gray-200 animate-pulse rounded h-3 w-1/2"></div>
            </>
          ) : (
            subValue.split('\n').map((line, index) => (
              <div key={index} className="truncate">
                {line}
              </div>
            ))
          )}
        </div>
      )}
      {change && (
        <div
          className={`text-xs truncate ${
            loading
              ? 'bg-gray-200 animate-pulse rounded h-3 w-2/3'
              : changeType === 'increase'
                ? 'text-green-600'
                : 'text-red-600'
          }`}
        >
          {loading ? (
            ''
          ) : (
            <span className="inline-flex items-center">
              {changeType === 'increase' ? '↗' : '↘'}
              <span className="truncate ml-1">{change}</span>
            </span>
          )}
        </div>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeManagers: 0,
    totalPayments: 0,
    todayReservations: 0,
    pendingApprovals: 0,
    managerStatusDetails: {
      pending: 0,
      review: 0,
      active: 0,
      rejected: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();

  // 사용자 권한 확인 함수 (관리자인지만 확인)
  const getUserRole = () => {
    // 먼저 Zustand store에서 확인
    if (authUser && authUser.role) {
      return authUser.role;
    }

    // Zustand에 없으면 localStorage에서 확인
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        return userData.role;
      } catch {
        return null;
      }
    }

    return null;
  };

  // API 호출 함수
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/auth/login', { replace: true });
        return;
      }

      const role = getUserRole();

      if (!role) {
        navigate('/auth/login', { replace: true });
        return;
      }

      if (role !== 'ROLE_ADMIN') {
        navigate('/403', { replace: true });
        return;
      }

      const response = await fetch('/api/v1/admin/dashboard-stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/auth/login', { replace: true });
          return;
        } else if (response.status === 403) {
          navigate('/403', { replace: true });
          return;
        }
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        setDashboardStats(data.data);
      }
    } catch {
      // 오류 발생 시 아무것도 하지 않음
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchDashboardStats();

    // 30초마다 데이터 새로고침 (실시간 업데이트)
    const interval = setInterval(fetchDashboardStats, 30000);

    return () => clearInterval(interval);
  }, []);

  // 관리자용 통계 카드 설정
  const adminStats = [
    {
      title: '전체 사용자',
      value: loading ? '...' : `${dashboardStats.totalUsers.toLocaleString()}`,
      subValue: '',
      change: '+12.3% 이번 달',
      icon: (
        <svg
          className="w-5 h-5 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    {
      title: '활성 매니저',
      value: loading
        ? '...'
        : `${dashboardStats.activeManagers.toLocaleString()}`,
      subValue: loading ? '로딩 중...' : `승인된 매니저`,
      change: '+15.2% 지난달 대비',
      icon: (
        <svg
          className="w-5 h-5 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: '승인 대기 매니저',
      value: loading ? '...' : `${dashboardStats.pendingApprovals}`,
      subValue: loading ? '로딩 중...' : '대기 + 검토 중',
      icon: (
        <svg
          className="w-5 h-5 text-yellow-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      title: '오늘 예약',
      value: loading ? '...' : `${dashboardStats.todayReservations}`,
      subValue: loading ? '로딩 중...' : '실시간 업데이트',
      change: '+18.5% 어제 대비',
      icon: (
        <svg
          className="w-5 h-5 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      title: '전체 결제 건수',
      value: loading
        ? '...'
        : `${dashboardStats.totalPayments.toLocaleString()}`,
      subValue: loading ? '로딩 중...' : '누적 결제 건수',
      change: '+25.7% 이번 달',
      icon: (
        <svg
          className="w-5 h-5 text-purple-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
    },
    {
      title: '플랫폼 성장률',
      value: loading ? '...' : '94.2%',
      subValue: loading ? '로딩 중...' : '이번 달 성장률',
      change: '+8.3% 지난달 대비',
      icon: (
        <svg
          className="w-5 h-5 text-indigo-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-none space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 w-full">
            <div>
              <button
                onClick={fetchDashboardStats}
                disabled={loading}
                className="px-4 py-2 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {loading ? '새로고침 중...' : '새로고침'}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {adminStats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                subValue={stat.subValue}
                icon={stat.icon}
                change={stat.change}
                loading={loading}
              />
            ))}
          </div>

          {/* Chart Section */}
          <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                매출 추이 (최근 7일)
              </h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-lg">
                  7일
                </button>
                <button className="px-3 py-1 text-sm text-white bg-blue-600 rounded-lg">
                  30일
                </button>
              </div>
            </div>

            {/* Placeholder for chart */}
            <div className="w-full h-64 lg:h-80 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center relative chart-container">
              <svg viewBox="0 0 800 200" className="w-full h-full max-w-full">
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: '#3B82F6', stopOpacity: 0.8 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: '#3B82F6', stopOpacity: 0.1 }}
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M50,150 L150,120 L250,100 L350,80 L450,70 L550,60 L650,50 L750,40"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                />
                <path
                  d="M50,150 L150,120 L250,100 L350,80 L450,70 L550,60 L650,50 L750,40 L750,200 L50,200 Z"
                  fill="url(#gradient)"
                />
                {/* Data points */}
                {[50, 150, 250, 350, 450, 550, 650, 750].map((x, i) => {
                  const y = 150 - i * 15;
                  return (
                    <circle
                      key={i}
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
              <div className="absolute bottom-4 left-6 flex space-x-6 text-sm text-gray-600">
                <span>1/9</span>
                <span>1/10</span>
                <span>1/11</span>
                <span>1/12</span>
                <span>1/13</span>
                <span>1/14</span>
                <span>1/15</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
