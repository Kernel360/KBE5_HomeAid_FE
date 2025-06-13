import React, { useEffect, useState } from 'react';
// TODO: 매칭내역 확인 기능 구현 시 필요
// import { useNavigate } from 'react-router-dom';
import './ManagerServiceCheckIn.css';
import Footer from '../../../components/Footer.jsx';
import Header from '../../../components/Header.jsx';
import useReservationStore from '../store/reservationStore.js';
import { apiService } from '../../../store/api.js';

import useMatchingStore from '../../../stores/matchingStore.js';
// TODO: 파일 업로드 기능 추가 시 필요한 import
// import React, { useState, useEffect } from 'react';

const ManagerServiceCheckIn = () => {
  const reservationId = useReservationStore.getState().reservationId;
  const workLog = useReservationStore.getState().workLog;
  const reservationStore = useReservationStore();
  const [reservation, setReservation] = useState({});
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  // const matchingItem = useReservationStore((state) => state.matching);
  const [currentLocation, setCurrentLocation] = useState(null);

  const { matchingRequest } = useMatchingStore();

  console.log(reservationId);
  console.log('workLog State ', workLog);
  console.log('workLog State ', workLog.status);

  console.log('reservationStore 타입:', typeof reservationStore);
  console.log('reservationStore 내용:', reservationStore);
  console.log('setWorkLog 타입:', typeof reservationStore.setWorkLog);

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('위치 정보 에러:', error);
        alert('위치 정보를 가져오는데 실패했습니다.');
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const fetchReservation = async () => {
    const response = await apiService.reservation.getById(
      matchingRequest.reservationId
    );
    console.log('fetchReservation back data', response.data.data);
    setReservation(response.data.data);
  };
  useEffect(() => {
    fetchReservation();
  }, []);

  const toggleCheckInModal = () => {
    setShowCheckInModal(!showCheckInModal);
  };

  const toggleCheckOutModal = () => {
    setShowCheckOutModal(!showCheckOutModal);
  };

  const handleCheckIn = () => {
    if (!currentLocation) {
      alert('위치 정보를 가져오는 중입니다. 잠시만 기다려주세요.');
      return;
    }
    console.log('현재 위치 정보:', {
      위도: currentLocation.lat,
      경도: currentLocation.lng,
    });
    toggleCheckInModal();
  };

  const handleCheckOut = () => {
    if (!currentLocation) {
      alert('위치 정보를 가져오는 중입니다. 잠시만 기다려주세요.');
      return;
    }
    console.log('체크아웃 위치 정보:', {
      위도: currentLocation.lat,
      경도: currentLocation.lng,
    });
    toggleCheckOutModal();
  };

  const confirmCheckIn = async () => {
    try {
      if (!currentLocation) {
        throw new Error('위치 정보를 가져오는데 실패했습니다.');
      }

      const requestData = {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        reservationId: matchingRequest.reservationId,
        workType: 'CHECKIN',
      };

      console.log('체크인 요청 데이터:', requestData);
      const response = await apiService.workLog.checkIn(requestData);
      console.log('체크인 결과 데이터', response.data.data);
      reservationStore.setWorkLog(response.data.data);
      toggleCheckInModal();
    } catch (error) {
      console.error('체크인 실패:', error);
      alert(error.response?.data?.message || '체크인에 실패했습니다.');
      cancelCheckIn();
    }
  };

  const confirmCheckOut = async () => {
    try {
      if (!currentLocation) {
        throw new Error('위치 정보를 가져오는데 실패했습니다.');
      }

      const requestData = {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
      };

      console.log('체크아웃 요청 데이터:', requestData);
      const response = await apiService.workLog.checkOut(
        matchingRequest.reservationId,
        requestData
      );
      console.log('체크아웃 결과 데이터', response.data);

      if (response.data.success) {
        reservationStore.setWorkLog({
          ...workLog,
          workType: 'CHECKOUT',
        });
        alert('체크아웃이 완료되었습니다.');
      }

      toggleCheckOutModal();
    } catch (error) {
      console.error('체크아웃 실패:', error);
      alert(error.response?.data?.message || '체크아웃에 실패했습니다.');
    }
  };

  const cancelCheckIn = () => {
    setShowCheckInModal(false); // ✅ false로 닫기
  };

  const cancelCheckOut = () => {
    setShowCheckOutModal(false); // ✅ false로 닫기
  };

  // TODO: 파일 업로드 기능 구현 예정

  // 버튼 활성화 상태 계산
  // const { isCheckInButtonEnabled, isCheckOutButtonEnabled } = getButtonStates();

  // 로딩 상태
  // if (!matchingRequest.customerName) {
  //   return (
  //     <div className="manager-service-page">
  //       <Header />
  //       <div className="page-content-wrapper">
  //         <div className="manager-service-checkin-container">
  //           <div className="loading-container">
  //             <p>{NOTIFICATION_MESSAGES.GENERAL.LOADING}</p>
  //           </div>
  //         </div>
  //       </div>
  //       <Footer current="/matching/service-checkin" />
  //     </div>
  //   );
  // }

  // 에러 상태
  // if (error && !matchingRequest.customerName) {
  //   return (
  //     <div className="manager-service-page">
  //       <Header />
  //       <div className="page-content-wrapper">
  //         <div className="manager-service-checkin-container">
  //           <div className="error-container">
  //             <p>{error}</p>
  //             <button
  //               onClick={() => window.location.reload()}
  //               className="retry-button"
  //             >
  //               새로고침
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //       <Footer current="/matching/service-checkin" />
  //     </div>
  //   );
  // }

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
          {/* <div className="service-map">
            <div className="map-placeholder">
              <i className="fas fa-map-marker-alt"></i>
              <p>지도가 표시될 영역</p>
              <small>{reservation.address}</small>
            </div>
          </div> */}

          <div className="service-progress">
            <h2>서비스 진행</h2>
            {/* <span className="status-badge">
              {getCurrentStatus()}
            </span> */}

            <div className="details-card">
              <div className="detail-item">
                {/* <span className="label">매칭 ID</span>
                <span className="value">#{reservation.matchingId}</span> */}
              </div>
              <div className="detail-item">
                <span className="label">고객명</span>
                <span className="value">{reservation.customerName}</span>
              </div>
              <div className="detail-item">
                <span className="label">서비스 유형</span>
                <span className="value">{reservation.subOptionName}</span>
              </div>
              <div className="detail-item">
                <span className="label">날짜 및 시간</span>
                <span className="value">
                  {reservation.requestedDate} {reservation.requestedTime}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">예상 소요시간</span>
                <span className="value">{reservation.totalDuration} 시간</span>
              </div>
              <div className="detail-item">
                <span className="label">주소</span>
                <span className="value">
                  {reservation.address} {reservation.addressDetail}
                </span>
              </div>
            </div>

            {/* 체크인/체크아웃 상태 표시 */}
            <div className="checkin-status-section">
              {/* <h3>서비스 진행 상태</h3> */}
              {/* <div className="status-items">
                <div className="status-item">
                  <div className="status-icon">
                    <span
                      className={`icon ${matchingRequest.status === 'COMPLETED' ? 'completed' : 'pending'}`}
                    >
                      {matchingRequest.status === 'COMPLETED'
                        ? '✓'
                        : '○'}
                    </span>
                  </div>
                  <div className="status-details">
                    <span className="status-label">체크인</span>
                    <span
                      className={`status-value ${matchingRequest.status === 'MATCHED' ? 'completed' : 'pending'}`}
                    >
                      {matchingRequest.status === 'MATCHED'
                        ? '완료'
                        : '대기 중'}
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
                      className={`icon ${matchingRequest.status === 'COMPLETED' ? 'completed' : 'pending'}`}
                    >
                      {matchingRequest.status === 'COMPLETED'
                        ? '✓'
                        : '○'}
                    </span>
                  </div>
                  <div className="status-details">
                    <span className="status-label">체크아웃</span>
                    <span
                      className={`status-value ${matchingRequest.status === 'COMPLETED' ? 'completed' : 'pending'}`}
                    >
                      {matchingRequest.status === 'COMPLETED'
                        ? '완료'
                        : '대기 중'}
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
              </div> */}
            </div>

            <div className="action-buttons">
              <button
                className={`action-button checkin-button ${workLog.workType === 'CHECKIN' ? 'disabled' : ''}`}
                onClick={handleCheckIn}
                disabled={workLog.workType === 'CHECKIN'}
                style={{
                  backgroundColor:
                    workLog.workType === 'CHECKIN' ? '#e0e0e0' : '#4caf50',
                  color: workLog.workType === 'CHECKIN' ? '#9e9e9e' : 'white',
                }}
              >
                체크인
              </button>

              <button
                className={`action-button checkout-button ${workLog.workType === 'CHECKOUT' ? 'disabled' : ''}`}
                onClick={handleCheckOut}
                disabled={workLog.workType === 'CHECKOUT'}
                style={{
                  backgroundColor:
                    workLog.workType === 'CHECKOUT' ? '#e0e0e0' : '#4caf50',
                  color: workLog.workType === 'CHECKOUT' ? '#9e9e9e' : 'white',
                }}
              >
                체크아웃
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
          {showCheckInModal && (
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
                    // disabled={loading}
                  >
                    {/* {true ? '처리 중...' : '확인'} */}
                    확인
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Check-out Confirmation Modal */}
          {showCheckOutModal && (
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
                    // disabled={loading}
                  >
                    {/* {true ? '처리 중...' : '체크아웃'} */}
                    체크아웃
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
