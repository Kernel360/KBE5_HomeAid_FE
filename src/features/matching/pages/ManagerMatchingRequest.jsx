import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManagerMatchingRequest.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import useMatchingStore from '../../../stores/matchingStore';
import { useManagerMatching } from '../hooks/useManagerAPI';
import { NOTIFICATION_MESSAGES } from '../constants/matchingData';

const ManagerMatchingRequest = () => {
  const navigate = useNavigate();

  // zustand store 사용
  const {
    matchingRequest,
    uiState,
    toggleAcceptModal,
    toggleRejectModal,
    setRejectReason,
    getCurrentStatus,
    acceptMatching,
  } = useMatchingStore();

  // API 훅 사용
  const {
    loading,
    error,
    getMatchingRequest,
    acceptMatchingRequest,
    rejectMatchingRequest,
  } = useManagerMatching();

  // 컴포넌트 마운트 시 매칭 요청 데이터 로드
  useEffect(() => {
    const requestId = 1; // TODO: URL 파라미터에서 실제 ID 가져오기
    getMatchingRequest(requestId).catch(console.error);
  }, [getMatchingRequest]);

  const handleAccept = () => {
    toggleAcceptModal();
  };

  const confirmAccept = async () => {
    try {
      await acceptMatchingRequest(matchingRequest.id);
      acceptMatching(); // zustand store 상태 업데이트
      alert(NOTIFICATION_MESSAGES.MATCHING.ACCEPT_SUCCESS);
      toggleAcceptModal();
      navigate('/matching/list'); // ManagerMatchingList로 이동
    } catch (error) {
      console.error('매칭 요청 수락 실패:', error);
      alert(NOTIFICATION_MESSAGES.MATCHING.ACCEPT_ERROR);
    }
  };

  const handleReject = () => {
    toggleRejectModal();
  };

  const handleReasonInputChange = (event) => {
    setRejectReason(event.target.value);
  };

  const confirmReject = async () => {
    try {
      await rejectMatchingRequest(matchingRequest.id, uiState.rejectReason);
      alert(NOTIFICATION_MESSAGES.MATCHING.REJECT_SUCCESS);
      toggleRejectModal();
      setRejectReason('');
      navigate('/matching/list'); // ManagerMatchingList로 이동
    } catch (error) {
      console.error('매칭 요청 거절 실패:', error);
      alert(error.message || NOTIFICATION_MESSAGES.MATCHING.REJECT_ERROR);
    }
  };

  const cancelAccept = () => {
    toggleAcceptModal();
  };

  const cancelReject = () => {
    toggleRejectModal();
    setRejectReason('');
  };

  const handleLocationConfirm = () => {
    console.log('위치 확인하기 clicked');
    alert('위치 확인 기능 준비중...');
  };

  // 로딩 상태
  if (loading && !matchingRequest.id) {
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
  if (error && !matchingRequest.id) {
    return (
      <div className="manager-matching-page">
        <Header />
        <div className="page-content-wrapper">
          <div className="manager-matching-request-container">
            <div className="error-container">
              <p>{error}</p>
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

  const areButtonsDisabled = loading || uiState.showRejectModal;

  return (
    <div className="manager-matching-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="manager-matching-request-container">
          <h1 className="page-title">매칭 요청</h1>

          <div className="status-badge-container">
            <span className="status-badge">{getCurrentStatus()}</span>
          </div>

          <div className="details-section">
            <div className="detail-item">
              <span className="label">서비스 유형</span>
              <span className="value">{matchingRequest.serviceType}</span>
            </div>
            <div className="detail-item">
              <span className="label">날짜 및 시간</span>
              <span className="value">{matchingRequest.dateTime}</span>
            </div>
            <div className="detail-item">
              <span className="label">예상 소요 시간</span>
              <span className="value">{matchingRequest.estimatedTime}</span>
            </div>
            <div className="detail-item">
              <span className="label">주소</span>
              <span className="value">{matchingRequest.address}</span>
            </div>
            <div className="detail-item estimated-earnings">
              <span className="label">예상 수입</span>
              <span className="value">
                {matchingRequest.estimatedEarnings?.toLocaleString() || '0'}원
              </span>
            </div>
          </div>

          <div className="customer-request-section">
            <h2 className="section-title">고객 요청사항</h2>
            <div className="request-box">
              <p>
                {matchingRequest.customerRequest ||
                  '특별한 요청사항이 없습니다.'}
              </p>
            </div>
          </div>

          <div className="location-section" onClick={handleLocationConfirm}>
            <div className="location-placeholder">
              <i className="fas fa-map-marker-alt"></i>
              <span>위치 확인하기</span>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="accept-button"
              onClick={handleAccept}
              disabled={areButtonsDisabled}
            >
              {loading ? '처리 중...' : '수락하기'}
            </button>
            <button
              className="reject-button"
              onClick={handleReject}
              disabled={areButtonsDisabled}
            >
              거절하기
            </button>
          </div>

          {/* Accept Confirmation Modal */}
          {uiState.showAcceptModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>수락 확인</h3>
                <p>매칭 요청을 수락하시겠습니까?</p>
                <div className="modal-actions">
                  <button onClick={cancelAccept} className="cancel-button">
                    취소
                  </button>
                  <button
                    onClick={confirmAccept}
                    className="confirm-button"
                    disabled={loading}
                  >
                    {loading ? '처리 중...' : '확인'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reject Reason Modal */}
          {uiState.showRejectModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>거절 사유를 작성해주세요</h3>
                <textarea
                  value={uiState.rejectReason}
                  onChange={handleReasonInputChange}
                  placeholder="너무 자주 거절할 경우 패널티가 부여될 수 있습니다. 최대한 자세하게 작성해주세요."
                  rows="4"
                  className="reject-reason-textarea"
                />
                <div className="modal-actions">
                  <button onClick={cancelReject} className="cancel-button">
                    취소
                  </button>
                  <button
                    onClick={confirmReject}
                    className="confirm-button"
                    disabled={loading || !uiState.rejectReason.trim()}
                  >
                    {loading ? '처리 중...' : '확인'}
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
