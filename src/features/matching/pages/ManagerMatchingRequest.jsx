import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ManagerMatchingRequest.css';
import Footer from '../../../components/Footer.jsx';
import Header from '../../../components/Header.jsx';
import { apiService } from '@/api';
import reservationStore from '../store/reservationStore.js';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  // YYYY-MM-DD → YYYY.MM.DD
  return dateStr.replace(/-/g, '.');
};

const formatTime = (timeStr) => {
  if (!timeStr) return '-';
  // HH:mm → HH:mm
  return timeStr;
};

const ManagerMatchingRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rejectReason, setRejectReason] = useState('');
  const [matching, setMatching] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const matchingItem = reservationStore((state) => state.matching);

  // location state에서 matchingId 가져오기
  const matchingId = location.state?.matchingId || matchingItem?.matchingId;

  console.log('📍 현재 location state:', location.state);
  console.log('📍 현재 matchingItem:', matchingItem);
  console.log('📍 사용할 matchingId:', matchingId);

  const fetchMatching = async (matchingId) => {
    try {
      if (!matchingId) {
        console.error('⚠️ matchingId가 없어 매칭 정보를 불러올 수 없습니다.');
        return;
      }
      console.log('🔄 매칭 정보 조회 시작 - matchingId:', matchingId);
      const response = await apiService.manager.getMatching(matchingId);
      console.log('✅ 매칭 정보 조회 성공:', response.data.data);
      setMatching(response.data.data);
    } catch (error) {
      console.error('❌ 매칭 정보 조회 실패:', error);
      alert('매칭 정보를 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect 실행 - matchingId:', matchingId);
    if (matchingId) {
      fetchMatching(matchingId);
    }
  }, [matchingId]);

  const fetchMatchAccept = async () => {
    if (!matchingId) {
      throw new Error('매칭 ID가 없습니다.');
    }
    const request = {
      action: 'ACCEPT',
    };
    const response = await apiService.matching.acceptMatching(
      matchingId,
      request
    );
    return response.data.success;
  };

  // 매칭 수락
  const handleAccept = async () => {
    if (!confirm('해당 예약 건의 수락 하시겠습니까?')) {
      return;
    }
    try {
      const acceptResult = await fetchMatchAccept();
      if (acceptResult) {
        // ⭐️ 수락 후 상태 즉시 갱신
        await fetchMatching(matchingId);
        alert('해당 매칭에 수락하였습니다');
        navigate('/matching/list');
      }
    } catch (error) {
      console.error('매칭 수락 실패:', error);
      alert('매칭 수락에 실패했습니다.');
    }
  };

  // 매칭 거절
  const handleReject = async () => {
    if (!matchingId) {
      alert('매칭 정보가 없습니다.');
      return;
    }
    const data = {
      action: 'REJECT',
      memo: rejectReason,
    };
    try {
      const response = await apiService.matching.acceptMatching(
        matchingId,
        data
      );
      if (response.data.success) {
        // ⭐️ 거절 후 상태 즉시 갱신
        await fetchMatching(matchingId);
        alert('해당 매칭을 거절하였습니다.');
        handleBack();
      }
    } catch (error) {
      console.error('매칭 거절 실패:', error);
      alert('매칭 거절에 실패했습니다.');
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

  // 상태 표시 텍스트 변환
  const getStatusKorean = (status) => {
    switch (status) {
      case 'REQUESTED':
        return '매니저 응답 대기';
      case 'ACCEPTED':
        return '고객 응답 대기';
      case 'CONFIRMED':
        return '매칭 완료';
      case 'REJECTED':
        return '매칭 거절';
      case 'WAITING':
        return '고객 대기';
      default:
        return status || '-';
    }
  };

  return (
    <div className="manager-matching-page">
      <Header showBackButton onBackClick={handleBack} />
      <div className="page-content-wrapper">
        <div className="manager-matching-request-container">
          <h1 className="page-title">매칭 요청</h1>

          {/* 매칭 상태 표시 */}
          <div className="status-section">
            <div className="status-item">
              <span className="status-label">현재 상태</span>
              <span
                className={`status-badge ${matching.status?.toLowerCase()}`}
              >
                {getStatusKorean(matching.status)}
              </span>
            </div>
          </div>

          {/* 서비스 정보 */}
          <div className="section">
            <h2 className="section-title">서비스 정보</h2>
            <div className="info-card">
              {/* null이 아닌 값만 렌더링 */}
              {matching.serviceType && (
                <div className="info-item">
                  <span className="label">서비스 유형</span>
                  <span className="value">{matching.serviceType}</span>
                </div>
              )}
              {matching.reservedDate && (
                <div className="info-item">
                  <span className="label">예약 날짜</span>
                  <span className="value">
                    {formatDate(matching.reservedDate)}
                  </span>
                </div>
              )}
              {matching.reservedTime && (
                <div className="info-item">
                  <span className="label">예약 시간</span>
                  <span className="value">
                    {formatTime(matching.reservedTime)}
                  </span>
                </div>
              )}
              {matching.estimatedDuration && (
                <div className="info-item">
                  <span className="label">예상 소요시간</span>
                  <span className="value">{`${matching.estimatedDuration}시간`}</span>
                </div>
              )}
              {matching.latitude !== null && matching.longitude !== null && (
                <div className="info-item">
                  <span className="label">위치</span>
                  <span className="value">{`${matching.latitude}, ${matching.longitude}`}</span>
                </div>
              )}
              {matching.fullAddress && (
                <div className="info-item">
                  <span className="label">주소</span>
                  <span className="value">{matching.fullAddress}</span>
                </div>
              )}
              {matching.customerRequest && (
                <div className="info-item">
                  <span className="label">고객 요청사항</span>
                  <span className="value">{matching.customerRequest}</span>
                </div>
              )}
              {matching.managerStatus && (
                <div className="info-item">
                  <span className="label">매니저 상태</span>
                  <span className="value">
                    {getStatusKorean(matching.managerStatus)}
                  </span>
                </div>
              )}
              {matching.customerStatus && (
                <div className="info-item">
                  <span className="label">고객 상태</span>
                  <span className="value">
                    {getStatusKorean(matching.customerStatus)}
                  </span>
                </div>
              )}
              {matching.reservationId && (
                <div className="info-item">
                  <span className="label">예약 ID</span>
                  <span className="value">{matching.reservationId}</span>
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="action-section">
            {matching.status === 'REQUESTED' && (
              <div className="button-group">
                <button onClick={handleAccept} className="accept-button">
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

            {matching.status === 'ACCEPTED' && (
              <div className="waiting-message">
                <p>고객의 응답을 기다리고 있습니다...</p>
              </div>
            )}

            {matching.status === 'CONFIRMED' && (
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

            {matching.status === 'REJECTED' && (
              <div className="rejected-message">
                <p>매칭이 거절되었습니다.</p>
                <button onClick={handleBack} className="back-button">
                  목록으로 돌아가기
                </button>
              </div>
            )}
          </div>

          {/* 거절 사유 입력 모달 */}
          {openModal && (
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
                    disabled={!rejectReason.trim()}
                  >
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
