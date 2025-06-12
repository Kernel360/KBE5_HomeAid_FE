import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MatchingManagerList.css';
import MatchingManagerCard from '../components/MatchingManagerCard.jsx';

// API 기본 URL 구성
const getBaseUrl = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
  return `${API_BASE_URL}/api/${API_VERSION}`;
};

function MatchingManagerList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matchedManagerIds, setMatchedManagerIds] = useState(new Set());

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // URL에서 reservationId 추출
  const reservationId = new URLSearchParams(location.search).get('reservationId');

  const handleGoBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  // 매칭 완료 처리
  const handleMatchingComplete = (matchingData) => {
    // 매칭된 매니저 ID를 Set에 추가
    setMatchedManagerIds(prev => new Set([...prev, matchingData.managerId]));
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!reservationId) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('로그인이 필요합니다');
          navigate('/auth/signin');
          return;
        }

        const response = await fetch(
          `${getBaseUrl()}/admin/matchings/${reservationId}/recommendations`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 401) {
          setError('인증이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('accessToken');
          navigate('/auth/signin');
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('추천 매니저 목록:', data);
        
        if (data.success === false) {
          setError(data.message || '매니저 추천 목록을 불러오는데 실패했습니다');
          return;
        }

        setManagers(data.data || []);
      } catch (error) {
        console.error('매니저 추천 목록을 불러오는데 실패했습니다:', error);
        setError('매니저 추천 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [reservationId, navigate]);

  // Filter and search logic
  const filteredManagers = managers.filter((manager) => {
    const matchesSearch =
      searchTerm === '' ||
      manager.managerName.toLowerCase().includes(searchTerm.toLowerCase());
    // 매칭이 완료되지 않은 매니저만 표시
    const isNotMatched = !matchedManagerIds.has(manager.managerId);
    return matchesSearch && isNotMatched;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentManagers = filteredManagers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredManagers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationButtons = () => {
    const pageButtons = [];
    for (let i = 1; i <= totalPages; i++) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={currentPage === i ? 'active' : ''}
        >
          {i}
        </button>
      );
    }
    return pageButtons;
  };

  return (
    <div className="manager-list-container">
      <div className="manager-list-header">
        <h2 className="manager-list-title">매니저 목록</h2>
        <p className="manager-list-description">
          {reservationId ? '추천 매니저 목록' : '매니저 목록을 관리합니다'}
        </p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="loading-message">
          <p>로딩 중...</p>
        </div>
      ) : managers.length === 0 ? (
        <div className="no-managers-message">
          <p>매칭 가능한 매니저가 없습니다.</p>
          <button className="back-button" onClick={handleGoBack}>
            이전 페이지로 돌아가기
          </button>
        </div>
      ) : (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="매니저 이름으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="manager-cards-list">
            {currentManagers.map((manager) => (
              <MatchingManagerCard 
                key={manager.managerId} 
                manager={{
                  id: manager.managerId,
                  name: manager.managerName,
                }}
                onMatchingComplete={handleMatchingComplete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">{renderPaginationButtons()}</div>
          )}
        </>
      )}
    </div>
  );
}

export default MatchingManagerList;
