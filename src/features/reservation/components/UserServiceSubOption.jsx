import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceSubOption.css';
import '../styles/common.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import { SERVICE_DESCRIPTIONS, USER_INFO } from '../constants/serviceData';
import { useCustomerServices } from '../hooks/useCustomerAPI';
import useReservationStore from '../../../stores/reservationStore';

const UserServiceSubOption = () => {
  const navigate = useNavigate();

  // zustand store 사용
  const {
    reservationData,
    toggleService,
    setServiceDetails,
    calculateTotals,
    getSelectedServicesWithDetails,
  } = useReservationStore();

  // API 훅 사용
  const { services, loading, loadServices } = useCustomerServices();

  // 컴포넌트 마운트 시 서비스 옵션 로드
  useEffect(() => {
    loadServices().catch(() => {
      // API 호출 실패 시에도 더미 데이터 설정
      console.log('API 호출 실패 - 더미 데이터 사용');
    });
  }, [loadServices]);

  // 서비스 데이터가 로드되면 store에 저장
  useEffect(() => {
    if (services && services.length > 0) {
      setServiceDetails(services);
    }
  }, [services, setServiceDetails]);

  // 선택된 서비스가 변경될 때마다 총액 계산
  useEffect(() => {
    calculateTotals();
  }, [reservationData.selectedServices, calculateTotals]);

  const handleServiceToggle = (serviceId) => {
    toggleService(serviceId);
  };

  const handleNextStep = async () => {
    if (reservationData.selectedServices.length === 0) {
      alert('서비스를 선택해주세요.');
      return;
    }

    try {
      console.log('선택된 서비스:', getSelectedServicesWithDetails());
      console.log('현재 예약 데이터:', reservationData);

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
            <h1 className="greeting-text">{USER_INFO.greeting}</h1>
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
            <div
              className="service-card sub-service-option"
              onClick={() => navigate('/user/service-sub-option')}
            >
              <div className="toilet-icon">
                <div className="toilet-bowl"></div>
                <div className="sparkles">
                  <span>✨</span>
                  <span>✨</span>
                  <span>✨</span>
                </div>
              </div>
            </div>
            <div className="service-card sub-service-option">
              <div className="building-icon">
                <div className="building-body">
                  <div className="building-windows">
                    <div className="window"></div>
                    <div className="window"></div>
                    <div className="window"></div>
                    <div className="window"></div>
                  </div>
                  <div className="building-door"></div>
                </div>
              </div>
            </div>
            <div className="service-card sub-service-option empty"></div>
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

            <div className="service-checklist">
              {services.length > 0 ? (
                services.map((service) => (
                  <div key={service.id} className="checklist-item">
                    <label className="service-checkbox-label">
                      <input
                        type="checkbox"
                        checked={reservationData.selectedServices.includes(
                          service.id
                        )}
                        onChange={() => handleServiceToggle(service.id)}
                      />
                      <span className="service-checkmark"></span>
                      <span className="service-name">
                        {service.name || service.subOptionName}
                      </span>
                      <span className="service-price">
                        +
                        {(
                          service.price ||
                          service.totalPrice ||
                          0
                        ).toLocaleString()}
                        원
                      </span>
                    </label>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100px',
                    fontSize: '14px',
                    color: '#999',
                  }}
                >
                  서비스 옵션을 불러오는 중...
                </div>
              )}
            </div>

            <div className="service-note">
              <span>
                * 기본 서비스 외 추가 요청사항은 매니저와 상담 후 결정됩니다.
              </span>
            </div>
          </div>

          {/* 가격 정보 표시 */}
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

          {/* 다음 단계 버튼 섹션 */}
          <div className="reservation-section">
            <button
              className="primary-button reservation-button"
              onClick={handleNextStep}
              disabled={reservationData.selectedServices.length === 0}
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
