import { useState, useRef } from 'react';
import { useManagerMatching } from './useManagerAPI';

/**
 * 매칭 데이터 관리 훅
 * API 호출과 데이터 변환 로직을 담당합니다.
 */
export const useMatchingData = () => {
  const [matchingList, setMatchingList] = useState([]);
  const { loading, error, getMatchingList } = useManagerMatching();
  
  // 로딩 상태 추적을 위한 ref
  const isLoadingRef = useRef(false);

  // 백엔드 상태를 탭 이름으로 매핑
  const getTabNameFromStatus = (status) => {
    switch (status) {
      case 'REQUESTED':
        return '매칭 대기';
      case 'ACCEPTED':
        return '고객 응답 대기';
      case 'CONFIRMED':
        return '매칭 완료';
      case 'REJECTED':
        return '거절됨';
      default:
        return '알 수 없음';
    }
  };

  // 상태별 색상 매핑 함수 (CSS 클래스명과 일치)
  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'completed';
      case 'MATCHED':
        return 'matched';
      case 'REJECTED':
        return 'rejected';
      case 'ACCEPTED':
        return 'waiting';
      case 'REQUESTED':
        return 'pending';
      default:
        return 'pending';
    }
  };

  // 날짜 포맷 변환 함수
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  // 데이터 변환 함수
  const transformMatchingData = (rawData) => {
    if (!rawData || !Array.isArray(rawData.content)) return [];
    return rawData.content.map((item) => ({
      id: item.reservationId,
      customerName: item.customerName,
      serviceType: item.serviceOptionName,
      workTime: formatDateTime(item.startTime),
      status: getTabNameFromStatus(item.matchingStatus),
      statusColor: getStatusColor(item.matchingStatus),
    }));
  };

  // 매칭 목록 로드
  const loadMatchingList = async (page = 0, size = 10) => {
    // 이미 로딩 중이면 중복 요청 방지
    if (isLoadingRef.current) {
      console.log('⚠️ 이미 로딩 중 - 중복 요청 방지');
      return { data: matchingList, totalPages: 0 };
    }

    try {
      isLoadingRef.current = true;
      console.log('📡 매칭 데이터 로드 중...', { page, size });
      const data = await getMatchingList(page, size);
      console.log('📡 백엔드에서 받은 원본 매칭 데이터:', data);
      
      const transformedData = transformMatchingData(data.data);
      console.log('✅ 변환된 매칭 목록:', transformedData);
      
      setMatchingList(transformedData);
      return {
        data: transformedData,
        totalPages: data.totalPages,
      };
    } catch (err) {
      console.error('매칭 목록 로드 실패:', err);
      setMatchingList([]);
      throw err;
    } finally {
      isLoadingRef.current = false;
    }
  };

  // 필터링 함수
  const getFilteredList = (activeTab, searchQuery) => {
    let filtered = matchingList;

    // 탭 필터링
    if (activeTab !== '전체') {
      filtered = filtered.filter((item) => item.status === activeTab);
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.customerName.includes(searchQuery) ||
          item.serviceType.includes(searchQuery) ||
          item.id.toString().includes(searchQuery)
      );
    }

    return filtered;
  };

  return {
    // 상태
    matchingList,
    loading,
    error,
    
    // 함수
    loadMatchingList,
    getFilteredList,
    
    // 헬퍼 함수
    getTabNameFromStatus,
  };
};