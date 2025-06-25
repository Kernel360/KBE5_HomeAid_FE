import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Suspense,
} from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import useReservationListStore from '../../stores/reservationListStore.js';
import { useCustomerReservationList } from '../../features/reservation/hooks/useCustomerAPI.js';
import { useAuthStore } from '../../stores/authStore.js';
import './UserReservationList.css';
import cleanIcon from '../../assets/images/clean1.png';

// 로딩 컴포넌트
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>로딩중...</p>
  </div>
);

const UserReservationList = () => {
  const navigate = useNavigate();

  // ⭐️ 인증 상태 확인
  const { user, accessToken } = useAuthStore();

  // 백엔드 API 훅
  const { loadReservations } = useCustomerReservationList();

  // 로컬 스토어 훅 (백업용)
  const { getAllReservations } = useReservationListStore();

  const reservations = useReservationListStore((state) => state.reservations);

  // ⭐️ 인증 상태 확인
  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/auth/signin');
      return;
    }

    if (user.role !== 'ROLE_CUSTOMER') {
      navigate('/');
      return;
    }
  }, [user, accessToken, navigate]);

  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 새로고침 함수 - 캐시 추가
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);

      // 백엔드에서 데이터 로드
      const _backendData = await loadReservations();

      // 로컬 스토어에서도 데이터 가져오기 (백업용)
      const _localData = getAllReservations();

      console.log('Data refresh completed');
    } catch (error) {
      console.error('데이터 새로고침 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadReservations, getAllReservations]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleReservationClick = (reservation) => {
    navigate(`/customer/reservations/${reservation.id}`, {
      state: { reservation },
    });
  };

  // ⭐️ 상태별 라벨
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

  const mapBackendStatus = (backendStatus) => {
    switch (backendStatus) {
      case 'REQUESTED':
      case 'MATCHING':
        return 'pending';
      case 'MATCHED':
        return 'completed';
      case 'COMPLETED':
        return 'visited';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  // ReservationCard 컴포넌트 메모이제이션
  const ReservationCard = React.memo(({ reservation }) => {
    if (!reservation) return null;

    // 실제 데이터 필드에 맞게 매핑
    const type = reservation.serviceOptionName || reservation.type || '서비스';
    const date =
      reservation.requestedDate || reservation.date || '날짜 정보 없음';
    const time =
      reservation.requestedTime || reservation.time || '시간 정보 없음';
    const price = reservation.totalPrice || reservation.price || 0;
    const status = mapBackendStatus(reservation.status);

    return (
      <div
        className={`reservation-card ${reservation.status === 'cancelled' ? 'cancelled' : ''}`}
        onClick={() => handleReservationClick(reservation)}
      >
        <div className="reservation-icon">
          <img
            src={cleanIcon}
            alt="Clean Icon"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              padding: '8px',
            }}
          />
        </div>

        <div className="reservation-content">
          <div className="reservation-header">
            <div className="reservation-type">{type}</div>
            <div
              className={`reservation-status-label ${getStatusClass(status)}`}
            >
              {getStatusLabel(status)}
            </div>
          </div>
          <div className="reservation-datetime">
            {date} / {time}
          </div>
          <div className="reservation-price">{price.toLocaleString()}원</div>
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

  // 탭별 데이터
  const currentReservations = reservations[activeTab] || [];

  return (
    <div className="min-h-screen bg-gray-100">
      <div
        className="w-full bg-white min-h-screen flex flex-col"
        style={{
          maxWidth: '512px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <Header />

        <main
          className="px-6 py-6 flex-1"
          style={{
            paddingBottom: '70px',
            paddingTop: '80px',
            minHeight: 'calc(100vh - 150px)', // 헤더(80px)와 푸터(70px) 높이를 제외한 최소 높이
          }}
        >
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
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="reservation-cards">
                {(() => {
                  if (currentReservations.length > 0) {
                    return currentReservations.map((reservation) => (
                      <ReservationCard
                        key={reservation.reservationId}
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
                          {activeTab === 'cancelled' &&
                            '취소된 예약이 없습니다.'}
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </div>
        </main>

        <Footer current="/customer/reservations" />
      </div>
    </div>
  );
};

export default UserReservationList;
