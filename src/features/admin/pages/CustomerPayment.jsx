import React, { useState, useEffect } from 'react';
import { api } from '../../../api/config/api';

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
  const [paymentStats, setPaymentStats] = useState({
    totalPayment: 0,
    refundAmount: 0,
    successRate: 0,
    pendingPayments: 0,
  });
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState('전체');

  // 탭별 결제 건수 계산 함수를 먼저 정의
  const getTabCount = (status) => {
    if (status === null) return allPayments.length;
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
      key: '결제실패',
      label: `결제실패 (${getTabCount('FAILED')})`,
      status: 'FAILED',
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
      filtered = filtered.filter(
        (payment) => payment.status === selectedTab.status
      );
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

  // 탭 변경 핸들러
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    // filteredPayments가 자동으로 탭과 검색어에 따라 필터링됨
  };

  // 결제 상태 매핑
  const getPaymentStatusText = (status) => {
    const statusMap = {
      PAID: '결제완료',
      PENDING: '결제대기',
      FAILED: '결제실패',
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

  // API 호출 함수
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthError(false);

      // 디버깅을 위한 토큰 확인
      const token = localStorage.getItem('accessToken');
      console.log('=== 결제 API 호출 시작 ===');
      console.log('토큰 존재 여부:', token ? '있음' : '없음');

      if (token) {
        console.log('토큰 길이:', token.length);
        console.log('토큰 앞 20자:', token.substring(0, 20));

        // 토큰 검증
        const tokenValidation = validateToken(token);
        console.log('토큰 검증 결과:', tokenValidation);

        if (!tokenValidation.valid) {
          console.error('토큰 검증 실패:', tokenValidation.reason);
          setAuthError(true);
          setError(`토큰 오류: ${tokenValidation.reason}`);
          return;
        }
      } else {
        console.error('토큰이 없습니다.');
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
        console.log(`=== API 호출 시도 ${attemptCount} ===`);

        try {
          switch (attemptCount) {
            case 1:
              // 시도 1: 기본 파라미터 방식
              console.log('시도 1: 기본 파라미터 방식');
              response = await api.get('/admin/payments/list', {
                params: {
                  page: 0,
                  size: 100,
        },
      });
              break;

            case 2:
              // 시도 2: 다른 엔드포인트 시도
              console.log('시도 2: /admin/payments 엔드포인트');
              response = await api.get('/admin/payments', {
                params: {
                  page: 0,
                  size: 100,
                },
              });
              break;

            case 3:
              // 시도 3: POST 방식으로 시도
              console.log('시도 3: POST 방식');
              response = await api.post('/admin/payments/list', {
                page: 0,
                size: 100,
              });
              break;

            case 4:
              // 시도 4: 파라미터 없이 시도
              console.log('시도 4: 파라미터 없이');
              response = await api.get('/admin/payments/list');
              break;

            default:
              throw new Error('모든 시도 실패');
          }

          // 성공한 경우 루프 종료
          console.log(`=== API 호출 성공 (시도 ${attemptCount}) ===`);
          console.log('응답 상태:', response.status);
          console.log('응답 데이터:', response.data);
          break;
        } catch (attemptError) {
          console.error(
            `시도 ${attemptCount} 실패:`,
            attemptError.response?.status,
            attemptError.response?.data
          );

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

        console.log('결제 데이터 배열:', paymentsArray);
        console.log('결제 데이터 개수:', paymentsArray.length);

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

        console.log('매핑된 결제 데이터:', paymentsData);

        setAllPayments(paymentsData);
      } else {
        console.log('응답 데이터가 비었거나 실패 응답');
        setAllPayments([]);
      }
    } catch (err) {
      console.error('=== Payment fetch error ===');
      console.error('에러 객체:', err);
      console.error('에러 메시지:', err.message);
      console.error('응답 상태:', err.response?.status);
      console.error('응답 데이터:', err.response?.data);
      console.error('요청 설정:', err.config);

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
  const calculateStats = (paymentsData) => {
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

    setPaymentStats({
      totalPayment,
      refundAmount,
      successRate: parseFloat(successRate),
      pendingPayments,
    });
  };

  // 환불 처리 함수
  const handleRefund = async (
    paymentId,
    isPartial = false,
    refundAmount = null
  ) => {
    try {
      const endpoint = isPartial
        ? `/admin/payments/${paymentId}/partial-refund`
        : `/admin/payments/${paymentId}/refund`;

      let response;
      if (isPartial && refundAmount) {
        // 부분 환불의 경우 쿼리 파라미터로 전송
        response = await api.post(
          endpoint,
          {},
          {
            params: { refundAmount },
          }
        );
      } else {
        // 전액 환불의 경우
        response = await api.post(endpoint);
      }

      if (response.success !== false) {
        alert(
          isPartial
            ? '부분 환불이 완료되었습니다.'
            : '전액 환불이 완료되었습니다.'
        );
        fetchPayments(); // 데이터 새로고침
      } else {
        throw new Error(response.message || '환불 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error('Refund error:', err);
      alert(`환불 처리 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchPayments();
  }, []);

  // payments 데이터가 변경될 때마다 통계 계산
  useEffect(() => {
    if (allPayments.length > 0) {
      calculateStats(allPayments);
    }
  }, [allPayments]);

  // 검색 핸들러 - 리뷰 관리와 동일한 방식
  const handleSearch = () => {
    // filteredPayments를 통해 자동으로 필터링됨
    // 별도 처리 불필요
  };

  // 검색 초기화 - 리뷰 관리와 동일한 방식
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchType('all');
  };

  // 엔터 키 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 환불 처리 확인 다이얼로그
  const confirmRefund = (paymentId, customerName) => {
    if (
      window.confirm(`${customerName} 고객의 결제를 전액 환불하시겠습니까?`)
    ) {
      handleRefund(paymentId, false);
    }
  };

  // 부분 환불 처리
  const confirmPartialRefund = (paymentId, customerName, totalAmount) => {
    const refundAmount = prompt(
      `${customerName} 고객의 부분 환불 금액을 입력하세요 (최대: ₩${formatAmount(totalAmount)}):`
    );
    if (refundAmount && !isNaN(refundAmount)) {
      const amount = parseInt(refundAmount);
      if (amount > 0 && amount <= totalAmount) {
        handleRefund(paymentId, true, amount);
      } else {
        alert('올바른 환불 금액을 입력해주세요.');
      }
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
                          {allPayments.length}
                        </span>
                        개 결제 내역
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            결제 ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            고객 정보
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            서비스 정보
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            결제 정보
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            상태
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            결제일시
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            작업
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPayments.length > 0 ? (
                          filteredPayments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
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
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                                    payment.status
                                  )}`}
                                >
                                  {getPaymentStatusText(payment.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {payment.createdAt}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  {payment.status === 'PAID' && (
                                    <>
                                      <button
                                        onClick={() =>
                                          confirmRefund(
                                            payment.id,
                                            payment.customerName
                                          )
                                        }
                                        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                                      >
                                        전액환불
                                      </button>
                                      <button
                                        onClick={() =>
                                          confirmPartialRefund(
                                            payment.id,
                                            payment.customerName,
                                            payment.amount
                                          )
                                        }
                                        className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                                      >
                                        부분환불
                                      </button>
                                    </>
                                  )}
                                  {payment.status === 'PENDING' && (
                                    <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-lg">
                                      대기중
                                    </span>
                                  )}
                                  {(payment.status === 'FAILED' ||
                                    payment.status === 'REFUNDED' ||
                                    payment.status === 'CANCELED') && (
                                    <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg">
                                      처리완료
                                    </span>
                                  )}
                                </div>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPayment;