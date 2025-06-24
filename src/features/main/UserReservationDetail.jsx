import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import './UserReservationDetail.css';
import { useCustomerReservation } from '../reservation/hooks/useCustomerAPI.js';

// API 기본 URL 구성
const getBaseUrl = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
  return `${API_BASE_URL}/api/${API_VERSION}`;
};

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
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectMemo, setRejectMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        console.log('🔍 예약 상세 조회 시작 - reservationId:', reservationId);
        
        const backendReservation = await getReservationById(reservationId);
        const data = backendReservation.data;
        
        console.log('✅ API 호출 완료 - 백엔드 응답:', backendReservation);

        if (data) {
          // ⭐️ 디버깅: 백엔드에서 받은 주소 데이터 확인
          console.log('📋 백엔드 예약 데이터 전체:', data);
          console.log('📍 주소 관련 필드들:', {
            address: data.address,
            addressDetail: data.addressDetail,
            customerAddress: data.customerAddress,
            fullAddress: data.fullAddress,
          });

          const transformedReservation = {
            id: data.reservationId || data.id || reservationId,
            type: data.serviceOptionName || getServiceName(1, '청소', data),
            icon: getServiceIcon(1),
            status: data.status || 'REQUESTED',
            date: data.requestedDate,
            time: data.requestedTime,
            price: data.totalPrice || getServicePrice(null, 1, '청소', data),

            // ⭐️ address와 addressDetail을 모두 받아와서 조합
            address: (() => {
              const mainAddress = data.address || location.state?.reservation?.address || '';
              const detailAddress = data.addressDetail || location.state?.reservation?.addressDetail || '';
              if (mainAddress && detailAddress) return `${mainAddress} ${detailAddress}`;
              if (mainAddress) return mainAddress;
              if (detailAddress) return detailAddress;
              return '주소 정보 없음';
            })(),
            addressDetail: '', // 상세 주소는 별도로 표시하지 않음

            customerNote: data.customerMemo || '',
            createdAt: data.startTime || new Date().toISOString(),

            // ⭐️ 백엔드 DTO의 추가 필드들도 보존
            backendData: data,
          };

          // ⭐️ 디버깅: 최종 변환된 예약 데이터 확인
          console.log('🎯 최종 변환된 예약 데이터:', transformedReservation);

          setReservation(transformedReservation);
        } else {
          console.error('❌ 백엔드에서 예약 데이터를 받지 못함');
          setError('예약 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('❌ 예약 상세 조회 실패:', err);

        if (location.state?.reservation) {
          console.log('🔄 URL state 데이터로 fallback');
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
    if (subOptionName) return subOptionName;

    if (backendData?.subOptionName) return backendData.subOptionName;
    if (backendData?.serviceName) return backendData.serviceName;
    if (backendData?.type) return backendData.type;

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

  const getServiceEmoji = (icon) => {
    const emojiMapping = {
      cleaning: '🧹',
      laundry: '👕',
      childcare: '👶',
      home: '🏠',
    };
    return emojiMapping[icon] || '🏠';
  };

  const getStatusText = (status) => {
    const statusMapping = {
      pending: '예약 요청됨',
      REQUESTED: '예약 요청됨',
      MATCHING: '매니저 매칭 중',
      MATCHED: '매칭 완료',
      completed: '매칭 완료',
      COMPLETED: '서비스 완료',
      visited: '서비스 완료',
      CANCELLED: '예약 취소됨',
      cancelled: '예약 취소됨',
    };
    return statusMapping[status] || '알 수 없음';
  };

  const getStatusColor = (status) => {
    const colorMapping = {
      pending: '#ffc107',
      REQUESTED: '#ffc107',
      MATCHING: '#17a2b8',
      MATCHED: '#28a745',
      completed: '#28a745',
      COMPLETED: '#6c757d',
      visited: '#6c757d',
      CANCELLED: '#dc3545',
      cancelled: '#dc3545',
    };
    return colorMapping[status] || '#6c757d';
  };

  const canMakePayment = (status) => {
    if (reservation.backendData) {
      const hasPayment =
        reservation.backendData.paymentId ||
        reservation.backendData.paidAt ||
        reservation.backendData.paymentStatus === 'COMPLETED';

      if (hasPayment) {
        return false;
      }
    }

    if (status === 'COMPLETED' || status === 'visited') {
      return false;
    }

    if (status === 'CANCELLED' || status === 'cancelled') {
      return false;
    }

    return status === 'MATCHED' || status === 'completed';
  };

  const handlePayment = () => {
    navigate('/customer/payment', {
      state: {
        reservation: reservation,
        fromDetail: true,
      },
    });
  };

  const getServicePrice = (
    totalPrice,
    subOptionId,
    subOptionName,
    backendData
  ) => {
    if (totalPrice && totalPrice > 0) return totalPrice;

    if (backendData?.totalPrice && backendData.totalPrice > 0)
      return backendData.totalPrice;
    if (backendData?.price && backendData.price > 0) return backendData.price;

    if (subOptionName) {
      if (subOptionName.includes('빨래') || subOptionName.includes('세탁'))
        return 40000;
      if (subOptionName.includes('청소')) return 58000;
      if (subOptionName.includes('육아')) return 62000;
    }

    const priceMapping = {
      1: 40000,
      2: 58000,
      3: 62000,
    };

    if (subOptionId && priceMapping[subOptionId]) {
      return priceMapping[subOptionId];
    }

    return 50000;
  };

  const handleMatchingResponse = async (action) => {
    if (action === 'REJECT') {
      setShowRejectModal(true);
      return;
    }

    await submitMatchingResponse(action);
  };

  const submitMatchingResponse = async (action, memo = '') => {
    if (!reservationId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('로그인이 필요합니다');
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
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('accessToken');
        navigate('/auth/signin');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '매칭 응답 처리에 실패했습니다.');
      }

      const updatedReservation = await getReservationById(reservationId);
      setReservation(updatedReservation);

      setShowRejectModal(false);
      setRejectMemo('');

      alert(
        action === 'CONFIRM'
          ? '매칭이 확인되었습니다.'
          : '매칭이 거절되었습니다.'
      );
    } catch (error) {
      console.error('매칭 응답 처리 실패:', error);
      setError(
        error.message ||
          '매칭 응답 처리에 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-white flex flex-col"
        style={{ maxWidth: '512px', margin: '0 auto' }}
      >
        <Header
          showBackButton
          onBackClick={() => navigate('/customer/reservations')}
        />
        <div
          style={{
            width: '100%',
            paddingTop: '80px',
            paddingBottom: '100px',
            padding: '80px 16px 100px 16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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
      <div
        className="min-h-screen bg-white flex flex-col"
        style={{ maxWidth: '512px', margin: '0 auto' }}
      >
        <Header
          showBackButton
          onBackClick={() => navigate('/customer/reservations')}
        />
        <div
          style={{
            width: '100%',
            paddingTop: '80px',
            paddingBottom: '100px',
            padding: '80px 16px 100px 16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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

  if (!reservation) {
    const defaultReservation = {
      id: reservationId,
      type: getServiceName(1, '청소', {}),
      icon: 'cleaning',
      status: 'REQUESTED',
      date: '날짜 정보 없음',
      time: '시간 정보 없음',
      price: getServicePrice(null, 2, '청소', {}),
      address: '주소 정보 없음',
      addressDetail: '',
      customerNote: '',
      createdAt: new Date().toISOString(),
      backendData: {},
    };
    setReservation(defaultReservation);
  }

  const detail = reservation.backendData?.data || {};

  const address =
    (detail.address && detail.addressDetail
      ? `${detail.address} ${detail.addressDetail}`
      : detail.address
      ? detail.address
      : detail.addressDetail
      ? detail.addressDetail
      : reservation.address) || '주소 정보 없음';

  const customerNote =
    detail.customerMemo ?? reservation.customerNote ?? '요청사항 없음';

  const managerName =
    detail.matchedManagerName ?? reservation.backendData?.matchedManagerName ?? '배정된 매니저 없음';

  const price =
    detail.totalPrice ?? reservation.price ?? 0;

  const type =
    detail.serviceOptionName ?? reservation.type ?? '서비스';

  const date =
    detail.requestedDate ?? reservation.date ?? '날짜 정보 없음';

  const time =
    detail.requestedTime
      ? formatTimeRange(detail.requestedTime, (detail.totalDuration ?? 3) * 60)
      : reservation.time ?? '시간 정보 없음';

  const status = detail.status || reservation.status || 'REQUESTED';

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      style={{ maxWidth: '512px', margin: '0 auto' }}
    >
      <Header
        showBackButton
        onBackClick={() => navigate('/customer/reservations')}
      />
      <div
        style={{
          width: '100%',
          paddingTop: '80px',
          paddingBottom: '100px',
          padding: '80px 16px 100px 16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="reservation-detail-container">
          <div className="status-section">
            <div
              className="status-badge"
              style={{
                backgroundColor: getStatusColor(
                  status
                ),
              }}
            >
              {getStatusText(status)}
            </div>
          </div>

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
                  {type}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">예약 금액</span>
                <span className="info-value price">
                  {price.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3 className="section-title">
              <span className="section-icon">📅</span>
              일정 정보
            </h3>
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">예약 날짜</span>
                <span className="info-value">
                  {date}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">예약 시간</span>
                <span className="info-value">
                  {time}
                </span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3 className="section-title">
              <span className="section-icon">📍</span>
              주소 정보
            </h3>
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">서비스 주소</span>
                <span className="info-value">
                  {address}
                </span>
              </div>
            </div>
          </div>

          {customerNote && (
            <div className="info-section">
              <h3 className="section-title">
                <span className="section-icon">📝</span>
                고객 요청사항
              </h3>
              <div className="info-card">
                <div className="note-content">{customerNote}</div>
              </div>
            </div>
          )}

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

          {canMakePayment(status) && (
            <div className="payment-section">
              <div className="payment-info">
                <p className="payment-notice">
                  매니저가 배정되었습니다! 이제 결제를 진행하세요.
                </p>
                <div className="manager-info">
                  <span className="manager-label">배정된 매니저:</span>
                  <span className="manager-value">{managerName}</span>
                </div>
              </div>
              <button className="payment-btn" onClick={handlePayment}>
                💳 {price.toLocaleString()}원 결제하기
              </button>
            </div>
          )}

          {!canMakePayment(status) &&
            (status === 'MATCHED' ||
              status === 'completed') && (
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

          {status === 'pending' ||
          status === 'REQUESTED' ||
          status === 'MATCHING' ? (
            <div className="waiting-section">
              <div className="waiting-info">
                {reservation?.backendData?.data?.matchingStatus === 'ACCEPTED' ? (
                  <>
                    <p className="waiting-notice">
                      🎉 매니저가 매칭되었습니다!
                    </p>
                    <p className="waiting-description">
                      매니저의 매칭을 확인해주세요.
                    </p>
                    <div className="matching-actions">
                      <button
                        className="accept-btn"
                        onClick={() => handleMatchingResponse('CONFIRM')}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? '처리 중...' : '확인'}
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleMatchingResponse('REJECT')}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? '처리 중...' : '거절'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="waiting-notice">
                      ⏳ 매니저 매칭을 기다리고 있습니다...
                    </p>
                    <p className="waiting-description">
                      매니저가 배정되면 결제를 진행할 수 있습니다.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : null}

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
                    }}
                    disabled={isSubmitting}
                  >
                    취소
                  </button>
                  <button
                    className="submit-btn"
                    onClick={() => submitMatchingResponse('REJECT', rejectMemo)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '처리 중...' : '확인'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {(status === 'COMPLETED' ||
            status === 'visited') && (
            <div className="service-completed-section">
              <div className="service-completed-info">
                <p className="service-completed-notice">
                  🎊 서비스가 완료되었습니다!
                </p>
                <p className="service-completed-description">
                  서비스를 이용해 주셔서 감사합니다.
                </p>
                <button
                  className="review-btn"
                  onClick={() => {
                    const targetReservationId =
                      reservation?.id || reservationId;
                    console.log(
                      '리뷰 쓰기 버튼 클릭 - reservationId:',
                      targetReservationId
                    );
                    console.log(
                      '리뷰 쓰기 이동 URL:',
                      `/customer/review/write?reservationId=${targetReservationId}`
                    );
                    navigate(
                      `/customer/review/write?reservationId=${targetReservationId}`
                    );
                  }}
                  style={{
                    marginTop: '15px',
                    padding: '12px 24px',
                    backgroundColor: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  리뷰 쓰기
                </button>
              </div>
            </div>
          )}

          {(status === 'CANCELLED' ||
            status === 'cancelled') && (
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
