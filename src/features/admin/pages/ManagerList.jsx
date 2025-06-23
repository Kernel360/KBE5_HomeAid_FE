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

const ManagerList = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('전체');
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    pending: 0,
    review: 0,
    active: 0,
    rejected: 0,
  });

  // 검색 관련 상태 추가
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // 통합 검색어
  const [searchScope, setSearchScope] = useState('all'); // 체크박스 대신 단일 선택

  // 체크박스 선택 상태 추가
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // 탭 이름과 API 상태값 매핑
  const getStatusForAPI = (tabName) => {
    const statusMap = {
      전체: null,
      승인대기: 'PENDING',
      검토중: 'REVIEW',
      승인완료: 'ACTIVE',
      반려: 'REJECTED',
    };
    return statusMap[tabName];
  };

  // 매니저 상태 한글 변환
  const getStatusText = (status) => {
    const statusMap = {
      PENDING: '승인대기',
      REVIEW: '검토중',
      ACTIVE: '승인완료',
      REJECTED: '반려',
    };
    return statusMap[status] || status;
  };

  // 매니저 상태 색상
  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      REVIEW: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // API 호출 함수
  const fetchManagers = async (
    page = 0,
    filterStatus = null,
    searchData = null
  ) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      // 검색 파라미터 구성 - size를 고정값으로 사용
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10', // 고정값 사용
      });

      // 상태 필터 추가 - API 상태값으로 변환
      const apiStatus = getStatusForAPI(filterStatus);
      if (apiStatus) {
        params.append('status', apiStatus);
      }

      // 검색 파라미터 추가
      if (searchData) {
        const query = searchData.query;
        const scope = searchData.scope;

        if (query && query.trim()) {
          // 선택된 범위에 따라 검색 파라미터 추가
          switch (scope) {
            case 'name':
              params.append('name', query.trim());
              break;
            case 'email':
              params.append('email', query.trim());
              break;
            case 'phone':
              params.append('phone', query.trim());
              break;
            case 'career':
              params.append('career', query.trim());
              break;
            case 'all':
            default:
              // 전체 검색인 경우 모든 필드에 검색
              params.append('name', query.trim());
              params.append('email', query.trim());
              params.append('phone', query.trim());
              params.append('career', query.trim());
              break;
          }
        }
      }

      console.log('Fetching managers with params:', Object.fromEntries(params));
      console.log('Filter status:', filterStatus, '-> API status:', apiStatus);
      console.log('Search params:', searchData);

      const response = await fetch(`/api/v1/admin/managers?${params}`, {
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
        setManagers(data.data.content || []);
        setPagination({
          page: data.data.currentPage || 0,
          size: data.data.size || 10,
          totalElements: data.data.totalElements || 0,
          totalPages: data.data.totalPages || 0,
        });
      } else {
        console.warn('No data received from API');
        setManagers([]);
      }
    } catch (err) {
      console.error('Manager fetch error:', err);
      setError(err.message);
      setManagers([]);
      setPagination({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  // 전체 매니저 데이터로 상태별 카운트 계산
  const fetchStatusCounts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // 전체 데이터를 가져와서 상태별 카운트 계산
      const response = await fetch('/api/v1/admin/managers?page=0&size=1000', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const allManagers = data.data.content || [];
          const counts = {
            total: allManagers.length,
            pending: allManagers.filter((m) => m.status === 'PENDING').length,
            review: allManagers.filter((m) => m.status === 'REVIEW').length,
            active: allManagers.filter((m) => m.status === 'ACTIVE').length,
            rejected: allManagers.filter((m) => m.status === 'REJECTED').length,
          };
          setStatusCounts(counts);
          console.log('Status counts updated:', counts);
        }
      }
    } catch (err) {
      console.error('Status counts fetch error:', err);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    console.log('Component mounted, initial load');
    fetchManagers(0, activeTab, null);
    fetchStatusCounts();
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // 탭 변경 핸들러
  const handleTabChange = (tab) => {
    console.log('=== Tab Change ===');
    console.log('Previous tab:', activeTab);
    console.log('New tab:', tab);
    console.log('Current managers count:', managers.length);

    // 즉시 상태 업데이트
    setActiveTab(tab);

    // 페이지를 0으로 리셋
    setPagination((prev) => ({
      ...prev,
      page: 0,
    }));

    // 매니저 리스트 즉시 초기화하고 로딩 상태 설정
    setManagers([]);
    setLoading(true);
    setError(null);

    // 현재 검색 상태 유지하면서 새로운 데이터 fetch
    const searchData = searchQuery.trim()
      ? {
          query: searchQuery.trim(),
          scope: searchScope,
        }
      : null;
    fetchManagers(0, tab, searchData);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    const searchData = searchQuery.trim()
      ? {
          query: searchQuery.trim(),
          scope: searchScope,
        }
      : null;
    fetchManagers(newPage, activeTab, searchData);
  };

  // 매니저 상태 변경
  const updateManagerStatus = async (managerId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await fetch(
        `/api/v1/admin/managers/${managerId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 성공 시 데이터 새로고침 - 현재 검색 상태 유지
      const searchData = searchQuery.trim()
        ? {
            query: searchQuery.trim(),
            scope: searchScope,
          }
        : null;
      fetchManagers(pagination.page, activeTab, searchData);
      fetchStatusCounts(); // 상태 카운트도 업데이트
    } catch (err) {
      console.error('Status update error:', err);
      setError('상태 변경에 실패했습니다.');
    }
  };

  // 검색 실행 함수
  const handleSearch = () => {
    console.log('Search triggered with query:', searchQuery);
    setIsSearching(true);

    // 페이지를 0으로 리셋하고 검색 실행
    setPagination((prev) => ({
      ...prev,
      page: 0,
    }));

    // 통합 검색어를 이름, 경력, 전화번호 모든 필드에 적용
    const searchData = searchQuery.trim()
      ? {
          query: searchQuery.trim(),
          scope: searchScope,
        }
      : null;
    fetchManagers(0, activeTab, searchData);
  };

  // 검색 초기화 함수
  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchScope('all');

    // 검색 초기화 후 현재 탭의 데이터 다시 로드
    setPagination((prev) => ({
      ...prev,
      page: 0,
    }));

    fetchManagers(0, activeTab, null);
  };

  // 엔터 키 검색 핸들러
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = () => {
    if (isAllSelected) {
      // 전체 해제
      setSelectedManagers([]);
      setIsAllSelected(false);
    } else {
      // 전체 선택
      const allManagerIds = managers.map((manager) => manager.id);
      setSelectedManagers(allManagerIds);
      setIsAllSelected(true);
    }
  };

  // 개별 매니저 선택/해제 핸들러
  const handleSelectManager = (managerId) => {
    setSelectedManagers((prev) => {
      if (prev.includes(managerId)) {
        // 선택 해제
        const newSelected = prev.filter((id) => id !== managerId);
        setIsAllSelected(false);
        return newSelected;
      } else {
        // 선택 추가
        const newSelected = [...prev, managerId];
        setIsAllSelected(newSelected.length === managers.length);
        return newSelected;
      }
    });
  };

  // 매니저 데이터가 변경될 때 전체 선택 상태 업데이트
  useEffect(() => {
    if (managers.length > 0) {
      setIsAllSelected(
        selectedManagers.length === managers.length && managers.length > 0
      );
    } else {
      setIsAllSelected(false);
      setSelectedManagers([]);
    }
  }, [managers, selectedManagers.length]);

  const tabs = [
    { key: '전체', label: `전체 (${statusCounts.total})` },
    { key: '승인대기', label: `승인대기 (${statusCounts.pending})` },
    { key: '검토중', label: `검토중 (${statusCounts.review})` },
    { key: '승인완료', label: `승인완료 (${statusCounts.active})` },
    { key: '반려', label: `반려 (${statusCounts.rejected})` },
  ];

  const stats = [
    {
      title: '승인 대기',
      value: statusCounts.pending.toString(),
      subValue: '신규 신청',
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
      title: '검토 중',
      value: statusCounts.review.toString(),
      subValue: '서류 검토',
      icon: (
        <svg
          className="w-5 h-5 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
            clipRule="evenodd"
          />
        </svg>
      ),
      iconBg: 'bg-blue-100',
    },
    {
      title: '승인 완료',
      value: statusCounts.active.toString(),
      subValue: '활성 매니저',
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
      title: '반려',
      value: statusCounts.rejected.toString(),
      subValue: '신청 거절',
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
              />
            ))}
          </div>

          {/* Tabs and Table */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs */}
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
                  매니저 목록 {activeTab !== '전체' && `- ${activeTab}`}
                </h3>
                <div className="flex items-center space-x-3">
                  {/* 검색 범위 선택 */}
                  <select
                    value={searchScope}
                    onChange={(e) => setSearchScope(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">전체</option>
                    <option value="name">이름</option>
                    <option value="email">이메일</option>
                    <option value="phone">전화번호</option>
                    <option value="career">경력</option>
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
                      onKeyDown={handleKeyPress}
                      placeholder="검색어를 입력하세요"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSearching}
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
                    disabled={isSearching}
                    className="px-4 py-2 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isSearching ? '검색 중...' : '검색'}
                  </button>
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
                <table className="w-full min-w-[1000px]">
                  <colgroup>
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '180px' }} />
                    <col style={{ width: '120px' }} />
                    <col style={{ width: '100px' }} />
                    <col style={{ width: '120px' }} />
                    <col style={{ width: '100px' }} />
                    <col style={{ width: '120px' }} />
                  </colgroup>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        매니저 정보
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        경력
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        전문분야
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        평점
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상세보기
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
                            <div className="space-y-2">
                              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                              <div className="w-24 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : managers.length === 0 ? (
                      // 데이터 없음
                      <tr>
                        <td colSpan="7" className="px-4 py-12 text-center">
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              매니저 데이터가 없습니다
                            </h3>
                            <p className="text-gray-500">
                              조건에 맞는 매니저가 없거나 데이터를 불러올 수
                              없습니다.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      // 실제 데이터
                      managers.map((manager, index) => (
                        <tr
                          key={manager.id || index}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={selectedManagers.includes(manager.id)}
                              onChange={() => handleSelectManager(manager.id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {manager.name || '-'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {manager.phone || '-'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {manager.experience || '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {manager.specialty || manager.career || '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(manager.status)}`}
                            >
                              {getStatusText(manager.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {manager.rating || '⭐ 신규'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            <button
                              onClick={() =>
                                updateManagerStatus(manager.id, 'ACTIVE')
                              }
                              className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              상세보기
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
                        pagination.page >= pagination.totalPages - 1 || loading
                      }
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerList;
