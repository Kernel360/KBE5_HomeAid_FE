import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore.js';

const API_URL = import.meta.env.VITE_API_URL || '';

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
    todayReservations: 0,
    pendingApprovals: 0,
    managerStatusDetails: {
      pending: 0,
      review: 0,
      active: 0,
      rejected: 0,
    },
    // 백엔드 DTO에 맞춘 필드명
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    totalPayments: 0,
    netRevenue: 0,
    totalRefundAmount: 0,
    refundRate: 0,
    platformProfit: 0,
    managerSettlementAmount: 0,
    profitRate: 0,
    // 차트 데이터
    dailyStats: [],
    // 기존 필드들 (호환성)
    totalPaymentAmount: 0,
    totalSettlementAmount: 0,
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

      const response = await fetch(`${API_URL}/api/v1/admin/dashboard-stats`, {
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
    //const interval = setInterval(fetchDashboardStats, 30000);

    //return () => clearInterval(interval);
  }, []);

  // 매출 중심 통계 카드 설정
  const revenueStats = [
    // 실시간 매출 현황
    {
      title: '오늘 매출',
      value: loading
        ? '...'
        : `₩${dashboardStats.todayRevenue.toLocaleString()}`,
      subValue: loading ? '로딩 중...' : '실시간 업데이트',
      change: '+18.5% 어제 대비',
      icon: (
        <svg
          className="w-5 h-5 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      title: '이번 주 매출',
      value: loading
        ? '...'
        : `₩${dashboardStats.weeklyRevenue.toLocaleString()}`,
      subValue: loading ? '로딩 중...' : '월~일 기준',
      change: '+25.3% 지난주 대비',
      icon: (
        <svg
          className="w-5 h-5 text-emerald-600"
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
      title: '이번 달 매출',
      value: loading
        ? '...'
        : `₩${dashboardStats.monthlyRevenue.toLocaleString()}`,
      subValue: loading ? '로딩 중...' : '월 누적',
      change: '+32.1% 지난달 대비',
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
      title: '순 매출',
      value: loading ? '...' : `₩${dashboardStats.netRevenue.toLocaleString()}`,
      subValue: loading ? '로딩 중...' : '환불 제외',
      change: '+15.8% 지난달 대비',
      icon: (
        <svg
          className="w-5 h-5 text-green-600"
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
    {
      title: '전체 결제 금액',
      value: loading
        ? '...'
        : `₩${dashboardStats.totalPayments.toLocaleString()}`,
      subValue: loading ? '로딩 중...' : '누적 총액',
      change: '+22.7% 지난달 대비',
      icon: (
        <svg
          className="w-5 h-5 text-slate-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path
            fillRule="evenodd"
            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    // 환불 관련 정보
    {
      title: '총 환불 금액',
      value: loading
        ? '...'
        : `₩${dashboardStats.totalRefundAmount.toLocaleString()}`,
      subValue: loading
        ? '로딩 중...'
        : `환불률 ${dashboardStats.refundRate.toFixed(2)}%`,
      change: '-5.2% 지난달 대비',
      changeType: 'decrease',
      icon: (
        <svg
          className="w-5 h-5 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8 7a1 1 0 012 0v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H6a1 1 0 110-2h2V7z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489a.5.5 0 01-.493.611H6.99a.5.5 0 01-.493-.611L6.62 15H5a2 2 0 01-2-2V5z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      title: '환불률',
      value: loading ? '...' : `${dashboardStats.refundRate.toFixed(2)}%`,
      subValue: loading ? '로딩 중...' : '전체 결제 대비',
      change: '-2.1% 지난달 대비',
      changeType: 'decrease',
      icon: (
        <svg
          className="w-5 h-5 text-orange-600"
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
    // 수익 분석
    {
      title: '관리자 수익 (20%)',
      value: loading
        ? '...'
        : `₩${dashboardStats.platformProfit.toLocaleString()}`,
      subValue: loading ? '로딩 중...' : '플랫폼 수수료',
      change: '+28.4% 지난달 대비',
      icon: (
        <svg
          className="w-5 h-5 text-indigo-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      ),
    },
    {
      title: '매니저 정산 (80%)',
      value: loading
        ? '...'
        : `₩${dashboardStats.managerSettlementAmount.toLocaleString()}`,
      subValue: loading ? '로딩 중...' : '매니저 수익',
      change: '+30.2% 지난달 대비',
      icon: (
        <svg
          className="w-5 h-5 text-teal-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-none space-y-6">
          {/* Revenue Stats Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {revenueStats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                subValue={stat.subValue}
                icon={stat.icon}
                change={stat.change}
                changeType={stat.changeType}
                loading={loading}
              />
            ))}
          </div>

          {/* Charts Section */}
          <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* 매출 추이 차트 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  매출 추이 (최근 7일)
                </h2>
                <div className="flex items-center space-x-4 text-base">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-800 rounded-full mr-2"></div>
                    <span className="text-gray-600">총 매출</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-600 rounded-full mr-2"></div>
                    <span className="text-gray-600">순 매출</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-80 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg flex items-center justify-center relative">
                {dashboardStats.dailyStats &&
                dashboardStats.dailyStats.length > 0 ? (
                  <svg
                    viewBox="0 0 800 320"
                    className="w-full h-full max-w-full"
                  >
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#1E40AF"
                          stopOpacity="0.6"
                        />
                        <stop
                          offset="100%"
                          stopColor="#1E40AF"
                          stopOpacity="0.1"
                        />
                      </linearGradient>
                      <linearGradient
                        id="netRevenueGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#EA580C"
                          stopOpacity="0.6"
                        />
                        <stop
                          offset="100%"
                          stopColor="#EA580C"
                          stopOpacity="0.1"
                        />
                      </linearGradient>
                    </defs>

                    {(() => {
                      const maxPayment = Math.max(
                        ...dashboardStats.dailyStats.map((d) => d.paymentAmount)
                      );
                      const chartHeight = 240;
                      const chartTop = 30;

                      if (maxPayment === 0) {
                        return (
                          <text
                            x="400"
                            y="100"
                            textAnchor="middle"
                            className="text-sm fill-gray-500"
                          >
                            데이터가 없습니다
                          </text>
                        );
                      }

                      // 7개 데이터 포인트를 균등하게 배치
                      const chartWidth = 600; // 차트 영역 너비
                      const chartStartX = 100; // 시작 X 좌표
                      const dataCount = dashboardStats.dailyStats.length;
                      const spacing =
                        dataCount > 1 ? chartWidth / (dataCount - 1) : 0;

                      // 총 매출과 순 매출 경로 생성
                      const totalPath = dashboardStats.dailyStats
                        .map((data, i) => {
                          const x = chartStartX + i * spacing;
                          const y =
                            chartTop +
                            (chartHeight -
                              (data.paymentAmount / maxPayment) * chartHeight);
                          return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                        })
                        .join(' ');

                      const netPath = dashboardStats.dailyStats
                        .map((data, i) => {
                          const netAmount =
                            data.paymentAmount - data.refundAmount;
                          const x = chartStartX + i * spacing;
                          const y =
                            chartTop +
                            (chartHeight -
                              (netAmount / maxPayment) * chartHeight);
                          return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                        })
                        .join(' ');

                      // 영역 채우기용 경로
                      const lastX = chartStartX + (dataCount - 1) * spacing;
                      const areaBottom = chartTop + chartHeight;
                      const totalAreaPath =
                        totalPath +
                        ` L${lastX},${areaBottom} L${chartStartX},${areaBottom} Z`;
                      const netAreaPath =
                        netPath +
                        ` L${lastX},${areaBottom} L${chartStartX},${areaBottom} Z`;

                      return (
                        <>
                          {/* 총 매출 영역 */}
                          <path
                            d={totalAreaPath}
                            fill="url(#revenueGradient)"
                          />
                          {/* 순 매출 영역 */}
                          <path
                            d={netAreaPath}
                            fill="url(#netRevenueGradient)"
                          />

                          {/* 총 매출 라인 */}
                          <path
                            d={totalPath}
                            fill="none"
                            stroke="#1E40AF"
                            strokeWidth="3"
                          />
                          {/* 순 매출 라인 */}
                          <path
                            d={netPath}
                            fill="none"
                            stroke="#EA580C"
                            strokeWidth="3"
                          />

                          {/* 데이터 포인트 */}
                          {dashboardStats.dailyStats.map((data, i) => {
                            const x = chartStartX + i * spacing;
                            const totalY =
                              chartTop +
                              (chartHeight -
                                (data.paymentAmount / maxPayment) *
                                  chartHeight);
                            const netAmount =
                              data.paymentAmount - data.refundAmount;
                            const netY =
                              chartTop +
                              (chartHeight -
                                (netAmount / maxPayment) * chartHeight);

                            return (
                              <g key={i}>
                                <circle
                                  cx={x}
                                  cy={totalY}
                                  r="6"
                                  fill="#1E40AF"
                                  stroke="white"
                                  strokeWidth="3"
                                />
                                <circle
                                  cx={x}
                                  cy={netY}
                                  r="6"
                                  fill="#EA580C"
                                  stroke="white"
                                  strokeWidth="3"
                                />
                              </g>
                            );
                          })}

                          {/* 날짜 라벨 */}
                          {dashboardStats.dailyStats.map((data, i) => {
                            const x = chartStartX + i * spacing;
                            const date = new Date(data.date);
                            const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;

                            return (
                              <text
                                key={i}
                                x={x}
                                y="305"
                                textAnchor="middle"
                                className="text-sm fill-gray-600"
                                fontSize="16"
                              >
                                {dateLabel}
                              </text>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                ) : (
                  <div className="text-gray-500">데이터가 없습니다</div>
                )}
              </div>
            </div>

            {/* 관리자 수익 섹션 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  관리자 수익 현황
                </h2>
                <p className="text-base text-gray-600 mt-1">
                  플랫폼 수수료 및 순수익 분석
                </p>
              </div>

              <div className="space-y-6">
                {/* 수익 요약 카드들 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 총 매출 */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">
                        총 매출
                      </span>
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-lg">₩</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      ₩
                      {loading
                        ? '...'
                        : dashboardStats.totalPayments.toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      전체 결제 금액
                    </div>
                  </div>

                  {/* 플랫폼 수익 */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-700">
                        플랫폼 수익
                      </span>
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 text-lg">%</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      ₩
                      {loading
                        ? '...'
                        : dashboardStats.platformProfit.toLocaleString()}
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      수익률{' '}
                      {loading ? '...' : dashboardStats.profitRate.toFixed(1)}%
                    </div>
                  </div>

                  {/* 순수익 */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700">
                        순수익
                      </span>
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 text-lg">₩</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      ₩
                      {loading
                        ? '...'
                        : dashboardStats.netRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      환불 제외 순수익
                    </div>
                  </div>
                </div>

                {/* 수익 분배 도넛 차트 */}
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg
                      viewBox="0 0 200 200"
                      className="w-full h-full transform -rotate-90"
                    >
                      {(() => {
                        const circumference = 2 * Math.PI * 80;
                        const platformRate = loading
                          ? 20
                          : dashboardStats.profitRate;
                        const managerRate = 100 - platformRate;

                        const platformArc =
                          (platformRate / 100) * circumference;
                        const managerArc = (managerRate / 100) * circumference;

                        return (
                          <>
                            {/* 매니저 정산 */}
                            <circle
                              cx="100"
                              cy="100"
                              r="80"
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="20"
                              strokeDasharray={`${managerArc} ${circumference}`}
                              strokeDashoffset="0"
                            />
                            {/* 플랫폼 수익 */}
                            <circle
                              cx="100"
                              cy="100"
                              r="80"
                              fill="none"
                              stroke="#6366F1"
                              strokeWidth="20"
                              strokeDasharray={`${platformArc} ${circumference}`}
                              strokeDashoffset={`-${managerArc}`}
                            />
                          </>
                        );
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {loading
                            ? '...'
                            : `${dashboardStats.profitRate.toFixed(1)}%`}
                        </div>
                        <div className="text-base text-gray-600">수익률</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 수익 분배 상세 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-medium text-emerald-700">
                        매니저 정산액
                      </span>
                      <span className="text-xl font-bold text-emerald-900">
                        ₩
                        {loading
                          ? '...'
                          : dashboardStats.managerSettlementAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-emerald-600">
                      전체 매출의{' '}
                      {loading
                        ? '...'
                        : (100 - dashboardStats.profitRate).toFixed(1)}
                      %
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-medium text-indigo-700">
                        플랫폼 수익
                      </span>
                      <span className="text-xl font-bold text-indigo-900">
                        ₩
                        {loading
                          ? '...'
                          : dashboardStats.platformProfit.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-indigo-600">
                      전체 매출의{' '}
                      {loading ? '...' : dashboardStats.profitRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;