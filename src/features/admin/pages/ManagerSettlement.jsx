import React, { useState, useEffect } from 'react';

const StatCard = ({ title, value, subValue, icon, iconBg }) => (
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
    </div>
  </div>
);

const ManagerSettlement = () => {
  // 상태 관리
  const [allSettlements, setAllSettlements] = useState([]); // 모든 정산 데이터
  const [settlements, setSettlements] = useState([]); // 필터링된 정산 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // 탭 및 필터 상태
  const [activeTab, setActiveTab] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  // 체크박스 선택 상태
  const [selectedSettlements, setSelectedSettlements] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // 통계 상태
  const [settlementStats, setSettlementStats] = useState({
    weeklyTotal: 0,
    pendingCount: 0,
    pendingAmount: 0,
    completedCount: 0,
    completedAmount: 0,
    averagePerManager: 0,
  });

  // 주간 정산 생성 모달 상태
  const [isWeeklySettlementModalOpen, setIsWeeklySettlementModalOpen] =
    useState(false);

  // 데이터 필터링 함수
  const filterSettlements = (data, tabKey, searchData = null) => {
    let filtered = [...data];

    // 탭 필터링
    if (tabKey !== '전체') {
      switch (tabKey) {
        case '승인대기':
          filtered = filtered.filter((s) => !s.confirmedAt && !s.paidAt);
          break;
        case '승인완료':
          filtered = filtered.filter((s) => s.confirmedAt && !s.paidAt);
          break;
        case '정산완료':
          filtered = filtered.filter((s) => s.paidAt);
          break;
        default:
          break;
      }
    }

    // 검색 필터링
    if (searchData && searchData.query && searchData.query.trim()) {
      const query = searchData.query.toLowerCase();
      if (searchData.scope === 'managerId' || searchData.scope === 'all') {
        filtered = filtered.filter((s) =>
          s.managerId?.toString().toLowerCase().includes(query)
        );
      }
    }

    return filtered;
  };

  // 탭 정의 (allSettlements 기준으로 카운트)
  const tabs = [
    { key: '전체', label: '전체', count: allSettlements.length },
    {
      key: '승인대기',
      label: '승인대기',
      count: allSettlements.filter((s) => !s.confirmedAt && !s.paidAt).length,
    },
    {
      key: '승인완료',
      label: '승인완료',
      count: allSettlements.filter((s) => s.confirmedAt && !s.paidAt).length,
    },
    {
      key: '정산완료',
      label: '정산완료',
      count: allSettlements.filter((s) => s.paidAt).length,
    },
  ];

  // API 호출 함수
  const fetchSettlements = async (page = 0, searchData = null) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      // 파라미터 구성
      const params = new URLSearchParams({
        page: page.toString(),
        size: pagination.size.toString(),
      });

      const response = await fetch(`/api/v1/admin/settlements?${params}`, {
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

      if (data.success && data.data) {
        // 백엔드가 List<SettlementResponseDto>를 반환하므로 배열로 처리
        const settlementsData = Array.isArray(data.data) ? data.data : [];
        setAllSettlements(settlementsData);

        // 현재 활성 탭과 검색 조건에 맞게 필터링
        const filtered = filterSettlements(
          settlementsData,
          activeTab,
          searchData
        );
        setSettlements(filtered);

        // 페이지네이션 정보 업데이트
        setPagination((prev) => ({
          ...prev,
          page: page,
          totalElements: filtered.length,
          totalPages: Math.ceil(filtered.length / prev.size),
        }));
      }
    } catch (err) {
      console.error('Settlement fetch error:', err);
      setError(err.message);
      setAllSettlements([]);
      setSettlements([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  // 통계 데이터 계산
  const calculateStats = (settlementsData) => {
    const weeklyTotal = settlementsData.reduce(
      (sum, s) => sum + (s.totalAmount || 0),
      0
    );
    const pending = settlementsData.filter((s) => !s.confirmedAt && !s.paidAt);
    const completed = settlementsData.filter((s) => s.paidAt);

    const pendingAmount = pending.reduce(
      (sum, s) => sum + (s.managerAmount || 0),
      0
    );
    const completedAmount = completed.reduce(
      (sum, s) => sum + (s.managerAmount || 0),
      0
    );

    // 매니저별 평균 계산
    const uniqueManagers = [
      ...new Set(settlementsData.map((s) => s.managerId)),
    ];
    const averagePerManager =
      uniqueManagers.length > 0 ? weeklyTotal / uniqueManagers.length : 0;

    setSettlementStats({
      weeklyTotal,
      pendingCount: pending.length,
      pendingAmount,
      completedCount: completed.length,
      completedAmount,
      averagePerManager,
    });
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchSettlements();
  }, []);

  // allSettlements 변경 시 통계 계산
  useEffect(() => {
    calculateStats(allSettlements);
  }, [allSettlements]);

  // 탭 클릭 핸들러
  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    const searchData = searchQuery.trim()
      ? { query: searchQuery.trim(), scope: searchScope }
      : null;

    // 클라이언트 사이드 필터링
    const filtered = filterSettlements(allSettlements, tabKey, searchData);
    setSettlements(filtered);

    // 페이지네이션 업데이트
    setPagination((prev) => ({
      ...prev,
      page: 0,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.size),
    }));
  };

  // 검색 실행
  const handleSearch = () => {
    setIsSearching(true);
    const searchData = searchQuery.trim()
      ? { query: searchQuery.trim(), scope: searchScope }
      : null;

    // 클라이언트 사이드 필터링
    const filtered = filterSettlements(allSettlements, activeTab, searchData);
    setSettlements(filtered);

    // 페이지네이션 업데이트
    setPagination((prev) => ({
      ...prev,
      page: 0,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.size),
    }));

    setIsSearching(false);
  };

  // 검색 초기화
  const handleReset = () => {
    setSearchQuery('');
    setSearchScope('all');
    setActiveTab('전체');
    setIsSearching(false);

    // 모든 데이터 표시
    setSettlements(allSettlements);
    setPagination((prev) => ({
      ...prev,
      page: 0,
      totalElements: allSettlements.length,
      totalPages: Math.ceil(allSettlements.length / prev.size),
    }));
  };

  // 엔터 키 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedSettlements([]);
      setIsAllSelected(false);
    } else {
      const allIds = settlements.map((settlement) => settlement.id);
      setSelectedSettlements(allIds);
      setIsAllSelected(true);
    }
  };

  // 개별 선택/해제
  const handleSelectSettlement = (settlementId) => {
    setSelectedSettlements((prev) => {
      if (prev.includes(settlementId)) {
        const newSelected = prev.filter((id) => id !== settlementId);
        setIsAllSelected(false);
        return newSelected;
      } else {
        const newSelected = [...prev, settlementId];
        setIsAllSelected(newSelected.length === settlements.length);
        return newSelected;
      }
    });
  };

  // 정산 승인 처리
  const handleConfirmSettlement = async (settlementId) => {
    try {
      if (!settlementId) {
        throw new Error('정산 ID가 없습니다.');
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await fetch(
        `/api/v1/admin/settlements/${settlementId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // 데이터 새로고침
        fetchSettlements(pagination.page);
        alert('정산이 승인되었습니다.');
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `승인 처리 실패 (${response.status})`
        );
      }
    } catch (err) {
      console.error('Confirm settlement error:', err);
      alert(`승인 처리 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  // 정산 지급 처리
  const handlePaySettlement = async (settlementId) => {
    try {
      if (!settlementId) {
        throw new Error('정산 ID가 없습니다.');
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await fetch(
        `/api/v1/admin/settlements/${settlementId}/pay`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // 데이터 새로고침
        fetchSettlements(pagination.page);
        alert('정산 지급이 완료되었습니다.');
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `지급 처리 실패 (${response.status})`
        );
      }
    } catch (err) {
      console.error('Pay settlement error:', err);
      alert(`지급 처리 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  // 정산 상세보기 처리
  const handleDetailSettlement = (settlement) => {
    console.log('Settlement detail:', settlement);
    // 상세 모달 또는 페이지로 이동하는 로직 구현 예정
    alert('상세보기 기능은 준비 중입니다.');
  };

  // 정산 상태 표시
  const getSettlementStatus = (settlement) => {
    if (!settlement)
      return { text: '미생성', color: 'bg-gray-100 text-gray-800' };
    if (settlement.paidAt)
      return { text: '지급완료', color: 'bg-green-100 text-green-800' };
    if (settlement.confirmedAt)
      return { text: '승인완료', color: 'bg-blue-100 text-blue-800' };
    return { text: '승인대기', color: 'bg-yellow-100 text-yellow-800' };
  };

  // 금액 포맷팅
  const formatCurrency = (amount) => {
    if (!amount) return '₩0';
    return `₩${amount.toLocaleString()}`;
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const stats = [
    {
      title: '이번주 총 정산금액',
      value: formatCurrency(settlementStats.weeklyTotal),
      subValue: `매니저 수: ${[...new Set(settlements.map((s) => s.managerId))].length}명\n완료 건수: ${settlementStats.completedCount}건`,
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
      title: '승인 대기',
      value: `${settlementStats.pendingCount}건`,
      subValue: `${formatCurrency(settlementStats.pendingAmount)} 대기금액`,
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
    {
      title: '승인 완료',
      value: `${settlements.filter((s) => s.confirmedAt && !s.paidAt).length}건`,
      subValue: `${formatCurrency(settlements.filter((s) => s.confirmedAt && !s.paidAt).reduce((sum, s) => sum + (s.managerAmount || 0), 0))} 승인금액`,
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
      title: '매니저당 평균',
      value: formatCurrency(settlementStats.averagePerManager),
      subValue: '+15.2% 지난주 대비',
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
  ];

  // 주간 정산 생성 처리
  const handleCreateWeeklySettlement = async (formData) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const params = new URLSearchParams({
        managerId: formData.managerId,
        weekStart: formData.weekStart,
        weekEnd: formData.weekEnd,
      });

      const response = await fetch(
        `/api/v1/admin/settlements/manager?${params}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert('주간 정산이 성공적으로 생성되었습니다.');
        setIsWeeklySettlementModalOpen(false);
        // 데이터 새로고침
        fetchSettlements(0);
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.message || `정산 생성 실패 (${response.status})`;

        // 특정 오류에 대한 사용자 친화적 메시지
        if (
          errorMessage.includes('결제 내역이 없습니다') ||
          errorMessage.includes('no payment')
        ) {
          alert(
            `선택한 기간(${formData.weekStart} ~ ${formData.weekEnd})에 해당 매니저의 결제 내역이 없어 정산을 생성할 수 없습니다.\n\n다른 기간을 선택하거나 결제 내역이 있는 매니저를 선택해주세요.`
          );
        } else {
          throw new Error(errorMessage);
        }
      }
    } catch (err) {
      console.error('Create weekly settlement error:', err);
      if (!err.message.includes('결제 내역이 없습니다')) {
        alert(`주간 정산 생성 중 오류가 발생했습니다: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
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
              />
            ))}
          </div>

          {/* 탭 메뉴와 테이블을 하나의 컨테이너로 통합 */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* 탭 메뉴 */}
            <div
              className="flex bg-white overflow-x-auto border-b border-gray-200"
              style={{ backgroundColor: 'white' }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab.key)}
                  className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  style={{ backgroundColor: 'white' }}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                        activeTab === tab.key
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* 검색 및 컨트롤 영역 */}
            <div className="p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  정산 목록
                </h3>
                <div className="flex items-center space-x-3">
                  {/* 주간 정산 생성 버튼 */}
                  {/* TODO: 주간 정산 생성 기능 구현 필요 */}
                  <button
                    onClick={() => {
                      alert('주간 정산 생성 기능은 준비 중입니다.');
                    }}
                    className="px-4 py-2 text-black bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>주간 정산 생성</span>
                  </button>

                  {/* 검색 범위 선택 */}
                  <select
                    value={searchScope}
                    onChange={(e) => setSearchScope(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">전체</option>
                    <option value="managerId">매니저ID</option>
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="검색어를 입력하세요"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSearching}
                    />
                  </div>

                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    초기화
                  </button>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-4 py-2 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isSearching ? '검색 중...' : '검색'}
                  </button>
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-b border-gray-200 bg-white"></div>

              {/* Error Message */}
              {error && (
                <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4 mt-4">
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
                      <button
                        onClick={() => fetchSettlements()}
                        className="mt-2 text-sm text-red-800 underline hover:no-underline"
                      >
                        다시 시도
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full overflow-x-auto mt-4">
                <table className="w-full min-w-[1500px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        매니저ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        정산기간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        총 수익
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        매니저 정산액
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        관리자 수수료
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        정산일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        승인일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        지급일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      // 로딩 상태
                      [...Array(5)].map((_, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {[...Array(11)].map((_, colIndex) => (
                            <td
                              key={colIndex}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : settlements.length === 0 ? (
                      // 데이터 없음
                      <tr>
                        <td colSpan="11" className="px-6 py-12 text-center">
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              정산 데이터가 없습니다
                            </h3>
                            <p className="text-gray-500">
                              조건을 변경하거나 데이터를 다시 로드해보세요.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      // 실제 데이터
                      settlements.map((settlement) => {
                        const status = getSettlementStatus(settlement);
                        const settlementId = settlement.id;

                        return (
                          <tr key={settlementId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedSettlements.includes(
                                  settlementId
                                )}
                                onChange={() =>
                                  handleSelectSettlement(settlementId)
                                }
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {settlement.managerId}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(settlement.from)} ~{' '}
                                {formatDate(settlement.to)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(settlement.totalAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {formatCurrency(settlement.managerAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(settlement.adminAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(settlement.settledAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(settlement.confirmedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(settlement.paidAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}
                              >
                                {status.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                {!settlement.confirmedAt && (
                                  <button
                                    onClick={() =>
                                      handleConfirmSettlement(settlement.id)
                                    }
                                    className="px-2 py-1 text-sm text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                  >
                                    승인
                                  </button>
                                )}
                                {settlement.confirmedAt &&
                                  !settlement.paidAt && (
                                    <button
                                      onClick={() =>
                                        handlePaySettlement(settlement.id)
                                      }
                                      className="px-2 py-1 text-sm text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors"
                                    >
                                      지급
                                    </button>
                                  )}
                                <button
                                  onClick={() =>
                                    handleDetailSettlement(settlement)
                                  }
                                  className="px-2 py-1 text-sm text-gray-600 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                >
                                  상세
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-gray-200 gap-4">
                <div className="text-sm text-gray-700">
                  총 {pagination.totalElements}개 중{' '}
                  {pagination.page * pagination.size + 1}-
                  {Math.min(
                    (pagination.page + 1) * pagination.size,
                    pagination.totalElements
                  )}
                  개 표시
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
                      pagination.page >= pagination.totalPages - 1 || loading
                    }
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 주간 정산 생성 모달 */}
      <WeeklySettlementModal
        isOpen={isWeeklySettlementModalOpen}
        onClose={() => setIsWeeklySettlementModalOpen(false)}
        onSubmit={handleCreateWeeklySettlement}
      />
    </div>
  );
};

// 주간 정산 생성 모달 컴포넌트
const WeeklySettlementModal = ({ isOpen, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'bulk'
  const [formData, setFormData] = useState({
    managerId: '',
    weekStart: '',
    weekEnd: '',
  });
  const [managers, setManagers] = useState([]);
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [managerSettlements, setManagerSettlements] = useState({});
  const [loading, setLoading] = useState(false);

  // 매니저 목록 조회
  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/v1/admin/managers?page=0&size=100', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const managersData = data.data.content || [];
          setManagers(managersData);
        }
      }
    } catch (err) {
      console.error('Failed to fetch managers:', err);
    }
  };

  // 매니저별 정산 상태 조회
  const fetchManagerSettlements = async (weekStart, weekEnd) => {
    if (!weekStart || !weekEnd) return;

    try {
      const token = localStorage.getItem('accessToken');
      const settlements = {};

      for (const manager of managers) {
        try {
          const response = await fetch(
            `/api/v1/admin/settlements/managers/${manager.id}?page=0&size=50`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              const managerSettlements = data.data || [];
              // 해당 주간에 정산이 있는지 확인
              const weekSettlement = managerSettlements.find(
                (s) => s.from === weekStart && s.to === weekEnd
              );
              settlements[manager.id] = weekSettlement || null;
            }
          }
        } catch (err) {
          console.error(
            `Failed to fetch settlements for manager ${manager.id}:`,
            err
          );
          settlements[manager.id] = null;
        }
      }

      setManagerSettlements(settlements);
    } catch (err) {
      console.error('Failed to fetch manager settlements:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchManagers();
      // 기본값: 이번 주 월요일 ~ 일요일
      const today = new Date();
      const currentDay = today.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const weekStart = monday.toISOString().split('T')[0];
      const weekEnd = sunday.toISOString().split('T')[0];

      setFormData({
        managerId: '',
        weekStart,
        weekEnd,
      });
    }
  }, [isOpen]);

  // 매니저 목록이 로드되고 날짜가 설정되면 정산 상태 조회
  useEffect(() => {
    if (managers.length > 0 && formData.weekStart && formData.weekEnd) {
      fetchManagerSettlements(formData.weekStart, formData.weekEnd);
    }
  }, [managers, formData.weekStart, formData.weekEnd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === 'individual') {
      if (!formData.managerId) {
        alert('매니저를 선택해주세요.');
        return;
      }
      onSubmit(formData);
    } else {
      if (selectedManagers.length === 0) {
        alert('정산을 생성할 매니저를 선택해주세요.');
        return;
      }

      setLoading(true);
      try {
        let successCount = 0;
        let failedManagers = [];

        for (const managerId of selectedManagers) {
          try {
            await onSubmit({
              managerId,
              weekStart: formData.weekStart,
              weekEnd: formData.weekEnd,
            });
            successCount++;
          } catch (err) {
            const manager = managers.find((m) => m.id === managerId);
            const managerName = manager ? manager.name : managerId;
            failedManagers.push(managerName);
            console.log(
              `Settlement creation failed for manager ${managerName}:`,
              err
            );
          }
        }

        if (successCount > 0 && failedManagers.length === 0) {
          alert(`${successCount}명의 매니저 정산이 성공적으로 생성되었습니다.`);
          onClose();
        } else if (successCount > 0 && failedManagers.length > 0) {
          alert(
            `${successCount}명의 정산은 성공했지만, 다음 매니저들은 해당 기간에 결제 내역이 없어 정산 생성에 실패했습니다:\n\n${failedManagers.join(', ')}\n\n다른 기간을 선택해주세요.`
          );
          onClose();
        } else {
          alert(
            `선택한 모든 매니저가 해당 기간(${formData.weekStart} ~ ${formData.weekEnd})에 결제 내역이 없어 정산을 생성할 수 없습니다.\n\n다른 기간을 선택하거나 결제 내역이 있는 매니저를 선택해주세요.`
          );
        }
      } catch (err) {
        console.error('Bulk settlement creation failed:', err);
        alert('일괄 정산 생성 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'weekStart') {
      // 시작일이 변경되면 자동으로 주 단위로 종료일 계산
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // 6일 후 (일주일)

      const weekEnd = endDate.toISOString().split('T')[0];

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        weekEnd: weekEnd,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleManagerSelect = (managerId) => {
    setSelectedManagers((prev) => {
      if (prev.includes(managerId)) {
        return prev.filter((id) => id !== managerId);
      } else {
        return [...prev, managerId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedManagers.length === managers.length) {
      setSelectedManagers([]);
    } else {
      setSelectedManagers(managers.map((m) => m.id));
    }
  };

  const getSettlementStatus = (settlement) => {
    if (!settlement)
      return { text: '미생성', color: 'bg-gray-100 text-gray-800' };
    if (settlement.paidAt)
      return { text: '지급완료', color: 'bg-green-100 text-green-800' };
    if (settlement.confirmedAt)
      return { text: '승인완료', color: 'bg-blue-100 text-blue-800' };
    return { text: '승인대기', color: 'bg-yellow-100 text-yellow-800' };
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₩0';
    return `₩${amount.toLocaleString()}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[95vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-900">
            주간 정산 관리
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'individual'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            개별 정산 생성
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'bulk'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            일괄 정산 관리
          </button>
        </div>

        {/* 날짜 선택 영역 */}
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일 (월요일)
              </label>
              <input
                type="date"
                name="weekStart"
                value={formData.weekStart}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일 (자동 계산됨)
              </label>
              <input
                type="date"
                name="weekEnd"
                value={formData.weekEnd}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
                required
              />
            </div>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-hidden min-h-0">
          {activeTab === 'individual' ? (
            // 개별 정산 생성 탭
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <h4 className="text-lg font-medium text-gray-900">
                  개별 정산 생성
                </h4>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      매니저 선택
                    </label>
                    <select
                      name="managerId"
                      value={formData.managerId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">매니저를 선택하세요</option>
                      {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name} ({manager.specialty})
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.managerId &&
                    managerSettlements[formData.managerId] !== undefined && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          선택된 매니저의 정산 상태
                        </h4>
                        {managerSettlements[formData.managerId] ? (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                정산 금액:
                              </span>
                              <span className="text-sm font-medium">
                                {formatCurrency(
                                  managerSettlements[formData.managerId]
                                    .managerAmount
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                상태:
                              </span>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  getSettlementStatus(
                                    managerSettlements[formData.managerId]
                                  ).color
                                }`}
                              >
                                {
                                  getSettlementStatus(
                                    managerSettlements[formData.managerId]
                                  ).text
                                }
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            해당 기간에 정산 내역이 없습니다.
                          </p>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ) : (
            // 일괄 정산 관리 탭
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-gray-900">
                    매니저 목록
                  </h4>
                  <button
                    onClick={handleSelectAll}
                    className="px-4 py-2 text-sm text-black bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    {selectedManagers.length === managers.length
                      ? '전체 해제'
                      : '전체 선택'}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {managers.map((manager) => {
                      const settlement = managerSettlements[manager.id];
                      const status = getSettlementStatus(settlement);
                      const isSelected = selectedManagers.includes(manager.id);

                      return (
                        <div
                          key={manager.id}
                          onClick={() => handleManagerSelect(manager.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h5 className="font-medium text-gray-900">
                                {manager.name}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {manager.specialty}
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleManagerSelect(manager.id)}
                              className="rounded border-gray-300"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                정산 상태:
                              </span>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}
                              >
                                {status.text}
                              </span>
                            </div>

                            {settlement && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                  정산 금액:
                                </span>
                                <span className="text-xs font-medium text-gray-900">
                                  {formatCurrency(settlement.managerAmount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {activeTab === 'bulk' && (
                <span>{selectedManagers.length}명의 매니저가 선택됨</span>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 text-black bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? '생성 중...' : '정산 생성'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSettlement;
