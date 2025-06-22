import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceRequest.css';
import '../styles/common.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import useReservationStore from '../../../stores/reservationStore';
import useReservationListStore from '../../../stores/reservationListStore';
import { useAuthStore } from '../../../stores/authStore';
import { useAddressStore } from '../../../stores/addressStore';
import { useCustomerReservation } from '../hooks/useCustomerAPI';

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
    isLoading: addressLoading,
    error: addressError,
    fetchAddresses,
  } = useAddressStore();

  const { createReservation } = useCustomerReservation();

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    date: '',
    startTime: '09:00', // 시작시간으로 변경
    selectedAddress: null,
    detailAddress: '',
    isCurrentLocation: false,
    addressMethod: '',
    isDefaultAddress: false,
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  // ⭐️ 중복 제출 방지를 위한 상태 추가
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ⭐️ React StrictMode에서 중복 호출 방지를 위한 ref
  const submissionRef = useRef(false);

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

    if (user && accessToken) {
      fetchAddresses();
    }
  }, [user, accessToken, fetchAddresses]);

  // 기본 주소가 있다면 선택
  useEffect(() => {
    if (addresses && addresses.length > 0 && !formData.selectedAddress) {
      setFormData((prev) => ({ ...prev, selectedAddress: addresses[0] }));
    }
  }, [addresses]);

  // ⭐️ 로그인한 사용자의 주소 재로딩 (토큰 변경 시)
  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/auth/signin');
    }
  }, [user, accessToken, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressSelect = (address) => {
    console.log('주소 선택됨:', address);
    setFormData((prev) => ({ ...prev, selectedAddress: address }));
  };

  const handleAddNewAddress = () => {
    navigate('/customer/mypage/address/register', {
      state: { from: '/customer/service-request' },
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting || submissionRef.current) return;
    if (!user || !accessToken || !user.userId) {
      alert('사용자 정보가 올바르지 않습니다. 다시 로그인해주세요.');
      navigate('/auth/signin');
      return;
    }
    if (!formData.date || !formData.startTime || !formData.selectedAddress) {
      alert('날짜, 시간, 주소를 모두 선택해주세요.');
      return;
    }
    if (!formData.selectedAddress?.id) {
      alert('유효한 주소를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    submissionRef.current = true;

    try {
      const currentReservationData = useReservationStore.getState().reservationData;
      const { selectedAddress } = formData;
      
      console.log('선택된 주소 데이터:', selectedAddress);
      console.log('주소 데이터 구조:', {
        id: selectedAddress.id,
        alias: selectedAddress.alias,
        address: selectedAddress.address,
        addressDetail: selectedAddress.addressDetail,
        fullAddress: selectedAddress.fullAddress,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
      });
      
      // 백엔드 API DTO 형식에 맞게 데이터 재구성
      const backendReservationData = {
        requestedDate: formData.date,
        requestedTime: `${formData.startTime}:00`,
        optionId: 1, // 요구사항에 따라 optionId를 사용하고 1로 고정
        totalDuration: Math.round(
          (currentReservationData.totalDuration || 180) / 60,
        ),
        address: selectedAddress.address || selectedAddress.fullAddress,
        addressDetail: selectedAddress.addressDetail || '-',
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
        customerMemo: currentReservationData.customerNote || '',
      };

      console.log('백엔드로 전송할 예약 데이터:', backendReservationData);

      const requestDataString = JSON.stringify(
        backendReservationData,
        null,
        2,
      );
      const isConfirmed = window.confirm(
        `다음 데이터로 예약을 요청하시겠습니까?\n\n${requestDataString}`,
      );

      if (!isConfirmed) {
        setIsSubmitting(false);
        submissionRef.current = false;
        return;
      }

      const backendReservation = await createReservation(backendReservationData);
      
      const { addReservation } = useReservationListStore.getState();
      const endTime = addMinutesToTime(
        formData.startTime,
        currentReservationData.totalDuration,
      );
      
      const localReservationData = {
        serviceType:
          currentReservationData.selectedSubOption?.name || '서비스',
        selectedSubOption: currentReservationData.selectedSubOption,
        reservationDate: formData.date,
        reservationTime: formData.startTime,
        endTime: endTime,
        totalPrice: currentReservationData.totalPrice || 0,
        address: backendReservationData.address,
        addressDetail: backendReservationData.addressDetail,
        customerNote: currentReservationData.customerNote || '',
        selectedServices: currentReservationData.selectedServices || [],
        serviceDetails: currentReservationData.serviceDetails || [],
        backendData: backendReservation,
      };
      
      addReservation(localReservationData);

      alert('✅ 예약이 성공적으로 생성되었습니다!');
      navigate('/customer/reservations');

    } catch (error) {
      console.error('예약 생성 실패:', error);
      alert(`예약 생성에 실패했습니다: ${error.message}`);
      submissionRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 상태
  if (addressLoading) {
    return (
      <div className="reservation-page">
        <Header showBackButton={true} />
        <div className="page-content-wrapper">
          <div className="reservation-container" style={{ marginTop: '64px' }}>
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
              주소 정보를 불러오는 중...
            </div>
          </div>
        </div>
        <Footer current="/customer/service-request" />
      </div>
    );
  }

  // 에러 상태
  if (addressError) {
    return (
      <div className="reservation-page">
        <Header showBackButton={true} />
        <div className="page-content-wrapper">
          <div className="reservation-container" style={{ marginTop: '64px' }}>
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
              <p>{addressError}</p>
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
        <Footer current="/customer/service-request" />
      </div>
    );
  }

  if (showAddressModal) {
    return (
      <div className="reservation-page">
        <Header showBackButton={true} />
        <div className="page-content-wrapper">
          <div
            className="address-modal-container"
            style={{ marginTop: '64px' }}
          >
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
              <button className="continue-btn" onClick={handleSubmit}>
                저장하기
              </button>
            </div>
          </div>
        </div>
        <Footer current="/customer/service-request" />
      </div>
    );
  }

  return (
    <div className="reservation-page">
      <Header showBackButton={true} />
      <div className="page-content-wrapper">
        <div className="reservation-container" style={{ marginTop: '64px' }}>
          {/* 제목 섹션 */}
          <div className="title-section">
            <h1 className="page-title">서비스 요청</h1>
            <p className="page-subtitle">서비스 정보를 입력해주세요.</p>
          </div>

          {/* 선택된 서비스 정보 표시 */}
          <div className="selected-service-section">
            <h3 className="section-title">선택된 서비스</h3>
            <div className="service-info-card">
              <div className="service-icon">
                {reservationData.selectedSubOption?.id === 'cleaning'
                  ? '🧹'
                  : reservationData.selectedSubOption?.id === 'laundry'
                    ? '👕'
                    : reservationData.selectedSubOption?.id === 'childcare'
                      ? '👶'
                      : '🏠'}
              </div>
              <div className="service-details">
                <h4 className="service-name">
                  {reservationData.selectedSubOption?.name || '서비스'}
                </h4>
                <p className="service-description">
                  {reservationData.serviceTitle || '기본 서비스'}
                </p>
                <div className="service-pricing">
                  <span className="service-duration">
                    약 {reservationData.totalDuration || 180}분 소요
                  </span>
                  <span className="service-price">
                    {(reservationData.totalPrice || 0).toLocaleString()}원
                  </span>
                </div>
              </div>
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

          {/* 주소 섹션 */}
          <div className="address-section">
            <h3 className="section-title">서비스 받을 주소</h3>

            {/* 저장된 주소 목록 */}
            {addresses && addresses.length > 0 ? (
              <div className="saved-addresses-section">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`address-item ${
                      formData.selectedAddress?.id === address.id ? 'selected' : ''
                    }`}
                    onClick={() => handleAddressSelect(address)}
                  >
                    <div className="address-radio">
                      <div className={`radio-circle ${formData.selectedAddress?.id === address.id ? 'active' : ''}`}>
                        {formData.selectedAddress?.id === address.id && <div className="radio-dot"></div>}
                      </div>
                    </div>
                    <div className="address-info">
                      <span className="address-icon">📍</span>
                      <div className="address-text">
                        <h4>{address.alias || '주소'}</h4>
                        <p className="address-main">{address.fullAddress}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                <p style={{ fontWeight: '600', color: '#333' }}>저장된 주소가 없습니다</p>
                <p style={{ color: '#666', marginTop: '8px' }}>서비스를 받을 주소를 먼저 추가해주세요.</p>
              </div>
            )}

            {/* 새 주소 추가 버튼 */}
            <div style={{ marginTop: '16px' }}>
              <button
                className="edit-btn"
                onClick={handleAddNewAddress}
                style={{ width: '100%', padding: '12px', border: '1px dashed #4285f4', backgroundColor: 'transparent', textDecoration: 'none', color: '#4285f4', borderRadius: '8px', cursor: 'pointer' }}
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
              disabled={isSubmitting || !formData.selectedAddress}
              style={{
                opacity: isSubmitting || !formData.selectedAddress ? 0.6 : 1,
                cursor:
                  isSubmitting || !formData.selectedAddress
                    ? 'not-allowed'
                    : 'pointer',
                backgroundColor: !formData.selectedAddress
                  ? '#cccccc'
                  : undefined,
              }}
            >
              {isSubmitting
                ? '예약 생성 중...'
                : !formData.selectedAddress
                  ? '주소를 먼저 선택하세요'
                  : '예약하기'}
            </button>
          </div>
        </div>
      </div>
      <Footer current="/customer/service-request" />
    </div>
  );
};

export default UserServiceRequest;
