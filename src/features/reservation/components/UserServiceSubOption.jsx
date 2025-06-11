import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceSubOption.css';
import '../styles/common.css';
import Footer from '../../../components/Footer.jsx';
import Header from '../../../components/Header.jsx';
import { useAuthStore } from '../../../stores/authStore.js';
import { SERVICE_DESCRIPTIONS, USER_INFO } from '../constants/serviceData.js';
import { useCustomerServices } from '../hooks/useCustomerAPI.js';
import useReservationStore from '../../../stores/reservationStore.js';

const UserServiceSubOption = () => {
  const navigate = useNavigate();

  // ⭐️ 하위 옵션 선택 상태 관리
  const [selectedSubOption, setSelectedSubOption] = useState(null);

  // zustand store 사용
  const {
    setServiceDetails,
    setSelectedSubOption: setStoreSubOption,
    setReservationInfo,
  } = useReservationStore();

  // API 훅 사용
  const { services, loading, loadServices } = useCustomerServices();

  // ⭐️ 인증된 사용자 정보 가져오기
  const { user, accessToken } = useAuthStore();

  // ⭐️ 사용자 인사말 생성 함수
  const getUserGreeting = () => {
    if (!user) {
      return '안녕하세요, 고객님!';
    }

    let userName = user.name || user.phone || '고객';

    // 이미 "님"이 붙어있다면 제거하여 중복 방지
    if (userName.endsWith('님')) {
      userName = userName.slice(0, -1);
    }

    return `${userName}님, 어떤 청소 서비스가 필요하신가요?`;
  };

  // ⭐️ 하위 옵션 선택 핸들러
  const handleOptionSelect = (optionName, optionId) => {
    const subOptionData = {
      id: optionId,
      name: optionName,
    };

    setSelectedSubOption(subOptionData);
    setStoreSubOption(subOptionData); // store에도 저장

    // ⭐️ 선택된 서브옵션에 따른 서비스 데이터를 reservationStore에 저장
    const selectedServiceData = getServiceData(optionId);
    const totalPrice = selectedServiceData.services.reduce(
      (total, service) => total + service.price,
      0
    );

    // 예약 데이터에 서비스 정보 저장
    setReservationInfo({
      selectedServices: selectedServiceData.services.map((service, index) => ({
        id: `${optionId}-${index}`,
        name: service.name,
        price: service.price,
        selected: true,
      })),
      serviceDetails: selectedServiceData.services,
      totalPrice: totalPrice,
      totalDuration: optionId === 'childcare' ? 240 : 180, // 육아: 4시간, 나머지: 3시간
      serviceTitle: selectedServiceData.title,
      serviceDuration: selectedServiceData.duration,
    });
  };

  const handleContinue = () => {
    if (!selectedSubOption) {
      alert('서비스 옵션을 선택해주세요.');
      return;
    }
    navigate('/customer/service-request');
  };

  // ⭐️ 로그인 상태 확인
  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/auth/signin');
    }
  }, [user, accessToken, navigate]);

  // 컴포넌트 마운트 시 서비스 옵션 로드
  useEffect(() => {
    loadServices().catch(() => {
      // API 호출 실패 시에도 더미 데이터 설정 (무음)
    });
  }, [loadServices]);

  // 서비스 데이터가 로드되면 store에 저장
  useEffect(() => {
    // ⭐️ 실제 API 서비스 데이터를 store에 설정
    if (services && services.length > 0) {
      setServiceDetails(services);
    }
  }, [services, setServiceDetails]);

  // ⭐️ 서브옵션별 서비스 데이터 정의
  const getServiceData = (subOptionId) => {
    const serviceData = {
      laundry: {
        title: '기본 빨래 서비스',
        duration: '약 2-3시간 소요',
        services: [
          { name: '세탁물 분류 및 세탁', price: 15000 },
          { name: '건조 및 정리', price: 8000 },
          { name: '다림질 (기본)', price: 12000 },
          { name: '세탁 후 정리정돈', price: 5000 },
        ],
      },
      cleaning: {
        title: '기본 청소 서비스',
        duration: '약 2-3시간 소요',
        services: [
          { name: '바닥 청소 및 걸레질', price: 20000 },
          { name: '먼지 제거 및 정돈', price: 15000 },
          { name: '쓰레기통 비우기', price: 5000 },
          { name: '화장실 기본 청소', price: 18000 },
        ],
      },
      childcare: {
        title: '기본 육아 서비스',
        duration: '약 3-4시간 소요',
        services: [
          { name: '아이 돌봄 및 놀이', price: 25000 },
          { name: '식사 준비 및 수유', price: 15000 },
          { name: '기저귀 교체 및 위생관리', price: 10000 },
          { name: '아이 안전 관리', price: 12000 },
        ],
      },
    };

    return serviceData[subOptionId] || serviceData.cleaning; // 기본값은 청소
  };

  // 현재 선택된 서브옵션의 서비스 데이터 가져오기
  const currentServiceData = selectedSubOption
    ? getServiceData(selectedSubOption.id)
    : getServiceData('cleaning');

  // 총 가격 계산
  const getTotalPrice = () => {
    return currentServiceData.services.reduce(
      (total, service) => total + service.price,
      0
    );
  };

  // 로딩 상태 표시 (단순화)
  if (loading && (!services || services.length === 0)) {
    return (
      <div className="reservation-page">
        <Header showBackButton={true} />
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
              서비스 옵션을 불러오는 중...
            </div>
          </div>
        </div>
        <Footer current="/customer/service-sub-option" />
      </div>
    );
  }

  return (
    <div className="reservation-page">
      <Header showBackButton={true} />
      <div className="page-content-wrapper">
        <div className="reservation-container" style={{ marginTop: '64px' }}>
          {/* 인사말 섹션 */}
          <div className="greeting-section">
            <h1 className="greeting-text">{getUserGreeting()}</h1>
          </div>

          {/* 서비스 선택 메시지 섹션 */}
          <div className="service-message-section">
            <h2 className="service-message">
              {SERVICE_DESCRIPTIONS.CLEANING_QUESTION}
            </h2>
            <p className="sub-message">원하는 청소 서비스를 선택해주세요.</p>
          </div>

          {/* 하위 서비스 옵션 섹션 */}
          <div className="sub-service-options">
            {/* 빨래 옵션 */}
            <div
              className={`service-card sub-service-option ${
                selectedSubOption && selectedSubOption.id === 'laundry'
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleOptionSelect('빨래', 'laundry')}
            >
              <div className="laundry-icon">
                <div className="washing-machine">
                  <div className="machine-body"></div>
                  <div className="machine-door"></div>
                  <div className="water-drops">
                    <span>💧</span>
                    <span>💧</span>
                    <span>💧</span>
                  </div>
                </div>
              </div>
              <div className="option-label">빨래</div>
            </div>

            {/* 청소 옵션 */}
            <div
              className={`service-card sub-service-option ${
                selectedSubOption && selectedSubOption.id === 'cleaning'
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleOptionSelect('청소', 'cleaning')}
            >
              <div className="cleaning-icon">
                <div className="cleaning-tools">
                  <div className="broom"></div>
                  <div className="dustpan"></div>
                  <div className="sparkles">
                    <span>✨</span>
                    <span>✨</span>
                    <span>✨</span>
                  </div>
                </div>
              </div>
              <div className="option-label">청소</div>
            </div>

            {/* 육아 옵션 */}
            <div
              className={`service-card sub-service-option ${
                selectedSubOption && selectedSubOption.id === 'childcare'
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleOptionSelect('육아', 'childcare')}
            >
              <div className="childcare-icon">
                <div className="baby-items">
                  <div className="baby-bottle"></div>
                  <div className="baby-toy"></div>
                  <div className="hearts">
                    <span>💕</span>
                    <span>💕</span>
                  </div>
                </div>
              </div>
              <div className="option-label">육아</div>
            </div>
          </div>

          {/* 기본 서비스 섹션 */}
          <div className="basic-service-section">
            <div className="service-header">
              <div className="service-icon-small">
                <span className="clock-icon">🕐</span>
              </div>
              <div className="service-title">
                <h3>{currentServiceData.title}</h3>
                <span className="service-duration">
                  {currentServiceData.duration}
                </span>
              </div>
            </div>

            {/* 동적 서비스 목록 */}
            <div className="service-checklist">
              {currentServiceData.services.map((service, index) => (
                <div key={index} className="checklist-item">
                  <label className="service-checkbox-label">
                    <input type="checkbox" disabled checked={true} />
                    <span className="service-checkmark"></span>
                    <span className="service-name">{service.name}</span>
                    <span className="service-price">
                      {service.price.toLocaleString()}원
                    </span>
                  </label>
                </div>
              ))}
            </div>

            {/* 총 가격 표시 */}
            <div className="total-price-section">
              <div className="total-price-item">
                <span className="total-label">총 예상 금액:</span>
                <span className="total-amount">
                  {getTotalPrice().toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="service-note">
              <span>
                * 기본 서비스 외 추가 요청사항은 매니저와 상담 후 결정됩니다.
              </span>
            </div>
          </div>

          {/* 다음 단계 버튼 섹션 */}
          <div className="reservation-section">
            {/* 선택된 옵션 표시 */}
            {selectedSubOption && (
              <div
                className="selected-option-info"
                style={{
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#e8f4fd',
                  borderRadius: '8px',
                  border: '1px solid #4285f4',
                }}
              >
                <p style={{ margin: '0', fontSize: '14px', color: '#1a73e8' }}>
                  ✅ 선택된 서비스: {selectedSubOption.name}
                </p>
              </div>
            )}

            <button
              className="primary-button reservation-button"
              onClick={handleContinue}
              disabled={!selectedSubOption}
              style={{
                opacity: selectedSubOption ? 1 : 0.6,
                cursor: selectedSubOption ? 'pointer' : 'not-allowed',
              }}
            >
              다음 단계
            </button>
          </div>
        </div>
      </div>
      <Footer current="/customer/service-sub-option" />
    </div>
  );
};

export default UserServiceSubOption;
