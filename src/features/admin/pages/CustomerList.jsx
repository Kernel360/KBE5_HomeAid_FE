import React, { useState, useEffect } from 'react';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('전체');
  const [searchParams, setSearchParams] = useState({
    userId: '',
    name: '',
    phone: '',
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // API 호출 함수
  const fetchCustomers = async (
    page = 0,
    searchData = searchParams,
    filterStatus = sortBy
  ) => {
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

      // 검색 조건 추가 (이름 또는 전화번호로 검색)
      if (searchData.name && searchData.name.trim()) {
        // 숫자로만 이루어진 경우 전화번호로, 그렇지 않으면 이름으로 검색
        const searchValue = searchData.name.trim();
        const isPhoneNumber = /^\d+$/.test(searchValue.replace(/-/g, ''));

        if (isPhoneNumber) {
          params.append('phone', searchValue);
        } else {
          params.append('name', searchValue);
        }
      }

      // 상태 필터 추가
      if (filterStatus && filterStatus !== '전체') {
        const statusValue = filterStatus === '활성' ? 'true' : 'false';
        params.append('isActive', statusValue);
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

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchCustomers();
  }, []);

  // 검색 실행
  const handleSearch = () => {
    fetchCustomers(0, searchParams, sortBy);
  };

  // 검색 초기화
  const handleReset = () => {
    const resetParams = { userId: '', name: '', phone: '' };
    setSearchParams(resetParams);
    setSortBy('전체');
    fetchCustomers(0, resetParams, '전체');
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    fetchCustomers(newPage, searchParams, sortBy);
  };

  // 필터 상태 변경
  const handleFilterChange = (newFilter) => {
    setSortBy(newFilter);
    fetchCustomers(0, searchParams, newFilter);
  };

  // 활동 상태 표시 함수
  const getActivityStatus = (customer) => {
    // 백엔드에서 받은 isActive 필드를 기반으로 상태 표시
    return customer.isActive ? '활성' : '비활성';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-none space-y-6">
          {/* Search Section */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-end space-x-3">
              <h3 className="text-base font-semibold text-gray-900">
                고객 검색
              </h3>
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
                  value={searchParams.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchParams({
                      userId: '',
                      name: value,
                      phone: value,
                    });
                  }}
                  placeholder="이름 또는 전화번호로 검색"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
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
                disabled={loading}
                className="px-4 py-2 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loading ? '검색 중...' : '검색'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
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

          {/* Table */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-gray-200 gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                수요자 목록
              </h3>
              <div className="flex items-center space-x-3">
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>전체</option>
                  <option>활성</option>
                  <option>비활성</option>
                </select>
                <span className="text-sm text-gray-500">⋯</span>
              </div>
            </div>

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
                    customers.map((customer, index) => (
                      <tr
                        key={customer.id || index}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
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
                                : 'bg-gray-100 text-gray-800'
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
  );
};

export default CustomerList;
