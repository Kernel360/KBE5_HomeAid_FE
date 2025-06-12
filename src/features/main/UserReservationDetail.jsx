import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import './UserReservationDetail.css';
import { useCustomerReservation } from '../reservation/hooks/useCustomerAPI.js';

const UserReservationDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: reservationId } = useParams();

  const { getReservationById } = useCustomerReservation();

  const [reservation, setReservation] = useState(
    location.state?.reservation || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReservationDetail = async () => {
      if (!reservationId) {
        setError('예약 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const backendReservation = await getReservationById(reservationId);

        if (backendReservation) {
          const transformedReservation = {
            id:
              backendReservation.id ||
              backendReservation.reservationId ||
              reservationId,
            type: getServiceName(
              backendReservation.subOptionId,
              backendReservation.subOptionName,
              backendReservation
            ),
            icon: getServiceIcon(backendReservation.subOptionId),
            status: backendReservation.status || 'REQUESTED',
            date:
              backendReservation.requestedDate ||
              backendReservation.date ||
              '날짜 정보 없음',
            time: formatTimeRange(
              backendReservation.requestedTime || backendReservation.time,
              backendReservation.totalDuration || 180
            ),
            price: getServicePrice(
              backendReservation.totalPrice,
              backendReservation.subOptionId,
              backendReservation.subOptionName,
              backendReservation
            ),

            // ⭐️ DB에서 가져온 주소 정보 (안전한 접근)
            address:
              backendReservation.customerAddress?.main ||
              backendReservation.address ||
              '주소 정보 없음',
            addressDetail:
              backendReservation.customerAddress?.detail ||
              backendReservation.addressDetail ||
              '',

            customerNote:
              backendReservation.customerMemo ||
              backendReservation.customerNote ||
              '',
            createdAt: backendReservation.createdAt || new Date().toISOString(),

            // ⭐️ 원본 백엔드 데이터도 보존
            backendData: {
              ...backendReservation,
              latitude: backendReservation.latitude,
              longitude: backendReservation.longitude,
            },
          };

          setReservation(transformedReservation);
        } else {
          setError('예약 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('Failed to load reservation detail:', err);

        // ⭐️ 백엔드 실패 시 URL state 데이터 사용 (fallback)
        if (location.state?.reservation) {
          setReservation(location.state.reservation);
          setError(null);
        } else {
          setError(`예약 정보를 불러오는데 실패했습니다: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadReservationDetail();
  }, [reservationId, getReservationById, location.state]);

  const getServiceName = (subOptionId, subOptionName, backendData) => {
    // 1. 백엔드에서 받은 subOptionName 우선 사용
    if (subOptionName) return subOptionName;

    // 2. backendData에서 서비스 이름 찾기
    if (backendData?.subOptionName) return backendData.subOptionName;
    if (backendData?.serviceName) return backendData.serviceName;
    if (backendData?.type) return backendData.type;

    // 3. subOptionId로 매핑
    const serviceMapping = {
      1: '빨래/세탁',
      2: '청소',
      3: '육아',
    };

    if (subOptionId && serviceMapping[subOptionId]) {
      return serviceMapping[subOptionId];
    }

    return '서비스';
  };

  const getServiceIcon = (subOptionId) => {
    const iconMapping = {
      1: 'laundry',
      2: 'cleaning',
      3: 'childcare',
    };
    return iconMapping[subOptionId] || 'home';
  };

  const formatTimeRange = (startTime, durationMinutes = 180) => {
    if (!startTime) return '시간 정보 없음';

    const timeStr = startTime.includes(':')
      ? startTime.substring(0, 5)
      : startTime;

    if (!durationMinutes) return timeStr;

    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;

    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
    return `${timeStr} ~ ${endTime}`;
  };

  // 서비스 아이콘 매핑
  const getServiceEmoji = (icon) => {
    const emojiMapping = {
      cleaning: '🧹',
      laundry: '👕',
      childcare: '👶',
      home: '🏠',
    };
    return emojiMapping[icon] || '🏠';
  };

  // 상태 한글 매핑
  const getStatusText = (status) => {
    const statusMapping = {
      pending: '예약 요청됨',
      REQUESTED: '예약 요청됨', // 백엔드 상태
      MATCHING: '매니저 매칭 중', // 백엔드 상태
      MATCHED: '매칭 완료', // 백엔드 상태
      completed: '매칭 완료',
      COMPLETED: '서비스 완료', // 백엔드 상태
      visited: '서비스 완료',
      CANCELLED: '예약 취소됨', // 백엔드 상태
      cancelled: '예약 취소됨',
    };
    return statusMapping[status] || '알 수 없음';
  };

  // 상태 색상 매핑
  const getStatusColor = (status) => {
    const colorMapping = {
      pending: '#ffc107',
      REQUESTED: '#ffc107', // 백엔드 상태
      MATCHING: '#17a2b8', // 백엔드 상태
      MATCHED: '#28a745', // 백엔드 상태
      completed: '#28a745',
      COMPLETED: '#6c757d', // 백엔드 상태
      visited: '#6c757d',
      CANCELLED: '#dc3545', // 백엔드 상태
      cancelled: '#dc3545',
    };
    return colorMapping[status] || '#6c757d';
  };

  // 결제 가능 여부 확인
  const canMakePayment = (status) => {
    // ⭐️ 결제 완료 여부 확인 추가
    if (reservation.backendData) {
      // 백엔드 데이터에서 결제 정보 확인
      const hasPayment =
        reservation.backendData.paymentId ||
        reservation.backendData.paidAt ||
        reservation.backendData.paymentStatus === 'COMPLETED';

      // 결제가 이미 완료된 경우 결제 버튼 비활성화
      if (hasPayment) {
        return false;
      }
    }

    // ⭐️ 서비스 완료 상태는 결제 불가
    if (status === 'COMPLETED' || status === 'visited') {
      return false;
    }

    // ⭐️ 취소된 예약은 결제 불가
    if (status === 'CANCELLED' || status === 'cancelled') {
      return false;
    }

    // MATCHED 상태일 때만 결제 가능
    return status === 'MATCHED' || status === 'completed';
  };

  // 결제하기 버튼 클릭
  const handlePayment = () => {
    navigate('/customer/payment', {
      state: {
        reservation: reservation,
        fromDetail: true,
      },
    });
  };

  // ⭐️ 서비스 가격 계산 함수 강화
  const getServicePrice = (
    totalPrice,
    subOptionId,
    subOptionName,
    backendData
  ) => {
    // 1. 백엔드에서 받은 totalPrice 우선 사용
    if (totalPrice && totalPrice > 0) return totalPrice;

    // 2. backendData에서 가격 찾기
    if (backendData?.totalPrice && backendData.totalPrice > 0)
      return backendData.totalPrice;
    if (backendData?.price && backendData.price > 0) return backendData.price;

    // 3. 서비스 유형별 기본 가격 설정
    if (subOptionName) {
      if (subOptionName.includes('빨래') || subOptionName.includes('세탁'))
        return 40000;
      if (subOptionName.includes('청소')) return 58000;
      if (subOptionName.includes('육아')) return 62000;
    }

    // 4. subOptionId로 기본 가격 매핑
    const priceMapping = {
      1: 40000, // 빨래/세탁
      2: 58000, // 청소
      3: 62000, // 육아
    };

    if (subOptionId && priceMapping[subOptionId]) {
      return priceMapping[subOptionId];
    }

    return 50000; // 기본값
  };

  if (loading) {
    return (
      <div className="reservation-detail-page">
        <Header
          showBackButton
          onBackClick={() => navigate('/customer/reservations')}
        />
        <div className="page-content-wrapper">
          <div className="loading-container">
            <div className="loading-spinner">예약 정보를 불러오는 중...</div>
            <p
              style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}
            >
              예약 ID: {reservationId}
            </p>
          </div>
        </div>
        <Footer current="/customer/reservations" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="reservation-detail-page">
        <Header
          showBackButton
          onBackClick={() => navigate('/customer/reservations')}
        />
        <div className="page-content-wrapper">
          <div className="error-container">
            <p>{error}</p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              예약 ID: {reservationId}
            </p>
            <button onClick={() => navigate('/customer/reservations')}>
              목록으로 돌아가기
            </button>
          </div>
        </div>
        <Footer current="/customer/reservations" />
      </div>
    );
  }

  // ⭐️ reservation이 여전히 없는 경우 기본값으로 설정
  if (!reservation) {
    const defaultReservation = {
      id: reservationId,
      type: getServiceName(2, '청소', {}), // 기본값으로 청소 서비스
      icon: 'cleaning',
      status: 'REQUESTED',
      date: '날짜 정보 없음',
      time: '시간 정보 없음',
      price: getServicePrice(null, 2, '청소', {}), // 기본값으로 청소 가격
      address: '주소 정보 없음',
      addressDetail: '',
      customerNote: '',
      createdAt: new Date().toISOString(),
      backendData: {},
    };
    setReservation(defaultReservation);
  }

  return (
    <div className="reservation-detail-page">
      <Header
        showBackButton
        onBackClick={() => navigate('/customer/reservations')}
      />
      <div className="page-content-wrapper">
        <div className="reservation-detail-container">
          {/* 예약 상태 배지 */}
          <div className="status-section">
            <div
              className="status-badge"
              style={{
                backgroundColor: getStatusColor(
                  reservation?.status || 'REQUESTED'
                ),
              }}
            >
              {getStatusText(reservation?.status || 'REQUESTED')}
            </div>
          </div>

          {/* 서비스 정보 섹션 */}
          <div className="info-section">
            <h3 className="section-title">
              <span className="section-icon">
                {getServiceEmoji(reservation?.icon || 'home')}
              </span>
              서비스 정보
            </h3>
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">서비스 유형</span>
                <span className="info-value">
                  {reservation?.type || '서비스'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">예약 금액</span>
                <span className="info-value price">
                  {(reservation?.price || 0).toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* 일정 정보 섹션 */}
          <div className="info-section">
            <h3 className="section-title">
              <span className="section-icon">📅</span>
              일정 정보
            </h3>
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">예약 날짜</span>
                <span className="info-value">
                  {reservation?.date || '날짜 정보 없음'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">예약 시간</span>
                <span className="info-value">
                  {reservation?.time || '시간 정보 없음'}
                </span>
              </div>
            </div>
          </div>

          {/* 주소 정보 섹션 */}
          <div className="info-section">
            <h3 className="section-title">
              <span className="section-icon">📍</span>
              주소 정보
            </h3>
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">서비스 주소</span>
                <span className="info-value">
                  {reservation?.address || '주소 정보 없음'}
                </span>
              </div>
              {reservation?.addressDetail && (
                <div className="info-row">
                  <span className="info-label">상세 주소</span>
                  <span className="info-value">
                    {reservation.addressDetail}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 위치 정보 섹션 (백엔드 데이터가 있을 때) */}
          {/* TODO: 향후 위치정보 기능 구현 시 활성화 예정
          {reservation.backendData && (
            <div className="info-section">
              <h3 className="section-title">
                <span className="section-icon">🌍</span>
                위치 정보
              </h3>
              <div className="info-card">
                {reservation.backendData.latitude && (
                  <div className="info-row">
                    <span className="info-label">위도</span>
                    <span className="info-value coordinates">
                      {reservation.backendData.latitude.toFixed(6)}
                    </span>
                  </div>
                )}
                {reservation.backendData.longitude && (
                  <div className="info-row">
                    <span className="info-label">경도</span>
                    <span className="info-value coordinates">
                      {reservation.backendData.longitude.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          */}

          {/* 추가 정보 섹션 */}
          {reservation?.customerNote && (
            <div className="info-section">
              <h3 className="section-title">
                <span className="section-icon">📝</span>
                고객 요청사항
              </h3>
              <div className="info-card">
                <div className="note-content">{reservation.customerNote}</div>
              </div>
            </div>
          )}

          {/* 예약 ID 정보 */}
          <div className="info-section">
            <h3 className="section-title">
              <span className="section-icon">🔢</span>
              예약 정보
            </h3>
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">예약 번호</span>
                <span className="info-value">
                  {reservation?.id || reservationId}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">예약 일시</span>
                <span className="info-value">
                  {reservation?.createdAt
                    ? new Date(reservation.createdAt).toLocaleString('ko-KR')
                    : '정보 없음'}
                </span>
              </div>
            </div>
          </div>

          {/* 결제하기 버튼 (MATCHED/completed 상태일 때만 표시) */}
          {canMakePayment(reservation?.status) && (
            <div className="payment-section">
              <div className="payment-info">
                <p className="payment-notice">
                  🎉 매니저가 배정되었습니다! 이제 결제를 진행하세요.
                </p>
                <div className="manager-info">
                  <span className="manager-label">배정된 매니저:</span>
                  <span className="manager-value">매니저 (ID: 10)</span>
                </div>
              </div>
              <button className="payment-btn" onClick={handlePayment}>
                💳 {(reservation?.price || 0).toLocaleString()}원 결제하기
              </button>
            </div>
          )}

          {/* ⭐️ 결제 완료 상태 안내 */}
          {!canMakePayment(reservation?.status) &&
            (reservation?.status === 'MATCHED' ||
              reservation?.status === 'completed') && (
              <div className="payment-completed-section">
                <div className="payment-completed-info">
                  <p className="payment-completed-notice">
                    ✅ 결제가 완료되었습니다!
                  </p>
                  {reservation?.backendData &&
                    reservation.backendData.paidAt && (
                      <div className="payment-date-info">
                        <span className="payment-date-label">결제 일시:</span>
                        <span className="payment-date-value">
                          {new Date(
                            reservation.backendData.paidAt
                          ).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    )}
                  <div className="service-ready-info">
                    <p className="service-ready-notice">
                      💼 매니저가 서비스 준비 중입니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* 결제 대기 상태 안내 */}
          {reservation?.status === 'pending' ||
          reservation?.status === 'REQUESTED' ||
          reservation?.status === 'MATCHING' ? (
            <div className="waiting-section">
              <div className="waiting-info">
                <p className="waiting-notice">
                  ⏳ 매니저 매칭을 기다리고 있습니다...
                </p>
                <p className="waiting-description">
                  매니저가 배정되면 결제를 진행할 수 있습니다.
                </p>
              </div>
            </div>
          ) : null}

          {/* ⭐️ 서비스 완료 상태 안내 */}
          {(reservation?.status === 'COMPLETED' ||
            reservation?.status === 'visited') && (
            <div className="service-completed-section">
              <div className="service-completed-info">
                <p className="service-completed-notice">
                  🎊 서비스가 완료되었습니다!
                </p>
                <p className="service-completed-description">
                  서비스를 이용해 주셔서 감사합니다.
                </p>
              </div>
            </div>
          )}

          {/* ⭐️ 취소 상태 안내 */}
          {(reservation?.status === 'CANCELLED' ||
            reservation?.status === 'cancelled') && (
            <div className="cancelled-section">
              <div className="cancelled-info">
                <p className="cancelled-notice">❌ 예약이 취소되었습니다.</p>
                <p className="cancelled-description">
                  새로운 예약을 원하시면 다시 신청해 주세요.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer current="/customer/reservations" />
    </div>
  );
};

export default UserReservationDetail;
