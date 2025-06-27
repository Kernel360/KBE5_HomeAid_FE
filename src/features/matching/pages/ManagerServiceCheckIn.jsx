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
  const reservationId = useReservationStore.getState().reservationId;
  const [reservation, setReservation] = useState({});
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [checkStatus, setCheckStatus] = useState({
    checkIn: false,
    checkOut: false,
  });
  const [loading, setLoading] = useState(false);

  // TODO: 체크아웃 메모와 파일 업로드 기능 구현 예정
  // const [checkoutMemo, setCheckoutMemo] = useState('');
  // const [checkoutFile, setCheckoutFile] = useState(null);

  // 로컬 스토리지에서 체크 상태 불러오기
  const getStoredCheckStatus = () => {
    const stored = localStorage.getItem(`checkStatus_${reservationId}`);
    if (stored) {
      try {
        const parsedStatus = JSON.parse(stored);
        console.log('🔍 로컬 스토리지에서 불러온 상태:', parsedStatus);
        return parsedStatus;
      } catch (error) {
        console.error('로컬 스토리지 파싱 오류:', error);
      }
    }
    return { checkIn: false, checkOut: false };
  };

  // 로컬 스토리지에 체크 상태 저장하기
  const saveCheckStatus = (status) => {
    localStorage.setItem(
      `checkStatus_${reservationId}`,
      JSON.stringify(status)
    );
    console.log('🔍 로컬 스토리지에 상태 저장:', status);
  };

  // 체크 상태 업데이트 (로컬 스토리지와 함께)
  const updateCheckStatus = (newStatus) => {
    console.log('🔍 체크 상태 업데이트:', newStatus);
    setCheckStatus(newStatus);
    saveCheckStatus(newStatus);
  };

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      return;
    }

    console.log('위치 정보 요청 시작...');

    const options = {
      enableHighAccuracy: true, // 높은 정확도
      timeout: 5000, // 5초 타임아웃
      maximumAge: 0, // 캐시된 위치정보를 사용하지 않음
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('위치 정보 가져오기 성공:', position.coords);
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('위치 정보 상세 에러:', {
          code: error.code,
          message: error.message,
        });

        let errorMessage = '위치 정보를 가져오는데 실패했습니다.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              '위치 정보 접근이 거부되었습니다. 브라우저 설정에서 위치 정보 접근 권한을 허용해주세요.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              '위치 정보를 사용할 수 없습니다. GPS 신호가 약하거나 위치 서비스가 꺼져있을 수 있습니다.';
            break;
          case error.TIMEOUT:
            errorMessage =
              '위치 정보 요청 시간이 초과되었습니다. 다시 시도해주세요.';
            break;
        }

        alert(errorMessage);
      },
      options // 옵션 추가
    );
  };

  // 예약 상세 정보 불러오기 (apiService.reservation.getById만 사용)
  const fetchReservation = async () => {
    try {
      setLoading(true);
      const response = await apiService.reservation.getById(reservationId);
      console.log(
        '🔍 reservation API 전체 응답:',
        JSON.stringify(response.data, null, 2)
      );
      console.log('🔍 reservation.data.data:', response.data.data);
      console.log(
        '🔍 workLog 전체 구조:',
        JSON.stringify(response.data.data.workLog, null, 2)
      );
      setReservation(response.data.data);

      // 로컬 스토리지에서 상태 확인
      const storedStatus = getStoredCheckStatus();

      // 체크인/아웃 상태 설정
      const reservationData = response.data.data;
      let serverStatus = { checkIn: false, checkOut: false };

      if (reservationData.workLog) {
        const workLog = reservationData.workLog;
        console.log('🔍 workLog 존재함:', workLog);
        console.log('🔍 checkInTime:', workLog.checkInTime);
        console.log('🔍 checkOutTime:', workLog.checkOutTime);

        serverStatus = {
          checkIn:
            workLog.checkInTime !== null && workLog.checkInTime !== undefined,
          checkOut:
            workLog.checkOutTime !== null && workLog.checkOutTime !== undefined,
        };
        console.log('🔍 서버에서 계산된 체크 상태:', serverStatus);
      } else if (
        reservationData.workLogs &&
        Array.isArray(reservationData.workLogs) &&
        reservationData.workLogs.length > 0
      ) {
        // workLogs 배열로 온 경우 처리
        const workLog = reservationData.workLogs[0];
        console.log('🔍 workLogs 배열에서 첫 번째 workLog:', workLog);

        serverStatus = {
          checkIn:
            workLog.checkInTime !== null && workLog.checkInTime !== undefined,
          checkOut:
            workLog.checkOutTime !== null && workLog.checkOutTime !== undefined,
        };
        console.log('🔍 서버에서 계산된 체크 상태 (배열):', serverStatus);
      } else {
        console.log('🔍 workLog가 없음 - 서버 상태는 초기값');
      }

      // 로컬 스토리지 상태와 서버 상태 중 더 진행된 상태를 사용
      const finalStatus = {
        checkIn: storedStatus.checkIn || serverStatus.checkIn,
        checkOut: storedStatus.checkOut || serverStatus.checkOut,
      };

      console.log('🔍 최종 적용될 상태:', finalStatus);
      console.log('🔍 로컬 스토리지 상태:', storedStatus);
      console.log('🔍 서버 상태:', serverStatus);

      updateCheckStatus(finalStatus);
    } catch (error) {
      console.error('예약 정보 로딩 실패:', error);
      alert('예약 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
    if (reservationId) {
      // 초기 로드 시 로컬 스토리지에서 상태 복원
      const storedStatus = getStoredCheckStatus();
      if (storedStatus.checkIn || storedStatus.checkOut) {
        setCheckStatus(storedStatus);
      }
      fetchReservation();
    }
  }, [reservationId]);

  // 디버깅을 위한 상태 변화 로그
  useEffect(() => {
    console.log('🔍 현재 체크 상태:', checkStatus);
    console.log('  - 체크인:', checkStatus.checkIn ? '완료' : '미완료');
    console.log('  - 체크아웃:', checkStatus.checkOut ? '완료' : '미완료');
    console.log('  - 체크인 버튼 활성화:', !checkStatus.checkIn && !loading);
    console.log(
      '  - 체크아웃 버튼 활성화:',
      checkStatus.checkIn && !checkStatus.checkOut && !loading
    );
  }, [checkStatus, loading]);

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
    console.log('체크인 버튼 클릭 - 현재 위치 정보:', {
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
    console.log('체크아웃 버튼 클릭 - 위치 정보:', {
      위도: currentLocation.lat,
      경도: currentLocation.lng,
    });
    toggleCheckOutModal();
  };

  const confirmCheckIn = async () => {
    try {
      setLoading(true);
      if (!currentLocation) {
        throw new Error('위치 정보를 가져오는데 실패했습니다.');
      }

      if (!reservationId) {
        throw new Error('예약 ID가 없습니다. 예약을 선택해주세요.');
      }

      // 이미 체크인된 상태인지 확인
      if (checkStatus.checkIn) {
        alert('이미 체크인이 완료되었습니다.');
        toggleCheckInModal();
        return;
      }

      const requestData = {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        reservationId: reservationId,
      };

      const response = await apiService.workLog.checkIn(requestData);

      if (response.data?.data) {
        // 체크인 성공 시 상태 업데이트
        updateCheckStatus({
          checkIn: true,
          checkOut: false,
        });

        alert('체크인이 완료되었습니다.');
        toggleCheckInModal();
      }
    } catch (error) {
      console.error('체크인 실패:', error);
      console.error('에러 상세:', error.response?.data);
      console.error('에러 상태:', error.response?.status);

      // 이미 체크인된 경우 상태 업데이트
      if (error.response?.data?.code === 'ALREADY_COMPLETED_WORKLOG') {
        updateCheckStatus({
          checkIn: true,
          checkOut: false,
        });
        alert('이미 체크인이 완료된 상태입니다.');
      } else {
        alert(error.response?.data?.message || '체크인에 실패했습니다.');
      }

      toggleCheckInModal();
    } finally {
      setLoading(false);
    }
  };

  const confirmCheckOut = async () => {
    try {
      setLoading(true);
      if (!currentLocation) {
        throw new Error('위치 정보를 가져오는데 실패했습니다.');
      }

      // 위치 정보만 전송
      const response = await apiService.workLog.checkOut(reservationId, {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
      });

      console.log('체크아웃 결과 데이터', response.data);

      // 체크아웃 성공 시 즉시 상태 업데이트
      updateCheckStatus({
        checkIn: true, // 체크인은 이미 완료된 상태 유지
        checkOut: true, // 체크아웃 완료
      });

      alert('체크아웃이 완료되었습니다.');
      toggleCheckOutModal();

      // 서버와 동기화를 위해 예약 정보 다시 불러오기
      setTimeout(() => {
        fetchReservation();
      }, 500);
    } catch (error) {
      console.error('체크아웃 실패:', error);
      alert(error.response?.data?.message || '체크아웃에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const cancelCheckIn = () => {
    setShowCheckInModal(false);
  };

  const cancelCheckOut = () => {
    // TODO: 메모와 파일 업로드 기능 구현 예정
    // 모달 닫을 때 입력 상태 초기화
    // setCheckoutMemo('');
    // setCheckoutFile(null);
    setShowCheckOutModal(false);
  };

  // TODO: 메모와 파일 업로드 기능 구현 예정
  // const handleCheckoutFileChange = (e) => {
  //   setCheckoutFile(e.target.files[0]);
  // };

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
      <Header showBackButton={true} />
      <div className="page-content-wrapper">
        <div className="manager-service-checkin-container">
          <div className="service-progress">
            <h2>서비스 진행</h2>

            <div className="details-card">
              <div className="detail-item">
                <span className="label">서비스 옵션</span>
                <span className="value">
                  {reservation.serviceOptionName || '-'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">가격</span>
                <span className="value">
                  {reservation.totalPrice != null
                    ? reservation.totalPrice.toLocaleString() + '원'
                    : '-'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">예상 소요시간</span>
                <span className="value">
                  {reservation.totalDuration
                    ? reservation.totalDuration + ' 시간'
                    : '-'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">시작시간</span>
                <span className="value">
                  {formatDateTime(reservation.startTime)}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">주소</span>
                <span className="value">
                  {reservation.address} {reservation.addressDetail}
                </span>
              </div>
            </div>

            <div className="service-progress">
              <h2>체크인/체크아웃 상태</h2>

              <div className="status-cards-container">
                <div className="status-card-item">
                  <div className="status-label">체크인</div>
                  <div
                    className={`status-badge ${checkStatus.checkIn ? 'completed' : 'pending'}`}
                  >
                    {checkStatus.checkIn ? '완료' : '미완료'}
                  </div>
                </div>
                <div className="status-card-item">
                  <div className="status-label">체크아웃</div>
                  <div
                    className={`status-badge ${checkStatus.checkOut ? 'completed' : 'pending'}`}
                  >
                    {checkStatus.checkOut ? '완료' : '미완료'}
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="checkin-button"
                  onClick={handleCheckIn}
                  disabled={checkStatus.checkIn || loading}
                >
                  {loading && !checkStatus.checkIn
                    ? '처리 중...'
                    : checkStatus.checkIn
                      ? '체크인 완료'
                      : '체크인 하기'}
                </button>
                <button
                  className="checkout-button"
                  onClick={handleCheckOut}
                  disabled={
                    !checkStatus.checkIn || checkStatus.checkOut || loading
                  }
                >
                  {loading && checkStatus.checkIn && !checkStatus.checkOut
                    ? '처리 중...'
                    : checkStatus.checkOut
                      ? '체크아웃 완료'
                      : '체크아웃 하기'}
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
                    <button
                      onClick={cancelCheckIn}
                      className="cancel-button"
                      disabled={loading}
                    >
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

            {/* Check-out Modal with File Upload and Memo */}
            {showCheckOutModal && (
              <div className="modal-overlay">
                <div className="modal-content" style={{ maxWidth: '500px' }}>
                  <h3>체크아웃</h3>
                  <p>체크아웃을 진행하시겠습니까?</p>

                  {/* TODO: 메모 작성 기능 구현 예정 */}
                  {/* <div style={{ marginBottom: '16px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                      }}
                    >
                      메모 (선택사항)
                    </label>
                    <textarea
                      placeholder="서비스 완료 메모를 입력하세요"
                      value={checkoutMemo}
                      onChange={(e) => setCheckoutMemo(e.target.value)}
                      disabled={loading}
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        resize: 'vertical',
                        fontSize: '14px',
                      }}
                    />
                  </div> */}

                  {/* TODO: 파일 첨부 기능 구현 예정 */}
                  {/* <div style={{ marginBottom: '24px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                      }}
                    >
                      파일 첨부 (선택사항)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCheckoutFileChange}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    />
                    {checkoutFile && (
                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '14px',
                          color: '#4caf50',
                        }}
                      >
                        ✓ 첨부된 파일: {checkoutFile.name}
                      </div>
                    )}
                  </div> */}

                  <div className="modal-actions">
                    <button
                      onClick={cancelCheckOut}
                      className="cancel-button"
                      disabled={loading}
                    >
                      취소
                    </button>
                    <button
                      onClick={confirmCheckOut}
                      className="confirm-button"
                      disabled={loading}
                    >
                      {loading ? '처리 중...' : '확인'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer current="/matching/service-checkin" />
    </div>
  );
};

export default ManagerServiceCheckIn;
