import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './ManagerMatchingRequest.css';
// import api from '@/services/apiClient'; // Import api client
// import { useEffect } from 'react'; // Commented out unused import
import { useMatchingRequestStatus } from '../../../contexts/MatchingRequestStatusContext'; // 올바른 임포트 경로
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';

const ManagerMatchingRequest = () => {
  const navigate = useNavigate(); // Get navigate function
  const { setRequestAccepted, isActionCompleted, setIsActionCompleted } =
    useMatchingRequestStatus(); // Get the state updater and current state from context

  // TODO: 실제 매칭 요청 데이터를 API에서 불러오도록 구현해야 합니다.
  const matchingRequest = {
    status: '신규 요청',
    serviceType: '대청소',
    dateTime: '2023-06-15 14:00',
    estimatedTime: '3시간',
    address: '서울시 강남구 테헤란로 123',
    estimatedEarnings: '60,000원',
    customerRequest:
      '주방 기름때 제거에 신경써주세요. 욕실 곰팡이도 꼼꼼하게 청소 부탁드립니다.',
  };

  // TODO: Fetch actual matching request details on component mount
  // useEffect(() => {
  //   const fetchMatchingRequest = async () => {
  //     try {
  //       const response = await api.get('/api/v1/manager/matching-request/[:requestId]'); // Replace with actual endpoint
  //       if (response.data) {
  //         setMatchingRequest(response.data);
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch matching request details:', error);
  //       alert('매칭 요청 정보를 불러오는데 실패했습니다.');
  //     }
  //   };
  //   fetchMatchingRequest();
  // }, []);

  const [showAcceptModal, setShowAcceptModal] = React.useState(false);
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');

  const handleAccept = () => {
    setShowAcceptModal(true);
  };

  const confirmAccept = () => {
    setRequestAccepted(true);
    setIsActionCompleted(true);
    setShowAcceptModal(false);
    navigate('/matching/service-checkin');
  };

  const handleReject = () => {
    if (!isActionCompleted) {
      setShowRejectModal(true);
    }
  };

  const handleReasonInputChange = (event) => {
    setRejectReason(event.target.value);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('거절 사유를 입력해주세요.');
      return;
    }
    try {
      // TODO: Implement actual reject logic (API call)
      console.log('거절 확인됨. API 호출 예정. 사유:', rejectReason);
      // const response = await api.patch('/api/v1/manager/reject-request', { requestId: matchingRequest.id, reason: rejectReason }); // Replace with actual endpoint and payload

      // Assuming API call is successful
      alert('요청을 거절했습니다.'); // Placeholder - replace with actual success handling
      setIsActionCompleted(true); // Disable buttons after action
      setShowRejectModal(false); // Hide the modal
      setRejectReason(''); // Clear the input
      navigate('/matching/service-checkin'); // Navigate to the service checkin page
    } catch (error) {
      console.error('거절 실패:', error);
      alert('요청 거절에 실패했습니다.');
    }
  };

  const cancelReject = () => {
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleLocationConfirm = () => {
    // TODO: Implement location confirmation logic (e.g., open map modal or navigate)
    console.log('위치 확인하기 clicked');
    alert('위치 확인 기능 준비중...'); // Placeholder
  };

  const areButtonsDisabled = isActionCompleted || showRejectModal; // Disable buttons if action completed or modal is open

  return (
    <div className="manager-matching-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="manager-matching-request-container">
          <h1 className="page-title">매칭 요청</h1>

          <div className="status-badge-container">
            <span className="status-badge">{matchingRequest.status}</span>
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
              <span className="value">{matchingRequest.estimatedEarnings}</span>
            </div>
          </div>

          <div className="customer-request-section">
            <h2 className="section-title">고객 요청사항</h2>
            <div className="request-box">
              <p>{matchingRequest.customerRequest}</p>
            </div>
          </div>

          <div className="location-section" onClick={handleLocationConfirm}>
            {/* Placeholder for map or location confirmation UI */}
            <div className="location-placeholder">
              {/* Placeholder icon - you might need to add a font-awesome or similar library */}
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
              수락하기
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
          {showAcceptModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>수락 확인</h3>
                <p>매칭 요청을 수락하시겠습니까?</p>
                <div className="modal-actions">
                  <button
                    onClick={() => setShowAcceptModal(false)}
                    className="cancel-button"
                  >
                    취소
                  </button>
                  <button onClick={confirmAccept} className="confirm-button">
                    확인
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reject Reason Modal */}
          {showRejectModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>거절 사유를 작성해주세요</h3>
                <textarea
                  value={rejectReason}
                  onChange={handleReasonInputChange}
                  placeholder="너무 자주 거절할 경우 패널티가 부여될 수 있습니다.최대한 자세하게 작성해주세요."
                  rows="5"
                ></textarea>
                <div className="modal-actions">
                  <button onClick={cancelReject} className="cancel-button">
                    취소
                  </button>
                  <button
                    onClick={confirmReject}
                    disabled={!rejectReason.trim()}
                    className="save-button"
                  >
                    저장
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
