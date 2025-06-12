import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MatchingSystemPage.css';
import MatchingSystemCard from '../components/MatchingSystemCard';

// API 기본 URL 구성
const getBaseUrl = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

  const baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;
  console.log('🔧 API 기본 URL:', {
    baseUrl,
    environment: import.meta.env.MODE,
    apiUrl: import.meta.env.VITE_API_URL,
    version: import.meta.env.VITE_API_VERSION
  });
  return baseUrl;
};

function MatchingSystemPage() {
  const navigate = useNavigate();
  
  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);

  // 필터 상태 관리
const [filter, setFilter] = useState('전체');


  // API 호출 함수
  const fetchReservations = async (page, size, status) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const baseUrl = getBaseUrl();
      const url = new URL(`${baseUrl}/reservations`);
      url.searchParams.append('page', page - 1);
      url.searchParams.append('size', size);
      if (status) {
        url.searchParams.append('status', status);
      }

      console.log('API 요청 URL:', url.toString());

      // 토큰 가져오기
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('로그인이 필요합니다');
        navigate('/auth/signin');
        return;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // 응답 상태 코드에 따른 처리
      if (response.status === 401) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('accessToken');
        navigate('/auth/signin');
        return;
      }

      if (response.status === 403) {
        setError('접근 권한이 없습니다.');
        navigate('/403');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 응답 에러:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API 응답:', result);
      
      if (result.success === false) {
        setError(result.message || '데이터를 불러오는데 실패했습니다');
        return;
      }

      // API 응답 형식에 맞게 데이터 처리
      const { content, totalPages: total, totalElements: totalCount } = result.data;
      
      setReservations(content);
      setTotalPages(total);
      setTotalElements(totalCount);
    } catch (error) {
      console.error('예약 목록을 불러오는데 실패했습니다:', error);
      setError('예약 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 필터가 변경될 때마다 API 호출
  useEffect(() => {
    const status = filter === '전체' ? null : 
                  filter === '매칭 대기' ? 'REQUESTED' :
                  filter === '매칭 중' ? 'MATCHING' :
                  filter === '매칭 완료' ? 'MATCHED' : 'COMPLETED';
    
    fetchReservations(currentPage, pageSize, status);
  }, [currentPage, pageSize, filter]);

  // 매칭 현황 카운트 계산
  const totalMatches = totalElements;
  const inProgressMatches = reservations.filter(
    (reservation) =>
      reservation.status === 'MATCHING' ||
      reservation.status === 'MATCHED'
  ).length;
  const pendingMatches = reservations.filter(
    (reservation) => reservation.status === 'REQUESTED'
  ).length;

  // 페이지 변경 함수
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="matching-management-container">
      {/* Header Section */}
      <div className="matching-management-header">
        <p className="matching-management-title">매칭 관리</p>
        <p className="matching-management-description">
          서비스 매칭 현황을 관리하고 추천합니다
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Matching Status Overview */}
      <div className="matching-status-overview">
        <div className="status-overview-header">
          <i className="fas fa-users"></i>
          <span>매칭 현황 관리</span>
        </div>
        <div className="status-cards-row">
          <div className="status-card total">
            <p>{totalMatches}</p>
            <p>총 매칭</p>
          </div>
          <div className="status-card in-progress">
            <p>{inProgressMatches}</p>
            <p>진행 중</p>
          </div>
          <div className="status-card pending">
            <p>{pendingMatches}</p>
            <p>대기 중</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-button ${filter === '전체' ? 'active' : ''}`}
          onClick={() => {
            setFilter('전체');
            setCurrentPage(1);
          }}
        >
          전체
        </button>
        <button
          className={`filter-button ${filter === '매칭 대기' ? 'active' : ''}`}
          onClick={() => {
            setFilter('매칭 대기');
            setCurrentPage(1);
          }}
        >
          매칭 대기
        </button>
        <button
          className={`filter-button ${filter === '매칭 중' ? 'active' : ''}`}
          onClick={() => {
            setFilter('매칭 중');
            setCurrentPage(1);
          }}
        >
          매칭 중
        </button>
        <button
          className={`filter-button ${filter === '매칭 완료' ? 'active' : ''}`}
          onClick={() => {
            setFilter('매칭 완료');
            setCurrentPage(1);
          }}
        >
          매칭 완료
        </button>
        <button
          className={`filter-button ${filter === '서비스 완료' ? 'active' : ''}`}
          onClick={() => {
            setFilter('서비스 완료');
            setCurrentPage(1);
          }}
        >
          서비스 완료
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <p>로딩 중...</p>
        </div>
      )}

      {/* Manager List (Matching System Cards) */}
      <div className="manager-list">
        {reservations.map((reservation) => (
          <MatchingSystemCard 
            key={reservation.reservationId} 
            reservation={reservation} 
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            이전
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

export default MatchingSystemPage;