import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManagerMatchingRequest.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import useMatchingStore from '../../../stores/matchingStore';
import { useAuthStore } from '../../../stores/authStore';
import {
  useManagerMatching,
  useCustomerMatching,
} from '../hooks/useManagerAPI';
import {
  NOTIFICATION_MESSAGES,
  MANAGER_ACTION,
  CUSTOMER_ACTION,
  MATCHING_STATUS,
} from '../constants/matchingData';
import useReservationStore from '../store/useMatchingStore';
import { apiService } from '../../../store/api';

const ManagerMatchingRequest = () => {
  const navigate = useNavigate();
  const [rejectReason, setRejectReason] = useState('');
  const activematching = useReservationStore((state) => state.activeMatching);
  const [reservation, setReservation] = useState({});

  // ⭐️ 인증 정보 확인
  const { user, accessToken } = useAuthStore();

  const fetchReservation = async (reservationId) => {
    const response = await apiService.reservation.getById(reservationId)
    console.log('수락하기 페이지 예약 정보', response.data.data);

    setReservation(response.data.data)
  }

  useEffect(() => {
    fetchReservation(activematching.reservationId);

  }, [activematching.reservationId])

  // zustand store 사용
  const {
    matchingRequest,
    uiState,
    toggleRejectModal,
    respondAsManager,
    respondAsCustomer,
    canRespondToMatching,
    setMatchingRequest,
  } = useMatchingStore();

  // API 훅 사용
  const {
    loading: managerLoading,
    error: managerError,
    getMatchingDetail,
    respondToMatching: managerRespondToMatching,
  } = useManagerMatching();

  // 고객 응답 시뮬레이션용
  const { loading: customerLoading } = useCustomerMatching();

  const fetchMatchAccept = async () => {
    console.log('zus id ', activematching.matchingId)

    const request = {
      action: 'ACCEPT',
    }
    console.log('request', request)

    const response = await apiService.matching.acceptMatching(activematching.matchingId, request);
    console.log('matching accept result ', response.data);

    return response.data.success;
  }


  // 매칭 수락
  const handleAccept = async () => {
    if (!canRespondToMatching()) {
      alert('이미 응답한 매칭입니다.');
      return;
    }


    try {
      const acceptResult =  await fetchMatchAccept();
      if (acceptResult) {
        alert('해당 매칭에 수락하였습니다')
        navigate('/matching/list');
      }
      // console.log('🎯 매칭 수락 프로세스 시작:');
      // console.log('📋 요청 정보:');
      // console.log('  - 매칭 ID:', matchingRequest.matchingId);
      // console.log('  - 고객명:', matchingRequest.customerName);
      // console.log('  - 서비스 유형:', matchingRequest.serviceType);
      // console.log('  - 매니저 ID:', user.userId);
      // console.log('  - 매니저명:', user.name);

      // // ⭐️ 수락 대기 메시지 표시
      // alert('수락 대기중입니다...');

      // await managerRespondToMatching(
      //   matchingRequest.matchingId,
      //   MANAGER_ACTION.ACCEPT
      // );

      // ⭐️ 매니저 수락 시 바로 매칭 완료 상태로 변경
      // respondAsManager(MANAGER_ACTION.ACCEPT); // 이건 PENDING_CUSTOMER_RESPONSE로 변경함

      // 바로 최종 매칭 완료 상태로 설정
      // respondAsCustomer(CUSTOMER_ACTION.CONFIRM);


      // ⭐️ 최종 매칭 완료 안내창 (약간의 지연 후 표시)
      // setTimeout(() => {
      //   alert('✅ 최종 매칭이 완료되었습니다!');

        // ⭐️ 확인 버튼 클릭 후 매칭 목록으로 이동 (새로고침 플래그 포함)
        // setTimeout(() => {
        //   console.log('📍 매칭 목록으로 이동 (데이터 새로고침 요청)');
        //   navigate('/matching/list', {
        //     state: {
        //       refreshData: true,
        //       completedMatchingId: matchingRequest.matchingId,
        //       managerInfo: {
        //         id: user.userId,
        //         name: user.name,
        //       },
        //     },
        //   });
        // }, 500);
      // }, 1000); // 1초 후 완료 메시지 표시
    } catch (error) {
      console.error('매칭 수락 실패:', error);
      alert(NOTIFICATION_MESSAGES.MATCHING.ACCEPT_ERROR);
    }
  };

  // 매칭 거절
  const handleReject = async () => {
    if (!canRespondToMatching()) {
      alert('이미 응답한 매칭입니다.');
      return;
    }

    if (!rejectReason.trim()) {
      alert(NOTIFICATION_MESSAGES.MATCHING.REJECT_REASON_REQUIRED);
      return;
    }

    try {
      await managerRespondToMatching(
        matchingRequest.matchingId,
        MANAGER_ACTION.REJECT,
        rejectReason.trim()
      );

      // 매니저 응답 처리
      respondAsManager(MANAGER_ACTION.REJECT, rejectReason.trim());

      alert(NOTIFICATION_MESSAGES.MATCHING.REJECT_SUCCESS);
      toggleRejectModal();
      setRejectReason('');

      // 매칭 목록으로 이동
      setTimeout(() => {
        navigate('/matching/list');
      }, 1000);
    } catch (error) {
      console.error('매칭 거절 실패:', error);
      alert(NOTIFICATION_MESSAGES.MATCHING.REJECT_ERROR);
    }
  };

  const handleRejectCancel = () => {
    toggleRejectModal();
    setRejectReason('');
  };

  const handleRejectModalOpen = () => {
    toggleRejectModal();
  };

  // 뒤로가기
  const handleBack = () => {
    navigate('/matching/list');
  };

  // 로딩 상태
  if ((managerLoading || customerLoading) && !matchingRequest.customerName) {
    return (
      <div className="manager-matching-page">
        <Header />
        <div className="page-content-wrapper">
          <div className="manager-matching-request-container">
            <div className="loading-container">
              <p>{NOTIFICATION_MESSAGES.GENERAL.LOADING}</p>
            </div>
          </div>
        </div>
        <Footer current="/matching/matching-request" />
      </div>
    );
  }

  // 에러 상태
  if (managerError && !matchingRequest.customerName) {
    return (
      <div className="manager-matching-page">
        <Header />
        <div className="page-content-wrapper">
          <div className="manager-matching-request-container">
            <div className="error-container">
              <p>{managerError}</p>
              <button
                onClick={() => window.location.reload()}
                className="retry-button"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
        <Footer current="/matching/matching-request" />
      </div>
    );
  }

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
              <span className={`status-badge ${matchingRequest.status}`}>
                {matchingRequest.status ===
                  MATCHING_STATUS.PENDING_MANAGER_RESPONSE &&
                  '매니저 응답 대기'}
                {matchingRequest.status ===
                  MATCHING_STATUS.PENDING_CUSTOMER_RESPONSE && '고객 응답 대기'}
                {matchingRequest.status === MATCHING_STATUS.CONFIRMED &&
                  '매칭 완료'}
                {matchingRequest.status ===
                  MATCHING_STATUS.REJECTED_BY_MANAGER && '매니저 거절'}
                {matchingRequest.status ===
                  MATCHING_STATUS.REJECTED_BY_CUSTOMER && '고객 거절'}
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
                <span className="value">{reservation.requestDate}</span>
              </div>
              <div className="info-item">
                <span className="label">시간</span>
                <span className="value">{reservation.requestTime}</span>
              </div>
              <div className="info-item">
                <span className="label">예상 소요시간</span>
                <span className="value">
                  {reservation.totalDuration}시간
                </span>
              </div>
              <div className="info-item">
                <span className="label">위치</span>
                <span className="value">{reservation.address}</span>
              </div>
            </div>
          </div>

          {/* 고객 요청사항 */}
          <div className="section">
            <h2 className="section-title">고객 요청사항</h2>
            <div className="request-card">
              <p>{reservation.customerMemo}</p>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="action-section">
            {matchingRequest.status ===
              MATCHING_STATUS.PENDING_MANAGER_RESPONSE && (
              <div className="button-group">
                <button
                  onClick={handleAccept}
                  className="accept-button"
                  disabled={managerLoading}
                >
                  {managerLoading ? '처리 중...' : '수락'}
                </button>
                <button
                  onClick={handleRejectModalOpen}
                  className="reject-button"
                  disabled={managerLoading}
                >
                  거절
                </button>
              </div>
            )}

            {matchingRequest.status ===
              MATCHING_STATUS.PENDING_CUSTOMER_RESPONSE && (
              <div className="waiting-message">
                <p>고객의 응답을 기다리고 있습니다...</p>
              </div>
            )}

            {matchingRequest.status === MATCHING_STATUS.CONFIRMED && (
              <div className="success-message">
                <p>매칭이 완료되었습니다!</p>
                <button
                  onClick={() => navigate('/matching/service-checkin')}
                  className="service-start-button"
                >
                  서비스 시작하기
                </button>
              </div>
            )}

            {(matchingRequest.status === MATCHING_STATUS.REJECTED_BY_MANAGER ||
              matchingRequest.status ===
                MATCHING_STATUS.REJECTED_BY_CUSTOMER) && (
              <div className="rejected-message">
                <p>매칭이 거절되었습니다.</p>
                <button onClick={handleBack} className="back-button">
                  목록으로 돌아가기
                </button>
              </div>
            )}
          </div>

          {/* 거절 사유 입력 모달 */}
          {uiState.showRejectModal && (
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
                    disabled={!rejectReason.trim() || managerLoading}
                  >
                    {managerLoading ? '처리 중...' : '확인'}
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
