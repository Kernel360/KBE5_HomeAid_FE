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

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('전체조회');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('전체');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    fiveStarReviews: 0,
    managementRequired: 0,
    customerReviews: 0,
    managerReviews: 0,
  });

  // 토큰 검증 함수
  const validateToken = (token) => {
    if (!token) return { valid: false, reason: '토큰이 없음' };

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, reason: 'JWT 형식이 아님' };
      }

      const payload = JSON.parse(atob(parts[1]));

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return { valid: false, reason: '토큰이 만료됨' };
      }

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
    } catch {
      return { valid: false, reason: '토큰 파싱 실패' };
    }
  };

  // API 호출 함수 - 최적화된 버전
  const fetchReviews = async (writerRole = null, page = 0) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/auth/signin';
        return;
      }

      const tokenValidation = validateToken(token);
      if (!tokenValidation.valid) {
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/signin';
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        size: '50', // 페이지 크기를 늘려서 API 호출 횟수 감소
        sort: 'createdAt,desc',
      });

      if (writerRole) {
        params.append('writerRole', writerRole);
      }

      const response = await api.get(`/admin/reviews?${params.toString()}`);

      if (response.data && response.data.success) {
        const reviewData = response.data.data;
        setReviews(reviewData.content || []);
        setPagination({
          page: reviewData.number || 0,
          size: reviewData.size || 50,
          totalElements: reviewData.totalElements || 0,
          totalPages: reviewData.totalPages || 0,
        });

        // 전체 데이터인 경우 통계 계산을 위해 저장
        if (!writerRole) {
          calculateStats(reviewData.content || []);
        }
      }
    } catch (error) {
      console.error('리뷰 데이터 가져오기 실패:', error);

      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/signin';
        return;
      }
      setError(
        error.response?.data?.message || '리뷰 데이터를 가져올 수 없습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 통계 계산 함수 - 성능 최적화
  const calculateStats = (reviewsData) => {
    if (!reviewsData.length) {
      setReviewStats({
        totalReviews: 0,
        averageRating: 0,
        fiveStarReviews: 0,
        managementRequired: 0,
        customerReviews: 0,
        managerReviews: 0,
      });
      return;
    }

    // 한 번의 순회로 모든 통계 계산
    const stats = reviewsData.reduce(
      (acc, review) => {
        acc.totalReviews++;
        acc.totalRating += review.rating || 0;

        if (review.writerRole === 'CUSTOMER') acc.customerReviews++;
        else if (review.writerRole === 'MANAGER') acc.managerReviews++;

        if (review.rating === 5) acc.fiveStarReviews++;
        if (review.rating <= 3) acc.managementRequired++;

        return acc;
      },
      {
        totalReviews: 0,
        totalRating: 0,
        customerReviews: 0,
        managerReviews: 0,
        fiveStarReviews: 0,
        managementRequired: 0,
      }
    );

    const averageRating =
      stats.totalReviews > 0
        ? parseFloat((stats.totalRating / stats.totalReviews).toFixed(1))
        : 0;

    setReviewStats({
      totalReviews: stats.totalReviews,
      averageRating,
      fiveStarReviews: stats.fiveStarReviews,
      managementRequired: stats.managementRequired,
      customerReviews: stats.customerReviews,
      managerReviews: stats.managerReviews,
    });
  };

  // 탭별 개수 반환
  const getTabCount = (status) => {
    switch (status) {
      case 'CUSTOMER':
        return reviewStats.customerReviews;
      case 'MANAGER':
        return reviewStats.managerReviews;
      default:
        return reviewStats.totalReviews;
    }
  };

  const tabs = [
    {
      key: '전체조회',
      label: `전체조회 (${getTabCount(null)})`,
      writerRole: null,
    },
    {
      key: '수요자리뷰',
      label: `수요자리뷰 (${getTabCount('CUSTOMER')})`,
      writerRole: 'CUSTOMER',
    },
    {
      key: '매니저리뷰',
      label: `매니저리뷰 (${getTabCount('MANAGER')})`,
      writerRole: 'MANAGER',
    },
  ];

  useEffect(() => {
    fetchReviews();
  }, []);

  // 디바운스된 검색 - 성능 최적화
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // 검색어나 필터가 변경된 후 300ms 후에 실행
      // 실시간 필터링은 클라이언트 사이드에서만 수행하므로 API 호출 없음
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStatus]);

  const handleTabChange = (tabKey) => {
    setSelectedTab(tabKey);
    const selectedTab = tabs.find((tab) => tab.key === tabKey);
    fetchReviews(selectedTab.writerRole, 0);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    const selectedTab = tabs.find((tab) => tab.key === selectedTab);
    fetchReviews(selectedTab?.writerRole, newPage);
  };

  const handleSearch = () => {
    const selectedTabData = tabs.find((tab) => tab.key === selectedTab);
    fetchReviews(selectedTabData?.writerRole, 0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchType('all');
    setFilterStatus('전체');
    const selectedTabData = tabs.find((tab) => tab.key === selectedTab);
    fetchReviews(selectedTabData?.writerRole, 0);
  };

  // 검색과 필터를 적용한 리뷰 필터링 - 성능 최적화
  const getFilteredReviews = () => {
    if (!reviews.length) return [];

    let filtered = reviews;

    // 검색어 필터링 - 최적화된 버전
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((review) => {
        switch (searchType) {
          case 'customerName':
            return (
              review.writerRole === 'CUSTOMER' &&
              review.writerName?.toLowerCase().includes(term)
            );
          case 'managerName':
            return (
              review.writerRole === 'MANAGER' &&
              review.writerName?.toLowerCase().includes(term)
            );
          case 'content':
            return review.content?.toLowerCase().includes(term);
          case 'all':
          default:
            return (
              review.writerName?.toLowerCase().includes(term) ||
              review.targetName?.toLowerCase().includes(term) ||
              review.content?.toLowerCase().includes(term) ||
              review.serviceName?.toLowerCase().includes(term)
            );
        }
      });
    }

    // 평점 필터링 - 최적화된 버전
    if (filterStatus !== '전체' && filterStatus !== '평점:') {
      const rating = parseInt(filterStatus.replace('점', ''));
      if (!isNaN(rating) && rating >= 1 && rating <= 5) {
        filtered = filtered.filter((review) => review.rating === rating);
      }
    }

    return filtered;
  };

  const filteredReviews = getFilteredReviews();

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.delete(`/admin/reviews/${reviewId}`);

      // 삭제 후 목록 새로고침
      const selectedTab = tabs.find((tab) => tab.key === selectedTab);
      fetchReviews(selectedTab?.writerRole, pagination.page);
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      alert('리뷰 삭제에 실패했습니다.');
    }
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'customerName':
        return '고객명을 입력하세요';
      case 'managerName':
        return '매니저명을 입력하세요';
      case 'content':
        return '리뷰 내용을 입력하세요';
      case 'all':
      default:
        return '검색어를 입력하세요';
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 리뷰 내용 짧게 표시
  const truncateContent = (content, maxLength = 10) => {
    if (!content) return '상세보기';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // 상세 리뷰 모달 열기
  const openReviewModal = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  // 상세 리뷰 모달 닫기
  const closeReviewModal = () => {
    setSelectedReview(null);
    setIsModalOpen(false);
  };

  // 리뷰 상세보기 모달 컴포넌트
  const ReviewDetailModal = () => {
    if (!selectedReview || !isModalOpen) return null;

    // 리뷰 내용 필드명 확인 (다양한 가능성 체크)
    const reviewContent =
      selectedReview.content ||
      selectedReview.reviewContent ||
      selectedReview.comment ||
      selectedReview.description ||
      selectedReview.text ||
      '작성된 리뷰 내용이 없습니다.';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* 모달 헤더 */}
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">리뷰 상세보기</h2>
              <button
                onClick={closeReviewModal}
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

            {/* 평점 */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">평점</h3>
              <div className="flex items-center space-x-2">
                {renderStars(selectedReview.rating || 0)}
                <span className="text-lg font-semibold text-gray-900">
                  {selectedReview.rating || 0}점
                </span>
              </div>
            </div>

            {/* 작성자 정보 */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">작성자</h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900">
                  {selectedReview.writerName || '상세보기'}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedReview.writerRole === 'CUSTOMER'
                    ? '수요자'
                    : '매니저'}{' '}
                  | ID: {selectedReview.writerId || '상세보기'}
                </div>
              </div>
            </div>

            {/* 대상자 정보 */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">대상자</h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900">
                  {selectedReview.targetName || '상세보기'}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedReview.targetRole === 'CUSTOMER'
                    ? '수요자'
                    : '매니저'}{' '}
                  | ID: {selectedReview.targetId || '상세보기'}
                </div>
              </div>
            </div>

            {/* 서비스 정보 */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">서비스</h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900">
                  {selectedReview.serviceName || '상세보기'}
                </div>
                <div className="text-sm text-gray-500">
                  예약 ID: {selectedReview.reservationId || '상세보기'}
                </div>
              </div>
            </div>

            {/* 리뷰 내용 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                리뷰 내용
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {reviewContent}
                </p>
              </div>
            </div>

            {/* 작성일 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">작성일</h3>
              <div className="text-sm text-gray-900">
                {formatDate(selectedReview.createdAt)}
              </div>
            </div>

            {/* 모달 액션 버튼 */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeReviewModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  handleDeleteReview(selectedReview.id);
                  closeReviewModal();
                }}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-red-50 rounded-lg transition-colors font-medium"
                style={{ color: '#ef4444' }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">
            오류가 발생했습니다
          </div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => fetchReviews()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white">
        <div className="max-w-none space-y-6">
          {/* 통계 카드 */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            <StatCard
              title="전체 리뷰"
              value={`${reviewStats.totalReviews}건`}
              subValue={`수요자: ${reviewStats.customerReviews}건\n매니저: ${reviewStats.managerReviews}건`}
              icon={
                <svg
                  className="w-5 h-5 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              }
              iconBg="bg-yellow-100"
            />
            <StatCard
              title="평균 평점"
              value={`${reviewStats.averageRating}점`}
              subValue={`만족도: ${reviewStats.averageRating >= 4 ? '높음' : reviewStats.averageRating >= 3 ? '보통' : '낮음'}\n평가 기준: 5점 만점`}
              icon={
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"
                  />
                </svg>
              }
              iconBg="bg-green-100"
            />
            <StatCard
              title="5점 리뷰"
              value={`${reviewStats.fiveStarReviews}건`}
              subValue={`전체 중: ${reviewStats.totalReviews > 0 ? ((reviewStats.fiveStarReviews / reviewStats.totalReviews) * 100).toFixed(1) : 0}%\n우수 평가`}
              icon={
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              iconBg="bg-green-100"
            />
            <StatCard
              title="처리필요 리뷰"
              value={`${reviewStats.managementRequired}건`}
              subValue={`3점 이하: 관리 필요\n전체 중: ${reviewStats.totalReviews > 0 ? ((reviewStats.managementRequired / reviewStats.totalReviews) * 100).toFixed(1) : 0}%`}
              icon={
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              iconBg="bg-red-100"
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
                    selectedTab === tab.key
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
                  리뷰 목록 {selectedTab !== '전체조회' && `- ${selectedTab}`}
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
                    <option value="managerName">매니저명</option>
                    <option value="content">리뷰내용</option>
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
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
                    className="px-4 py-2 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    검색
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>평점:</option>
                  <option>전체</option>
                  <option>5점</option>
                  <option>4점</option>
                  <option>3점</option>
                  <option>2점</option>
                  <option>1점</option>
                </select>

                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>상태:</option>
                  <option>전체</option>
                  <option>정상</option>
                  <option>블라인드</option>
                  <option>신고됨</option>
                </select>
              </div>

              {/* 로딩 상태 */}
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
                    <p className="text-gray-500">리뷰를 불러오는 중...</p>
                  </div>
                </div>
              )}

              {/* Table */}
              {!loading && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          평점
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          작성자
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          대상자
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          리뷰내용
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          서비스
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          작성일
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          관리
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReviews.length === 0 ? (
                        <tr>
                          <td
                            colSpan="8"
                            className="px-6 py-12 text-center text-gray-500"
                          >
                            등록된 리뷰가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredReviews.map((review) => (
                          <tr key={review.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {renderStars(review.rating || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-medium text-gray-900">
                                {review.writerName || '상세보기'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {review.writerRole === 'CUSTOMER'
                                  ? '수요자'
                                  : '매니저'}{' '}
                                | ID: {review.writerId || '상세보기'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-medium text-gray-900">
                                {review.targetName || '상세보기'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {review.targetRole === 'CUSTOMER'
                                  ? '수요자'
                                  : '매니저'}{' '}
                                | ID: {review.targetId || '상세보기'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => openReviewModal(review)}
                                className="text-sm text-gray-900 max-w-xs hover:text-blue-600 cursor-pointer transition-colors"
                              >
                                {truncateContent(review.content)}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-medium text-gray-900">
                                {review.serviceName || '상세보기'}
                              </div>
                              <div className="text-sm text-gray-500">
                                예약 ID: {review.reservationId || '상세보기'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-900">
                                {formatDate(review.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="px-3 py-1 text-sm hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                style={{ color: '#ef4444' }}
                              >
                                삭제
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!loading && filteredReviews.length > 0 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {searchTerm || filterStatus !== '전체' ? (
                      <>
                        검색 결과:{' '}
                        <span className="font-medium">
                          {filteredReviews.length}
                        </span>
                        개{searchTerm && ` (검색어: "${searchTerm}")`}
                        {filterStatus !== '전체' && ` (평점: ${filterStatus})`}
                      </>
                    ) : (
                      <>
                        총{' '}
                        <span className="font-medium">
                          {pagination.totalElements}
                        </span>
                        개 중{' '}
                        <span className="font-medium">
                          {pagination.page * pagination.size + 1}-
                          {Math.min(
                            (pagination.page + 1) * pagination.size,
                            pagination.totalElements
                          )}
                        </span>
                        개 표시
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 0}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        const pageNum =
                          Math.max(
                            0,
                            Math.min(
                              pagination.page - 2,
                              pagination.totalPages - 5
                            )
                          ) + i;
                        return pageNum < pagination.totalPages ? (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded-md text-sm ${
                              pagination.page === pageNum
                                ? 'bg-blue-500 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        ) : null;
                      }
                    )}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages - 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {ReviewDetailModal()}
    </div>
  );
};

export default ReviewManagement;
