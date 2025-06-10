import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import useReservationStore from '../../../stores/reservationStore';
import { usePaymentData } from '../../reservation/hooks/useLocalStorage';
// ⭐️ 중복 예약 생성 방지를 위해 createCustomerReservation import 제거
// import { createCustomerReservation } from '../../reservation/api/customerAPI';
import './UserPaymentComplete.css';

const UserPaymentComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ⭐️ 결제 페이지에서 전달받은 결제 정보
  const { paymentResult, serviceInfo, totalAmount } = location.state || {};

  const {
    reservationData,
    getSelectedServicesWithDetails,
    resetReservationData,
  } = useReservationStore();
  const selectedServices = getSelectedServicesWithDetails();

  // ⭐️ 결제 완료 후 데이터 정리를 위한 hook 추가
  const { clearPaymentData } = usePaymentData();

  useEffect(() => {
    // ⭐️ 중복 예약 생성 방지: 예약은 이미 UserServiceRequest에서 생성되었음
    // 결제 완료 페이지에서는 매니저 할당만 처리하거나 단순히 완료 상태만 표시
    const handlePaymentComplete = async () => {
      // 이미 처리되었는지 확인
      if (reservationData.isSaved || reservationData.managerId) {
        return;
      }

      // ⭐️ 예약은 이미 생성되었으므로 로컬 상태만 업데이트
      const { setReservationInfo } = useReservationStore.getState();
      setReservationInfo({
        managerId: 20, // 화면 표시용 (실제로는 백엔드에서 할당)
        status: 'CONFIRMED',
        isSaved: true,
      });
    };

    // 한번만 실행
    handlePaymentComplete();
  }, []); // 빈 dependency array로 컴포넌트 마운트 시 한번만

  const handleGoHome = () => {
    // ⭐️ 예약 데이터와 결제 데이터 모두 초기화
    resetReservationData();
    if (clearPaymentData) {
      clearPaymentData();
    }
    navigate('/');
  };

  const handleViewReservation = () => {
    // 예약 상세 페이지로 이동 (추후 구현)
    navigate('/user/reservations');
  };

  return (
    <div className="payment-complete-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="payment-complete-container">
          {/* 제목 섹션 */}
          <div className="title-section">
            <h1 className="page-title">결제가 완료되었습니다!</h1>
            <p className="page-subtitle">
              예약이 성공적으로 접수되었습니다.
              <br />
              매니저를 배정중이며 곧 연락을 드리겠습니다.
            </p>
          </div>

          {/* 성공 아이콘 */}
          <div className="success-icon">
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

          {/* 예약 정보 요약 */}
          <div className="reservation-summary">
            <h3 className="summary-title">결제 및 예약 정보</h3>

            {/* ⭐️ 백엔드에서 받은 결제 정보 표시 */}
            {paymentResult && (
              <>
                <div className="info-item">
                  <span className="info-label">결제 ID: </span>
                  <span className="info-value">{paymentResult.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">예약 번호: </span>
                  <span className="info-value">
                    {paymentResult.reservationId}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">결제 상태: </span>
                  <span className="info-value">
                    {paymentResult.status === 'COMPLETED'
                      ? '결제 완료'
                      : paymentResult.status === 'PENDING'
                        ? '결제 대기'
                        : paymentResult.status}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">결제 수단: </span>
                  <span className="info-value">
                    {paymentResult.paymentMethod === 'TRANSFER'
                      ? '계좌이체'
                      : paymentResult.paymentMethod === 'CARD'
                        ? '신용카드'
                        : paymentResult.paymentMethod === 'CASH'
                          ? '현금'
                          : paymentResult.paymentMethod}
                  </span>
                </div>
                {paymentResult.paidAt && (
                  <div className="info-item">
                    <span className="info-label">결제 시간: </span>
                    <span className="info-value">
                      {new Date(paymentResult.paidAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* 선택된 서비스 옵션 표시 */}
            <div className="info-item">
              <span className="info-label">서비스 유형: </span>
              <span className="info-value">
                {serviceInfo?.serviceType ||
                  reservationData.selectedSubOption?.name ||
                  '청소 서비스'}
              </span>
            </div>

            {/* 배정된 매니저 정보 */}
            <div className="info-item">
              <span className="info-label">배정 매니저: </span>
              <span className="info-value">배정중</span>
            </div>

            {(serviceInfo?.dateTime || reservationData.reservationDate) && (
              <div className="info-item">
                <span className="info-label">날짜: </span>
                <span className="info-value">
                  {serviceInfo?.dateTime ||
                    `${reservationData.reservationDate} ${reservationData.reservationTime}`}
                </span>
              </div>
            )}

            {reservationData.address && (
              <div className="info-item">
                <span className="info-label">주소: </span>
                <span className="info-value">
                  {/* 위도, 경도가 포함된 addressDetail만 표시하거나, address가 좌표 정보인 경우 처리 */}
                  {reservationData.addressDetail &&
                  reservationData.addressDetail.includes('위도:')
                    ? reservationData.addressDetail
                    : reservationData.address.includes('위도:')
                      ? reservationData.address
                      : `${reservationData.address} ${reservationData.addressDetail || ''}`}
                </span>
              </div>
            )}

            <div className="info-item">
              <span className="info-label">선택 서비스: </span>
              <span className="info-value">
                {selectedServices.length > 0
                  ? selectedServices.map((s) => s.name).join(', ')
                  : reservationData.selectedSubOption?.name ||
                    '기본 청소 서비스'}
              </span>
            </div>

            <div className="total-amount">
              <span className="amount-label">총 결제 금액: </span>
              <span className="amount-value">
                {(
                  paymentResult?.amount ||
                  totalAmount ||
                  reservationData.totalPrice ||
                  155000
                ).toLocaleString()}
                원
              </span>
            </div>
          </div>

          {/* 버튼들 */}
          <div className="action-buttons">
            <button
              onClick={handleViewReservation}
              className="primary-action-btn"
            >
              예약 내역 확인
            </button>

            <button onClick={handleGoHome} className="secondary-action-btn">
              홈으로 가기
            </button>
          </div>

          {/* 안내 문구 */}
          <p className="notice-text">
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
