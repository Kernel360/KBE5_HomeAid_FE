import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import useReservationStore from '../../../stores/reservationStore';

const UserPaymentComplete = () => {
  const navigate = useNavigate();
  const {
    reservationData,
    getSelectedServicesWithDetails,
    resetReservationData,
  } = useReservationStore();
  const selectedServices = getSelectedServicesWithDetails();

  useEffect(() => {
    // 결제 완료 후 예약 상태를 CONFIRMED로 변경
    const { setReservationStatus } = useReservationStore.getState();
    setReservationStatus('CONFIRMED');
  }, []);

  const handleGoHome = () => {
    // 예약 데이터 초기화하고 홈으로 이동
    resetReservationData();
    navigate('/user/service-option');
  };

  const handleViewReservation = () => {
    // 예약 상세 페이지로 이동 (추후 구현)
    navigate('/user/reservations');
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Header />
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          paddingTop: '56px',
          paddingBottom: '104px',
          paddingLeft: '16px',
          paddingRight: '16px',
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            backgroundColor: 'white',
            padding: '40px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          {/* 성공 아이콘 */}
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#4285f4',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
            >
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>

          {/* 제목 */}
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#333',
              marginBottom: '8px',
            }}
          >
            결제가 완료되었습니다!
          </h1>

          <p
            style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '32px',
              lineHeight: '1.5',
            }}
          >
            예약이 성공적으로 접수되었습니다.
            <br />
            매니저 배정 후 연락을 드리겠습니다.
          </p>

          {/* 예약 정보 요약 */}
          <div
            style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '32px',
              textAlign: 'left',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '16px',
              }}
            >
              예약 정보
            </h3>

            {reservationData.reservationDate && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>날짜: </span>
                <span
                  style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}
                >
                  {reservationData.reservationDate}{' '}
                  {reservationData.reservationTime}
                </span>
              </div>
            )}

            {reservationData.address && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#666', fontSize: '14px' }}>주소: </span>
                <span
                  style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}
                >
                  {reservationData.address} {reservationData.addressDetail}
                </span>
              </div>
            )}

            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>
                선택 서비스:{' '}
              </span>
              <span
                style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}
              >
                {selectedServices.length > 0
                  ? selectedServices.map((s) => s.name).join(', ')
                  : '기본 청소 서비스'}
              </span>
            </div>

            <div
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #e9ecef',
              }}
            >
              <span style={{ color: '#666', fontSize: '14px' }}>
                총 결제 금액:{' '}
              </span>
              <span
                style={{
                  color: '#4285f4',
                  fontSize: '18px',
                  fontWeight: '700',
                }}
              >
                {reservationData.totalPrice > 0
                  ? reservationData.totalPrice.toLocaleString()
                  : '155,000'}
                원
              </span>
            </div>
          </div>

          {/* 버튼들 */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <button
              onClick={handleViewReservation}
              style={{
                width: '100%',
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#3367d6')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#4285f4')}
            >
              예약 내역 확인
            </button>

            <button
              onClick={handleGoHome}
              style={{
                width: '100%',
                backgroundColor: 'white',
                color: '#666',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#d0d0d0';
                e.target.style.backgroundColor = '#f8f9fa';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#e9ecef';
                e.target.style.backgroundColor = 'white';
              }}
            >
              홈으로 가기
            </button>
          </div>

          {/* 안내 문구 */}
          <p
            style={{
              fontSize: '12px',
              color: '#999',
              marginTop: '24px',
              lineHeight: '1.4',
            }}
          >
            예약 변경이나 취소가 필요한 경우
            <br />
            고객센터로 연락주세요.
          </p>
        </div>
      </div>
      <Footer current="/user/payment-complete" />
    </div>
  );
};

export default UserPaymentComplete;
