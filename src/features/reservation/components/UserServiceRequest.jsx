import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceRequest.css';
import '../styles/common.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
// Google Maps 컴포넌트 활성화
import GoogleMapPicker from '../../../components/GoogleMapPicker';
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
    loadAddresses,
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
      } else {
        // 기본 주소가 없으면 첫 번째 주소 선택
        setFormData((prev) => ({ ...prev, selectedAddress: addresses[0] }));
      }
    }
  }, [addresses, addressLoading]);

  // ⭐️ 로그인한 사용자의 주소 재로딩 (토큰 변경 시)
  useEffect(() => {
    if (user && accessToken) {
      // 이미 선언된 loadAddresses 함수 사용
      loadAddresses();
    }
  }, [user, accessToken, loadAddresses]);

  // ⭐️ 로그인 상태 확인
  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/auth/signin');
      return;
    }
  }, [user, accessToken, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressSelect = (address) => {
    setFormData((prev) => ({ ...prev, selectedAddress: address }));
  };

  // Google Maps 위치 선택 핸들러 활성화
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

    const newAddressData = {
      main: formData.addressMethod, // 기본 주소
      detail: formData.detailAddress || '', // 상세 주소
      type: '기타', // 주소 타입
      isDefault: formData.isDefaultAddress, // 기본 주소 여부
      // Google Maps에서 선택한 위도/경도 좌표 포함
      coordinates: formData.selectedAddress?.coordinates || {
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
        formData.selectedAddress.detail ||
        formData.selectedAddress.addressDetail ||
        '';

      // ⭐️ Google Maps에서 선택한 위치인 경우 특별 처리
      if (
        selectedAddressId === 'current-location' ||
        selectedAddressId === 'map-selected'
      ) {
        const coordinates = formData.selectedAddress.coordinates;
        if (coordinates && coordinates.lat && coordinates.lng) {
          try {
            // ⭐️ Google Maps 선택 위치용 예약 데이터
            const backendReservationData = {
              requestedDate: formData.date, // LocalDate (yyyy-MM-dd)
              requestedTime: `${formData.startTime}:00`, // LocalTime (HH:mm:ss)
              subOptionId: getSubOptionId(
                currentReservationData.selectedSubOption
              ), // Long
              latitude: Number(coordinates.lat), // Double
              longitude: Number(coordinates.lng), // Double
              address:
                selectedAddressMain ||
                `위도: ${coordinates.lat.toFixed(6)}, 경도: ${coordinates.lng.toFixed(6)}`, // String
              addressDetail: selectedAddressDetail || `지도에서 선택한 위치`, // String
              customerMemo: currentReservationData.customerNote || '', // String
              totalPrice: currentReservationData.totalPrice || 0, // Integer
              totalDuration: currentReservationData.totalDuration || 180, // Integer (분)
            };

            console.log(
              '🗺️ Google Maps 선택 위치로 예약 생성:',
              backendReservationData
            );

            // ⭐️ 실제 백엔드 API 호출
            const backendReservation = await createReservation(
              backendReservationData
            );

            // ⭐️ 성공 시 로컬 스토어에 추가
            const { addReservation } = useReservationListStore.getState();
            const coordinateAddress = `위도: ${coordinates.lat.toFixed(6)}, 경도: ${coordinates.lng.toFixed(6)}`;

            const localReservationData = {
              serviceType:
                currentReservationData.selectedSubOption?.name || '서비스',
              selectedSubOption: currentReservationData.selectedSubOption,
              reservationDate: formData.date,
              reservationTime: formData.startTime,
              endTime: endTime,
              totalPrice: currentReservationData.totalPrice || 0,
              address: selectedAddressMain || coordinateAddress,
              addressDetail:
                selectedAddressDetail ||
                `위도: ${coordinates.lat}, 경도: ${coordinates.lng}`,
              customerNote: currentReservationData.customerNote || '',
              selectedServices: currentReservationData.selectedServices || [],
              serviceDetails: currentReservationData.serviceDetails || [],
              backendData: {
                ...backendReservation,
                status: backendReservation.status || 'REQUESTED',
                address: backendReservation.address || coordinateAddress,
                addressDetail:
                  backendReservation.addressDetail ||
                  `위도: ${coordinates.lat}, 경도: ${coordinates.lng}`,
                latitude: coordinates.lat,
                longitude: coordinates.lng,
              },
            };

            addReservation(localReservationData);
            alert('✅ 예약이 성공적으로 생성되었습니다!');
            navigate('/customer/reservations');
            return; // Google Maps 처리 완료, 함수 종료
          } catch (mapError) {
            console.error('Google Maps 예약 생성 실패:', mapError);

            // 인증 에러인 경우 로그인 페이지로 리다이렉트
            if (
              mapError.message.includes('JWT_TOKEN_INVALID') ||
              mapError.message.includes('BACKEND_AUTH_ERROR') ||
              mapError.message.includes('401') ||
              mapError.message.includes('403')
            ) {
              alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('auth-storage');
              navigate('/auth/signin');
              return;
            }

            alert(
              `Google Maps 위치로 예약 생성에 실패했습니다: ${mapError.message}`
            );
            return;
          }
        } else {
          alert(
            '위치 정보가 올바르지 않습니다. 지도에서 위치를 다시 선택해주세요.'
          );
          return;
        }
      }

      // ⭐️ 기존 저장된 주소 사용 시 예약 데이터 준비
      const backendReservationData = {
        requestedDate: formData.date, // LocalDate (yyyy-MM-dd)
        requestedTime: `${formData.startTime}:00`, // LocalTime (HH:mm:ss)
        subOptionId: getSubOptionId(currentReservationData.selectedSubOption), // Long
        customerMemo: currentReservationData.customerNote || '', // String
      };

      // 주소 정보 추가 방식 결정
      if (typeof selectedAddressId === 'number') {
        // 실제 DB에 저장된 주소인 경우 addressId 사용
        backendReservationData.addressId = Number(selectedAddressId);
      } else {
        // 임시 주소인 경우 문자열로 전송
        backendReservationData.address = selectedAddressMain;
        backendReservationData.addressDetail = selectedAddressDetail;
      }

      console.log('🏠 기존 주소로 예약 생성:', backendReservationData);

      // ⭐️ 실제 백엔드 API 호출
      const backendReservation = await createReservation(
        backendReservationData
      );

      // ⭐️ 백엔드 성공 시 로컬 스토어에도 추가 (즉시 반영용)
      const { addReservation } = useReservationListStore.getState();
      const localReservationData = {
        serviceType: currentReservationData.selectedSubOption?.name || '서비스',
        selectedSubOption: currentReservationData.selectedSubOption,
        reservationDate: formData.date,
        reservationTime: formData.startTime,
        endTime: endTime,
        totalPrice: currentReservationData.totalPrice || 0,
        address: selectedAddressMain,
        addressDetail: selectedAddressDetail,
        customerNote: currentReservationData.customerNote || '',
        selectedServices: currentReservationData.selectedServices || [],
        serviceDetails: currentReservationData.serviceDetails || [],
        backendData: {
          ...backendReservation,
          status: backendReservation.status || 'REQUESTED',
          subOptionId: getSubOptionId(currentReservationData.selectedSubOption),
          requestedDate: formData.date,
          requestedTime: `${formData.startTime}:00`,
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
      alert('✅ 예약이 성공적으로 생성되었습니다!');
      navigate('/customer/reservations');
    } catch (error) {
      console.error('예약 생성 실패:', error);

      // 인증 에러인 경우 로그인 페이지로 리다이렉트
      if (
        error.message.includes('JWT_TOKEN_INVALID') ||
        error.message.includes('BACKEND_AUTH_ERROR') ||
        error.message.includes('401') ||
        error.message.includes('403')
      ) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('auth-storage');
        navigate('/auth/signin');
        return;
      }

      alert(`예약 생성에 실패했습니다: ${error.message}`);
      // ⭐️ 실패 시 ref 초기화 (재시도 가능하도록)
      submissionRef.current = false;
    } finally {
      // ⭐️ 제출 완료 - 버튼 다시 활성화 (실패 시에도 재시도 가능하도록)
      setIsSubmitting(false);
    }
  };

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
            <h3 className="section-title">서비스 받을 주소</h3>

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

            {/* Google Maps 위치 선택 섹션 - 선택된 주소 바로 밑으로 이동 */}
            <div style={{ marginTop: '20px', marginBottom: '24px' }}>
              <h4
                className="section-title"
                style={{ fontSize: '16px', marginBottom: '12px' }}
              >
                지도에서 위치 선택
              </h4>
              <p
                style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '16px',
                  lineHeight: '1.5',
                }}
              >
                현재 위치를 사용하거나 지도를 클릭하여 정확한 위치를 선택하세요.
                <br />
                선택한 위치의 위도/경도 좌표가 자동으로 저장됩니다.
              </p>
              <GoogleMapPicker
                onLocationSelect={handleMapLocationSelect}
                selectedLocation={formData.selectedAddress?.coordinates}
              />
            </div>

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

            {/* 주소가 없을 때 안내 메시지 */}
            {!addressLoading && (!addresses || addresses.length === 0) && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #e9ecef',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '12px' }}></div>
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333',
                    margin: '0 0 8px 0',
                  }}
                >
                  저장된 주소가 없습니다
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#666',
                    margin: '0 0 20px 0',
                  }}
                >
                  서비스를 받을 주소를 먼저 추가해주세요
                </p>
                <button
                  onClick={() => setShowAddressModal(true)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  주소 추가하기
                </button>
              </div>
            )}

            {/* 저장된 주소 목록 */}
            {!addressLoading && addresses && addresses.length > 0 && (
              <div className="saved-addresses-section">
                <h4
                  className="section-title"
                  style={{ fontSize: '14px', marginBottom: '12px' }}
                >
                  다른 주소 선택
                </h4>

                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`address-item ${
                      formData.selectedAddress?.id === address.id
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => handleAddressSelect(address)}
                  >
                    <div className="address-radio">
                      <div
                        className={`radio-circle ${
                          formData.selectedAddress?.id === address.id
                            ? 'active'
                            : ''
                        }`}
                      >
                        {formData.selectedAddress?.id === address.id && (
                          <div className="radio-dot"></div>
                        )}
                      </div>
                    </div>
                    <div className="address-info">
                      <span className="address-icon">📍</span>
                      <div className="address-text">
                        <h4>{address.type}</h4>
                        <p className="address-main">{address.main}</p>
                        <p className="address-detail">{address.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 새 주소 추가 버튼 */}
            {!addressLoading && (
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
            )}
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
