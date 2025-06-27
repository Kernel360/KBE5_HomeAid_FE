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

  // 체크아웃 모달에서 사용할 상태
  const [checkoutMemo, setCheckoutMemo] = useState('');
  const [checkoutFile, setCheckoutFile] = useState(null);

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
      console.log('reservation API 응답:', response.data.data);
      setReservation(response.data.data);

      // 체크인/아웃 상태 설정
      if (response.data.data.workLog) {
        const newCheckStatus = {
          checkIn: response.data.data.workLog.checkInTime !== null,
          checkOut: response.data.data.workLog.checkOutTime !== null,
        };
        console.log('체크 상태 업데이트:', newCheckStatus);
        setCheckStatus(newCheckStatus);
      } else {
        console.log('workLog가 없음 - 초기 상태 유지');
        setCheckStatus({
          checkIn: false,
          checkOut: false,
        });
      }
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
        setCheckStatus({
          checkIn: true,
          checkOut: false,
        });

        alert('체크인이 완료되었습니다.');
        toggleCheckInModal();

        // 예약 정보 갱신
        await fetchReservation();
      }
    } catch (error) {
      console.error('체크인 실패:', error);
      console.error('에러 상세:', error.response?.data);
      console.error('에러 상태:', error.response?.status);

      // 이미 체크인된 경우 상태 업데이트
      if (error.response?.data?.code === 'ALREADY_COMPLETED_WORKLOG') {
        setCheckStatus({
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

      // 파일 업로드 필수 검증
      if (!checkoutFile) {
        alert('파일을 업로드해주세요.');
        setLoading(false);
        return;
      }

      // FormData 사용 (파일 업로드 필수이므로 항상 FormData 사용)
      const finalData = new FormData();
      finalData.append('lat', currentLocation.lat);
      finalData.append('lng', currentLocation.lng);
      finalData.append('memo', checkoutMemo);
      finalData.append('file', checkoutFile);

      console.log('체크아웃 요청 데이터:', finalData);
      const response = await apiService.workLog.checkOut(
        reservationId,
        finalData
      );
      console.log('체크아웃 결과 데이터', response.data);

      // 체크아웃 성공 시 상태 업데이트
      setCheckStatus((prev) => {
        const newStatus = { ...prev, checkOut: true };
        console.log('체크아웃 상태 업데이트:', newStatus);
        return newStatus;
      });

      alert('체크아웃이 완료되었습니다.');

      // 모달 상태 초기화
      setCheckoutMemo('');
      setCheckoutFile(null);
      toggleCheckOutModal();

      // 예약 정보 다시 불러오기
      await fetchReservation();
    } catch (error) {
      console.error('체크아웃 실패:', error);
      alert(error.response?.data?.message || '체크아웃에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const cancelCheckIn = () => {
    setShowCheckInModal(false); // ✅ false로 닫기
  };

  const cancelCheckOut = () => {
    // 모달 닫을 때 입력 상태 초기화
    setCheckoutMemo('');
    setCheckoutFile(null);
    setShowCheckOutModal(false); // ✅ false로 닫기
  };

  const handleCheckoutFileChange = (e) => {
    setCheckoutFile(e.target.files[0]);
  };

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
                  <p>서비스 완료 정보를 입력해주세요.</p>

                  <div style={{ marginBottom: '16px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                      }}
                    >
                      메모
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
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                      }}
                    >
                      파일 첨부 <span style={{ color: '#f44336' }}>*</span>
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
                    {checkoutFile ? (
                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '14px',
                          color: '#4caf50',
                        }}
                      >
                        ✓ 첨부된 파일: {checkoutFile.name}
                      </div>
                    ) : (
                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '14px',
                          color: '#f44336',
                        }}
                      >
                        파일을 업로드해주세요 (필수)
                      </div>
                    )}
                  </div>

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
                      disabled={loading || !checkoutFile}
                    >
                      {loading ? '처리 중...' : '등록하기'}
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
