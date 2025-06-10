import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceRequest.css';
import '../styles/common.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import { usePaymentData } from '../hooks/useLocalStorage';
import {
  useCustomerReservation,
  useCustomerAddresses,
} from '../hooks/useCustomerAPI';
import useReservationStore from '../../../stores/reservationStore';
// ⭐️ 인증 정보 추가
import { useAuthStore } from '../../../stores/authStore';

// ⭐️ 시간 계산 함수들 추가
const addMinutesToTime = (timeStr, minutes) => {
  if (!timeStr || !minutes) return '';

  const [hours, mins] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;

  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;

  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
};

const UserServiceRequest = () => {
  const navigate = useNavigate();

  // ⭐️ 인증된 사용자 정보 가져오기 (최우선)
  const { user, accessToken } = useAuthStore();

  // zustand store 사용
  const { reservationData } = useReservationStore();

  // API 훅 사용
  const {
    addresses,
    loading: addressLoading,
    error: addressError,
    addAddress,
  } = useCustomerAddresses();

  const {
    createReservation,
    loading: reservationLoading,
    error: reservationError,
  } = useCustomerReservation();

  const { updatePaymentData } = usePaymentData();

  // ⭐️ 인증 및 주소 디버깅
  React.useEffect(() => {
    console.log('🏠 UserServiceRequest - 주소 상태:');
    console.log('📍 addresses:', addresses);
    console.log('⏳ addressLoading:', addressLoading);
    console.log('❌ addressError:', addressError);
    console.log('🔑 현재 토큰:', localStorage.getItem('accessToken'));
    console.log('👤 현재 사용자:', user);
  }, [addresses, addressLoading, addressError, user]);

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    serviceType: '원룸',
    date: '',
    startTime: '09:00', // 시작시간으로 변경
    managerGender: '',
    selectedAddress: null,
    detailAddress: '',
    isCurrentLocation: false,
    addressMethod: '',
    isDefaultAddress: false,
  });

  const [showAddressModal, setShowAddressModal] = useState(false);

  // 종료시간 계산 (zustand store의 totalDuration 사용)
  const endTime =
    formData.startTime && reservationData.totalDuration > 0
      ? addMinutesToTime(formData.startTime, reservationData.totalDuration)
      : '';

  // 컴포넌트 마운트 시 기본값 설정
  useEffect(() => {
    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split('T')[0];
    setFormData((prev) => ({ ...prev, date: today }));
  }, []);

  // 기본 주소가 있다면 선택
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setFormData((prev) => ({ ...prev, selectedAddress: defaultAddress }));
        console.log('🏡 기본 주소 선택됨:', defaultAddress);
      }
    }
  }, [addresses]);

  // ⭐️ 로그인 상태 확인
  useEffect(() => {
    console.log('🔐 UserServiceRequest - 현재 사용자 정보:', user);
    console.log(
      '🔑 UserServiceRequest - 액세스 토큰:',
      accessToken ? '있음' : '없음'
    );

    if (!user || !accessToken) {
      console.log('로그인 정보가 없습니다. 로그인 페이지로 이동합니다.');
      navigate('/auth/signin');
    }
  }, [user, accessToken, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressSelect = (address) => {
    setFormData((prev) => ({ ...prev, selectedAddress: address }));
  };

  const handleCurrentLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('현재 위치:', latitude, longitude);
          handleInputChange('isCurrentLocation', true);
          // 임시로 현재 위치 주소 설정
          const currentLocationAddress = {
            id: 'current',
            type: '현재 위치',
            main: `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`,
            detail: '현재 위치에서 측정된 좌표',
            isDefault: false,
          };
          handleAddressSelect(currentLocationAddress);
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          alert(
            '위치 정보를 가져올 수 없습니다. 수동으로 주소를 입력해주세요.'
          );
        }
      );
    } else {
      alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
    }
  };

  const handleAddressSave = async () => {
    if (!formData.addressMethod.trim()) {
      alert('주소를 입력해주세요.');
      return;
    }

    try {
      const newAddressData = {
        type: '기타',
        main: formData.addressMethod,
        detail: formData.detailAddress || '',
        isDefault: formData.isDefaultAddress,
      };

      const newAddress = await addAddress(newAddressData);
      handleAddressSelect(newAddress);
      setShowAddressModal(false);

      // 폼 초기화
      setFormData((prev) => ({
        ...prev,
        addressMethod: '',
        detailAddress: '',
        isDefaultAddress: false,
      }));

      alert('주소가 저장되었습니다.');
    } catch (error) {
      console.error('주소 저장 실패:', error);
      alert('주소 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSubmit = async () => {
    // ⭐️ 로그인 확인
    if (!user || !accessToken) {
      alert('로그인이 필요합니다. 다시 로그인해주세요.');
      navigate('/auth/signin');
      return;
    }

    // 필수 입력 검증
    if (!formData.serviceType || !formData.date || !formData.startTime) {
      alert('서비스 유형, 날짜, 시간을 모두 선택해주세요.');
      return;
    }

    if (!formData.selectedAddress) {
      alert('주소를 선택해주세요.');
      return;
    }

    try {
      // zustand store에서 예약 정보 가져오기
      const { setReservationDate, setReservationTime, setAddress } =
        useReservationStore.getState();

      // zustand store에 예약 정보 저장
      setReservationDate(formData.date);
      setReservationTime(formData.startTime);
      setAddress(
        formData.selectedAddress.main,
        formData.detailAddress || formData.selectedAddress.detail || ''
      );

      // ⭐️⭐️⭐️ 백엔드 ReservationRequestDto 규격에 맞는 데이터로 변경! ⭐️⭐️⭐️
      const reservationData = {
        subOptionId: 1, // TODO: 실제로는 선택된 서브옵션 ID 사용해야 함!
        requestedDate: formData.date, // yyyy-MM-dd
        requestedTime: `${formData.startTime}:00`, // HH:mm:ss 형식으로 변환
        // ⭐️ 인증된 사용자 정보 자동 포함 (백엔드에서 JWT 토큰으로 사용자 식별)
        // customerId는 백엔드에서 JWT 토큰을 통해 자동으로 인식됩니다.
      };

      console.log('🔐 인증된 사용자:', user);
      console.log('📝 예약 요청 데이터:', reservationData);

      // 백엔드에 예약 생성 요청 (ReservationResponseDto 응답받음)
      const reservation = await createReservation(reservationData);

      console.log('예약 생성 응답 (ReservationResponseDto):', reservation);

      // Spring Boot ReservationResponseDto 필드 확인
      if (!reservation || !reservation.reservationId) {
        throw new Error('예약 응답 데이터가 올바르지 않습니다.');
      }

      // 결제 페이지로 넘길 데이터 준비 (Spring Boot DTO 구조 기반)
      const paymentData = {
        reservationId: reservation.reservationId, // Long
        serviceInfo: {
          type: formData.serviceType,
          date: formData.date,
          time: formData.startTime,
          address: {
            main: formData.selectedAddress.main,
            detail:
              formData.detailAddress || formData.selectedAddress.detail || '',
          },
          subOptionName: reservation.subOptionName, // String - 예약 서비스 명
        },
        amount: reservation.totalPrice, // Integer - 총 가격 (원 단위)
        duration: reservation.totalDuration, // Integer - 총 소요 시간 (분 단위)
        status: reservation.status, // ReservationStatus enum
      };

      // localStorage에 결제 데이터 저장 (결제 페이지에서 사용)
      updatePaymentData(paymentData);

      console.log('예약 생성 완료, 결제 페이지로 이동:', {
        reservationId: reservation.reservationId,
        status: reservation.status,
        totalPrice: reservation.totalPrice,
        totalDuration: reservation.totalDuration,
        subOptionName: reservation.subOptionName,
      });

      navigate('/user/payment');
    } catch (error) {
      console.error('예약 생성 실패:', error);
      alert(`예약 생성에 실패했습니다: ${error.message}`);
    }
  };

  // 로딩 상태
  if (addressLoading || reservationLoading) {
    return (
      <div className="reservation-page">
        <Header />
        <div className="page-content-wrapper">
          <div className="reservation-container">
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
                fontSize: '16px',
                color: '#666',
              }}
            >
              {addressLoading
                ? '주소 정보를 불러오는 중...'
                : '예약을 생성하는 중...'}
            </div>
          </div>
        </div>
        <Footer current="/user/service-request" />
      </div>
    );
  }

  // 에러 상태
  if (addressError || reservationError) {
    return (
      <div className="reservation-page">
        <Header />
        <div className="page-content-wrapper">
          <div className="reservation-container">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
                fontSize: '16px',
                color: '#e74c3c',
              }}
            >
              <p>{addressError || reservationError}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: '10px',
                  padding: '10px 20px',
                  backgroundColor: '#4285f4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
        <Footer current="/user/service-request" />
      </div>
    );
  }

  if (showAddressModal) {
    return (
      <div className="reservation-page">
        <Header />
        <div className="page-content-wrapper">
          <div className="address-modal-container">
            {/* 주소 입력 모달 */}
            <div className="title-section">
              <h1 className="page-title">주소 추가</h1>
              <p className="page-subtitle">새로운 주소를 추가해주세요.</p>
            </div>

            <div className="address-method-section">
              <label className="section-title">주소</label>
              <input
                type="text"
                className="address-method-input"
                placeholder="예: 서울시 강남구 테헤란로 123"
                value={formData.addressMethod}
                onChange={(e) =>
                  handleInputChange('addressMethod', e.target.value)
                }
              />
            </div>

            <div className="default-address-section">
              <label className="default-address-label">
                <input
                  type="checkbox"
                  checked={formData.isDefaultAddress}
                  onChange={(e) =>
                    handleInputChange('isDefaultAddress', e.target.checked)
                  }
                />
                <span className="checkmark"></span>
                기본 주소로 설정
              </label>
            </div>

            <div className="modal-buttons">
              <button
                className="save-btn"
                onClick={() => setShowAddressModal(false)}
              >
                취소
              </button>
              <button className="continue-btn" onClick={handleAddressSave}>
                저장하기
              </button>
            </div>
          </div>
        </div>
        <Footer current="/user/service-request" />
      </div>
    );
  }

  return (
    <div className="reservation-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="reservation-container">
          {/* 제목 섹션 */}
          <div className="title-section">
            <h1 className="page-title">서비스 요청</h1>
            <p className="page-subtitle">서비스 정보를 입력해주세요.</p>
          </div>

          {/* 서비스 유형 선택 */}
          <div className="service-type-section">
            <h3 className="section-title">서비스 유형</h3>
            <div className="service-type-options">
              {['원룸', '투룸', '쓰리룸'].map((type) => (
                <button
                  key={type}
                  className={`service-type-btn ${formData.serviceType === type ? 'active' : ''}`}
                  onClick={() => handleInputChange('serviceType', type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 날짜 및 시간 선택 */}
          <div className="datetime-section">
            <h3 className="section-title">날짜 및 시간</h3>
            <div className="datetime-inputs">
              <input
                type="date"
                className="date-input"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />

              {/* 시작시간 입력 */}
              <div className="time-input-section">
                <label className="time-label">시작 시간</label>
                <input
                  type="time"
                  className="time-input"
                  value={formData.startTime}
                  onChange={(e) =>
                    handleInputChange('startTime', e.target.value)
                  }
                />
              </div>

              {/* 종료시간 표시 */}
              {endTime && (
                <div className="time-display-section">
                  <label className="time-label">예상 종료 시간</label>
                  <div className="time-display">
                    {formatTimeDisplay(endTime)}
                  </div>
                  <div className="duration-display">
                    (약 {reservationData.totalDuration}분 소요)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 매니저 성별 선택 */}
          <div className="manager-gender-section">
            <h3 className="section-title">매니저 성별 (선택)</h3>
            <div className="gender-options">
              {['남성', '여성', '상관없음'].map((gender) => (
                <button
                  key={gender}
                  className={`gender-btn ${formData.managerGender === gender ? 'active' : ''}`}
                  onClick={() => handleInputChange('managerGender', gender)}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* 주소 섹션 */}
          <div className="address-section">
            <h3 className="section-title">서비스 주소</h3>

            {/* 선택된 주소 표시 */}
            {formData.selectedAddress && (
              <div className="address-header">
                <span className="address-icon">📍</span>
                <div className="address-content">
                  <h4 className="address-type">
                    {formData.selectedAddress.type}
                  </h4>
                  <p className="address-main">
                    {formData.selectedAddress.main}
                  </p>
                  <p className="address-detail">
                    {formData.selectedAddress.detail}
                  </p>
                </div>
                <div className="address-actions">
                  <button
                    className="edit-btn"
                    onClick={() => setShowAddressModal(true)}
                  >
                    변경
                  </button>
                  <span className="time-indicator">약 30분 소요</span>
                </div>
              </div>
            )}

            {/* 현재 위치 사용 버튼 */}
            <div className="current-location-section">
              <button
                className="current-location-btn"
                onClick={handleCurrentLocationClick}
              >
                📍 현재 위치 사용하기
              </button>
            </div>

            {/* 저장된 주소 목록 */}
            {addresses && addresses.length > 0 && (
              <div className="saved-addresses-section">
                <h4 className="section-title">저장된 주소</h4>
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`address-item ${formData.selectedAddress?.id === address.id ? 'selected' : ''}`}
                    onClick={() => handleAddressSelect(address)}
                  >
                    <div className="address-radio">
                      <div
                        className={`radio-circle ${formData.selectedAddress?.id === address.id ? 'active' : ''}`}
                      >
                        {formData.selectedAddress?.id === address.id && (
                          <div className="radio-dot"></div>
                        )}
                      </div>
                    </div>
                    <div className="address-info">
                      <span className="address-icon">🏠</span>
                      <div className="address-text">
                        <h4>
                          {address.type} {address.isDefault && '(기본)'}
                        </h4>
                        <p className="address-main">{address.main}</p>
                        <p className="address-detail">{address.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 새 주소 추가 버튼 */}
            <div style={{ marginTop: '16px' }}>
              <button
                className="edit-btn"
                onClick={() => setShowAddressModal(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px dashed #4285f4',
                  backgroundColor: 'transparent',
                  textDecoration: 'none',
                }}
              >
                + 새 주소 추가
              </button>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="submit-section">
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={reservationLoading}
            >
              {reservationLoading ? '예약 생성 중...' : '결제하기'}
            </button>
          </div>
        </div>
      </div>
      <Footer current="/user/service-request" />
    </div>
  );
};

export default UserServiceRequest;
