import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManagerMatchingRequest.css';
import Footer from '../../../components/Footer.jsx';
import Header from '../../../components/Header.jsx';
import { apiService } from '../../../store/api';
import reservationStore from '../store/reservationStore.js';

const ManagerMatchingRequest = () => {

  const navigate = useNavigate();
  const [rejectReason, setRejectReason] = useState('');
  const reservationId = reservationStore((state) => state.reservationId);
  const [reservation, setReservation] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const matchingItem = reservationStore((state) => state.matching);


  const fetchReservation = async (reservationId) => {
    const response = await apiService.reservation.getById(reservationId)
    console.log('수락하기 페이지 예약 정보', response.data.data);

    setReservation(response.data.data)
  }

  useEffect(() => {
    fetchReservation(reservationId);
  }, [reservationId])

  const fetchMatchAccept = async () => {
    console.log('matchingItem', matchingItem);
    console.log('matching id', matchingItem.matchingId);
    const request = {
      action: 'ACCEPT',
    }
    const response = await apiService.matching.acceptMatching(matchingItem.matchingId, request);
    return response.data.success;
  }


  // 매칭 수락
  const handleAccept = async () => {
    if (!confirm('해당 예약 건의 수락 하시겠습니까?')) {
      return;
    }
    try {
      const acceptResult =  await fetchMatchAccept();
      if (acceptResult) {
        alert('해당 매칭에 수락하였습니다')
        navigate('/matching/list');
      }
    } catch (error) {
      console.error('매칭 수락 실패:', error);
    }
  };

  // 매칭 거절
  const handleReject = async () => {
    console.log('스토어 매칭아이템 확인', matchingItem)
    const data = {
      action: 'REJECT',
      memo: rejectReason,
    }
    const response = await apiService.matching.acceptMatching(matchingItem.matchingId, data);
    console.log('매니저 매칭 거절 요청', response.data)
    if (response.data.success) {
      alert('해당 매칭을 거절하였습니다.')
      handleBack();
    }
  };

  const handleRejectCancel = () => {
    setOpenModal(false);
    setRejectReason('');
  };

  const handleRejectModalOpen = () => {
    if (confirm('해당 매칭을 거절하시겠습니까?')) {
      setOpenModal(true);
    }
  };

  // 뒤로가기
  const handleBack = () => {
    navigate('/matching/list');
  };

  // 로딩 상태
  // if ((managerLoading || customerLoading) && !matchingRequest.customerName) {
  //   return (
  //     <div className="manager-matching-page">
  //       <Header />
  //       <div className="page-content-wrapper">
  //         <div className="manager-matching-request-container">
  //           <div className="loading-container">
  //             <p>{NOTIFICATION_MESSAGES.GENERAL.LOADING}</p>
  //           </div>
  //         </div>
  //       </div>
  //       <Footer current="/matching/matching-request" />
  //     </div>
  //   );
  // }

  // 에러 상태
  // if (managerError && !matchingRequest.customerName) {
  //   return (
  //     <div className="manager-matching-page">
  //       <Header />
  //       <div className="page-content-wrapper">
  //         <div className="manager-matching-request-container">
  //           <div className="error-container">
  //             <p>{managerError}</p>
  //             <button
  //               onClick={() => window.location.reload()}
  //               className="retry-button"
  //             >
  //               새로고침
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //       <Footer current="/matching/matching-request" />
  //     </div>
  //   );
  // }

  return (
    <div className="manager-matching-page">
      <Header showBackButton onBackClick={handleBack} />
      <div className="page-content-wrapper">
        <div className="manager-matching-request-container">
          <h1 className="page-title">매칭 요청</h1>

          {/* 매칭 상태 표시 */}
          <div className="status-section">
            {/* <div className="status-item">
              <span className="status-label">매칭 ID</span>
              <span className="status-value">
                #{matchingRequest.matchingId}
              </span>
            </div> */}
            <div className="status-item">
              <span className="status-label">현재 상태</span>
              <span className={`status-badge `}>
                {reservation.status === 'test' &&
                  '매니저 응답 대기'}
                {reservation.status === 'test' && '고객 응답 대기'}
                {reservation.status === 'test' &&
                  '매칭 완료'}
                {reservation.status === 'test' && '매니저 거절'}
                {reservation.status === 'test' && '고객 거절'}
              </span>
            </div>
          </div>

          {/* 고객 정보 */}
          <div className="section">
            <h2 className="section-title">고객 정보</h2>
            <div className="info-card">
              <div className="info-item">
                <span className="label">고객명</span>
                <span className="value">{reservation.customerName}</span>
              </div>
            </div>
          </div>

          {/* 서비스 정보 */}
          <div className="section">
            <h2 className="section-title">서비스 정보</h2>
            <div className="info-card">
              <div className="info-item">
                <span className="label">서비스 유형</span>
                <span className="value">{reservation.subOptionName}</span>
              </div>
              <div className="info-item">
                <span className="label">날짜</span>
                <span className="value">{reservation.requestedDate}</span>
              </div>
              <div className="info-item">
                <span className="label">시간</span>
                <span className="value">{reservation.requestedTime}</span>
              </div>
              <div className="info-item">
                <span className="label">예상 소요시간</span>
                <span className="value">
                  {reservation.totalDuration}시간
                </span>
              </div>
              <div className="info-item">
                <span className="label">위치</span>
                <span className="value">{reservation.address}{reservation.addressDetail}</span>
              </div>
               <div className="info-item">
                <span className="label">요청사항</span>
                <span className="value">{reservation.customerMemo}</span>
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="action-section">
            {reservation.status === 'MATCHING' && (
              <div className="button-group">
                <button
                  onClick={handleAccept}
                  className="accept-button"
                  // disabled={managerLoading}
                >
                  {/* {reservation ? '처리 중...' : '수락'} */}
                  수락
                </button>
                <button
                  onClick={handleRejectModalOpen}
                  className="reject-button"
                >
                  거절
                </button>
              </div>
            )}

            {reservation.status === 'test' && (
              <div className="waiting-message">
                <p>고객의 응답을 기다리고 있습니다...</p>
              </div>
            )}

            {reservation.status ===  'teste' && (
              <div className="success-message">
                <p>매칭이 완료되었습니다!</p>
                <button
                  onClick={() => navigate('/matching/service-checkin')}
                  className="service-start-button"
                >z
                  서비스 시작하기
                </button>
              </div>
            )}

            {(reservation.status === 'tetes' ||
              reservation.status === 'testes' ) && (
              <div className="rejected-message">
                <p>매칭이 거절되었습니다.</p>
                <button onClick={handleBack} className="back-button">
                  목록으로 돌아가기
                </button>
              </div>
            )}
          </div>

          {/* 거절 사유 입력 모달 */}
          { openModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>거절 사유 입력</h3>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="거절 사유를 입력해주세요."
                  className="reject-reason-input"
                />
                <div className="modal-actions">
                  <button
                    onClick={handleRejectCancel}
                    className="cancel-button"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleReject}
                    className="confirm-button"
                    // disabled={!rejectReason.trim() || managerLoading}
                  >
                    {/* {managerLoading ? '처리 중...' : '확인'} */}
                    확인
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer current="/matching/matching-request" />
    </div>
  );
};

export default ManagerMatchingRequest;
