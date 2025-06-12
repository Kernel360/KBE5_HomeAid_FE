import React, { useEffect, useState } from 'react';
import './ManagerServiceCheckIn.css';
import Footer from '../../../components/Footer.jsx';
import Header from '../../../components/Header.jsx';
import useReservationStore from '../store/reservationStore.js';
import { apiService } from '../../../store/api.js';

const ManagerServiceCheckIn = () => {
  const workLog = useReservationStore.getState().workLog;
  const reservationStore = useReservationStore();
  const [reservation, setReservation] = useState({});
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const matchingItem = useReservationStore((state) => state.matching);

  console.log('workLog State ', workLog);

  const fetchReservation = async () => {
    const response = await apiService.reservation.getById(matchingItem.reservationId);
    console.log('fetchReservation back data', response.data.data);
    setReservation(response.data.data)
  }
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
    toggleCheckInModal();
  };

  const handleCheckOut = () => {
    toggleCheckOutModal();
  };

  const confirmCheckIn = async () => {
    try {
      const requestData = {
        lat: '123.123',
        lng: '111.11',
        managerId: '1',
        reservationId: matchingItem.reservationId
      }
      const response = await apiService.workLog.checkIn(requestData);
      console.log('체크인 결과 데이터', response.data.data)
      reservationStore.setWorkLog(response.data.data)
      toggleCheckInModal();
    } catch (error) {
      console.error('체크인 실패:', error);
      alert(error.response.data.message);
      cancelCheckIn();
    }
  };

  const confirmCheckOut = async () => {
    try {
      const requestData = {
        lat: '123.123',
        lng: '111.11',
        managerId: '1',
        reservationId: matchingItem.reservationId,
        workLogId: workLog.workLogId || 4,
      }
      const response = await apiService.workLog.checkOut(requestData);
      console.log('체크아웃 백엔드 결과', response.data);
      const isCheckOutSuccess = response.data.success;
      if (isCheckOutSuccess) {
        reservationStore.setWorkLog({  // 이방식 하거나  useReservationStore.getState().setWorkLog({
          ...workLog,
          status: 'CHECKOUT'
        })
        console.log('성공시 체크아웃 상태 변화', workLog)
      }

      toggleCheckOutModal();
    } catch (error) {
      console.error('체크아웃 실패:', error);
      alert(error.response.data.message);
    }
  };

  const cancelCheckIn = () => {
    setShowCheckInModal(false);  // ✅ false로 닫기

  };

  const cancelCheckOut = () => {
    setShowCheckOutModal(false); // ✅ false로 닫기

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
                <span className="value">
                  {reservation.totalDuration} 시간
                </span>
              </div>
              <div className="detail-item">
                <span className="label">주소</span>
                <span className="value">{reservation.address} {reservation.addressDetail}</span>
              </div>
            </div>
            <div className="action-buttons">
              <button
                className={`action-button checkin-button ${workLog.status !== 'PENDING' ? 'disabled' : ''}`}
                onClick={handleCheckIn}
                disabled={workLog.status !== 'PENDING'}
                style={{
                  backgroundColor: workLog.status === 'PENDING' ? '#4caf50' : '#e0e0e0',
                  color: workLog.status === 'PENDING' ? 'white' : '#9e9e9e',
                }}
              >
                체크인
              </button>

              <button
                className={`action-button checkout-button ${workLog.status === 'CHECKOUT' ? 'disabled' : ''}`}
                onClick={handleCheckOut}
                 disabled={workLog.status === 'PENDING' || 'CHECKOUT'}
              >
                체크아웃
              </button>
            </div>
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
                  >
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
