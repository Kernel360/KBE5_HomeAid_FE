import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import './UserReservationDetail.css';

const UserReservationDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // URL state에서 예약 정보 가져오기
  const [reservation] = useState(location.state?.reservation || null);
  const [loading, setLoading] = useState(!reservation);

  useEffect(() => {
    // 예약 정보가 없으면 목록으로 돌아가기
    if (!reservation) {
      console.warn('예약 정보가 없습니다. 목록으로 돌아갑니다.');
      navigate('/user/reservations');
      return;
    }
    setLoading(false);
  }, [reservation, navigate]);

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
    // MATCHED 상태일 때만 결제 가능
    return status === 'MATCHED' || status === 'completed';
  };

  // 결제하기 버튼 클릭
  const handlePayment = () => {
    navigate('/user/payment', {
      state: {
        reservation: reservation,
        fromDetail: true,
      },
    });
  };

  if (loading) {
    return (
      <div className="reservation-detail-page">
        <Header />
        <div className="page-content-wrapper">
          <div className="loading-container">
            <div className="loading-spinner">로딩 중...</div>
          </div>
        </div>
        <Footer current="/user/reservations" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="reservation-detail-page">
        <Header />
        <div className="page-content-wrapper">
          <div className="error-container">
            <p>예약 정보를 찾을 수 없습니다.</p>
            <button onClick={() => navigate('/user/reservations')}>
              목록으로 돌아가기
            </button>
          </div>
        </div>
        <Footer current="/user/reservations" />
      </div>
    );
  }

  return (
    <div className="reservation-detail-page">
      <Header
        showBackButton
        onBackClick={() => navigate('/user/reservations')}
      />
      <div className="page-content-wrapper">
        <div className="reservation-detail-container">
          {/* 예약 상태 배지 */}
          <div className="status-section">
            <div
              className="status-badge"
              style={{ backgroundColor: getStatusColor(reservation.status) }}
            >
              {getStatusText(reservation.status)}
            </div>
          </div>

          {/* 서비스 정보 섹션 */}
          <div className="info-section">
            <h3 className="section-title">
              <span className="section-icon">
                {getServiceEmoji(reservation.icon)}
              </span>
              서비스 정보
            </h3>
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">서비스 유형</span>
                <span className="info-value">{reservation.type}</span>
              </div>
              <div className="info-row">
                <span className="info-label">예약 금액</span>
                <span className="info-value price">
                  {reservation.price.toLocaleString()}원
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
                <span className="info-value">{reservation.date}</span>
              </div>
              <div className="info-row">
                <span className="info-label">예약 시간</span>
                <span className="info-value">{reservation.time}</span>
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
                <span className="info-value">{reservation.address}</span>
              </div>
              {reservation.addressDetail && (
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

          {/* 추가 정보 섹션 */}
          {reservation.customerNote && (
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
                <span className="info-value">{reservation.id}</span>
              </div>
              <div className="info-row">
                <span className="info-label">예약 일시</span>
                <span className="info-value">
                  {reservation.createdAt
                    ? new Date(reservation.createdAt).toLocaleString('ko-KR')
                    : '정보 없음'}
                </span>
              </div>
            </div>
          </div>

          {/* 결제하기 버튼 (MATCHED/completed 상태일 때만 표시) */}
          {canMakePayment(reservation.status) && (
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
                💳 {reservation.price.toLocaleString()}원 결제하기
              </button>
            </div>
          )}

          {/* 결제 대기 상태 안내 */}
          {reservation.status === 'pending' ||
          reservation.status === 'REQUESTED' ||
          reservation.status === 'MATCHING' ? (
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
        </div>
      </div>
      <Footer current="/user/reservations" />
    </div>
  );
};

export default UserReservationDetail;
