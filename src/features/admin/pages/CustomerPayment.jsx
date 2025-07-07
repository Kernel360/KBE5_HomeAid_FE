import React, { useState, useEffect } from 'react';
import { api } from '../../../api/config/api';
import AdminPaymentDetail from '../components/AdminPaymentDetail';

const StatCard = ({ title, value, subValue, icon, iconBg, trend }) => (
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
      <div className="text-lg font-bold text-gray-900 mb-1 truncate">
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-gray-500">
          {subValue.split('\n').map((line, index) => (
            <div key={index} className="truncate">
              {line}
            </div>
          ))}
        </div>
      )}
      {trend && (
        <div className="flex items-center mt-1">
          <span
            className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
          >
            {trend.isPositive ? '▲' : '▼'} {trend.value}
          </span>
          <span className="text-xs text-gray-500 ml-1">{trend.period}</span>
        </div>
      )}
    </div>
  </div>
);

const CustomerPayment = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [allPayments, setAllPayments] = useState([]); // 전체 데이터 저장
  const [allRefunds, setAllRefunds] = useState([]); // 환불 내역 저장
  const [paymentStats, setPaymentStats] = useState({
    totalPayment: 0,
    refundAmount: 0,
    successRate: 0,
    pendingPayments: 0,
    refundRequests: 0, // 환불 요청 건수
    refundRequestAmount: 0, // 환불 요청 금액
  });
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState('전체');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 페이지네이션 상태 추가
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10, // 한 페이지에 10개씩 표시
    totalElements: 0,
    totalPages: 0,
  });

  // 탭별 결제 건수 계산 함수를 먼저 정의
  const getTabCount = (status) => {
    if (status === null) return allPayments.length;
    if (status === 'REFUND_REQUESTED') {
      // 환불 요청이 있는 결제 건수 계산
      const refundRequestedPaymentIds = allRefunds
        .filter((refund) => refund.status === 'REQUESTED')
        .map((refund) => refund.paymentId);
      return allPayments.filter((payment) =>
        refundRequestedPaymentIds.includes(payment.id)
      ).length;
    }
    return allPayments.filter((payment) => payment.status === status).length;
  };

  // 탭 정의 (getTabCount 함수 사용)
  const tabs = [
    { key: '전체', label: `전체 (${getTabCount(null)})`, status: null },
    {
      key: '결제완료',
      label: `결제완료 (${getTabCount('PAID')})`,
      status: 'PAID',
    },
    {
      key: '결제대기',
      label: `결제대기 (${getTabCount('PENDING')})`,
      status: 'PENDING',
    },
    {
      key: '환불요청대기',
      label: `환불요청대기 (${getTabCount('REFUND_REQUESTED')})`,
      status: 'REFUND_REQUESTED',
    },
    {
      key: '결제실패',
      label: `결제실패 (${getTabCount('FAILED')})`,
      status: 'FAILED',
    },
    {
      key: '부분환불',
      label: `부분환불 (${getTabCount('PARTIAL_REFUNDED')})`,
      status: 'PARTIAL_REFUNDED',
    },
    {
      key: '환불완료',
      label: `환불완료 (${getTabCount('REFUNDED')})`,
      status: 'REFUNDED',
    },
    {
      key: '결제취소',
      label: `결제취소 (${getTabCount('CANCELED')})`,
      status: 'CANCELED',
    },
  ];

  // 디바운스된 검색 - 성능 최적화
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // 검색어가 변경된 후 300ms 후에 실행
      if (searchTerm.trim()) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // 검색과 필터를 적용한 결제 필터링 - 성능 최적화
  const getFilteredPayments = () => {
    let filtered = allPayments;

    // 활성 탭에 따른 상태 필터링
    const selectedTab = tabs.find((tab) => tab.key === activeTab);
    if (selectedTab && selectedTab.status !== null) {
      if (selectedTab.status === 'REFUND_REQUESTED') {
        // 환불 요청이 있는 결제만 필터링
        const refundRequestedPaymentIds = allRefunds
          .filter((refund) => refund.status === 'REQUESTED')
          .map((refund) => refund.paymentId);
        filtered = filtered.filter((payment) =>
          refundRequestedPaymentIds.includes(payment.id)
        );
      } else {
        filtered = filtered.filter(
          (payment) => payment.status === selectedTab.status
        );
      }
    }

    // 검색어 필터링 - 최적화된 버전
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((payment) => {
        switch (searchType) {
          case 'customerName':
            return payment.customerName?.toLowerCase().includes(term);
          case 'serviceName':
            return payment.serviceName?.toLowerCase().includes(term);
          case 'managerName':
            return payment.managerName?.toLowerCase().includes(term);
          case 'paymentDate':
            return payment.createdAt?.toLowerCase().includes(term);
          case 'all':
          default:
            return (
              payment.customerName?.toLowerCase().includes(term) ||
              payment.serviceName?.toLowerCase().includes(term) ||
              payment.managerName?.toLowerCase().includes(term) ||
              payment.createdAt?.toLowerCase().includes(term)
            );
        }
      });
    }

    return filtered;
  };

  const filteredPayments = getFilteredPayments();

  // 페이지네이션 적용된 결제 목록
  const getPaginatedPayments = () => {
    const startIndex = pagination.page * pagination.size;
    const endIndex = startIndex + pagination.size;
    return filteredPayments.slice(startIndex, endIndex);
  };

  const paginatedPayments = getPaginatedPayments();

  // 페이지네이션 정보 업데이트
  const updatePaginationInfo = () => {
    const totalElements = filteredPayments.length;
    const totalPages = Math.ceil(totalElements / pagination.size);

    setPagination((prev) => ({
      ...prev,
      totalElements,
      totalPages,
    }));
  };

  // 검색어나 필터가 변경될 때 페이지네이션 정보 업데이트
  useEffect(() => {
    updatePaginationInfo();
    // 현재 페이지가 총 페이지 수를 초과하면 첫 페이지로 이동
    if (
      pagination.page > 0 &&
      pagination.page >= Math.ceil(filteredPayments.length / pagination.size)
    ) {
      setPagination((prev) => ({ ...prev, page: 0 }));
    }
  }, [filteredPayments.length, pagination.size]);

  // 페이지 변경 핸들러 - 클라이언트 사이드 페이지네이션
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    // 탭 변경 시 첫 페이지로 이동
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  // 결제 상태 매핑
  const getPaymentStatusText = (status) => {
    const statusMap = {
      PAID: '결제완료',
      PENDING: '결제대기',
      FAILED: '결제실패',
      PARTIAL_REFUNDED: '부분환불',
      REFUNDED: '환불완료',
      CANCELED: '결제취소',
    };
    return statusMap[status] || status;
  };

  // 결제 상태 색상
  const getPaymentStatusColor = (status) => {
    const colorMap = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      PARTIAL_REFUNDED: 'bg-orange-100 text-orange-800',
      REFUNDED: 'bg-blue-100 text-blue-800',
      CANCELED: 'bg-gray-100 text-gray-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // 토큰 검증 함수
  const validateToken = (token) => {
    if (!token) return { valid: false, reason: '토큰이 없음' };

    try {
      // JWT 토큰 구조 확인 (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, reason: 'JWT 형식이 아님' };
      }

      // Base64 디코딩 시도
      const payload = JSON.parse(atob(parts[1]));

      // 만료 시간 확인
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return { valid: false, reason: '토큰이 만료됨' };
      }

      // 특수 문자 확인 (INVALID_DATA_CONVERSION 원인 중 하나)
      const hasSpecialChars = !/^[\x20-\x7E.]+$/.test(token);
      if (hasSpecialChars) {
        return { valid: false, reason: '토큰에 특수 문자 포함됨' };
      }

      return {
        valid: true,
        payload: payload,
        expiresAt: new Date(payload.exp * 1000),
        issuedAt: new Date(payload.iat * 1000),
      };
    } catch (error) {
      return { valid: false, reason: `토큰 파싱 오류: ${error.message}` };
    }
  };

  // 환불 내역 조회 함수
  const fetchRefunds = async () => {
    try {
      console.log('🔍 환불 내역 조회 시작');
      const response = await api.get('/admin/refunds', {
        params: { page: 0, size: 1000 }, // 충분히 큰 사이즈로 모든 환불 내역 조회
      });

      if (response?.data?.data) {
        const refundsData = response.data.data.content || response.data.data;
        console.log('✅ 환불 내역 조회 성공:', refundsData.length, '건');
        setAllRefunds(refundsData);
        return refundsData;
      } else {
        console.log('ℹ️ 환불 내역 없음');
        setAllRefunds([]);
        return [];
      }
    } catch (err) {
      console.error('❌ 환불 내역 조회 실패:', err);
      setAllRefunds([]);
      return [];
    }
  };

  // API 호출 함수
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthError(false);

      const token = localStorage.getItem('accessToken');

      if (token) {
        // 토큰 검증
        const tokenValidation = validateToken(token);

        if (!tokenValidation.valid) {
          setAuthError(true);
          setError(`토큰 오류: ${tokenValidation.reason}`);
          return;
        }
      } else {
        setAuthError(true);
        setError('로그인이 필요합니다.');
        return;
      }

      let response;
      let attemptCount = 0;
      const maxAttempts = 4;

      // 여러 가지 API 호출 방식을 시도
      while (attemptCount < maxAttempts) {
        attemptCount++;

        try {
          switch (attemptCount) {
            case 1:
              // 시도 1: 기본 파라미터 방식
              response = await api.get('/admin/payments/list', {
                params: {
                  page: 0,
                  size: 100,
                },
              });
              break;

            case 2:
              // 시도 2: 다른 엔드포인트 시도
              response = await api.get('/admin/payments', {
                params: {
                  page: 0,
                  size: 100,
                },
              });
              break;

            case 3:
              // 시도 3: POST 방식으로 시도
              response = await api.post('/admin/payments/list', {
                page: 0,
                size: 100,
              });
              break;

            case 4:
              // 시도 4: 파라미터 없이 시도
              response = await api.get('/admin/payments/list');
              break;

            default:
              throw new Error('모든 시도 실패');
          }

          // 성공한 경우 루프 종료
          break;
        } catch (attemptError) {
          // 마지막 시도가 아니면 계속 시도
          if (attemptCount < maxAttempts) {
            continue;
          } else {
            // 모든 시도가 실패한 경우 마지막 에러를 던짐
            throw attemptError;
          }
        }
      }

      // API 클라이언트는 이미 response.data를 반환함
      const data = response.data || response;

      if (data && data.success !== false) {
        // 백엔드에서 List<PaymentResponseDto>를 직접 반환
        const paymentsArray = data.data || data || [];

        const paymentsData = paymentsArray.map((payment) => {
          const mappedPayment = {
            id: payment.id,
            reservationId: payment.reservationId,
            customerName: payment.customerName || '알 수 없음',
            managerName: '매니저 정보 없음',
            serviceName: '홈케어 서비스',
            amount: payment.amount || 0,
            method: payment.paymentMethod || 'CARD',
            status: payment.status || 'PENDING',
            createdAt: payment.paidAt
              ? new Date(payment.paidAt)
                  .toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                  .replace(/\. /g, '.')
              : '날짜 정보 없음',
            paymentMethodText: getPaymentMethodText(
              payment.paymentMethod || 'CARD'
            ),
          };

          return mappedPayment;
        });

        // ID 기준으로 내림차순 정렬 (최신 결제 내역이 상단에 오도록)
        const sortedPayments = paymentsData.sort((a, b) => b.id - a.id);

        setAllPayments(sortedPayments);

        // 환불 내역도 함께 조회
        const refundsData = await fetchRefunds();

        // 통계 계산 (결제 + 환불 데이터)
        calculateStats(sortedPayments, refundsData);
      } else {
        setAllPayments([]);
        await fetchRefunds(); // 환불 내역도 조회 시도
      }
    } catch (err) {
      // 더 구체적인 에러 처리
      if (err.response?.status === 401) {
        setAuthError(true);
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
      } else if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (errorData?.code === 'INVALID_DATA_CONVERSION') {
          setError(
            `데이터 변환 오류: ${errorData.message || '요청 형식을 확인해주세요.'}`
          );
        } else {
          setError(
            `잘못된 요청: ${errorData?.message || '요청 형식을 확인해주세요.'}`
          );
        }
      } else if (err.response?.status === 403) {
        setError('접근 권한이 없습니다. 관리자 권한을 확인해주세요.');
      } else if (err.response?.status === 404) {
        setError(
          'API 엔드포인트를 찾을 수 없습니다. 백엔드 서버를 확인해주세요.'
        );
      } else if (err.response?.status >= 500) {
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (
        err.code === 'ERR_NETWORK' ||
        err.message.includes('Network Error')
      ) {
        setError('네트워크 연결을 확인해주세요.');
      } else if (
        err.code === 'ECONNREFUSED' ||
        err.message.includes('ERR_CONNECTION_REFUSED')
      ) {
        setError(
          '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
        );
      } else {
        setError(
          err.message || '데이터를 불러오는 중 알 수 없는 오류가 발생했습니다.'
        );
      }

      setAllPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // 결제 수단 텍스트 매핑 함수
  const getPaymentMethodText = (method) => {
    const methodMap = {
      CARD: '신용카드',
      TRANSFER: '계좌이체',
      VIRTUAL_ACCOUNT: '가상계좌',
    };
    return methodMap[method] || method;
  };

  // 통계 데이터 가져오기 (백엔드에 통계 API가 없으므로 클라이언트에서 계산)
  const calculateStats = (paymentsData, refundsData = []) => {
    const totalPayment = paymentsData
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const refundAmount = paymentsData
      .filter((p) => p.status === 'REFUNDED')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalCount = paymentsData.length;
    const completedCount = paymentsData.filter(
      (p) => p.status === 'PAID'
    ).length;
    const successRate =
      totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : 0;

    const pendingPayments = paymentsData
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    // 환불 요청 통계 계산
    const requestedRefunds = refundsData.filter(
      (r) => r.status === 'REQUESTED'
    );
    const refundRequests = requestedRefunds.length;

    // 환불 요청 금액 계산 (결제 내역과 매칭)
    const refundRequestAmount = requestedRefunds.reduce((sum, refund) => {
      const payment = paymentsData.find((p) => p.id === refund.paymentId);
      return sum + (payment ? payment.amount : 0);
    }, 0);

    setPaymentStats({
      totalPayment,
      refundAmount,
      successRate: parseFloat(successRate),
      pendingPayments,
      refundRequests,
      refundRequestAmount,
    });
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchPayments();
  }, []);

  // payments 데이터가 변경될 때마다 통계 계산
  useEffect(() => {
    if (allPayments.length > 0) {
      calculateStats(allPayments, allRefunds);
    }
  }, [allPayments, allRefunds]);

  // 정기적 자동 새로고침 (30초마다) - 실시간 동기화
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('🔄 자동 새로고침 실행 (30초 주기)');
      await fetchPayments(); // fetchPayments 내에서 fetchRefunds도 함께 호출됨
    }, 30000); // 30초마다

    return () => clearInterval(interval);
  }, []);

  // 검색 핸들러 - 리뷰 관리와 동일한 방식
  const handleSearch = () => {
    // 검색 시 첫 페이지로 이동
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  // 검색 초기화 - 리뷰 관리와 동일한 방식
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchType('all');
    // 검색 초기화 시 첫 페이지로 이동
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  // 엔터 키 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 금액 포맷팅
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 검색 placeholder 텍스트 생성
  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'customerName':
        return '고객명을 입력하세요';
      case 'serviceName':
        return '서비스명을 입력하세요';
      case 'managerName':
        return '매니저명을 입력하세요';
      case 'paymentDate':
        return '날짜를 입력하세요 (예: 2024.01 01.15)';
      case 'all':
      default:
        return '검색어를 입력하세요';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white">
        <div className="max-w-none space-y-6">
          {/* 통계 카드 */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            <StatCard
              title="오늘 총 결제금액"
              value={`₩${formatAmount(paymentStats.totalPayment)}`}
              subValue={`결제 건수 : ${getTabCount('PAID')}건\n평균 결제액 : ₩${paymentStats.totalPayment > 0 ? formatAmount(Math.round(paymentStats.totalPayment / Math.max(getTabCount('PAID'), 1))) : 0}`}
              icon={
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              iconBg="bg-blue-100"
            />
            <StatCard
              title="환불 금액"
              value={`₩${formatAmount(paymentStats.refundAmount)}`}
              subValue={`환불 건수 : ${getTabCount('REFUNDED')}건\n환불률 : ${allPayments.length > 0 ? ((getTabCount('REFUNDED') / allPayments.length) * 100).toFixed(1) : 0}%`}
              icon={
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
              }
              iconBg="bg-red-100"
            />
            <StatCard
              title="결제 성공률"
              value={`${paymentStats.successRate}%`}
              subValue={`성공 : ${getTabCount('PAID')}건\n실패 : ${getTabCount('FAILED')}건`}
              icon={
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              iconBg="bg-green-100"
            />
            <StatCard
              title="결제 대기"
              value={`₩${formatAmount(paymentStats.pendingPayments)}`}
              subValue={`대기 건수 : ${getTabCount('PENDING')}건\n대기율 : ${allPayments.length > 0 ? ((getTabCount('PENDING') / allPayments.length) * 100).toFixed(1) : 0}%`}
              icon={
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
              }
              iconBg="bg-yellow-100"
            />
            <StatCard
              title="환불 요청 대기"
              value={`${paymentStats.refundRequests}건`}
              subValue={`요청 금액 : ₩${formatAmount(paymentStats.refundRequestAmount)}\n승인 대기 중인 환불 요청`}
              icon={
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              iconBg="bg-purple-100"
            />
          </div>

          {/* 탭과 테이블 */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* 탭 */}
            <div className="flex bg-white" style={{ backgroundColor: 'white' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'text-blue-600 border-b-2 border-blue-500 bg-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent bg-white'
                  }`}
                  style={{ backgroundColor: 'white' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 구분선 */}
            <div className="border-b border-gray-200 bg-white"></div>

            {/* 검색 영역 */}
            <div className="p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  결제 내역 목록 {activeTab !== '전체' && `- ${activeTab}`}
                </h3>
                <div className="flex items-center space-x-3">
                  {/* 검색 범위 선택 */}
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">전체</option>
                    <option value="customerName">고객명</option>
                    <option value="serviceName">서비스명</option>
                    <option value="managerName">매니저명</option>
                    <option value="paymentDate">결제날짜</option>
                  </select>

                  <div className="w-80 relative">
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
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={getSearchPlaceholder()}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleClearSearch}
                    className="px-4 py-2 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    초기화
                  </button>
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    검색
                  </button>
                </div>
              </div>

              {/* 페이지네이션 및 결과 정보 */}
              {!loading && filteredPayments.length > 0 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {searchTerm || activeTab !== '전체' ? (
                      <>
                        검색 결과:{' '}
                        <span className="font-medium">
                          {filteredPayments.length}
                        </span>
                        개{searchTerm && ` (검색어: "${searchTerm}")`}
                        {activeTab !== '전체' && ` (탭: ${activeTab})`}
                      </>
                    ) : (
                      <>
                        총{' '}
                        <span className="font-medium">
                          {pagination.totalElements}
                        </span>
                        건 중{' '}
                        <span className="font-medium">
                          {pagination.page * pagination.size + 1}-
                          {Math.min(
                            (pagination.page + 1) * pagination.size,
                            pagination.totalElements
                          )}
                        </span>
                        건 표시
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* 로딩 및 에러 상태 */}
              {loading && (
                <div className="text-center py-12">
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-6 h-6 animate-spin text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <p className="text-gray-500">
                      결제 데이터를 불러오는 중...
                    </p>
                  </div>
                </div>
              )}

              {error && !loading && (
                <div className="text-center py-12">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center space-x-2 text-red-800">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="font-medium">오류 발생</p>
                    </div>
                    {authError && (
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        페이지 새로고침
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 테이블 */}
              {!loading && !error && (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            결제 ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            고객 정보
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            서비스 정보
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            결제 정보
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            상태
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            결제일시
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            관리
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedPayments.length > 0 ? (
                          paginatedPayments.map((payment) => (
                            <tr
                              key={payment.id}
                              className={`hover:bg-gray-50 ${
                                // 환불 요청이 있는 결제는 보라색 배경으로 강조
                                allRefunds.some(
                                  (refund) =>
                                    refund.paymentId === payment.id &&
                                    refund.status === 'REQUESTED'
                                )
                                  ? 'bg-purple-50 border-l-4 border-l-purple-400'
                                  : ''
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                #{payment.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {payment.customerName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    예약 ID: {payment.reservationId || 'N/A'}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {payment.serviceName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    매니저: {payment.managerName}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    ₩{formatAmount(payment.amount)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {payment.paymentMethodText}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col space-y-1">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                                      payment.status
                                    )}`}
                                  >
                                    {getPaymentStatusText(payment.status)}
                                  </span>
                                  {/* 환불 요청 표시 */}
                                  {allRefunds.some(
                                    (refund) =>
                                      refund.paymentId === payment.id &&
                                      refund.status === 'REQUESTED'
                                  ) && (
                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                      환불요청중
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {payment.createdAt}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                {/* 상세 관리 버튼 - 모든 결제에 대해 표시 */}
                                <button
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setShowDetailModal(true);
                                  }}
                                  className="px-4 py-2 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                                >
                                  상세 관리
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="7"
                              className="px-6 py-12 text-center text-gray-500"
                            >
                              {searchTerm
                                ? '검색 결과가 없습니다.'
                                : '결제 데이터가 없습니다.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination - 매니저 목록과 동일한 스타일 */}
                  {pagination.totalPages > 1 && (
                    <div className="w-full flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-gray-200 gap-4">
                      <div className="text-sm text-gray-700">
                        총 {pagination.totalElements}건 중{' '}
                        {pagination.page * pagination.size + 1}-
                        {Math.min(
                          (pagination.page + 1) * pagination.size,
                          pagination.totalElements
                        )}
                        건 표시
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 0 || loading}
                        >
                          ‹
                        </button>
                        <span className="px-3 py-1 text-sm text-white bg-blue-600 rounded">
                          {pagination.page + 1}
                        </span>
                        <span className="px-3 py-1 text-sm text-gray-500">
                          / {pagination.totalPages}
                        </span>
                        <button
                          className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={
                            pagination.page >= pagination.totalPages - 1 ||
                            loading
                          }
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 결제 상세 정보 모달 */}
      <AdminPaymentDetail
        payment={selectedPayment}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPayment(null);
        }}
        onRefresh={fetchPayments}
      />
    </div>
  );
};

export default CustomerPayment;
