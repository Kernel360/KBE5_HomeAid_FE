import React, { useEffect } from 'react';
// TODO: 매칭내역 확인 기능 구현 시 필요
// import { useNavigate } from 'react-router-dom';
import './ManagerServiceCheckIn.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import useMatchingStore from '../../../stores/matchingStore';
import { useServiceCheckIn } from '../hooks/useManagerAPI';
import { NOTIFICATION_MESSAGES } from '../constants/matchingData';

// TODO: 파일 업로드 기능 추가 시 필요한 import
// import React, { useState, useEffect } from 'react';

const ManagerServiceCheckIn = () => {
  // TODO: 매칭내역 확인 기능 사용 시 필요
  // const navigate = useNavigate();

  // zustand store 사용
  const {
    matchingRequest,
    serviceProgress,
    uiState,
    toggleCheckInModal,
    toggleCheckOutModal,
    getCurrentStatus,
    getButtonStates,
  } = useMatchingStore();

  // API 훅 사용
  const {
    loading,
    error,
    getServiceDetails,
    performCheckIn,
    performCheckOut,
    // TODO: 파일 업로드 기능 구현 시 사용
    // uploadServiceFile,
  } = useServiceCheckIn();

  // TODO: 파일 업로드 기능 구현 예정
  // 파일 업로드 관련 로컬 상태 (현재 주석 처리)
  // const [showFileUpload, setShowFileUpload] = useState(false);
  // const [selectedFile, setSelectedFile] = useState(null);

  // 컴포넌트 마운트 시 서비스 상세 정보 로드
  useEffect(() => {
    const serviceId = 1; // TODO: URL 파라미터에서 실제 ID 가져오기
    getServiceDetails(serviceId).catch(console.error);
  }, [getServiceDetails]);

  // TODO: 매칭내역 확인 기능 - 현재 주석처리
  /*
  const handleMatchingHistoryClick = () => {
    navigate('/matching/matching-request');
  };
  */

  const handleCheckIn = () => {
    toggleCheckInModal();
  };

  const handleCheckOut = () => {
    toggleCheckOutModal();
  };

  const confirmCheckIn = async () => {
    try {
      const serviceId = 1; // TODO: 실제 서비스 ID 사용
      await performCheckIn(serviceId);
      alert(NOTIFICATION_MESSAGES.SERVICE.CHECKIN_SUCCESS);
      toggleCheckInModal();
    } catch (error) {
      console.error('체크인 실패:', error);
      alert(NOTIFICATION_MESSAGES.SERVICE.CHECKIN_ERROR);
    }
  };

  const confirmCheckOut = async () => {
    try {
      const serviceId = 1; // TODO: 실제 서비스 ID 사용
      await performCheckOut(serviceId);
      alert(NOTIFICATION_MESSAGES.SERVICE.CHECKOUT_SUCCESS);
      toggleCheckOutModal();
    } catch (error) {
      console.error('체크아웃 실패:', error);
      alert(NOTIFICATION_MESSAGES.SERVICE.CHECKOUT_ERROR);
    }
  };

  const cancelCheckIn = () => {
    toggleCheckInModal();
  };

  const cancelCheckOut = () => {
    toggleCheckOutModal();
  };

  // TODO: 파일 업로드 기능 구현 예정
  /*
  const handleFileSelect = (event) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
  };

  // 파일 업로드로 체크아웃 완료
  const handleFileUploadAndCheckout = async () => {
    if (!selectedFile) {
      alert(NOTIFICATION_MESSAGES.SERVICE.FILE_REQUIRED);
      return;
    }

    try {
      const serviceId = 1; // TODO: 실제 서비스 ID 사용
      
      // 파일 업로드
      await uploadServiceFile(serviceId, selectedFile);
      
      // 체크아웃 처리
      await performCheckOut(serviceId);
      
      alert('파일 업로드 및 체크아웃이 완료되었습니다.');
      setShowFileUpload(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('파일 업로드 또는 체크아웃 실패:', error);
      alert('파일 업로드 또는 체크아웃 중 오류가 발생했습니다.');
    }
  };
  */

  // 버튼 활성화 상태 계산
  const { isCheckInButtonEnabled, isCheckOutButtonEnabled } = getButtonStates();

  // 로딩 상태
  if (loading && !matchingRequest.customerName) {
    return (
      <div className="manager-service-page">
        <Header />
        <div className="page-content-wrapper">
          <div className="manager-service-checkin-container">
            <div className="loading-container">
              <p>{NOTIFICATION_MESSAGES.GENERAL.LOADING}</p>
            </div>
          </div>
        </div>
        <Footer current="/matching/service-checkin" />
      </div>
    );
  }

  // 에러 상태
  if (error && !matchingRequest.customerName) {
    return (
      <div className="manager-service-page">
        <Header />
        <div className="page-content-wrapper">
          <div className="manager-service-checkin-container">
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
        <Footer current="/matching/service-checkin" />
      </div>
    );
  }

  return (
    <div className="manager-service-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="manager-service-checkin-container">
          {/* TODO: 매칭내역 확인 기능 - 현재 주석처리
          <div className="matching-details">
            <button
              className="matching-history-button"
              onClick={handleMatchingHistoryClick}
            >
              매칭 내역 확인
            </button>
          </div>
          */}

          {/* Map 영역 */}
          <div className="service-map">
            <div className="map-placeholder">
              <i className="fas fa-map-marker-alt"></i>
              <p>지도가 표시될 영역</p>
              <small>{matchingRequest.address}</small>
            </div>
          </div>

          <div className="service-progress">
            <h2>서비스 진행</h2>
            <span className="status-badge">{getCurrentStatus()}</span>

            <div className="details-card">
              <div className="detail-item">
                <span className="label">고객명</span>
                <span className="value">{matchingRequest.customerName}</span>
              </div>
              <div className="detail-item">
                <span className="label">서비스 유형</span>
                <span className="value">{matchingRequest.serviceType}</span>
              </div>
              <div className="detail-item">
                <span className="label">날짜 및 시간</span>
                <span className="value">{matchingRequest.dateTime}</span>
              </div>
              <div className="detail-item">
                <span className="label">주소</span>
                <span className="value">{matchingRequest.address}</span>
              </div>
            </div>

            {/* 체크인/체크아웃 상태 표시 */}
            <div className="checkin-status-section">
              <h3>서비스 진행 상태</h3>
              <div className="status-items">
                <div className="status-item">
                  <div className="status-icon">
                    <span
                      className={`icon ${serviceProgress.checkInStatus === '완료' ? 'completed' : 'pending'}`}
                    >
                      {serviceProgress.checkInStatus === '완료' ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="status-details">
                    <span className="status-label">체크인</span>
                    <span
                      className={`status-value ${serviceProgress.checkInStatus === '완료' ? 'completed' : 'pending'}`}
                    >
                      {serviceProgress.checkInStatus}
                    </span>
                    {serviceProgress.checkInTime && (
                      <span className="status-time">
                        {new Date(serviceProgress.checkInTime).toLocaleString(
                          'ko-KR',
                          {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="status-item">
                  <div className="status-icon">
                    <span
                      className={`icon ${serviceProgress.checkOutStatus === '완료' ? 'completed' : 'pending'}`}
                    >
                      {serviceProgress.checkOutStatus === '완료' ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="status-details">
                    <span className="status-label">체크아웃</span>
                    <span
                      className={`status-value ${serviceProgress.checkOutStatus === '완료' ? 'completed' : 'pending'}`}
                    >
                      {serviceProgress.checkOutStatus}
                    </span>
                    {serviceProgress.checkOutTime && (
                      <span className="status-time">
                        {new Date(serviceProgress.checkOutTime).toLocaleString(
                          'ko-KR',
                          {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className={`action-button checkin-button ${!isCheckInButtonEnabled ? 'disabled' : ''}`}
                onClick={handleCheckIn}
                disabled={!isCheckInButtonEnabled || loading}
              >
                {loading ? '처리 중...' : '체크인'}
              </button>
              <button
                className={`action-button checkout-button ${!isCheckOutButtonEnabled ? 'disabled' : ''}`}
                onClick={handleCheckOut}
                disabled={!isCheckOutButtonEnabled || loading}
              >
                {loading ? '처리 중...' : '체크아웃'}
              </button>
            </div>

            {/* TODO: 파일 업로드 섹션 구현 예정 */}
            {/* 파일 업로드 섹션 (현재 주석 처리)
            {showFileUpload && (
              <div className="file-upload-section">
                <h3>서비스 완료 사진 업로드</h3>
                <p className="upload-note">체크아웃을 완료하려면 서비스 완료 사진을 업로드해주세요.</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="file-input"
                />
                {selectedFile && (
                  <p className="selected-file">
                    선택된 파일: {selectedFile.name}
                  </p>
                )}
                <div className="file-upload-buttons">
                  <button
                    onClick={() => {
                      setShowFileUpload(false);
                      setSelectedFile(null);
                    }}
                    className="cancel-upload-button"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleFileUploadAndCheckout}
                    disabled={!selectedFile || loading}
                    className="upload-button"
                  >
                    {loading ? '업로드 중...' : '파일 업로드 & 체크아웃'}
                  </button>
                </div>
              </div>
            )}
            */}
          </div>

          {/* Check-in Confirmation Modal */}
          {uiState.showCheckInModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>체크인 확인</h3>
                <p>서비스 체크인을 진행하시겠습니까?</p>
                <div className="modal-actions">
                  <button onClick={cancelCheckIn} className="cancel-button">
                    취소
                  </button>
                  <button
                    onClick={confirmCheckIn}
                    className="confirm-button"
                    disabled={loading}
                  >
                    {loading ? '처리 중...' : '확인'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Check-out Confirmation Modal */}
          {uiState.showCheckOutModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>체크아웃 확인</h3>
                <p>서비스 체크아웃을 진행하시겠습니까?</p>
                <div className="modal-actions">
                  <button onClick={cancelCheckOut} className="cancel-button">
                    취소
                  </button>
                  <button
                    onClick={confirmCheckOut}
                    className="confirm-button"
                    disabled={loading}
                  >
                    {loading ? '처리 중...' : '체크아웃'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer current="/matching/service-checkin" />
    </div>
  );
};

export default ManagerServiceCheckIn;
