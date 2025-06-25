import React, { useEffect, useState } from 'react';
// TODO: 매칭내역 확인 기능 구현 시 필요
// import { useNavigate } from 'react-router-dom';
import './ManagerServiceCheckIn.css';
import Footer from '../../../components/Footer.jsx';
import Header from '../../../components/Header.jsx';
import useReservationStore from '../store/reservationStore.js';
import { apiService } from '@/api';
// TODO: 파일 업로드 기능 추가 시 필요한 import
// import React, { useState, useEffect } from 'react';

const ManagerServiceCheckIn = () => {

  const workLog = useReservationStore.getState().workLog;
  const reservationId = useReservationStore.getState().reservationId;
  const [reservation, setReservation] = useState({});
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  // 체크아웃 상태에서 이슈 작성 폼 상태
  const [issueText, setIssueText] = useState('');
  const [issueFile, setIssueFile] = useState(null);


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

  // 예약 상세 정보 불러오기 (apiService.reservation.getById만 사용)
  const fetchReservation = async () => {
    const response = await apiService.reservation.getById(reservationId);
    console.log('reservation API 응답:', response.data.data);
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
        reservationId: reservationId,
        workType: 'CHECKIN',
      };

      console.log('체크인 요청 데이터:', requestData);
      const response = await apiService.workLog.checkIn(requestData);
      console.log('체크인 결과 데이터', response.data.data);
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
      const response = await apiService.workLog.checkOut(reservationId, requestData);
      console.log('체크아웃 결과 데이터', response.data);

      if (response.data.success) {
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

  const handleIssueFileChange = (e) => {
    setIssueFile(e.target.files[0]);
  };

  const handleIssueSubmit = async () => {
    if (!issueText && !issueFile) {
      alert('이슈 내용 또는 파일을 입력해주세요.');
      return;
    }
    // FormData로 파일 및 텍스트 전송
    const formData = new FormData();
    formData.append('issueText', issueText);
    if (issueFile) formData.append('file', issueFile);
    formData.append('reservationId', reservationId);

    try {
      await apiService.workLog.submitIssue(formData); // 실제 API에 맞게 수정
      alert('이슈가 등록되었습니다.');
      setIssueText('');
      setIssueFile(null);
    } catch {
      alert('이슈 등록에 실패했습니다.');
    }
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

  // 날짜 포맷 변환 함수
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  return (
    <div className="manager-service-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="manager-service-checkin-container">

          <div className="service-progress">
            <h2>서비스 진행</h2>

            <div className="details-card">
              <div className="detail-item">
                <span className="label">서비스 옵션</span>
                <span className="value">{reservation.serviceOptionName || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="label">가격</span>
                <span className="value">{reservation.totalPrice != null ? reservation.totalPrice.toLocaleString() + '원' : '-'}</span>
              </div>
              <div className="detail-item">
                <span className="label">예상 소요시간</span>
                <span className="value">{reservation.totalDuration ? reservation.totalDuration + ' 시간' : '-'}</span>
              </div>
              <div className="detail-item">
                <span className="label">시작시간</span>
                <span className="value">{formatDateTime(reservation.startTime)}</span>
              </div>
              <div className="detail-item">
                <span className="label">주소</span>
                <span className="value">{reservation.address} {reservation.addressDetail}</span>
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
                className={`action-button checkin-button ${workLog.status === 'CHECKIN' ? 'disabled' : ''}`}
                onClick={handleCheckIn}
                disabled={workLog.status === 'CHECKIN'}
                style={{
                  backgroundColor: workLog.status === 'CHECKIN' ? '#e0e0e0' : '#4caf50',
                  color: workLog.status === 'CHECKIN' ? '#9e9e9e' : 'white',
                }}
              >
                체크인 하기
              </button>

              <button
                className={`action-button checkout-button ${workLog.status === 'CHECKOUT' ? 'disabled' : ''}`}
                onClick={handleCheckOut}
                disabled={workLog.status === 'CHECKOUT'}
                style={{
                  backgroundColor: workLog.status === 'CHECKOUT' ? '#e0e0e0' : '#4caf50',
                  color: workLog.status === 'CHECKOUT' ? '#9e9e9e' : 'white',
                }}
              >
                체크아웃 하기
              </button>
            </div>

            {/* 체크아웃 상태에서만 이슈 작성 폼 노출 */}
            {workLog.status === 'CHECKOUT' && (
              <div className="issue-section">
                <h3>업무 이슈 작성</h3>
                <textarea
                  placeholder="이슈 내용을 입력하세요"
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  className="issue-textarea"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIssueFileChange}
                  className="issue-file-input"
                />
                {issueFile && <div>첨부파일: {issueFile.name}</div>}
                <button onClick={handleIssueSubmit} className="issue-submit-button">
                  이슈 등록
                </button>
              </div>
            )}
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
