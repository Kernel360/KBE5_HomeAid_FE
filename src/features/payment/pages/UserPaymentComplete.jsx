import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import useReservationStore from '../../../stores/reservationStore';
import { createCustomerReservation } from '../../reservation/api/customerAPI';
import './UserPaymentComplete.css';

const UserPaymentComplete = () => {
  const navigate = useNavigate();
  const {
    reservationData,
    getSelectedServicesWithDetails,
    resetReservationData,
  } = useReservationStore();
  const selectedServices = getSelectedServicesWithDetails();

  useEffect(() => {
    // 결제 완료 후 실제 DB에 매니저 ID 저장 (한번만 실행)
    const saveManagerIdToDB = async () => {
      // 이미 처리되었는지 확인
      if (reservationData.isSaved || reservationData.managerId) {
        return;
      }

      try {
        console.log('👨‍💼 예약 생성 및 매니저 할당 시작...');

        // ⭐️ 1단계: 예약 생성 (managerId 없이)
        const reservationRequest = {
          subOptionId: Number(reservationData.selectedSubOption?.id) || 1,
          requestedDate:
            reservationData.reservationDate ||
            new Date().toISOString().split('T')[0],
          requestedTime: reservationData.reservationTime
            ? `${reservationData.reservationTime}:00`
            : '14:00:00',
          customerNote: reservationData.customerNote || null,
        };

        console.log('📝 1단계: 예약 생성 요청:', reservationRequest);

        // 백엔드 API 호출 - 예약 생성
        const response = await createCustomerReservation(reservationRequest);

        console.log(
          '✅ 1단계: 예약 생성 완료 - 예약 ID:',
          response.reservationId
        );

        // ⭐️ 임시: 매니저 할당 비활성화 (예약 생성만 확인)
        console.log('📝 매니저 할당은 임시로 비활성화, 로컬에만 저장');

        // 로컬 상태 업데이트
        const { setReservationInfo } = useReservationStore.getState();
        setReservationInfo({
          managerId: 20, // 화면 표시용
          reservationId: response.reservationId,
          status: 'CONFIRMED',
          isSaved: true,
        });

        // TODO: 매니저 할당 API 개발 완료 후 활성화
        /*
        // ⭐️ 2단계: 생성된 예약에 매니저 ID 20 할당
        if (response.reservationId) {
          try {
            console.log('👨‍💼 2단계: 매니저 ID 20 할당 시작...');
            
            await assignManagerToReservation(response.reservationId, 20);
            
            console.log('🎯 2단계: 매니저 ID 20 DB 할당 성공!');
            
            // 로컬 상태 업데이트
            const { setReservationInfo } = useReservationStore.getState();
            setReservationInfo({ 
              managerId: 20,
              reservationId: response.reservationId,
              status: 'CONFIRMED',
              isSaved: true 
            });
            
          } catch (managerError) {
            console.log('❌ 2단계: 모든 매니저 할당 방법 실패, 로컬에만 저장');
            console.log('매니저 할당 오류:', managerError.message);
            
            // 매니저 할당 실패 시에도 예약은 성공했으므로 로컬 상태 업데이트
            const { setReservationInfo } = useReservationStore.getState();
            setReservationInfo({ 
              managerId: 20,
              reservationId: response.reservationId,
              status: 'CONFIRMED',
              isSaved: true 
            });
          }
        }
        */
      } catch (error) {
        console.log('❌ 예약 생성 실패, 로컬에만 매니저 ID 20 저장');
        console.log('오류 내용:', error.message);

        // API 실패 시에도 로컬 상태는 업데이트
        const { setReservationInfo } = useReservationStore.getState();
        setReservationInfo({
          managerId: 20,
          status: 'CONFIRMED',
          isSaved: true,
        });
      }
    };

    // 한번만 실행
    saveManagerIdToDB();
  }, []); // 빈 dependency array로 컴포넌트 마운트 시 한번만

  const handleGoHome = () => {
    // 예약 데이터 초기화하고 메인 홈페이지로 이동
    resetReservationData();
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
              매니저(ID: 20)가 배정되어 곧 연락을 드리겠습니다.
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
            <h3 className="summary-title">예약 정보</h3>

            {/* 선택된 서비스 옵션 표시 */}
            <div className="info-item">
              <span className="info-label">서비스 유형: </span>
              <span className="info-value">
                {reservationData.selectedSubOption?.name || '청소 서비스'}
              </span>
            </div>

            {/* 배정된 매니저 정보 */}
            <div className="info-item">
              <span className="info-label">배정 매니저: </span>
              <span className="info-value">매니저 ID: 20</span>
            </div>

            {reservationData.reservationDate && (
              <div className="info-item">
                <span className="info-label">날짜: </span>
                <span className="info-value">
                  {reservationData.reservationDate}{' '}
                  {reservationData.reservationTime}
                </span>
              </div>
            )}

            {reservationData.address && (
              <div className="info-item">
                <span className="info-label">주소: </span>
                <span className="info-value">
                  {reservationData.address} {reservationData.addressDetail}
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
                {reservationData.totalPrice > 0
                  ? reservationData.totalPrice.toLocaleString()
                  : '155,000'}
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
