import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Suspense,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import useReservationListStore from '../../stores/reservationListStore.js';
import { useCustomerReservationList } from '../../features/reservation/hooks/useCustomerAPI.js';
import { useAuthStore } from '../../stores/authStore.js';
import './UserReservationList.css';

// API 기본 URL 구성
const getBaseUrl = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
  return `${API_BASE_URL}/api/${API_VERSION}`;
};

// 로딩 컴포넌트
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>로딩중...</p>
  </div>
);

const UserReservationList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ⭐️ 인증 상태 확인
  const { user, accessToken } = useAuthStore();

  // 백엔드 API 훅
  const { loadReservations } = useCustomerReservationList();

  // 로컬 스토어 훅 (백업용)
  const { getAllReservations, setReservations } = useReservationListStore();

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

  // 매칭 응답 처리 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectMemo, setRejectMemo] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);

  // 데이터 새로고침 함수 - 캐시 추가
  const refreshData = useCallback(async () => {
    if (!user || !accessToken) {
      return false;
    }

    setIsLoading(true);
    try {
      await loadReservations();
      setIsLoading(false);
      return true;
    } catch (error) {
      if (
        error.message.includes('401') ||
        error.message.includes('JWT_INVALID')
      ) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/auth/signin');
        return false;
      }

      getAllReservations(); // 로컬 데이터 로드
      setIsLoading(false);
      return false;
    }
  }, [loadReservations, getAllReservations, user, accessToken, navigate]);

  // 결제 완료 후 데이터 새로고침 처리
  useEffect(() => {
    if (location.state?.paymentCompleted && location.state?.refreshData) {
      console.log('🎉 결제 완료 후 예약 목록 새로고침');
      refreshData();

      // state 초기화하여 다음 방문 시 중복 새로고침 방지
      navigate('/customer/reservations', { replace: true });
    }
  }, [location.state, refreshData, navigate]);

  // 예약 데이터 로드 - 최적화된 로직
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!user || !accessToken) return;

      if (isMounted) {
        await refreshData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, accessToken, refreshData]);

  // 탭 변경 시 페이지 초기화
  const handleTabChange = useCallback((tabKey) => {
    setActiveTab(tabKey);
  }, []);

  const handleReservationClick = useCallback(
    (reservation) => {
      // 예약 상세 페이지로 이동
      navigate(`/customer/reservations/${reservation.reservationId}`, {
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

  const mapBackendStatus = (backendStatus, reservation = null) => {
    // 결제 완료 상태 확인
    if (reservation) {
      const reservationId = reservation.reservationId || reservation.id;

      // 1. localStorage에서 결제 완료 상태 확인
      const paymentCompletedKey = `payment_completed_${reservationId}`;
      const reservationStatusKey = `reservation_status_${reservationId}`;

      const paymentCompleted = localStorage.getItem(paymentCompletedKey);
      const reservationStatus = localStorage.getItem(reservationStatusKey);

      if (paymentCompleted || reservationStatus) {
        try {
          const statusData = reservationStatus
            ? JSON.parse(reservationStatus)
            : null;
          if (
            statusData?.status === 'COMPLETED' &&
            statusData?.paymentCompleted
          ) {
            console.log('💳 결제 완료된 예약 확인:', {
              reservationId,
              statusData,
              returning: 'completed',
            });
            return 'completed'; // 결제 완료된 예약은 "예약완료"로 표시
          }
        } catch (error) {
          console.error('예약 상태 파싱 오류:', error);
        }
      }

      // 2. 백엔드 데이터에서 결제 완료 상태 확인
      const backendData =
        reservation?.backendData?.data || reservation?.backendData || {};
      const hasPayment =
        backendData.paymentId ||
        backendData.paidAt ||
        backendData.paymentStatus === 'PAID' ||
        backendData.paymentStatus === 'COMPLETED' ||
        backendData.isPaid === true;

      if (hasPayment) {
        console.log('💳 백엔드에서 결제 완료 확인:', {
          reservationId,
          backendData,
          returning: 'completed',
        });
        return 'completed'; // 결제 완료된 예약은 "예약완료"로 표시
      }
    }

    // 기본 상태 매핑
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

  // 매칭 응답 처리 함수
  const handleMatchingResponse = async (reservation, action) => {
    if (action === 'REJECT') {
      setSelectedReservation(reservation);
      setShowRejectModal(true);
      return;
    }

    await submitMatchingResponse(reservation, action);
  };

  const submitMatchingResponse = async (reservation, action, memo = '') => {
    const reservationId = reservation.reservationId || reservation.id;
    if (!reservationId) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다');
        navigate('/auth/signin');
        return;
      }

      const response = await fetch(
        `${getBaseUrl()}/customer/matchings/${reservationId}/to-manager`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: action,
            memo: memo,
          }),
        }
      );

      if (response.status === 401) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('accessToken');
        navigate('/auth/signin');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '매칭 응답 처리에 실패했습니다.');
      }

      // ⭐️ 매칭 확인 시 즉시 로컬 상태 업데이트 (새로고침 없이 바로 반영)
      if (action === 'CONFIRM') {
        const currentReservations =
          useReservationListStore.getState().reservations;
        let targetReservation = null;
        let sourceCategory = null;

        // 어느 카테고리에 있는지 찾기
        for (const category of [
          'pending',
          'completed',
          'visited',
          'cancelled',
        ]) {
          const foundReservation = currentReservations[category]?.find(
            (res) => (res.reservationId || res.id) === reservationId
          );
          if (foundReservation) {
            targetReservation = foundReservation;
            sourceCategory = category;
            break;
          }
        }

        if (targetReservation && sourceCategory) {
          // 예약 정보 업데이트 (매칭 확인된 상태로)
          const updatedReservation = {
            ...targetReservation,
            status: 'MATCHED',
            // 백엔드 데이터 업데이트
            backendData: {
              ...targetReservation.backendData,
              status: 'MATCHED',
              matchingStatus: 'CONFIRMED',
              data: {
                ...targetReservation.backendData?.data,
                status: 'MATCHED',
                matchingStatus: 'CONFIRMED',
              },
            },
          };

          console.log('💫 매칭 확인 - 즉시 상태 업데이트:', {
            reservationId,
            sourceCategory,
            targetCategory: 'completed',
            before: targetReservation.status,
            after: 'MATCHED',
            backendData: updatedReservation.backendData,
          });

          // 매핑된 상태로 변경 (MATCHED -> completed)
          const mappedStatus = mapBackendStatus('MATCHED', updatedReservation);
          updatedReservation.status = mappedStatus;

          // 상태 즉시 업데이트
          const updatedReservations = {
            ...currentReservations,
            [sourceCategory]: currentReservations[sourceCategory].filter(
              (res) => (res.reservationId || res.id) !== reservationId
            ),
            completed: [
              ...(currentReservations.completed || []),
              updatedReservation,
            ],
          };

          // Zustand 스토어 즉시 업데이트
          setReservations(updatedReservations);

          // 현재 탭이 completed가 아니면 completed 탭으로 전환
          if (activeTab !== 'completed') {
            setActiveTab('completed');
          }
        }
      }

      // 성공 시 백그라운드에서 데이터 새로고침 (서버와 동기화)
      setTimeout(async () => {
        await refreshData();
      }, 1000);

      setShowRejectModal(false);
      setRejectMemo('');
      setSelectedReservation(null);

      alert(
        action === 'CONFIRM'
          ? '매칭이 확인되었습니다. 이제 결제를 진행할 수 있습니다.'
          : '매칭이 거절되었습니다.'
      );
    } catch (error) {
      console.error('매칭 응답 처리 실패:', error);
      alert(
        error.message ||
          '매칭 응답 처리에 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 결제 가능 여부 확인
  const canMakePayment = (reservation) => {
    console.log('🔍 UserReservationList - 결제 가능 여부 확인:', {
      reservationId: reservation?.reservationId || reservation?.id,
      status: reservation?.status,
      backendData: reservation?.backendData,
      fullReservation: reservation, // 전체 예약 객체 로그
    });

    const backendData =
      reservation?.backendData?.data || reservation?.backendData || {};

    console.log('🔍 UserReservationList - 백엔드 데이터 상세 확인:', {
      'entire backendData': backendData,
      'backendData keys': Object.keys(backendData),
      paymentId: backendData.paymentId,
      paidAt: backendData.paidAt,
      paymentStatus: backendData.paymentStatus,
      isPaid: backendData.isPaid,
      status: backendData.status,
      // 가능한 모든 결제 관련 필드 확인
      payment: backendData.payment,
      paymentInfo: backendData.paymentInfo,
      paymentResult: backendData.paymentResult,
      paymentDetails: backendData.paymentDetails,
      paymentData: backendData.paymentData,
      isPaymentCompleted: backendData.isPaymentCompleted,
      paymentCompleted: backendData.paymentCompleted,
      additionalPaymentInfo: backendData.additionalPaymentInfo,
    });

    // 1. localStorage에서 최근 결제 완료 정보 확인 (UserReservationDetail과 동일)
    const reservationId = reservation?.reservationId || reservation?.id;
    const recentPaymentCompletion = localStorage.getItem(
      'recentPaymentCompletion'
    );
    if (recentPaymentCompletion) {
      try {
        const paymentInfo = JSON.parse(recentPaymentCompletion);
        if (paymentInfo.reservationId === parseInt(reservationId)) {
          console.log(
            '🔒 localStorage에서 결제 완료 확인 - 결제 불가능:',
            paymentInfo
          );
          return false;
        }
      } catch (error) {
        console.error('localStorage 결제 정보 파싱 오류:', error);
      }
    }

    // 2. 백엔드 데이터에서 결제 완료 상태 확인 (확장된 체크)
    const hasPayment =
      // 기존 체크 필드들
      backendData.paymentId ||
      backendData.paidAt ||
      backendData.paymentStatus === 'PAID' ||
      backendData.paymentStatus === 'COMPLETED' ||
      backendData.isPaid === true ||
      // 추가적인 결제 완료 상태 확인
      backendData.payment ||
      backendData.paymentInfo ||
      backendData.paymentResult ||
      backendData.paymentDetails ||
      backendData.paymentData ||
      backendData.isPaymentCompleted === true ||
      backendData.paymentCompleted === true ||
      // 상태가 이미 결제 완료를 의미하는 경우
      backendData.status === 'PAID' ||
      // 예약 상태가 결제 완료 이후 단계인지 확인
      (backendData.status === 'MATCHED' && backendData.paymentStatus) ||
      // 별도 조회한 결제 정보 확인
      backendData.additionalPaymentInfo;

    // 3. 실제 예약 객체 자체에서도 결제 정보 확인
    const reservationHasPayment =
      reservation?.paymentId ||
      reservation?.paidAt ||
      reservation?.paymentStatus === 'PAID' ||
      reservation?.paymentStatus === 'COMPLETED' ||
      reservation?.isPaid === true ||
      reservation?.payment ||
      reservation?.paymentInfo;

    if (hasPayment || reservationHasPayment) {
      console.log('🔒 백엔드에서 결제 완료 확인 - 결제 불가능:', {
        hasPayment,
        reservationHasPayment,
        paymentId: backendData.paymentId || reservation?.paymentId,
        paidAt: backendData.paidAt || reservation?.paidAt,
        paymentStatus: backendData.paymentStatus || reservation?.paymentStatus,
        isPaid: backendData.isPaid || reservation?.isPaid,
      });
      return false;
    }

    // 4. ⭐️ 임시 해결책: "completed" 상태이고 현재 시간이 예약 생성 시간보다 30분 이후라면 결제 완료로 간주
    const status = reservation?.status;
    if (status === 'completed' || status === 'MATCHED') {
      const reservationCreatedAt =
        reservation?.createdAt || reservation?.backendData?.createdAt;
      if (reservationCreatedAt) {
        const createdTime = new Date(reservationCreatedAt);
        const now = new Date();
        const timeDiff = now - createdTime;
        const thirtyMinutes = 30 * 60 * 1000; // 30분을 밀리초로

        if (timeDiff > thirtyMinutes) {
          console.log(
            '🔒 임시 해결책 (목록): 생성 후 30분 경과된 completed/MATCHED 상태 - 결제 완료로 간주'
          );
          return false;
        }
      }
    }

    // 5. localStorage에서 결제 완료 상태 확인 (UserReservationDetail과 동일)
    const paymentCompletedKey = `payment_completed_${reservationId}`;
    const reservationStatusKey = `reservation_status_${reservationId}`;

    const paymentCompleted = localStorage.getItem(paymentCompletedKey);
    const reservationStatus = localStorage.getItem(reservationStatusKey);

    if (paymentCompleted || reservationStatus) {
      try {
        const statusData = reservationStatus
          ? JSON.parse(reservationStatus)
          : null;
        if (
          statusData?.status === 'COMPLETED' &&
          statusData?.paymentCompleted
        ) {
          console.log('🔒 localStorage 예약 상태에서 결제 완료 확인:', {
            reservationId,
            statusData,
          });
          return false;
        }
      } catch (error) {
        console.error('예약 상태 파싱 오류:', error);
      }
    }

    // 6. 매칭 확인 상태 체크
    const isMatchingConfirmed =
      backendData.matchingStatus === 'CONFIRMED' ||
      backendData.matchingStatus === 'ACCEPTED';

    // 7. 매칭 완료 상태 체크
    const isMatched =
      reservation.status === 'MATCHED' ||
      backendData.status === 'MATCHED' ||
      reservation.status === 'CONFIRMED' ||
      backendData.status === 'CONFIRMED' ||
      reservation.status === 'completed'; // 프론트엔드 매핑된 상태도 포함

    // 8. 매니저 정보가 있는지 확인
    const hasManager =
      backendData.managerId ||
      backendData.manager ||
      backendData.matchedManagerId ||
      backendData.matchedManagerName;

    // 9. 최종 결제 가능 판단
    const canPay =
      (isMatched && isMatchingConfirmed) || (isMatched && hasManager);

    console.log('💳 UserReservationList - 최종 결제 가능 여부:', {
      reservationId,
      isMatched,
      isMatchingConfirmed,
      hasManager,
      canPay,
      '최종 결정': canPay,
    });

    return canPay;
  };

  // 결제 페이지로 이동
  const handlePayment = (reservation) => {
    console.log('💳 결제 페이지로 이동:', {
      reservationId: reservation.reservationId || reservation.id,
      reservation,
    });

    navigate('/customer/payment', {
      state: {
        reservation: reservation,
        fromDetail: true,
      },
    });
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
    const price = reservation.totalPrice || reservation.price || 20000; // 기본값 설정
    const status = mapBackendStatus(reservation.status, reservation);

    // 매칭 상태 확인
    const backendData =
      reservation?.backendData?.data || reservation?.backendData || {};
    const matchingStatus = backendData.matchingStatus;
    const isMatchingAccepted = matchingStatus === 'ACCEPTED';
    const isMatchingConfirmed = matchingStatus === 'CONFIRMED';
    const canPay = canMakePayment(reservation);

    return (
      <div
        className={`reservation-card ${reservation.status === 'cancelled' ? 'cancelled' : ''}`}
        onClick={() => handleReservationClick(reservation)} // 전체 카드 클릭 기능 복원
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

          {/* 매칭 수락/거절 버튼 - 매칭 수락됐지만 아직 확인하지 않은 경우 */}
          {isMatchingAccepted && !isMatchingConfirmed && (
            <div className="matching-actions">
              <p className="matching-notice">🎉 매니저가 매칭되었습니다!</p>
              <div className="matching-buttons">
                <button
                  className="accept-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // 카드 클릭 이벤트 방지
                    handleMatchingResponse(reservation, 'CONFIRM');
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '처리 중...' : '확인'}
                </button>
                <button
                  className="reject-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // 카드 클릭 이벤트 방지
                    handleMatchingResponse(reservation, 'REJECT');
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '처리 중...' : '거절'}
                </button>
              </div>
            </div>
          )}

          {/* 결제 버튼 - 매칭 확인 완료 후 결제 가능한 경우 */}
          {canPay && (
            <div className="payment-actions">
              <p className="payment-notice">💳 결제를 진행해주세요</p>
              <button
                className="payment-btn"
                onClick={(e) => {
                  e.stopPropagation(); // 카드 클릭 이벤트 방지
                  handlePayment(reservation);
                }}
              >
                {price.toLocaleString()}원 결제하기
              </button>
            </div>
          )}
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

      {/* 거절 사유 입력 모달 */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>매칭 거절 사유</h3>
            <textarea
              value={rejectMemo}
              onChange={(e) => setRejectMemo(e.target.value)}
              placeholder="거절 사유를 입력해주세요 (선택사항)"
              rows={4}
            />
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectMemo('');
                  setSelectedReservation(null);
                }}
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                className="submit-btn"
                onClick={() => {
                  if (selectedReservation) {
                    submitMatchingResponse(
                      selectedReservation,
                      'REJECT',
                      rejectMemo
                    );
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? '처리 중...' : '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReservationList;
