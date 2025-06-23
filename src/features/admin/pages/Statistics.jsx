import React, { useState, useEffect } from 'react';

const StatCard = ({ title, value, subValue, icon, iconBg, loading }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-h-[140px] flex flex-col">
    <div className="flex items-start justify-between mb-3 min-h-0">
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
        <span className="text-xs text-gray-600 truncate flex-1">{title}</span>
      </div>
      <div
        className={`w-8 h-8 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0 ml-2`}
      >
        {icon}
      </div>
    </div>
    <div className="flex-1 flex flex-col justify-center min-h-0">
      {loading ? (
        <div className="w-20 h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
      ) : (
        <div className="text-lg font-bold text-gray-900 mb-1 truncate">
          {value}
        </div>
      )}
      {subValue && (
        <div className="text-xs text-gray-500">
          {loading ? (
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            subValue.split('\n').map((line, index) => (
              <div key={index} className="truncate">
                {line}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  </div>
);

const Statistics = () => {
  const [activeMainTab, setActiveMainTab] = useState('회원현황');
  const [activeTimeTab, setActiveTimeTab] = useState('30일');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // 통계 데이터 상태
  const [stats, setStats] = useState({
    users: null,
    settlements: null,
    payments: null,
    paymentMethods: null,
    reservations: null,
    matching: null,
    managerRatings: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mainTabs = [
    '회원현황 통계',
    '정산 통계',
    '결제 통계',
    '매칭 통계',
    '예약 통계',
  ];
  const timeTabs = ['7일', '30일', '90일'];
  const years = [2023, 2024, 2025];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // API 호출 함수들
  const fetchUserStats = async (year, month) => {
    try {
      const token = localStorage.getItem('accessToken');
      const url = `/api/v1/admin/statistics/users?year=${year}&month=${month}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // CommonApiResponse 구조 처리
        if (data && data.data) {
          return data.data;
        } else {
          return data;
        }
      } else {
        const errorText = await response.text();
        console.error('❌ User stats error:', {
          status: response.status,
          error: errorText,
        });
      }
      return null;
    } catch (err) {
      console.error('💥 Failed to fetch user stats:', err);
      return null;
    }
  };

  const fetchSettlementStats = async (year, month) => {
    try {
      const token = localStorage.getItem('accessToken');
      const url = `/api/v1/admin/statistics/settlements?year=${year}&month=${month}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data && data.data ? data.data : data;
      } else {
        const errorText = await response.text();
        console.error('❌ Settlement stats error:', {
          status: response.status,
          error: errorText,
        });
      }
      return null;
    } catch (err) {
      console.error('💥 Failed to fetch settlement stats:', err);
      return null;
    }
  };

  const fetchPaymentStats = async (year, month) => {
    try {
      const token = localStorage.getItem('accessToken');
      const url = `/api/v1/admin/statistics/payments?year=${year}&month=${month}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data && data.data ? data.data : data;
      } else {
        const errorText = await response.text();
        console.error('❌ Payment stats error:', {
          status: response.status,
          error: errorText,
        });
      }
      return null;
    } catch (err) {
      console.error('💥 Failed to fetch payment stats:', err);
      return null;
    }
  };

  const fetchReservationStats = async (year, month) => {
    try {
      const token = localStorage.getItem('accessToken');
      const url = `/api/v1/admin/statistics/reservations?year=${year}&month=${month}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data && data.data ? data.data : data;
      } else {
        const errorText = await response.text();
        console.error('❌ Reservation stats error:', {
          status: response.status,
          error: errorText,
        });
      }
      return null;
    } catch (err) {
      console.error('💥 Failed to fetch reservation stats:', err);
      return null;
    }
  };

  const fetchMatchingStats = async (year, month) => {
    try {
      const token = localStorage.getItem('accessToken');

      const [successResponse, failResponse] = await Promise.all([
        fetch(
          `/api/v1/admin/statistics/matching/success?year=${year}&month=${month}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        ),
        fetch(
          `/api/v1/admin/statistics/matching/fail?year=${year}&month=${month}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        ),
      ]);

      const successData = successResponse.ok
        ? await successResponse.json()
        : null;
      const failData = failResponse.ok ? await failResponse.json() : null;

      return {
        success:
          successData && successData.data ? successData.data : successData,
        fail: failData && failData.data ? failData.data : failData,
      };
    } catch (err) {
      console.error('💥 Failed to fetch matching stats:', err);
      return null;
    }
  };

  // 모든 통계 데이터 로드
  const loadAllStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [users, settlements, payments, reservations, matching] =
        await Promise.all([
          fetchUserStats(selectedYear, selectedMonth),
          fetchSettlementStats(selectedYear, selectedMonth),
          fetchPaymentStats(selectedYear, selectedMonth),
          fetchReservationStats(selectedYear, selectedMonth),
          fetchMatchingStats(selectedYear, selectedMonth),
        ]);

      // 결제 수단 데이터는 월별 조회일 때만 payments 응답에 포함됨
      const paymentMethods =
        payments &&
        (payments.card !== undefined ||
          payments.transfer !== undefined ||
          payments.cash !== undefined)
          ? payments
          : null;

      const newStats = {
        users,
        settlements,
        payments,
        paymentMethods, // 월별일 때만 결제 수단 데이터 있음
        reservations,
        matching,
      };

      setStats(newStats);
    } catch (err) {
      console.error('💥 Failed to load statistics:', err);
      setError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 및 연도/월 변경 시 데이터 로드
  useEffect(() => {
    loadAllStats();
  }, [selectedYear, selectedMonth]);

  // 금액 포맷팅
  const formatCurrency = (amount) => {
    if (!amount) return '₩0';
    return `₩${amount.toLocaleString()}`;
  };

  // 숫자 포맷팅
  const formatNumber = (number) => {
    if (!number || isNaN(number) || !isFinite(number)) return '0';
    return Number(number).toLocaleString();
  };

  // 퍼센트 포맷팅
  const formatPercent = (percent) => {
    if (!percent || isNaN(percent) || !isFinite(percent)) return '0%';
    return `${Number(percent).toFixed(1)}%`;
  };

  // 차트 데이터 생성 함수
  const getChartData = () => {
    if (!stats) return { values: [], max: 100, labels: [] };

    // 안전한 숫자 변환 함수
    const safeNumber = (value, defaultValue = 0) => {
      const num = Number(value);
      return isNaN(num) || !isFinite(num) ? defaultValue : num;
    };

    switch (activeMainTab) {
      case '회원현황': {
        if (!stats.users) return { values: [], max: 100, labels: [] };
        const totalUsers = safeNumber(stats.users.totalUsers, 100);
        const signupCount = safeNumber(stats.users.signupCount, 0);
        const withdrawCount = safeNumber(stats.users.withdrawCount, 0);
        const inactiveUserCount = safeNumber(stats.users.inactiveUserCount, 0);

        const maxValue = Math.max(totalUsers, 100);

        return {
          values: [
            totalUsers * 0.7,
            totalUsers * 0.75,
            totalUsers * 0.8,
            totalUsers * 0.85,
            totalUsers * 0.9,
            totalUsers * 0.95,
            totalUsers,
            totalUsers,
          ],
          max: maxValue * 1.2,
          labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월'],
          mainValue: totalUsers,
          subValues: [signupCount, withdrawCount, inactiveUserCount],
        };
      }

      case '정산': {
        if (!stats.settlements) return { values: [], max: 100, labels: [] };
        const requestedCount = safeNumber(stats.settlements.requestedCount, 0);
        const paidCount = safeNumber(stats.settlements.paidCount, 0);

        const maxValue = Math.max(requestedCount, 10);

        return {
          values: [
            paidCount * 0.3,
            paidCount * 0.5,
            paidCount * 0.65,
            paidCount * 0.75,
            paidCount * 0.85,
            paidCount * 0.9,
            paidCount * 0.95,
            paidCount,
          ],
          max: maxValue * 1.2,
          labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월'],
          mainValue: requestedCount,
          subValues: [paidCount, requestedCount - paidCount],
        };
      }

      case '결제': {
        if (!stats.payments) return { values: [], max: 100, labels: [] };
        const totalAmount = safeNumber(stats.payments.totalAmount, 0);
        const cancelAmount = safeNumber(stats.payments.cancelAmount, 0);

        const maxValue = Math.max(totalAmount, 1000);

        return {
          values: [
            totalAmount * 0.4,
            totalAmount * 0.55,
            totalAmount * 0.7,
            totalAmount * 0.8,
            totalAmount * 0.85,
            totalAmount * 0.9,
            totalAmount * 0.95,
            totalAmount,
          ],
          max: maxValue * 1.2,
          labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월'],
          mainValue: totalAmount,
          subValues: [totalAmount - cancelAmount, cancelAmount],
        };
      }

      case '매칭': {
        if (!stats.matching?.success || !stats.matching?.fail)
          return { values: [], max: 100, labels: [] };
        const successCount = safeNumber(stats.matching.success.successCount, 0);
        const failCount = safeNumber(stats.matching.fail.failCount, 0);
        const totalMatching = successCount + failCount;

        const maxValue = Math.max(totalMatching, 10);

        return {
          values: [
            totalMatching * 0.3,
            totalMatching * 0.45,
            totalMatching * 0.6,
            totalMatching * 0.7,
            totalMatching * 0.8,
            totalMatching * 0.9,
            totalMatching * 0.95,
            totalMatching,
          ],
          max: maxValue * 1.2,
          labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월'],
          mainValue: totalMatching,
          subValues: [successCount, failCount],
        };
      }

      case '예약': {
        if (!stats.reservations) return { values: [], max: 100, labels: [] };
        const reservationCount = safeNumber(
          stats.reservations.reservationCount,
          0
        );
        const avgProcessingMinutes = safeNumber(
          stats.reservations.avgProcessingMinutes,
          0
        );

        const maxValue = Math.max(reservationCount, 10);

        return {
          values: [
            reservationCount * 0.5,
            reservationCount * 0.6,
            reservationCount * 0.7,
            reservationCount * 0.8,
            reservationCount * 0.85,
            reservationCount * 0.9,
            reservationCount * 0.95,
            reservationCount,
          ],
          max: maxValue * 1.2,
          labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월'],
          mainValue: reservationCount,
          subValues: [avgProcessingMinutes, Math.round(reservationCount / 365)],
        };
      }

      default:
        return { values: [], max: 100, labels: [] };
    }
  };

  // SVG 좌표 계산 함수
  const generateChartPath = (values, max) => {
    if (!values || !values.length || !max || max <= 0) return '';

    const width = 700; // SVG 내부 차트 영역 너비
    const height = 160; // SVG 내부 차트 영역 높이
    const padding = 50;
    const stepX = width / (values.length - 1);

    return values
      .map((value, index) => {
        // 안전한 숫자 변환
        const safeValue = isNaN(value) || !isFinite(value) ? 0 : Number(value);
        const safeMax =
          isNaN(max) || !isFinite(max) || max <= 0 ? 100 : Number(max);

        const x = padding + index * stepX;
        const y = height - (safeValue / safeMax) * height + 40; // 40은 상단 패딩

        // 좌표가 유효한 숫자인지 확인
        const safeX = isNaN(x) || !isFinite(x) ? padding : x;
        const safeY = isNaN(y) || !isFinite(y) ? height + 40 : y;

        return `${index === 0 ? 'M' : 'L'}${safeX},${safeY}`;
      })
      .join(' ');
  };

  // 탭별 통계 카드 생성
  const getStatsForTab = () => {
    switch (activeMainTab) {
      case '회원현황':
        return [
          {
            title: '총 회원 수',
            value: stats.users ? formatNumber(stats.users.totalUsers) : '0',
            subValue: stats.users
              ? `신규: ${formatNumber(stats.users.signupCount)}명\n탈퇴: ${formatNumber(stats.users.withdrawCount)}명`
              : '',
            icon: (
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            ),
            iconBg: 'bg-blue-100',
          },
          {
            title: '신규 가입자',
            value: stats.users ? formatNumber(stats.users.signupCount) : '0',
            subValue: `${selectedYear}년 ${selectedMonth}월`,
            icon: (
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            ),
            iconBg: 'bg-green-100',
          },
          {
            title: '탈퇴율',
            value: stats.users ? formatPercent(stats.users.withdrawRate) : '0%',
            subValue: stats.users
              ? `${selectedYear}년 ${selectedMonth}월\n탈퇴: ${formatNumber(stats.users.withdrawCount)}명`
              : '',
            icon: (
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ),
            iconBg: 'bg-red-100',
          },
          {
            title: '휴면 회원',
            value: stats.users
              ? formatNumber(stats.users.inactiveUserCount || 0)
              : '0',
            subValue: stats.users
              ? `${selectedYear}년 ${selectedMonth}월\n비활성 회원`
              : '',
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
            iconBg: 'bg-yellow-100',
          },
        ];

      case '정산':
        return [
          {
            title: '정산 신청 수',
            value: stats.settlements
              ? formatNumber(stats.settlements.requestedCount)
              : '0',
            subValue: `${selectedYear}년 ${selectedMonth}월`,
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
            iconBg: 'bg-blue-100',
          },
          {
            title: '정산 완료 수',
            value: stats.settlements
              ? formatNumber(stats.settlements.paidCount)
              : '0',
            subValue: `${selectedYear}년 ${selectedMonth}월`,
            icon: (
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ),
            iconBg: 'bg-green-100',
          },
          {
            title: '정산 완료율',
            value:
              stats.settlements && stats.settlements.requestedCount > 0
                ? formatPercent(
                    (stats.settlements.paidCount /
                      stats.settlements.requestedCount) *
                      100
                  )
                : '0%',
            subValue: '신청 대비 완료',
            icon: (
              <svg
                className="w-5 h-5 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ),
            iconBg: 'bg-purple-100',
          },
          {
            title: '총 예약 수',
            value: stats.reservations
              ? formatNumber(stats.reservations.reservationCount)
              : '0',
            subValue: `${selectedYear}년 ${selectedMonth}월`,
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
            iconBg: 'bg-blue-100',
          },
        ];

      case '결제': {
        const basePaymentCards = [
          {
            title: '총 결제 금액',
            value: stats.payments
              ? formatCurrency(stats.payments.totalAmount)
              : '₩0',
            subValue: `${selectedYear}년 ${selectedMonth}월`,
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
            iconBg: 'bg-blue-100',
          },
          {
            title: '취소 금액',
            value: stats.payments
              ? formatCurrency(stats.payments.cancelAmount)
              : '₩0',
            subValue: `${selectedYear}년 ${selectedMonth}월`,
            icon: (
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ),
            iconBg: 'bg-red-100',
          },
        ];

        // 결제 수단별 카드 추가 (월별 조회일 때만)
        if (stats.paymentMethods) {
          basePaymentCards.push(
            {
              title: '카드 결제',
              value: formatCurrency(stats.paymentMethods.card || 0),
              subValue: `${selectedYear}년 ${selectedMonth}월`,
              icon: (
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
              ),
              iconBg: 'bg-indigo-100',
            },
            {
              title: '계좌이체',
              value: formatCurrency(stats.paymentMethods.transfer || 0),
              subValue: `${selectedYear}년 ${selectedMonth}월`,
              icon: (
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              iconBg: 'bg-purple-100',
            },
            {
              title: '현금 결제',
              value: formatCurrency(stats.paymentMethods.cash || 0),
              subValue: `${selectedYear}년 ${selectedMonth}월`,
              icon: (
                <svg
                  className="w-5 h-5 text-green-600"
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
              iconBg: 'bg-green-100',
            }
          );
        }

        return basePaymentCards;
      }

      case '매칭':
        return [
          {
            title: '성공한 매칭',
            value: stats.matching?.success
              ? formatNumber(stats.matching.success.successCount)
              : '0',
            subValue: `${selectedYear}년 ${selectedMonth}월`,
            icon: (
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ),
            iconBg: 'bg-green-100',
          },
          {
            title: '실패한 매칭',
            value: stats.matching?.fail
              ? formatNumber(stats.matching.fail.failCount)
              : '0',
            subValue: `${selectedYear}년 ${selectedMonth}월`,
            icon: (
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            ),
            iconBg: 'bg-red-100',
          },
          {
            title: '매칭 성공률',
            value:
              stats.matching && stats.matching.success && stats.matching.fail
                ? formatPercent(
                    (stats.matching.success.successCount /
                      (stats.matching.success.successCount +
                        stats.matching.fail.failCount)) *
                      100
                  )
                : '0%',
            subValue: '전체 매칭 대비',
            icon: (
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ),
            iconBg: 'bg-blue-100',
          },
          {
            title: '총 매칭 시도',
            value:
              stats.matching && stats.matching.success && stats.matching.fail
                ? formatNumber(
                    stats.matching.success.successCount +
                      stats.matching.fail.failCount
                  )
                : '0',
            subValue: '성공+실패 합계',
            icon: (
              <svg
                className="w-5 h-5 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            iconBg: 'bg-purple-100',
          },
        ];

      case '예약':
        return [
          {
            title: '총 예약 수',
            value: stats.reservations
              ? formatNumber(stats.reservations.reservationCount)
              : '0',
            subValue: `${selectedYear}년`,
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
            iconBg: 'bg-blue-100',
          },
          {
            title: '평균 처리 시간',
            value: stats.reservations
              ? `${stats.reservations.avgProcessingMinutes.toFixed(1)}분`
              : '0분',
            subValue: '예약 처리 소요시간',
            icon: (
              <svg
                className="w-5 h-5 text-green-600"
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
            iconBg: 'bg-green-100',
          },
          {
            title: '일평균 예약',
            value: stats.reservations
              ? formatNumber(
                  Math.round(stats.reservations.reservationCount / 365)
                )
              : '0',
            subValue: '하루 평균 예약 수',
            icon: (
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z"
                  clipRule="evenodd"
                />
              </svg>
            ),
            iconBg: 'bg-yellow-100',
          },
          {
            title: '예약 효율성',
            value:
              stats.reservations && stats.reservations.avgProcessingMinutes > 0
                ? stats.reservations.avgProcessingMinutes <= 10
                  ? '우수'
                  : stats.reservations.avgProcessingMinutes <= 20
                    ? '양호'
                    : '개선필요'
                : '데이터 없음',
            subValue: '처리 시간 기준',
            icon: (
              <svg
                className="w-5 h-5 text-indigo-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            ),
            iconBg: 'bg-indigo-100',
          },
        ];

      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white">
        <div className="max-w-none space-y-6">
          {/* Header with Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Year Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  연도:
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}년
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Selector (for all tabs) */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">월:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}월
                    </option>
                  ))}
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadAllStats}
                disabled={loading}
                className="px-4 py-2 text-sm text-black bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
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

          {/* Error Message */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    오류 발생
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button
                    onClick={loadAllStats}
                    className="mt-2 text-sm text-red-800 underline hover:no-underline"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Tabs */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              className="flex overflow-x-auto bg-white"
              style={{ backgroundColor: 'white' }}
            >
              {mainTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMainTab(tab.split(' ')[0])}
                  className={`px-4 sm:px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeMainTab === tab.split(' ')[0]
                      ? 'text-blue-600 border-b-2 border-blue-500 bg-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent bg-white'
                  }`}
                  style={{ backgroundColor: 'white' }}
                  disabled={loading}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 구분선 */}
            <div className="border-b border-gray-200 bg-white"></div>

            <div className="w-full p-6">
              {/* Stats Grid */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-6">
                {getStatsForTab().map((stat, index) => (
                  <StatCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    subValue={stat.subValue}
                    icon={stat.icon}
                    iconBg={stat.iconBg}
                    loading={loading}
                  />
                ))}
              </div>

              {/* Chart Section */}
              <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeMainTab === '회원현황' && '회원 증가 추이'}
                    {activeMainTab === '정산' && '정산 처리 추이'}
                    {activeMainTab === '결제' && '결제 금액 추이'}
                    {activeMainTab === '매칭' && '매칭 성공률 추이'}
                    {activeMainTab === '예약' && '예약 건수 추이'}
                  </h3>
                  <div className="flex space-x-2">
                    {timeTabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTimeTab(tab)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          activeTimeTab === tab
                            ? 'text-black bg-blue-600'
                            : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                        }`}
                        disabled={loading}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart */}
                <div className="w-full h-64 lg:h-80 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center relative chart-container">
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">
                        차트 데이터 로딩 중...
                      </span>
                    </div>
                  ) : (
                    (() => {
                      const chartData = getChartData();
                      const { values, max, labels } = chartData;

                      if (!values.length) {
                        return (
                          <div className="text-gray-500 text-center">
                            <div className="text-lg font-medium mb-2">
                              데이터 없음
                            </div>
                            <div className="text-sm">
                              통계 데이터를 불러올 수 없습니다.
                            </div>
                          </div>
                        );
                      }

                      const chartPath = generateChartPath(values, max);
                      const fillPath = chartPath + ' L750,200 L50,200 Z';

                      return (
                        <>
                          <svg
                            viewBox="0 0 800 200"
                            className="w-full h-full max-w-full"
                          >
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

                            {/* Chart line */}
                            <path
                              d={chartPath}
                              fill="none"
                              stroke="#3B82F6"
                              strokeWidth="3"
                            />
                            <path d={fillPath} fill="url(#chartGradient)" />

                            {/* Data points */}
                            {values.map((value, index) => {
                              // 안전한 좌표 계산
                              const safeValue =
                                isNaN(value) || !isFinite(value)
                                  ? 0
                                  : Number(value);
                              const safeMax =
                                isNaN(max) || !isFinite(max) || max <= 0
                                  ? 100
                                  : Number(max);

                              const x =
                                50 + index * (700 / (values.length - 1));
                              const y = 160 - (safeValue / safeMax) * 160 + 40;

                              // 좌표가 유효한 숫자인지 확인
                              const safeX = isNaN(x) || !isFinite(x) ? 50 : x;
                              const safeY = isNaN(y) || !isFinite(y) ? 200 : y;

                              return (
                                <circle
                                  key={index}
                                  cx={safeX}
                                  cy={safeY}
                                  r="4"
                                  fill="#3B82F6"
                                  stroke="white"
                                  strokeWidth="2"
                                />
                              );
                            })}
                          </svg>

                          {/* X-axis labels */}
                          <div className="absolute bottom-4 left-6 flex justify-between w-full pr-12 text-sm text-gray-600">
                            {labels.slice(0, 5).map((label, index) => (
                              <span key={index}>{label}</span>
                            ))}
                          </div>
                        </>
                      );
                    })()
                  )}
                </div>
              </div>

              {/* Distribution Chart */}
              <div className="w-full mt-6 bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeMainTab === '회원현황' && '회원 분포'}
                    {activeMainTab === '정산' && '정산 상태 분포'}
                    {activeMainTab === '결제' && '결제 수단 분포'}
                    {activeMainTab === '매칭' && '매칭 결과 분포'}
                    {activeMainTab === '예약' && '예약 처리 효율성'}
                  </h3>
                  {!loading && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
                      {activeMainTab === '회원현황' && stats.users && (
                        <>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span>활성 회원</span>
                            <span className="ml-2 font-semibold text-blue-600">
                              {formatNumber(
                                stats.users.totalUsers -
                                  stats.users.dormantCount
                              )}
                              명
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <span>휴면 회원</span>
                            <span className="ml-2 font-semibold text-yellow-600">
                              {formatNumber(stats.users.inactiveUserCount || 0)}
                              명
                            </span>
                          </div>
                        </>
                      )}
                      {activeMainTab === '정산' && stats.settlements && (
                        <>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span>완료</span>
                            <span className="ml-2 font-semibold text-green-600">
                              {formatNumber(stats.settlements.paidCount)}건
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span>대기</span>
                            <span className="ml-2 font-semibold text-blue-600">
                              {formatNumber(
                                stats.settlements.requestedCount -
                                  stats.settlements.paidCount
                              )}
                              건
                            </span>
                          </div>
                        </>
                      )}
                      {activeMainTab === '결제' && (
                        <>
                          {stats.paymentMethods &&
                          (stats.paymentMethods.card || 0) +
                            (stats.paymentMethods.transfer || 0) +
                            (stats.paymentMethods.cash || 0) >
                            0 ? (
                            <>
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                <span>카드</span>
                                <span className="ml-2 font-semibold text-blue-600">
                                  {formatCurrency(
                                    stats.paymentMethods.card || 0
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                                <span>계좌이체</span>
                                <span className="ml-2 font-semibold text-purple-600">
                                  {formatCurrency(
                                    stats.paymentMethods.transfer || 0
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                <span>현금</span>
                                <span className="ml-2 font-semibold text-yellow-600">
                                  {formatCurrency(
                                    stats.paymentMethods.cash || 0
                                  )}
                                </span>
                              </div>
                            </>
                          ) : stats.payments &&
                            (stats.payments.totalAmount || 0) > 0 ? (
                            <div className="text-sm text-gray-500">
                              {selectedYear}년 {selectedMonth}월 결제 수단별
                              데이터 없음 (총액:{' '}
                              {formatCurrency(stats.payments.totalAmount)})
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {selectedYear}년 {selectedMonth}월 결제 데이터
                              없음
                            </div>
                          )}
                        </>
                      )}
                      {activeMainTab === '매칭' &&
                        stats.matching &&
                        stats.matching.success &&
                        stats.matching.fail && (
                          <>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              <span>성공</span>
                              <span className="ml-2 font-semibold text-green-600">
                                {formatNumber(
                                  stats.matching.success.successCount
                                )}
                                건
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                              <span>실패</span>
                              <span className="ml-2 font-semibold text-red-600">
                                {formatNumber(stats.matching.fail.failCount)}건
                              </span>
                            </div>
                          </>
                        )}
                      {activeMainTab === '예약' && stats.reservations && (
                        <>
                          <div className="flex items-center">
                            <div className="w-16 sm:w-20 text-sm text-gray-600">
                              평균 처리시간
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                              <div
                                className="bg-green-500 h-4 rounded-full"
                                style={{
                                  width: `${stats.reservations.avgProcessingMinutes <= 10 ? 80 : stats.reservations.avgProcessingMinutes <= 20 ? 60 : 30}%`,
                                }}
                              ></div>
                            </div>
                            <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                              {stats.reservations.avgProcessingMinutes.toFixed(
                                1
                              )}
                              분
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 sm:w-20 text-sm text-gray-600">
                              일평균 예약
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                              <div
                                className="bg-blue-500 h-4 rounded-full"
                                style={{
                                  width: `${Math.min((Math.round(stats.reservations.reservationCount / 365) / 50) * 100, 100)}%`,
                                }}
                              ></div>
                            </div>
                            <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                              {formatNumber(
                                Math.round(
                                  stats.reservations.reservationCount / 365
                                )
                              )}
                              건/일
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Bar chart representation */}
                <div className="space-y-4 w-full">
                  {loading ? (
                    <>
                      <div className="flex items-center">
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mr-4"></div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4 animate-pulse"></div>
                        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mr-4"></div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4 animate-pulse"></div>
                        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </>
                  ) : (
                    <>
                      {activeMainTab === '회원현황' && stats.users && (
                        <>
                          <div className="flex items-center">
                            <div className="w-16 sm:w-20 text-sm text-gray-600">
                              활성 회원
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                              <div
                                className="bg-blue-500 h-4 rounded-full"
                                style={{
                                  width: `${((stats.users.totalUsers - (stats.users.inactiveUserCount || 0)) / stats.users.totalUsers) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                              {formatPercent(
                                ((stats.users.totalUsers -
                                  (stats.users.inactiveUserCount || 0)) /
                                  stats.users.totalUsers) *
                                  100
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 sm:w-20 text-sm text-gray-600">
                              휴면 회원
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                              <div
                                className="bg-yellow-500 h-4 rounded-full"
                                style={{
                                  width: `${((stats.users.inactiveUserCount || 0) / stats.users.totalUsers) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                              {formatPercent(
                                ((stats.users.inactiveUserCount || 0) /
                                  stats.users.totalUsers) *
                                  100
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      {activeMainTab === '정산' && stats.settlements && (
                        <>
                          <div className="flex items-center">
                            <div className="w-16 sm:w-20 text-sm text-gray-600">
                              완료
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                              <div
                                className="bg-green-500 h-4 rounded-full"
                                style={{
                                  width: `${(stats.settlements.paidCount / stats.settlements.requestedCount) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                              {formatPercent(
                                (stats.settlements.paidCount /
                                  stats.settlements.requestedCount) *
                                  100
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 sm:w-20 text-sm text-gray-600">
                              대기
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                              <div
                                className="bg-blue-500 h-4 rounded-full"
                                style={{
                                  width: `${((stats.settlements.requestedCount - stats.settlements.paidCount) / stats.settlements.requestedCount) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                              {formatPercent(
                                ((stats.settlements.requestedCount -
                                  stats.settlements.paidCount) /
                                  stats.settlements.requestedCount) *
                                  100
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      {activeMainTab === '결제' && (
                        <>
                          {stats.paymentMethods &&
                          (stats.paymentMethods.card || 0) +
                            (stats.paymentMethods.transfer || 0) +
                            (stats.paymentMethods.cash || 0) >
                            0 ? (
                            <>
                              <div className="flex items-center">
                                <div className="w-16 sm:w-20 text-sm text-gray-600">
                                  카드
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                                  <div
                                    className="bg-blue-500 h-4 rounded-full"
                                    style={{
                                      width: `${((stats.paymentMethods.card || 0) / ((stats.paymentMethods.card || 0) + (stats.paymentMethods.transfer || 0) + (stats.paymentMethods.cash || 0))) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                                  {formatPercent(
                                    ((stats.paymentMethods.card || 0) /
                                      ((stats.paymentMethods.card || 0) +
                                        (stats.paymentMethods.transfer || 0) +
                                        (stats.paymentMethods.cash || 0))) *
                                      100
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="w-16 sm:w-20 text-sm text-gray-600">
                                  계좌이체
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                                  <div
                                    className="bg-purple-500 h-4 rounded-full"
                                    style={{
                                      width: `${((stats.paymentMethods.transfer || 0) / ((stats.paymentMethods.card || 0) + (stats.paymentMethods.transfer || 0) + (stats.paymentMethods.cash || 0))) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                                  {formatPercent(
                                    ((stats.paymentMethods.transfer || 0) /
                                      ((stats.paymentMethods.card || 0) +
                                        (stats.paymentMethods.transfer || 0) +
                                        (stats.paymentMethods.cash || 0))) *
                                      100
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="w-16 sm:w-20 text-sm text-gray-600">
                                  현금
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                                  <div
                                    className="bg-yellow-500 h-4 rounded-full"
                                    style={{
                                      width: `${((stats.paymentMethods.cash || 0) / ((stats.paymentMethods.card || 0) + (stats.paymentMethods.transfer || 0) + (stats.paymentMethods.cash || 0))) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                                  {formatPercent(
                                    ((stats.paymentMethods.cash || 0) /
                                      ((stats.paymentMethods.card || 0) +
                                        (stats.paymentMethods.transfer || 0) +
                                        (stats.paymentMethods.cash || 0))) *
                                      100
                                  )}
                                </div>
                              </div>
                            </>
                          ) : stats.payments &&
                            (stats.payments.totalAmount || 0) > 0 ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-sm text-gray-500">
                                {selectedYear}년 {selectedMonth}월 결제 수단별
                                데이터 없음 (총액:{' '}
                                {formatCurrency(stats.payments.totalAmount)})
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-sm text-gray-500">
                                {selectedYear}년 {selectedMonth}월 결제 데이터
                                없음
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {activeMainTab === '매칭' &&
                        stats.matching &&
                        stats.matching.success &&
                        stats.matching.fail && (
                          <>
                            <div className="flex items-center">
                              <div className="w-16 sm:w-20 text-sm text-gray-600">
                                성공
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                                <div
                                  className="bg-green-500 h-4 rounded-full"
                                  style={{
                                    width: `${(stats.matching.success.successCount / (stats.matching.success.successCount + stats.matching.fail.failCount)) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                                {formatPercent(
                                  (stats.matching.success.successCount /
                                    (stats.matching.success.successCount +
                                      stats.matching.fail.failCount)) *
                                    100
                                )}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-16 sm:w-20 text-sm text-gray-600">
                                실패
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                                <div
                                  className="bg-red-500 h-4 rounded-full"
                                  style={{
                                    width: `${(stats.matching.fail.failCount / (stats.matching.success.successCount + stats.matching.fail.failCount)) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                                {formatPercent(
                                  (stats.matching.fail.failCount /
                                    (stats.matching.success.successCount +
                                      stats.matching.fail.failCount)) *
                                    100
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      {activeMainTab === '예약' && stats.reservations && (
                        <>
                          <div className="flex items-center">
                            <div className="w-16 sm:w-20 text-sm text-gray-600">
                              평균 처리시간
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                              <div
                                className="bg-green-500 h-4 rounded-full"
                                style={{
                                  width: `${stats.reservations.avgProcessingMinutes <= 10 ? 80 : stats.reservations.avgProcessingMinutes <= 20 ? 60 : 30}%`,
                                }}
                              ></div>
                            </div>
                            <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                              {stats.reservations.avgProcessingMinutes.toFixed(
                                1
                              )}
                              분
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 sm:w-20 text-sm text-gray-600">
                              일평균 예약
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                              <div
                                className="bg-blue-500 h-4 rounded-full"
                                style={{
                                  width: `${Math.min((Math.round(stats.reservations.reservationCount / 365) / 50) * 100, 100)}%`,
                                }}
                              ></div>
                            </div>
                            <div className="w-12 sm:w-16 text-sm text-gray-900 font-medium">
                              {formatNumber(
                                Math.round(
                                  stats.reservations.reservationCount / 365
                                )
                              )}
                              건/일
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
