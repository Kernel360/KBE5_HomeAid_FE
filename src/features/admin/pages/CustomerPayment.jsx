import React, { useState, useEffect } from 'react';

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
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('전체조회');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [paymentStats, setPaymentStats] = useState({
    totalPayment: 0,
    refundAmount: 0,
    successRate: 0,
    pendingPayments: 0,
  });

  // 결제 상태 매핑
  const getPaymentStatusText = (status) => {
    const statusMap = {
      COMPLETED: '결제완료',
      PENDING: '결제대기',
      FAILED: '결제실패',
      REFUNDED: '환불완료',
      CANCELLED: '결제취소',
    };
    return statusMap[status] || status;
  };

  // 결제 상태 색상
  const getPaymentStatusColor = (status) => {
    const colorMap = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // 결제 수단 아이콘
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'CARD':
        return '💳';
      case 'TRANSFER':
        return '🏦';
      case 'VIRTUAL_ACCOUNT':
        return '📄';
      default:
        return '💰';
    }
  };

  // API 호출 함수
  const fetchPayments = async (page = 0, searchData = null) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        size: '10',
      });

      if (searchData?.query) {
        params.append('search', searchData.query);
      }

      console.log('Fetching payments with params:', Object.fromEntries(params));

      const response = await fetch(`/api/v1/admin/payments?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success && data.data) {
        setPayments(data.data.content || []);
        setPagination({
          page: data.data.currentPage || 0,
          size: data.data.size || 10,
          totalElements: data.data.totalElements || 0,
          totalPages: data.data.totalPages || 0,
        });
      } else {
        console.warn('No data received from API');
        setPayments([]);
      }
    } catch (err) {
      console.error('Payment fetch error:', err);
      setError(err.message);
      setPayments([]);
      // Mock data for development
      const mockPayments = [
        {
          id: 'PAY240115001',
          customerName: '김민수',
          customerEmail: 'user123@email.com',
          serviceName: '홈클리닝',
          amount: 150000,
          method: 'CARD',
          status: 'COMPLETED',
          createdAt: '2024.01.15 14:30:25',
          managerName: '신용카드',
        },
      ];
      setPayments(mockPayments);
      setPagination({
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      });
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  // 통계 데이터 가져오기
  const fetchPaymentStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/v1/admin/payments/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPaymentStats(data.data);
        }
      } else {
        // Mock stats for development
        setPaymentStats({
          totalPayment: 12450000,
          refundAmount: 890000,
          successRate: 97.8,
          pendingPayments: 2340000,
        });
      }
    } catch (err) {
      console.error('Payment stats fetch error:', err);
      // Mock stats for development
      setPaymentStats({
        totalPayment: 12450000,
        refundAmount: 890000,
        successRate: 97.8,
        pendingPayments: 2340000,
      });
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchPayments(0, null);
    fetchPaymentStats();
  }, []);

  // 검색 핸들러
  const handleSearch = () => {
    console.log('Search triggered with query:', searchQuery);
    setIsSearching(true);
    setPagination((prev) => ({ ...prev, page: 0 }));

    const searchData = searchQuery.trim()
      ? { query: searchQuery.trim() }
      : null;
    fetchPayments(0, searchData);
  };

  // 검색 초기화
  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setPagination((prev) => ({ ...prev, page: 0 }));
    fetchPayments(0, null);
  };

  // 엔터 키 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    const searchData = searchQuery.trim()
      ? { query: searchQuery.trim() }
      : null;
    fetchPayments(newPage, searchData);
  };

  // 금액 포맷팅
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const tabs = [
    { key: '전체조회', label: `전체조회 (${pagination.totalElements})` },
  ];

  const stats = [
    {
      title: '오늘 총 결제금액',
      value: `₩${formatAmount(paymentStats.totalPayment)}`,
      subValue: '결제 건수 : 89건\n평균 결제액 : ₩139,888',
      icon: (
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
      ),
      iconBg: 'bg-blue-100',
    },
    {
      title: '환불 금액',
      value: `₩${formatAmount(paymentStats.refundAmount)}`,
      subValue: '',
      icon: (
        <svg
          className="w-5 h-5 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clipRule="evenodd"
          />
        </svg>
      ),
      iconBg: 'bg-red-100',
      trend: { value: '7건', period: '환불 요청', isPositive: false },
    },
    {
      title: '결제 성공률',
      value: `${paymentStats.successRate}%`,
      subValue: '',
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
      trend: { value: '+2.1%', period: '지난 주 대비', isPositive: true },
    },
    {
      title: '결제 대기',
      value: `₩${formatAmount(paymentStats.pendingPayments)}`,
      subValue: '',
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
      trend: { value: '12건', period: '결제 진행중', isPositive: false },
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white">
        <div className="max-w-none space-y-6">
          {/* Stats Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                subValue={stat.subValue}
                icon={stat.icon}
                iconBg={stat.iconBg}
                trend={stat.trend}
              />
            ))}
          </div>

          {/* Search Section */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-end space-x-4">
              <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
                결제 내역 검색
              </h3>

              <div className="relative w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                  placeholder="결제ID, 고객명, 서비스명으로 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleClearSearch}
                className="px-4 py-2 text-black bg-gray-100 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                초기화
              </button>

              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-2 bg-gray-100 text-black text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? '검색 중...' : '검색'}
              </button>
            </div>
          </div>

          {/* Tabs and Table */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex bg-white" style={{ backgroundColor: 'white' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
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

            {/* Table */}
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Table Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-gray-200 gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  결제 내역 목록
                </h3>
                <div className="flex items-center space-x-3">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="전체 회원">전체 회원</option>
                    <option value="일반 회원">일반 회원</option>
                    <option value="프리미엄 회원">프리미엄 회원</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="전체 상태">전체 상태</option>
                    <option value="결제완료">결제완료</option>
                    <option value="결제대기">결제대기</option>
                    <option value="결제실패">결제실패</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="전체 서비스">전체 서비스</option>
                    <option value="홈클리닝">홈클리닝</option>
                    <option value="에어컨청소">에어컨청소</option>
                  </select>
                  <span className="text-sm text-gray-500">⋯</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mx-6 mb-4">
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
                        데이터 로드 오류
                      </h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <colgroup>
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '140px' }} />
                    <col style={{ width: '180px' }} />
                    <col style={{ width: '120px' }} />
                    <col style={{ width: '100px' }} />
                    <col style={{ width: '100px' }} />
                    <col style={{ width: '140px' }} />
                    <col style={{ width: '100px' }} />
                    <col style={{ width: '120px' }} />
                  </colgroup>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        결제ID
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        회원정보
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        서비스명
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        결제금액
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        결제방법
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        결제일시
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        매니저
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      // 로딩 상태
                      [...Array(5)].map((_, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="space-y-2">
                              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                              <div className="w-32 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : payments.length === 0 ? (
                      // 데이터 없음
                      <tr>
                        <td colSpan="9" className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <svg
                              className="w-12 h-12 text-gray-400 mb-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                              />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              결제 내역이 없습니다
                            </h3>
                            <p className="text-gray-500">
                              조건에 맞는 결제 데이터가 없거나 데이터를 불러올
                              수 없습니다.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      // 실제 데이터
                      payments.map((payment, index) => (
                        <tr
                          key={payment.id || index}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-blue-600">
                              {payment.id || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {payment.customerName || '-'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.customerEmail || '-'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {payment.serviceName || '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                            ₩{formatAmount(payment.amount || 0)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            <div className="flex items-center justify-center">
                              <span className="mr-1">
                                {getPaymentMethodIcon(payment.method)}
                              </span>
                              {payment.managerName || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {payment.createdAt || '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(payment.status)}`}
                            >
                              {getPaymentStatusText(payment.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            <button className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                              액션
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="w-full flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  총 {pagination.totalElements}개 중{' '}
                  {pagination.totalElements > 0
                    ? `${pagination.page * pagination.size + 1}-${Math.min(
                        (pagination.page + 1) * pagination.size,
                        pagination.totalElements
                      )}`
                    : '0-0'}
                  개 표시
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0 || loading}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white text-sm font-medium rounded">
                    {pagination.page + 1}
                  </div>

                  <span className="text-gray-400 text-sm font-medium">
                    / {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={
                      pagination.page >= pagination.totalPages - 1 || loading
                    }
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPayment;
