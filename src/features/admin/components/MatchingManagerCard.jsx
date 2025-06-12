import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MatchingManagerCard.css';

// API 기본 URL 구성
const getBaseUrl = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
  return `${API_BASE_URL}/api/${API_VERSION}`;
};

function MatchingManagerCard({ manager, onMatchingComplete }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // URL에서 reservationId 추출
  const reservationId = new URLSearchParams(location.search).get('reservationId');

  // Function to handle "상세 보기" button click
  const handleViewDetails = () => {
    console.log('View details for manager:', manager.id);
    // TODO: Implement navigation to manager details page if needed
  };

  // Function to handle "매칭하기" button click
  const handleActionButtonClick = async () => {
    if (!reservationId) {
      setError('예약 정보를 찾을 수 없습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('로그인이 필요합니다');
        navigate('/auth/signin');
        return;
      }

      const response = await fetch(`${getBaseUrl()}/admin/matchings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: parseInt(reservationId),
          managerId: manager.id
        })
      });

      if (response.status === 401) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('accessToken');
        navigate('/auth/signin');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '매칭 생성에 실패했습니다.');
      }

      const data = await response.json();
      console.log('매칭 생성 성공:', data);

      // 매칭 완료 콜백 호출
      if (onMatchingComplete) {
        onMatchingComplete(data.data);
      }

      // 성공 메시지와 함께 이전 페이지로 이동
      alert('매칭이 완료되었습니다.');
      navigate('/admin/matchingsystem');
    } catch (error) {
      console.error('매칭 생성 실패:', error);
      setError(error.message || '매칭 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="manager-list-card">
      <div className="card-header">
        <span className="manager-initial">{manager.name.charAt(0)}</span>
        <div className="manager-info-header">
          <span className="manager-name">{manager.name}</span>
          <span className="manager-id">ID: {manager.id}</span>
        </div>
      </div>
      <div className="card-details">
        {/* API 응답에 없는 필드는 조건부 렌더링 */}
        {manager.phone && <p>{manager.phone}</p>}
        {manager.email && <p>{manager.email}</p>}
        {manager.joinDate && <p>가입일: {manager.joinDate}</p>}
        {manager.serviceType && (
          <p>서비스: {Array.isArray(manager.serviceType) ? manager.serviceType.join(', ') : manager.serviceType}</p>
        )}
        {manager.activityArea && <p>활동 지역: {manager.activityArea}</p>}
      </div>
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      <div className="card-actions">
        <button className="action-button secondary" onClick={handleViewDetails}>
          상세 보기
        </button>
        <button
          className="action-button primary"
          onClick={handleActionButtonClick}
          disabled={isLoading}
        >
          {isLoading ? '매칭 중...' : '매칭하기'}
        </button>
      </div>
    </div>
  );
}

export default MatchingManagerCard;
