import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

// 고객 상세 모달 컴포넌트
const CustomerDetailModal = ({
  isOpen,
  onClose,
  customer,
  customerDetail,
  loading,
}) => {
  if (!isOpen || !customer) return null;

  return (
    <div
      className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg border border-gray-200">
        <div className="p-6">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              고객 상세 정보
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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

          {/* 프로필 정보 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              프로필 정보
            </h3>
            {loading ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-gray-500">
                  프로필 정보를 불러오는 중...
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    {(() => {
                      // 가능한 모든 프로필 이미지 필드 확인
                      const profileImage =
                        customerDetail?.profile?.profileImage ||
                        customerDetail?.profile?.imageUrl ||
                        customerDetail?.profile?.image ||
                        customerDetail?.profileImage ||
                        customerDetail?.imageUrl ||
                        customerDetail?.image ||
                        customerDetail?.profile?.profileImageUrl;

                      if (profileImage) {
                        // 캐싱 방지를 위해 timestamp 추가
                        const imageUrl = profileImage.includes('?')
                          ? `${profileImage}&t=${Date.now()}`
                          : `${profileImage}?t=${Date.now()}`;

                        return (
                          <img
                            src={imageUrl}
                            alt="프로필 이미지"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log(
                                'Profile image load failed:',
                                imageUrl
                              );
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display =
                                'flex';
                            }}
                          />
                        );
                      }
                      return null;
                    })()}
                    <span
                      className="text-blue-600 font-semibold w-full h-full flex items-center justify-center"
                      style={{
                        display: (() => {
                          const hasImage =
                            customerDetail?.profile?.profileImage ||
                            customerDetail?.profile?.imageUrl ||
                            customerDetail?.profile?.image ||
                            customerDetail?.profileImage ||
                            customerDetail?.imageUrl ||
                            customerDetail?.image ||
                            customerDetail?.profile?.profileImageUrl;
                          return hasImage ? 'none' : 'flex';
                        })(),
                      }}
                    >
                      {customerDetail?.profile?.name?.charAt(0) ||
                        customer.name?.charAt(0) ||
                        '?'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {customerDetail?.profile?.name || customer.name || '-'}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {customer.id}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      이메일
                    </label>
                    <div className="text-gray-900">
                      {customerDetail?.profile?.email || customer.email || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      전화번호
                    </label>
                    <div className="text-gray-900">
                      {customerDetail?.profile?.phone || customer.phone || '-'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 주소 정보 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              등록된 주소
            </h3>
            {customerDetail?.addresses &&
            customerDetail.addresses.length > 0 ? (
              <div className="space-y-3">
                {customerDetail.addresses.map((address, index) => (
                  <div
                    key={address.id || index}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-blue-600">
                            {address.alias || `주소 ${index + 1}`}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            ID: {address.id}
                          </span>
                        </div>
                        <div className="text-gray-900 mb-1">
                          {address.fullAddress ||
                            `${address.address || ''} ${address.addressDetail || ''}`.trim()}
                        </div>
                        {(address.latitude || address.longitude) && (
                          <div className="text-sm text-gray-500">
                            위도: {address.latitude || '-'}, 경도:{' '}
                            {address.longitude || '-'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                등록된 주소가 없습니다.
              </div>
            )}
          </div>

          {/* 기타 정보 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              기타 정보
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    매칭 수
                  </label>
                  <div className="text-gray-900">
                    {customer.matchCount || 0}건
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    가입일
                  </label>
                  <div className="text-gray-900">
                    {customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString('ko-KR')
                      : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 모달 푸터 */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 한글 입력 처리를 위한 상태
  const [isComposing, setIsComposing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [customerStats, setCustomerStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newToday: 0,
  });

  // 고객 상세 모달 상태
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    customer: null,
    customerDetail: null,
  });

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        page: newPage,
      }));
    }
  };

  // 개별 필드 검색을 위한 API 호출 함수
  const fetchCustomersByField = async (field, query, page) => {
    const token = localStorage.getItem('accessToken');
    const params = new URLSearchParams({
      page: page.toString(),
      size: '50', // 전체 검색 시 더 많은 결과 가져오기
    });

    params.append(field, query);

    const response = await fetch(
      `${API_URL}/api/v1/admin/customers?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success && data.data ? data.data.content || [] : [];
  };

  // API 호출 함수 - 전체 검색 시 OR 조건 지원
  const fetchCustomers = async (page = 0, searchData = null) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      // 전체 검색인 경우 OR 조건을 위해 각 필드별로 검색 후 결합
      if (
        searchData &&
        searchData.query &&
        searchData.query.trim() &&
        searchData.scope === 'all'
      ) {
        const query = searchData.query.trim();

        console.log('전체 검색 실행:', query);

        // 병렬로 각 필드 검색 실행
        const [nameResults, emailResults, phoneResults] = await Promise.all([
          fetchCustomersByField('name', query, 0),
          fetchCustomersByField('email', query, 0),
          fetchCustomersByField('phone', query, 0),
        ]);

        // 중복 제거하여 결과 합치기 (id 기준)
        const allResults = [...nameResults, ...emailResults, ...phoneResults];
        const uniqueResults = allResults.filter(
          (customer, index, arr) =>
            arr.findIndex((c) => c.id === customer.id) === index
        );

        console.log('전체 검색 결과:', {
          name: nameResults.length,
          email: emailResults.length,
          phone: phoneResults.length,
          unique: uniqueResults.length,
        });

        // 페이징 처리
        const pageSize = 10;
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedResults = uniqueResults.slice(startIndex, endIndex);

        setCustomers(paginatedResults);
        setPagination({
          page: page,
          size: pageSize,
          totalElements: uniqueResults.length,
          totalPages: Math.ceil(uniqueResults.length / pageSize),
        });

        return;
      }

      // 개별 필드 검색 또는 검색어 없는 경우
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10',
      });

      // 개별 필드 검색
      if (searchData && searchData.query && searchData.query.trim()) {
        const query = searchData.query.trim();
        const scope = searchData.scope;

        switch (scope) {
          case 'name':
            params.append('name', query);
            break;
          case 'email':
            params.append('email', query);
            break;
          case 'phone':
            params.append('phone', query);
            break;
        }
      }

      console.log('개별 검색 실행:', Object.fromEntries(params));

      const response = await fetch(
        `${API_URL}/api/v1/admin/customers?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setCustomers(data.data.content || []);
        setPagination({
          page: data.data.currentPage || data.data.number || 0,
          size: data.data.size || 10,
          totalElements: data.data.totalElements || 0,
          totalPages: data.data.totalPages || 0,
        });
      } else {
        setCustomers([]);
        setPagination({
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        });
      }
    } catch (err) {
      console.error('Customer fetch error:', err);
      setError(err.message);
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

      // 전체 데이터를 가져와서 통계 계산 - 더 큰 size 사용
      const response = await fetch(
        '/api/v1/admin/customers?page=0&size=10000',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Customer stats API response:', data);

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

  // 디바운스된 검색 - 한글 입력 최적화
  useEffect(() => {
    // 한글 조합 중일 때는 검색하지 않음
    if (isComposing) return;

    const timeoutId = setTimeout(() => {
      // 검색어가 있을 때만 검색 실행 (500ms 디바운스)
      if (searchTerm.trim()) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchType, isComposing]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchCustomers(pagination.page);
    fetchCustomerStats();
  }, [pagination.page]);

  // 검색 실행
  const handleSearch = () => {
    console.log('Search triggered:', { searchTerm, searchType });
    // 검색 시 첫 페이지로 이동
    setPagination((prev) => ({ ...prev, page: 0 }));

    // 검색 데이터 구성
    const searchData = searchTerm.trim()
      ? {
          query: searchTerm.trim(),
          scope: searchType,
        }
      : null;

    // API 호출
    fetchCustomers(0, searchData);
  };

  // 검색 초기화
  const handleReset = () => {
    const wasSearching = searchTerm.trim() !== '';

    setSearchTerm('');
    setSearchType('all');

    // 검색어가 있었을 때만 데이터 다시 로드
    if (wasSearching) {
      setPagination((prev) => ({ ...prev, page: 0 }));
      fetchCustomers(0, null);
    }
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

  // 고객 상세 정보 조회
  const fetchCustomerDetail = async (customerId) => {
    try {
      setDetailModal((prev) => ({ ...prev, loading: true }));

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      // 캐시 방지를 위해 timestamp 추가
      const url = `${API_URL}/api/v1/admin/customers/${customerId}?t=${Date.now()}`;

      const response = await fetch(url, {
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
      console.log('Customer detail API response:', data); // 디버깅용

      if (data.success && data.data) {
        setDetailModal((prev) => ({
          ...prev,
          customerDetail: data.data,
          loading: false,
        }));
      } else {
        throw new Error('고객 상세 정보를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('고객 상세 정보 조회 오류:', err);
      setDetailModal((prev) => ({ ...prev, loading: false }));
      alert('고객 상세 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  // 상세보기 버튼 클릭 핸들러
  const handleDetailClick = async (customer) => {
    setDetailModal({
      isOpen: true,
      customer,
      customerDetail: null,
      loading: true, // 로딩 상태로 변경
    });

    // 상세 정보 조회 (캐시 방지)
    await fetchCustomerDetail(customer.id);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setDetailModal({
      isOpen: false,
      customer: null,
      customerDetail: null,
    });
  };

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
                      onCompositionStart={() => setIsComposing(true)}
                      onCompositionEnd={() => setIsComposing(false)}
                      placeholder={
                        searchType === 'all'
                          ? '이름, 이메일, 전화번호에서 통합 검색'
                          : searchType === 'name'
                            ? '이름을 입력하세요'
                            : searchType === 'email'
                              ? '이메일을 입력하세요'
                              : '전화번호를 입력하세요'
                      }
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
                        <td colSpan="6" className="px-4 py-12 text-center">
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
                            <button
                              onClick={() => handleDetailClick(customer)}
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

              {/* Pagination - 매니저 목록과 동일한 스타일 적용 */}
              {!loading &&
                customers.length > 0 &&
                pagination.totalPages > 1 && (
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-gray-200 gap-4">
                    <div className="text-sm text-gray-700">
                      {searchTerm ? (
                        <>
                          검색 결과:{' '}
                          <span className="font-medium">
                            {customers.length}
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

      {/* 고객 상세 모달 */}
      <CustomerDetailModal
        isOpen={detailModal.isOpen}
        onClose={handleCloseModal}
        customer={detailModal.customer}
        customerDetail={detailModal.customerDetail}
        loading={detailModal.loading}
      />
    </div>
  );
};

export default CustomerList;
