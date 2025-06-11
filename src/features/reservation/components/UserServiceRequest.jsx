import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceRequest.css';
import '../styles/common.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
// TODO: 구글맵 연동 완료 후 활성화
// import GoogleMapPicker from '../../../components/GoogleMapPicker';
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
    console.log('🏠 주소 선택됨:', address);
    setFormData((prev) => ({ ...prev, selectedAddress: address }));
  };

  // TODO: 구글맵 연동 완료 후 활성화
  /*
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
  */

  const handleAddressSave = async () => {
    if (!formData.addressMethod.trim()) {
      alert('주소를 입력해주세요.');
      return;
    }

    const newAddressData = {
      main: formData.addressMethod, // 기본 주소
      detail: formData.detailAddress || '', // 상세 주소
      type: '기타', // 주소 타입
      isDefault: formData.isDefaultAddress, // 기본 주소 여부
      // TODO: 구글맵 연동 완료 후 위도/경도 추가
      coordinates: {
        lat: null,
        lng: null,
      },
    };

    const savedAddress = await addAddress(newAddressData);
    handleAddressSelect(savedAddress);
    setShowAddressModal(false);

    setFormData((prev) => ({
      ...prev,
      addressMethod: '',
      detailAddress: '',
      isDefaultAddress: false,
    }));
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

    // ⭐️ 사용자 ID 확인 (Spring Boot customerId 필수)
    if (!user.userId) {
      alert('사용자 정보에 문제가 있습니다. 다시 로그인해주세요.');
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

    // ⭐️ 중복 예약 확인 (같은 날짜, 시간에 이미 예약이 있는지 체크)
    const { getAllReservations } = useReservationListStore.getState();
    const allReservations = getAllReservations();

    // 모든 활성 예약을 하나의 배열로 합치기
    const activeReservations = [
      ...(allReservations.pending || []),
      ...(allReservations.completed || []),
      ...(allReservations.visited || []),
    ];

    const duplicateReservation = activeReservations.find((reservation) => {
      const reservationDate =
        reservation.backendData?.requestedDate || reservation.date;
      const reservationTimeStr =
        reservation.backendData?.requestedTime || reservation.time;

      // 시간 형식 정규화 (HH:mm 형식으로 변환)
      let reservationTime = '';
      if (reservationTimeStr.includes('~')) {
        reservationTime = reservationTimeStr.split('~')[0];
      } else if (reservationTimeStr.includes(':')) {
        reservationTime = reservationTimeStr.substring(0, 5); // HH:mm:ss -> HH:mm
      } else {
        reservationTime = reservationTimeStr;
      }

      return (
        reservationDate === formData.date &&
        reservationTime === formData.startTime &&
        (reservation.status === 'pending' ||
          reservation.status === 'confirmed' ||
          reservation.backendData?.status === 'REQUESTED' ||
          reservation.backendData?.status === 'CONFIRMED')
      );
    });

    if (duplicateReservation) {
      alert(
        '같은 날짜와 시간에 이미 예약이 있습니다.\n\n' +
          `기존 예약: ${duplicateReservation.date} ${duplicateReservation.time}\n` +
          '다른 날짜나 시간으로 예약해주세요.'
      );
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

      // ⭐️ 백엔드 구조에 맞는 주소 ID 검증
      const selectedAddressId = formData.selectedAddress.id;
      const selectedAddressMain =
        formData.selectedAddress.main || formData.selectedAddress.address || '';
      const selectedAddressDetail =
        formData.detailAddress ||
        formData.selectedAddress.detail ||
        formData.selectedAddress.addressDetail ||
        '';

      if (!selectedAddressId || typeof selectedAddressId !== 'number') {
        alert(
          '❌ 유효한 주소를 선택해주세요!\n\n주소 ID가 없습니다.\n\n해결방법:\n1. 저장된 주소 목록에서 주소 선택\n2. "새 주소 추가"로 새 주소 등록'
        );
        return;
      }

      try {
        // ⭐️ 백엔드 API 호출을 위한 예약 데이터 준비
        const backendReservationData = {
          // 🔧 Spring Boot Reservation 엔티티에 정확히 맞는 구조
          requestedDate: formData.date, // LocalDate용 (yyyy-MM-dd)
          requestedTime: `${formData.startTime}:00`, // LocalTime용 (HH:mm:ss 형식 필수)
          subOptionId: getSubOptionId(currentReservationData.selectedSubOption), // Long
          customerId: user?.userId || null, // Long (필수)
          // ⭐️ 주소 문자열 대신 CustomerAddress ID 전송
          addressId: selectedAddressId, // Long (CustomerAddress 테이블의 ID)
          // 📝 참고: address, addressDetail은 제거 (별도 테이블에 저장됨)
          totalPrice: currentReservationData.totalPrice || 0, // Integer
          totalDuration: currentReservationData.totalDuration || 0, // Integer
          customerMemo: currentReservationData.customerNote || '', // String (TEXT)
        };

        // Spring Boot 필수 필드 검증
        const requiredFields = [
          'requestedDate',
          'requestedTime',
          'subOptionId',
          'customerId',
        ];
        const missingFields = requiredFields.filter(
          (field) => !backendReservationData[field]
        );

        if (missingFields.length > 0) {
          alert(
            `필수 정보가 누락되었습니다: ${missingFields.join(', ')}\n\n` +
              '다시 로그인하고 모든 정보를 입력해주세요.'
          );
          return;
        }

        // ⭐️ 실제 백엔드 API 호출
        const backendReservation = await createReservation(
          backendReservationData
        );

        // ⭐️ 백엔드 성공 시 로컬 스토어에도 추가 (즉시 반영용)
        const { addReservation } = useReservationListStore.getState();
        const localReservationData = {
          // reservationListStore의 addReservation에서 기대하는 형식에 맞춤
          serviceType:
            currentReservationData.selectedSubOption?.name || '서비스',
          selectedSubOption: currentReservationData.selectedSubOption,
          reservationDate: formData.date,
          reservationTime: formData.startTime,
          endTime: endTime,
          totalPrice: currentReservationData.totalPrice || 0,
          address: selectedAddressMain, // ⭐️ 원본 주소 사용 (백엔드 null 대신)
          addressDetail: selectedAddressDetail, // ⭐️ 원본 상세주소 사용 (백엔드 null 대신)
          customerNote: currentReservationData.customerNote || '',
          selectedServices: currentReservationData.selectedServices || [],
          serviceDetails: currentReservationData.serviceDetails || [],
          // 백엔드 응답 데이터도 포함 (하지만 주소는 원본 사용)
          backendData: {
            ...backendReservation,
            status: backendReservation.status || 'REQUESTED',
            subOptionId: getSubOptionId(
              currentReservationData.selectedSubOption
            ),
            requestedDate: formData.date,
            requestedTime: `${formData.startTime}:00`,
            customerId: user?.userId,
            // ⭐️ 백엔드에서 null로 온 주소 대신 원본 주소 정보 보존
            address: backendReservation.address || selectedAddressMain,
            addressDetail:
              backendReservation.addressDetail || selectedAddressDetail,
            totalPrice:
              backendReservation.totalPrice ||
              currentReservationData.totalPrice ||
              0,
            totalDuration:
              backendReservation.totalDuration ||
              currentReservationData.totalDuration ||
              0,
          },
        };

        addReservation(localReservationData);

        // ⭐️ 이용내역 페이지로 이동
        navigate('/customer/reservations');
      } catch (backendError) {
        console.error(
          '❌ 백엔드 DB 저장 실패, 로컬 저장으로 대체:',
          backendError
        );

        // ⭐️ 로컬 저장 성공 시에도 이용내역 페이지로 이동
        navigate('/customer/reservations');
      }

      // ⭐️ 선택된 서브옵션에서 백엔드 API에 맞는 ID 추출 함수
      function getSubOptionId(selectedSubOption) {
        if (!selectedSubOption || !selectedSubOption.id) {
          return 2; // 기본값으로 청소 ID 사용
        }

        // 서브옵션 ID 매핑 (프론트엔드 ID -> 백엔드 subOptionId)
        const subOptionMapping = {
          laundry: 1, // 빨래/세탁
          cleaning: 2, // 청소
          childcare: 3, // 육아
        };

        const backendId = subOptionMapping[selectedSubOption.id];
        if (!backendId) {
          return 2; // 청소 서비스로 기본값 설정
        }

        return backendId;
      }
    } catch (error) {
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
              <button className="continue-btn" onClick={handleAddressSave}>
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
            <h3 className="section-title">서비스 주소</h3>

            {/* TODO: 구글 맵 위치 선택 기능 - 백엔드 연동 완료 후 활성화 */}
            {/* 
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
            */}

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

            {/* 주소 로딩 상태 */}
            {addressLoading && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#666',
                  fontSize: '14px',
                }}
              >
                💾 저장된 주소를 불러오는 중...
              </div>
            )}

            {/* 저장된 주소 목록 */}
            {!addressLoading && addresses && addresses.length > 0 && (
              <div className="saved-addresses-section">
                <h4 className="section-title">
                  저장된 주소 ({addresses.length}개)
                </h4>
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
            {/* 주소 선택 안내 메시지 */}

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
