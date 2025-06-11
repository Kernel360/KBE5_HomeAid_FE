import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceRequest.css';
import '../styles/common.css';
import Footer from '../../../components/Footer.jsx';
import Header from '../../../components/Header.jsx';
import GoogleMapPicker from '../../../components/GoogleMapPicker.jsx';
// import { usePaymentData } from '../hooks/useLocalStorage';
import {
  useCustomerReservation,
  useCustomerAddresses,
} from '../hooks/useCustomerAPI';
import useReservationStore from '../../../stores/reservationStore';
import useReservationListStore from '../../../stores/reservationListStore';
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

  const { createReservation } = useCustomerReservation();

  // const { updatePaymentData } = usePaymentData();

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
  }, []);

  // 기본 주소가 있다면 선택
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setFormData((prev) => ({ ...prev, selectedAddress: defaultAddress }));
      }
    }
  }, [addresses]);

  // ⭐️ 로그인 상태 확인
  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/auth/signin');
    }
  }, [user, accessToken, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressSelect = (address) => {
    setFormData((prev) => ({ ...prev, selectedAddress: address }));
  };

  // 지도에서 위치 선택 시 처리하는 함수
  const handleMapLocationSelect = (locationData) => {
    let main, detail;

    if (locationData.source === 'current_location') {
      // 현재 위치인 경우
      main = '현재 위치에서 측정된 좌표';
      detail = `위도: ${locationData.coordinates.lat.toFixed(6)}, 경도: ${locationData.coordinates.lng.toFixed(6)}`;
    } else {
      // 지도에서 선택한 경우
      main = locationData.address.includes('위도:')
        ? '지도에서 선택한 위치'
        : locationData.address;
      detail = `위도: ${locationData.coordinates.lat.toFixed(6)}, 경도: ${locationData.coordinates.lng.toFixed(6)}`;
    }

    const mapAddress = {
      id:
        locationData.source === 'current_location'
          ? 'current-location'
          : 'map-selected',
      type:
        locationData.source === 'current_location' ? '현재 위치' : '지도 선택',
      main: main,
      detail: detail,
      isDefault: false,
      coordinates: locationData.coordinates,
    };

    handleAddressSelect(mapAddress);
    handleInputChange(
      'isCurrentLocation',
      locationData.source === 'current_location'
    );
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
    // ⭐️ 중복 제출 방지 (state + ref 이중 체크)
    if (isSubmitting || submissionRef.current) {
      return;
    }

    // ⭐️ 로그인 확인
    if (!user || !accessToken) {
      alert('로그인이 필요합니다. 다시 로그인해주세요.');
      navigate('/auth/signin');
      return;
    }

    // 필수 입력 검증
    if (!formData.date || !formData.startTime) {
      alert('날짜와 시간을 선택해주세요.');
      return;
    }

    if (!formData.selectedAddress) {
      alert('주소를 선택해주세요.');
      return;
    }

    // ⭐️ 제출 시작 - 이중 잠금
    setIsSubmitting(true);
    submissionRef.current = true;

    try {
      // zustand store에서 예약 정보 가져오기
      const { setReservationDate, setReservationTime, setSelectedAddress } =
        useReservationStore.getState();

      // zustand store에 예약 정보 저장
      setReservationDate(formData.date);
      setReservationTime(formData.startTime);

      // ⭐️ 위치정보를 포함한 주소 객체 저장
      setSelectedAddress({
        ...formData.selectedAddress,
        detail: formData.detailAddress || formData.selectedAddress.detail || '',
      });

      // ⭐️ 현재 예약 데이터 가져오기
      const currentReservationData =
        useReservationStore.getState().reservationData;

      // ⭐️ 종료 시간 계산
      const endTime = addMinutesToTime(
        formData.startTime,
        currentReservationData.totalDuration
      );

      try {
        // ⭐️ 백엔드 API 호출을 위한 예약 데이터 준비
        const backendReservationData = {
          // Spring Boot ReservationRequestDto에 정확히 맞는 구조
          reservationDate: formData.date, // LocalDate용 (yyyy-MM-dd)
          reservationTime: formData.startTime, // LocalTime용 (HH:mm -> HH:mm:ss로 변환됨)
          subOptionId: getSubOptionId(currentReservationData.selectedSubOption), // Long
          latitude:
            formData.selectedAddress.coordinates?.lat ||
            formData.selectedAddress.coordinates?.latitude ||
            null, // Double
          longitude:
            formData.selectedAddress.coordinates?.lng ||
            formData.selectedAddress.coordinates?.longitude ||
            null, // Double
        };

        // Spring Boot @NotNull 필드 검증 (requestedDate, requestedTime, subOptionId)
        const requiredFields = [
          'reservationDate',
          'reservationTime',
          'subOptionId',
        ];
        const missingFields = requiredFields.filter(
          (field) => !backendReservationData[field]
        );

        if (missingFields.length > 0) {
          alert(
            `Spring Boot 필수 정보가 누락되었습니다: ${missingFields.join(', ')}`
          );
          return;
        }

        // subOptionId가 유효한 숫자인지 확인
        if (
          !Number.isInteger(backendReservationData.subOptionId) ||
          backendReservationData.subOptionId <= 0
        ) {
          console.error(
            '❌ subOptionId가 유효하지 않음:',
            backendReservationData.subOptionId
          );
          alert('서비스 선택이 올바르지 않습니다. 다시 선택해주세요.');
          return;
        }

        // ⭐️ 실제 백엔드 API 호출
        const backendReservation = await createReservation(
          backendReservationData
        );

        // ⭐️ 백엔드 성공 시 로컬 스토어에도 추가 (즉시 반영용)
        const { addReservation } = useReservationListStore.getState();
        const localReservationData = {
          // 백엔드 응답 또는 원본 데이터를 로컬 형식으로 변환
          id:
            backendReservation.reservationId ||
            backendReservation.id ||
            Date.now(),
          type: currentReservationData.selectedSubOption?.name || '서비스',
          date: formData.date,
          time: `${formData.startTime}~${endTime}`,
          price: currentReservationData.totalPrice || 0,
          icon: getServiceIcon(currentReservationData.selectedSubOption?.id),
          status: 'pending', // 새로 생성된 예약은 REQUESTED 상태이므로 pending
          address: formData.selectedAddress.main,
          addressDetail:
            formData.detailAddress || formData.selectedAddress.detail || '',
          customerNote: currentReservationData.customerNote || '',
          selectedServices: currentReservationData.selectedServices || [],
          serviceDetails: currentReservationData.serviceDetails || [],
          createdAt: new Date().toISOString(),
          // 백엔드 응답 데이터도 보존 (Spring Boot 형식)
          backendData: {
            ...backendReservation,
            status: 'REQUESTED', // 새 예약의 기본 상태
            subOptionId: getSubOptionId(
              currentReservationData.selectedSubOption
            ),
            requestedDate: formData.date,
            requestedTime: `${formData.startTime}:00`,
          },
        };

        addReservation(localReservationData);

        // ⭐️ 성공 메시지
        alert(
          `예약이 접수되었습니다!\n\n` +
            `서비스: ${currentReservationData.selectedSubOption?.name || '서비스'}\n` +
            `날짜: ${formData.date}\n` +
            `시간: ${formData.startTime}~${endTime}\n` +
            `금액: ${currentReservationData.totalPrice.toLocaleString()}원\n\n` +
            `이용내역에서 예약 상태를 확인하실 수 있습니다.`
        );

        // ⭐️ 이용내역 페이지로 이동
        navigate('/user/reservations');
      } catch (backendError) {
        // ⭐️ 사용자에게 오류 메시지 표시 (로컬 저장 없음)
        let errorMessage = '예약 생성에 실패했습니다.';

        if (backendError.message.includes('400')) {
          errorMessage += '\n\n다음 사항을 확인해주세요:\n';
          errorMessage += '• 모든 필수 정보가 입력되었는지 확인\n';
          errorMessage += '• 날짜와 시간이 올바른지 확인\n';
          errorMessage += '• 주소 정보가 정확한지 확인';
        } else if (backendError.message.includes('401')) {
          errorMessage += '\n\n로그인이 만료되었습니다. 다시 로그인해주세요.';
        } else if (backendError.message.includes('403')) {
          errorMessage += '\n\n접근 권한이 없습니다.';
        } else if (backendError.message.includes('500')) {
          errorMessage +=
            '\n\n서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else {
          errorMessage += '\n\n네트워크 연결을 확인하고 다시 시도해주세요.';
        }

        alert(errorMessage);

        // ⭐️ 오류 발생 시에는 페이지 이동하지 않음
        return;
      }

      // ⭐️ 선택된 서브옵션에서 백엔드 API에 맞는 ID 추출 함수
      function getSubOptionId(selectedSubOption) {
        if (!selectedSubOption || !selectedSubOption.id) {
          console.warn('선택된 서브옵션이 없습니다. 기본값(1)을 사용합니다.');
          return 1; // 기본값으로 빨래 ID 사용
        }

        // 서브옵션 ID 매핑 (프론트엔드 ID -> 백엔드 ID)
        const subOptionMapping = {
          laundry: 1, // 빨래
          cleaning: 2, // 청소
          childcare: 3, // 육아
        };

        const backendId = subOptionMapping[selectedSubOption.id];
        if (!backendId) {
          console.warn(
            `알 수 없는 서브옵션 ID: ${selectedSubOption.id}. 기본값(1)을 사용합니다.`
          );
          return 1;
        }

        console.log(
          '선택된 서브옵션:',
          selectedSubOption.name,
          '-> 백엔드 ID:',
          backendId
        );
        return backendId;
      }

      // ⭐️ 서비스 아이콘 매핑 함수
      function getServiceIcon(subOptionId) {
        const iconMapping = {
          laundry: 'laundry',
          cleaning: 'cleaning',
          childcare: 'childcare',
        };
        return iconMapping[subOptionId] || 'home';
      }
    } catch (error) {
      console.error('예약 생성 실패:', error);
      alert(`예약 생성에 실패했습니다: ${error.message}`);
      // ⭐️ 실패 시 ref 초기화 (재시도 가능하도록)
      submissionRef.current = false;
    } finally {
      // ⭐️ 제출 완료 - 버튼 다시 활성화 (실패 시에도 재시도 가능하도록)
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
        <Footer current="/user/service-request" />
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
            <h3 className="section-title">서비스 주소</h3>

            {/* 구글 맵으로 위치 선택 */}
            <div style={{ marginTop: '16px', marginBottom: '24px' }}>
              <h4 className="section-title">지도에서 위치 선택</h4>
              <GoogleMapPicker
                onLocationSelect={handleMapLocationSelect}
                selectedLocation={
                  formData.selectedAddress?.coordinates
                    ? {
                        lat:
                          formData.selectedAddress.coordinates.latitude ||
                          formData.selectedAddress.coordinates.lat,
                        lng:
                          formData.selectedAddress.coordinates.longitude ||
                          formData.selectedAddress.coordinates.lng,
                      }
                    : null
                }
              />
            </div>

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
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? '예약 생성 중...' : '예약하기'}
            </button>
          </div>
        </div>
      </div>
      <Footer current="/user/service-request" />
    </div>
  );
};

export default UserServiceRequest;
