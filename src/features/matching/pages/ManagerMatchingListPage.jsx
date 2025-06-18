import React, { useEffect } from 'react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ManagerMatchingDetail from '@/features/matching/pages/ManagerMatchingDetail.jsx';

// 분리된 훅들
import { useMatchingList } from '@/features/matching/hooks/useMatchingList.js';
import { useMatchingData } from '@/features/matching/hooks/useMatchingData.js';
import { useMatchingActions } from '@/features/matching/hooks/useMatchingActions.js';

// 분리된 컴포넌트들
import TabNavigation from '@/features/matching/components/TabNavigation.jsx';
import SearchBar from '@/features/matching/components/SearchBar.jsx';
import MatchingList from '@/features/matching/components/MatchingList.jsx';
import Pagination from '@/features/matching/components/Pagination.jsx';

// 서비스
import MatchingService from '@/features/matching/services/MatchingService.js';

// 스타일
import './ManagerMatchingList.css';

/**
 * 매니저 매칭 리스트 페이지
 * 순수한 조합 로직만 담당하며, 모든 비즈니스 로직은 훅과 서비스에서 처리
 */
const ManagerMatchingListPage = () => {
  // 커스텀 훅들로 관심사 분리
  const {
    // UI 상태
    activeTab,
    searchQuery,
    showDetailModal,
    selectedItem,
    currentPage,
    totalPages,
    pageSize,
    
    // 핸들러
    handleTabChange,
    handleSearchChange,
    handlePageChange,
    openDetailModal,
    closeDetailModal,
    shouldRefreshData,
    
    // 상태 업데이트
    setTotalPages,
  } = useMatchingList();

  const {
    // 데이터 상태
    matchingList,
    loading,
    error,
    
    // 데이터 함수
    loadMatchingList,
    getFilteredList,
  } = useMatchingData();

  const {
    // 액션 핸들러
    handleServiceStart,
    handleMatching,
  } = useMatchingActions();

  // 데이터 로딩 및 새로고침 로직
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 페이지 초기 로딩...', { currentPage, pageSize });
        const result = await loadMatchingList(currentPage, pageSize);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error('데이터 로딩 실패:', err);
      }
    };

    loadData();
  }, []); // 컴포넌트 마운트 시에만 실행

  // 페이지 가시성 기반 새로고침 설정
  useEffect(() => {
    const cleanup = MatchingService.setupVisibilityListeners(async () => {
      try {
        const result = await loadMatchingList(currentPage, pageSize);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error('가시성 변경 시 데이터 로딩 실패:', err);
      }
    });

    return cleanup;
  }, []); // 컴포넌트 마운트 시에만 설정

  // 페이지 경로 변경 기반 새로고침
  useEffect(() => {
    if (shouldRefreshData()) {
      console.log('✅ 매칭 완료 후 돌아옴 - 강제 데이터 새로고침');
      
      MatchingService.delayedRefresh(async () => {
        try {
          const result = await loadMatchingList(currentPage, pageSize);
          setTotalPages(result.totalPages);
        } catch (err) {
          console.error('경로 변경 시 데이터 로딩 실패:', err);
        }
      });
    }
  }, []); // 컴포넌트 마운트 시에만 체크

  // 탭/페이지 변경 시 데이터 새로고침
  const handleTabChangeWithRefresh = async (tab) => {
    console.log('🏷️ 탭 변경:', tab);
    handleTabChange(tab);
    try {
      const result = await loadMatchingList(0, pageSize); // 탭 변경 시 첫 페이지로
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('탭 변경 시 데이터 로딩 실패:', err);
    }
  };

  const handlePageChangeWithRefresh = async (newPage) => {
    console.log('📄 페이지 변경:', newPage);
    handlePageChange(newPage);
    try {
      const result = await loadMatchingList(newPage, pageSize);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('페이지 변경 시 데이터 로딩 실패:', err);
    }
  };

  // 재시도 핸들러
  const handleRetry = async () => {
    try {
      const result = await loadMatchingList(currentPage, pageSize);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('재시도 실패:', err);
    }
  };

  // 필터링된 데이터 가져오기
  const filteredList = getFilteredList(activeTab, searchQuery);

  return (
    <div className="manager-matching-list-page">
      <Header showBackButton={true} />
      
      <div className="page-content-wrapper">
        <div className="manager-matching-list-container">
          <h1 className="page-title">매칭 내역 조회</h1>

          {/* 탭 네비게이션 */}
          <TabNavigation 
            tabs={MatchingService.TABS}
            activeTab={activeTab}
            onTabChange={handleTabChangeWithRefresh}
          />

          {/* 검색 바 */}
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />

          {/* 매칭 리스트 */}
          <MatchingList 
            matchingList={filteredList}
            loading={loading}
            error={error}
            onRetry={handleRetry}
            onDetailView={openDetailModal}
            onServiceStart={handleServiceStart}
            onMatching={handleMatching}
          />

          {/* 페이지네이션 */}
          {!loading && !error && filteredList.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChangeWithRefresh}
            />
          )}
        </div>
      </div>

      {/* 상세보기 모달 */}
      <ManagerMatchingDetail 
        showDetailModal={showDetailModal} 
        setShowDetailModal={closeDetailModal} 
        selectedItem={selectedItem}
        setSelectedItem={() => {}} // 이미 closeDetailModal에서 처리
        handleServiceStart={handleServiceStart}
        handleMatching={handleMatching}
      />

      <Footer current="/matching/list" />
    </div>
  );
};

export default ManagerMatchingListPage;