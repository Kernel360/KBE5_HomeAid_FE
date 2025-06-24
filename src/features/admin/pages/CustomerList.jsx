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

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10, // 한 페이지에 10개씩 표시
    totalElements: 0,
    totalPages: 0,
  });
  const [customerStats, setCustomerStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newToday: 0,
  });

  // 검색 관련 상태 - 리뷰 관리와 동일한 패턴
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');

  // 체크박스 선택 상태
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

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

  // 검색과 필터를 적용한 고객 필터링 - 성능 최적화
  const getFilteredCustomers = () => {
    if (!customers.length) return [];

    let filtered = customers;

    // 검색어 필터링 - 최적화된 버전
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((customer) => {
        switch (searchType) {
          case 'name':
            return customer.name?.toLowerCase().includes(term);
          case 'email':
            return customer.email?.toLowerCase().includes(term);
          case 'phone':
            return customer.phone?.toLowerCase().includes(term);
          case 'all':
          default:
            return (
              customer.name?.toLowerCase().includes(term) ||
              customer.email?.toLowerCase().includes(term) ||
              customer.phone?.toLowerCase().includes(term)
            );
        }
      });
    }

    return filtered;
  };

  const filteredCustomers = getFilteredCustomers();

  // 페이지네이션 적용된 고객 목록
  const getPaginatedCustomers = () => {
    const startIndex = pagination.page * pagination.size;
    const endIndex = startIndex + pagination.size;
    return filteredCustomers.slice(startIndex, endIndex);
  };

  const paginatedCustomers = getPaginatedCustomers();

  // 페이지네이션 정보 업데이트
  const updatePaginationInfo = () => {
    const totalElements = filteredCustomers.length;
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
      pagination.page >= Math.ceil(filteredCustomers.length / pagination.size)
    ) {
      setPagination((prev) => ({ ...prev, page: 0 }));
    }
  }, [filteredCustomers.length, pagination.size]);

  // 페이지 변경 핸들러 - 클라이언트 사이드 페이지네이션
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // API 호출 함수
  const fetchCustomers = async (page = 0, searchData = null) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      // 검색 파라미터 구성
      const params = new URLSearchParams({
        page: page.toString(),
        size: pagination.size.toString(),
      });

      // 검색 조건 추가 - 선택된 범위에 따라 검색
      if (searchData && searchData.query && searchData.query.trim()) {
        const query = searchData.query.trim();

        // 선택된 범위에 따라 검색 파라미터 추가
        switch (searchData.scope) {
          case 'name':
            params.append('name', query);
            break;
          case 'email':
            params.append('email', query);
            break;
          case 'phone':
            params.append('phone', query);
            break;
          case 'all':
          default:
            // 전체 검색인 경우 모든 필드에 검색
            params.append('name', query);
            params.append('email', query);
            params.append('phone', query);
            break;
        }
      }

      const response = await fetch(`/api/v1/admin/customers?${params}`, {
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
        setCustomers(data.data.content || []);
        setPagination({
          page: data.data.currentPage || 0,
          size: data.data.size || 10,
          totalElements: data.data.totalElements || 0,
          totalPages: data.data.totalPages || 0,
        });
      }
    } catch (err) {
      console.error('Customer fetch error:', err);
      setError(err.message);
      // 오류 시 빈 배열로 설정
      setCustomers([]);
      setPagination({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // 통계 데이터 가져오기
  const fetchCustomerStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // 전체 데이터를 가져와서 통계 계산
      const response = await fetch('/api/v1/admin/customers?page=0&size=1000', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const allCustomers = data.data.content || [];
          const today = new Date().toDateString();

          // 탈퇴 여부를 확인하는 함수
          const isWithdrawn = (customer) => {
            return (
              customer.withdrawnAt ||
              customer.deletedAt ||
              customer.isWithdrawn ||
              customer.isDeleted ||
              customer.status === 'WITHDRAWN' ||
              customer.status === 'DELETED'
            );
          };

          const stats = {
            total: allCustomers.length,
            active: allCustomers.filter((c) => !isWithdrawn(c)).length, // 탈퇴하지 않은 회원
            inactive: allCustomers.filter((c) => isWithdrawn(c)).length, // 탈퇴한 회원
            newToday: allCustomers.filter((c) => {
              const createdDate = new Date(c.createdAt || c.joinDate);
              return createdDate.toDateString() === today;
            }).length,
          };
          setCustomerStats(stats);
          console.log('Customer stats updated:', stats);
        }
      }
    } catch (err) {
      console.error('Customer stats fetch error:', err);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchCustomers();
    fetchCustomerStats();
  }, []);

  // 검색 실행
  const handleSearch = () => {
    // 검색 시 첫 페이지로 이동
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  // 검색 초기화
  const handleReset = () => {
    setSearchTerm('');
    setSearchType('all');
    // 초기화 시 첫 페이지로 이동
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  // 엔터 키 검색 핸들러
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 활동 상태 표시 함수
  const getActivityStatus = (customer) => {
    // 탈퇴 여부 확인 - 여러 가능한 필드명 체크
    const isWithdrawn =
      customer.withdrawnAt ||
      customer.deletedAt ||
      customer.isWithdrawn ||
      customer.isDeleted ||
      customer.status === 'WITHDRAWN' ||
      customer.status === 'DELETED';

    // 탈퇴한 회원은 비활성, 그 외는 활성
    return isWithdrawn ? '비활성' : '활성';
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = () => {
    if (isAllSelected) {
      // 전체 해제
      setSelectedCustomers([]);
      setIsAllSelected(false);
    } else {
      // 전체 선택
      const allCustomerIds = customers.map((customer) => customer.id);
      setSelectedCustomers(allCustomerIds);
      setIsAllSelected(true);
    }
  };

  // 개별 고객 선택/해제 핸들러
  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers((prev) => {
      if (prev.includes(customerId)) {
        // 선택 해제
        const newSelected = prev.filter((id) => id !== customerId);
        setIsAllSelected(false);
        return newSelected;
      } else {
        // 선택 추가
        const newSelected = [...prev, customerId];
        setIsAllSelected(newSelected.length === customers.length);
        return newSelected;
      }
    });
  };

  // 고객 데이터가 변경될 때 전체 선택 상태 업데이트
  useEffect(() => {
    if (customers.length > 0) {
      setIsAllSelected(
        selectedCustomers.length === customers.length && customers.length > 0
      );
    } else {
      setIsAllSelected(false);
      setSelectedCustomers([]);
    }
  }, [customers, selectedCustomers.length]);

  const stats = [
    {
      title: '전체 고객',
      value: customerStats.total.toString(),
      subValue: '등록된 고객',
      icon: (
        <svg
          className="w-5 h-5 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      ),
      iconBg: 'bg-blue-100',
    },
    {
      title: '활성 고객',
      value: customerStats.active.toString(),
      subValue: '정상 이용 중',
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
      title: '비활성 고객',
      value: customerStats.inactive.toString(),
      subValue: '탈퇴한 회원',
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
      title: '신규 가입',
      value: customerStats.newToday.toString(),
      subValue: '오늘 가입',
      icon: (
        <svg
          className="w-5 h-5 text-purple-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      iconBg: 'bg-purple-100',
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

          {/* Table */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* 검색 영역 */}
            <div className="p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  수요자 목록
                </h3>
                <div className="flex items-center space-x-3">
                  {/* 검색 범위 선택 */}
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">전체</option>
                    <option value="name">이름</option>
                    <option value="email">이메일</option>
                    <option value="phone">전화번호</option>
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
                      placeholder="검색어를 입력하세요"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    검색
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
                        데이터 로드 오류
                      </h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                      <button
                        onClick={() => fetchCustomers()}
                        className="mt-2 text-sm text-red-800 underline hover:no-underline"
                      >
                        다시 시도
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <colgroup>
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '120px' }} />
                    <col style={{ width: '220px' }} />
                    <col style={{ width: '160px' }} />
                    <col style={{ width: '100px' }} />
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
                        이름
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이메일
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        전화번호
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        매칭수
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
                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-28 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-8 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse mx-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : customers.length === 0 ? (
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
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                              />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              고객 데이터가 없습니다
                            </h3>
                            <p className="text-gray-500">
                              검색 조건을 변경하거나 데이터를 다시 로드해보세요.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      // 실제 데이터
                      paginatedCustomers.map((customer, index) => (
                        <tr
                          key={customer.id || index}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(customer.id)}
                              onChange={() => handleSelectCustomer(customer.id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {customer.email || '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {customer.phone || '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                getActivityStatus(customer) === '활성'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {getActivityStatus(customer)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {customer.matchCount || '0'}건
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            <button className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                              상세보기
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - 매니저 목록과 동일한 스타일 적용 */}
              {!loading &&
                filteredCustomers.length > 0 &&
                pagination.totalPages > 1 && (
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-gray-200 gap-4">
                    <div className="text-sm text-gray-700">
                      {searchTerm ? (
                        <>
                          검색 결과:{' '}
                          <span className="font-medium">
                            {filteredCustomers.length}
                          </span>
                          개{searchTerm && ` (검색어: "${searchTerm}")`}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
