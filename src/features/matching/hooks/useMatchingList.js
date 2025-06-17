import { useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 매칭 리스트 상태 관리 훅
 * UI 상태와 사용자 인터랙션 로직을 관리합니다.
 */
export const useMatchingList = () => {
  // UI 상태
  const [activeTab, setActiveTab] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // 위치 기반 새로고침 로직
  const location = useLocation();

  // 탭 변경 핸들러
  const handleTabChange = (tab) => {
    console.log('🏷️ 탭 변경 상태 업데이트:', tab);
    setActiveTab(tab);
    setCurrentPage(0); // 탭 변경 시 첫 페이지로 이동
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // 상세보기 모달 제어
  const openDetailModal = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  // 페이지 새로고침 필요 여부 체크
  const shouldRefreshData = () => {
    return location.pathname === '/matching/list' && location.state?.refreshData;
  };

  return {
    // 상태
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
    
    // 상태 업데이트 함수
    setTotalPages,
    setCurrentPage,
  };
};