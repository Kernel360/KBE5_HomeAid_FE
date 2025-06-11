import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import useReservationListStore from '../../stores/reservationListStore.js';
import { useCustomerReservationList } from '../../features/reservation/hooks/useCustomerAPI.js';
import { useAuthStore } from '../../stores/authStore.js';
import './UserReservationList.css';

const UserReservationList = () => {
  const navigate = useNavigate();

  // ⭐️ 인증 상태 확인
  const { user, accessToken } = useAuthStore();

  // 백엔드 API 훅
  const {
    reservations: apiReservations,
    loading: apiLoading,
    error: apiError,
  } = useCustomerReservationList();

  // 로컬 스토어 훅 (백업용)
  const { getAllReservations } = useReservationListStore();

  const [activeTab, setActiveTab] = useState('pending');
  const [reservations] = useState({
    pending: [],
    completed: [],
    visited: [],
    cancelled: [],
  });

  // ⭐️ 페이징 상태 추가
  const [currentPage, setCurrentPage] = useState({
    pending: 1,
    completed: 1,
    visited: 1,
    cancelled: 1,
  });
  const itemsPerPage = 5;

  // 데이터 새로고침 함수 - 의존성 최소화
  const refreshData = useCallback(async () => {
    if (!user || !accessToken) {
      return false;
    }
  }, []);

  // 예약 데이터 로드 - 컴포넌트 마운트 시에만 실행
  useEffect(() => {
    // ⭐️ 인증된 사용자만 데이터 로드
    if (!user || !accessToken) {
      console.log('❌ 인증 정보 없음 - 데이터 로드 건너뛰기');
      return;
    }
  }, [apiReservations, refreshData, user, accessToken, getAllReservations]);

  // 탭 변경 시 페이지 초기화
  const handleTabChange = useCallback((tabKey) => {
    setActiveTab(tabKey);
    setCurrentPage((prev) => ({ ...prev, [tabKey]: 1 }));
  }, []);

  const handleReservationClick = useCallback(
    (reservation) => {
      // 예약 상세 페이지로 이동
      navigate(`/customer/reservation/${reservation.id}`, {
        state: { reservation },
      });
    },
    [navigate]
  );

  // ⭐️ 상태 라벨 매핑
  const getStatusLabel = (status) => {
    const statusLabels = {
      pending: '예약중',
      completed: '예약완료',
      visited: '방문완료',
      cancelled: '취소완료',
    };
    return statusLabels[status] || '상태 미확인';
  };

  // ⭐️ 상태별 라벨 스타일 클래스
  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      completed: 'status-completed',
      visited: 'status-visited',
      cancelled: 'status-cancelled',
    };
    return statusClasses[status] || 'status-default';
  };

  // ReservationCard 컴포넌트 메모이제이션
  const ReservationCard = React.memo(({ reservation }) => {
    // 데이터 안전성 체크
    if (!reservation) {
      console.warn('❌ ReservationCard: reservation 데이터가 없습니다');
      return null;
    }

    console.log('🎯 ReservationCard 렌더링 데이터:', reservation);

    return (
      <div
        className={`reservation-card ${reservation.status === 'cancelled' ? 'cancelled' : ''}`}
        onClick={() => handleReservationClick(reservation)}
      >
        <div className="reservation-icon">
          {reservation.icon === 'home' ? (
            <div className="home-icon">🏠</div>
          ) : reservation.icon === 'cleaning' ? (
            <div className="cleaning-icon">🧹</div>
          ) : reservation.icon === 'laundry' ? (
            <div className="laundry-icon">👕</div>
          ) : reservation.icon === 'childcare' ? (
            <div className="childcare-icon">👶</div>
          ) : (
            <div className="home-icon">🏠</div>
          )}
        </div>

        <div className="reservation-content">
          <div className="reservation-header">
            <div className="reservation-type">
              {reservation.type || '서비스'}
            </div>
            <div
              className={`reservation-status-label ${getStatusClass(reservation.status)}`}
            >
              {getStatusLabel(reservation.status)}
            </div>
          </div>
          <div className="reservation-datetime">
            {reservation.date || '날짜 정보 없음'} /{' '}
            {reservation.time || '시간 정보 없음'}
          </div>
          <div className="reservation-price">
            {(reservation.price || 0).toLocaleString()}원
          </div>
        </div>

        <div className="reservation-actions">
          <div className="reservation-arrow">
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path
                d="M1 1L7 7L1 13"
                stroke="#C4C4C4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  });

  const getTabData = useMemo(
    () => [
      { key: 'pending', label: '예약중', count: reservations.pending.length },
      {
        key: 'completed',
        label: '예약완료',
        count: reservations.completed.length,
      },
      { key: 'visited', label: '방문완료', count: reservations.visited.length },
      {
        key: 'cancelled',
        label: '취소됨',
        count: reservations.cancelled.length,
      },
    ],
    [reservations]
  );

  // ⭐️ 페이징 처리된 현재 탭 예약 데이터
  const getCurrentTabReservations = useMemo(() => {
    const allReservations = reservations[activeTab] || [];
    const currentPageNum = currentPage[activeTab];
    const startIndex = (currentPageNum - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return allReservations.slice(startIndex, endIndex);
  }, [reservations, activeTab, currentPage]);

  // ⭐️ 페이징 정보 계산
  const getPaginationInfo = useMemo(() => {
    const allReservations = reservations[activeTab] || [];
    const totalItems = allReservations.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPageNum = currentPage[activeTab];

    return {
      totalItems,
      totalPages,
      currentPage: currentPageNum,
      hasNext: currentPageNum < totalPages,
      hasPrevious: currentPageNum > 1,
    };
  }, [reservations, activeTab, currentPage]);

  // ⭐️ 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (pageNum) => {
      setCurrentPage((prev) => ({
        ...prev,
        [activeTab]: pageNum,
      }));
    },
    [activeTab]
  );

  return (
    <div className="user-reservation-list-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="reservation-list-container">
          {/* 새로고침 버튼 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              margin: '16px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* 백엔드 API 로딩 중일 때 로딩 표시 */}
              {apiLoading && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#666',
                    fontSize: '14px',
                  }}
                >
                  <span>📡 데이터 불러오는 중...</span>
                </div>
              )}

              {/* 백엔드 API 에러 시 에러 표시 */}
              {apiError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#e74c3c',
                    fontSize: '14px',
                  }}
                >
                  <span>⚠️ 연결 오류</span>
                </div>
              )}
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="tab-navigation">
            {getTabData.map((tab) => (
              <button
                key={tab.key}
                className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.key)}
              >
                <span className="tab-label">{tab.label}</span>
                {tab.count > 0 && (
                  <span className="tab-count">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div className="tab-content">
            <div className="reservation-cards">
              {(() => {
                const currentReservations = getCurrentTabReservations;

                if (currentReservations.length > 0) {
                  return currentReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                    />
                  ));
                } else {
                  return (
                    <div className="empty-state">
                      <p>
                        {activeTab === 'pending' &&
                          '예약중인 서비스가 없습니다.'}
                        {activeTab === 'completed' &&
                          '예약 완료된 서비스가 없습니다.'}
                        {activeTab === 'visited' &&
                          '방문 완료된 서비스가 없습니다.'}
                        {activeTab === 'cancelled' && '취소된 예약이 없습니다.'}
                      </p>
                    </div>
                  );
                }
              })()}
            </div>

            {/* ⭐️ 페이지네이션 */}
            {getPaginationInfo.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() =>
                    handlePageChange(getPaginationInfo.currentPage - 1)
                  }
                  disabled={!getPaginationInfo.hasPrevious}
                >
                  이전
                </button>

                <div className="pagination-info">
                  <span className="page-numbers">
                    {Array.from(
                      { length: getPaginationInfo.totalPages },
                      (_, index) => (
                        <button
                          key={index + 1}
                          className={`page-number ${getPaginationInfo.currentPage === index + 1 ? 'active' : ''}`}
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </button>
                      )
                    )}
                  </span>
                </div>

                <button
                  className="pagination-btn"
                  onClick={() =>
                    handlePageChange(getPaginationInfo.currentPage + 1)
                  }
                  disabled={!getPaginationInfo.hasNext}
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer current="/customer/reservations" />
    </div>
  );
};

export default UserReservationList;
