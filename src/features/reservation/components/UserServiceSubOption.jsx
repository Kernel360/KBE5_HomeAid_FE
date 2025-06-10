import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceSubOption.css';
import '../styles/common.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import { useAuthStore } from '../../../stores/authStore';
import { SERVICE_DESCRIPTIONS, USER_INFO } from '../constants/serviceData';
import { useCustomerServices } from '../hooks/useCustomerAPI';
import useReservationStore from '../../../stores/reservationStore';

const UserServiceSubOption = () => {
  const navigate = useNavigate();

  // ⭐️ 하위 옵션 선택 상태 관리
  const [selectedSubOption, setSelectedSubOption] = useState(null);

  // zustand store 사용
  const {
    reservationData,
    setServiceDetails,
    setSelectedSubOption: setStoreSubOption, // store에 하위 옵션 저장
  } = useReservationStore();

  // API 훅 사용
  const { services, loading, loadServices } = useCustomerServices();

  // ⭐️ 인증된 사용자 정보 가져오기
  const { user, accessToken } = useAuthStore();

  // ⭐️ 하위 옵션 선택 핸들러
  const handleSubOptionSelect = (optionId, optionName) => {
    console.log(`🔘 하위 옵션 선택: ${optionName} (${optionId})`);
    setSelectedSubOption(optionId);

    // zustand store에 선택된 하위 옵션 저장 (DB 저장용)
    const subOptionData = {
      id: optionId,
      name: optionName,
      timestamp: new Date().toISOString(),
    };

    setStoreSubOption(subOptionData);

    console.log('💾 선택된 하위 옵션이 store에 저장됨:', subOptionData);
    console.log('📦 현재 전체 예약 데이터:', reservationData);
    console.log('🔍 이 데이터가 DB에 전송될 예정:', {
      selectedSubOption: subOptionData,
      serviceDetails: reservationData.serviceDetails,
    });
  };

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

  // ⭐️ 로그인 상태 확인
  React.useEffect(() => {
    console.log('🔐 UserServiceSubOption - 현재 사용자 정보:', user);
    console.log(
      '🔑 UserServiceSubOption - 액세스 토큰:',
      accessToken ? '있음' : '없음'
    );

    if (!user || !accessToken) {
      console.log('로그인 정보가 없습니다. 로그인 페이지로 이동합니다.');
      navigate('/auth/signin');
    }
  }, [user, accessToken, navigate]);

  // 컴포넌트 마운트 시 서비스 옵션 로드
  useEffect(() => {
    loadServices().catch(() => {
      // API 호출 실패 시에도 더미 데이터 설정
      console.log('API 호출 실패 - 더미 데이터 사용');
    });
  }, [loadServices]);

  // 서비스 데이터가 로드되면 store에 저장
  useEffect(() => {
    // ⭐️ 실제 API 서비스 데이터를 store에 설정
    if (services && services.length > 0) {
      console.log('🔄 실제 서비스 데이터를 store에 설정:', services);
      setServiceDetails(services);
    }
  }, [services, setServiceDetails]);

  // 선택된 서비스가 변경될 때마다 총액 계산
  // useEffect(() => {
  //   calculateTotals();
  // }, [reservationData.selectedServices, calculateTotals]);

  // const handleServiceToggle = (serviceId) => {
  //   toggleService(serviceId);
  // };

  const handleNextStep = async () => {
    // ⭐️ 하위 옵션 선택 확인
    if (!selectedSubOption) {
      alert('청소 서비스 유형을 선택해주세요.');
      return;
    }

    try {
      console.log('🎯 선택된 하위 옵션:', selectedSubOption);
      console.log('📦 현재 예약 데이터:', reservationData);

      // 서비스 요청 페이지로 이동
      navigate('/user/service-request');
    } catch (error) {
      console.error('다음 단계 진행 실패:', error);
      alert('다음 단계 진행에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 로딩 상태 표시 (단순화)
  if (loading && (!services || services.length === 0)) {
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
              서비스 옵션을 불러오는 중...
            </div>
          </div>
        </div>
        <Footer current="/user/service-sub-option" />
      </div>
    );
  }

  return (
    <div className="reservation-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="reservation-container">
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
                selectedSubOption === 'laundry' ? 'selected' : ''
              }`}
              onClick={() => handleSubOptionSelect('laundry', '빨래')}
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
                selectedSubOption === 'cleaning' ? 'selected' : ''
              }`}
              onClick={() => handleSubOptionSelect('cleaning', '청소')}
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
                selectedSubOption === 'childcare' ? 'selected' : ''
              }`}
              onClick={() => handleSubOptionSelect('childcare', '육아')}
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
                <h3>기본 청소 서비스</h3>
                <span className="service-duration">약 2-3시간 소요</span>
              </div>
            </div>

            {/* TODO: 나중에 실제 API 데이터로 교체 예정 */}
            {/* 현재는 더미 데이터로 표시 */}
            <div className="service-checklist">
              {/* 더미 데이터 - 기본 서비스 목록 */}
              <div className="checklist-item">
                <label className="service-checkbox-label">
                  <input type="checkbox" disabled checked={true} />
                  <span className="service-checkmark"></span>
                  <span className="service-name">바닥 청소 및 걸레질</span>
                  <span className="service-price">기본 포함</span>
                </label>
              </div>

              <div className="checklist-item">
                <label className="service-checkbox-label">
                  <input type="checkbox" disabled checked={true} />
                  <span className="service-checkmark"></span>
                  <span className="service-name">먼지 제거 및 정돈</span>
                  <span className="service-price">기본 포함</span>
                </label>
              </div>

              <div className="checklist-item">
                <label className="service-checkbox-label">
                  <input type="checkbox" disabled checked={true} />
                  <span className="service-checkmark"></span>
                  <span className="service-name">쓰레기통 비우기</span>
                  <span className="service-price">기본 포함</span>
                </label>
              </div>

              <div className="checklist-item">
                <label className="service-checkbox-label">
                  <input type="checkbox" disabled checked={true} />
                  <span className="service-checkmark"></span>
                  <span className="service-name">화장실 기본 청소</span>
                  <span className="service-price">기본 포함</span>
                </label>
              </div>

              {/* TODO: 향후 실제 API 데이터로 교체
                  현재 주석처리된 코드를 활성화하여 사용 예정
                  API 연동 시 아래 코드를 사용:
                  
                  {services.map((service) => (
                    <div key={service.id} className="checklist-item">
                      <label className="service-checkbox-label">
                        <input
                          type="checkbox"
                          checked={reservationData.selectedServices.includes(service.id)}
                          onChange={() => handleServiceToggle(service.id)}
                        />
                        <span className="service-checkmark"></span>
                        <span className="service-name">{service.name}</span>
                        <span className="service-price">+{service.price.toLocaleString()}원</span>
                      </label>
                    </div>
                  ))}
              */}
            </div>

            <div className="service-note">
              <span>
                * 기본 서비스 외 추가 요청사항은 매니저와 상담 후 결정됩니다.
              </span>
            </div>
          </div>

          {/* 가격 정보 표시 (주석처리) */}
          {/* 
          {reservationData.selectedServices.length > 0 && (
            <div
              className="pricing-section"
              style={{
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
              }}
            >
              <h4
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                예상 금액
              </h4>
              <p
                style={{
                  margin: '0',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#4285f4',
                }}
              >
                총 {reservationData.totalPrice.toLocaleString()}원
              </p>
            </div>
          )}
          */}

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
                  ✅ 선택된 서비스:{' '}
                  {selectedSubOption === 'laundry'
                    ? '빨래'
                    : selectedSubOption === 'cleaning'
                      ? '청소'
                      : '육아'}
                </p>
              </div>
            )}

            <button
              className="primary-button reservation-button"
              onClick={handleNextStep}
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
      <Footer current="/user/service-sub-option" />
    </div>
  );
};

export default UserServiceSubOption;
