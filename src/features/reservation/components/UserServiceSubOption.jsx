import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceSubOption.css';
import '../styles/common.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import { useServiceSelection } from '../hooks/useServiceSelection';
import { useCartData } from '../hooks/useLocalStorage';
import {
  USER_INFO,
  SERVICE_DESCRIPTIONS,
  SUB_SERVICE_OPTIONS,
  PRICING,
} from '../constants/serviceData';

const UserServiceSubOption = () => {
  const navigate = useNavigate();
  const {
    selectedSubOption,
    serviceOptions,
    handleSubOptionClick,
    handleServiceOptionChange,
    getSelectedServices,
  } = useServiceSelection();

  const { setCartData } = useCartData();

  const handleReservationClick = () => {
    console.log('예약하기 버튼 클릭');

    const selectedServices = getSelectedServices();

    // 기본 요금 추가
    const cartData = {
      basePrice: { name: PRICING.BASE_PRICE_NAME, price: PRICING.BASE_PRICE },
      selectedServices,
      subOptionType: selectedSubOption,
    };

    setCartData(cartData);
    navigate('/user/service-option-cart');
  };

  return (
    <div className="reservation-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="reservation-container">
          {/* 인사말 섹션 */}
          <div className="greeting-section">
            <h1 className="greeting-text">{USER_INFO.name} 님</h1>
          </div>

          {/* 서비스 선택 메시지 */}
          <div className="service-message-section">
            <h2 className="service-message">
              {SERVICE_DESCRIPTIONS.SUB_QUESTION}
            </h2>
            <p className="sub-message">{SERVICE_DESCRIPTIONS.SUB_MESSAGE}</p>
          </div>

          {/* 하위 서비스 옵션 섹션 */}
          <div className="sub-service-options">
            <div
              className={`service-card sub-service-option ${selectedSubOption === SUB_SERVICE_OPTIONS.TOILET_CLEANING ? 'selected' : ''}`}
              onClick={() =>
                handleSubOptionClick(SUB_SERVICE_OPTIONS.TOILET_CLEANING)
              }
            >
              <div className="sub-service-icon">
                {/* 화장실 아이콘 */}
                <div className="toilet-icon">
                  <div className="toilet-bowl"></div>
                  <div className="sparkles">
                    <span>✨</span>
                    <span>✨</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`service-card sub-service-option ${selectedSubOption === SUB_SERVICE_OPTIONS.BUILDING_CLEANING ? 'selected' : ''}`}
              onClick={() =>
                handleSubOptionClick(SUB_SERVICE_OPTIONS.BUILDING_CLEANING)
              }
            >
              <div className="sub-service-icon">
                {/* 건물 아이콘 */}
                <div className="building-icon">
                  <div className="building-body">
                    <div className="building-windows">
                      <div className="window"></div>
                      <div className="window"></div>
                      <div className="window"></div>
                      <div className="window"></div>
                      <div className="window"></div>
                      <div className="window"></div>
                    </div>
                    <div className="building-door"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="service-card sub-service-option empty">
              {/* 빈 박스 */}
            </div>
          </div>

          {/* 기본 서비스 섹션 */}
          <div className="basic-service-section">
            <div className="service-header">
              <div className="service-icon-small">
                <div className="clock-icon">⏰</div>
              </div>
              <div className="service-title">
                <h3>{SERVICE_DESCRIPTIONS.BASIC_SERVICE.title}</h3>
                <span className="service-duration">
                  {SERVICE_DESCRIPTIONS.BASIC_SERVICE.duration}
                </span>
              </div>
            </div>

            <div className="service-checklist">
              {Object.entries(serviceOptions).map(([key, option]) => (
                <div key={key} className="checklist-item">
                  <label className="custom-checkbox-label service-checkbox-label">
                    <input
                      type="checkbox"
                      checked={option.selected}
                      onChange={(e) =>
                        handleServiceOptionChange(key, e.target.checked)
                      }
                    />
                    <span className="custom-checkmark service-checkmark"></span>
                    <span className="service-name">{option.name}</span>
                    <span className="service-price">
                      +{option.price.toLocaleString()}원
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <div className="service-note">
              <span>{SERVICE_DESCRIPTIONS.BASIC_SERVICE.note}</span>
            </div>
          </div>

          {/* 예약 버튼 섹션 */}
          <div className="reservation-section">
            <button
              className="primary-button reservation-button"
              onClick={handleReservationClick}
              disabled={!selectedSubOption}
            >
              예약하기
            </button>
          </div>
        </div>
      </div>
      <Footer current="/user/service-sub-option" />
    </div>
  );
};

export default UserServiceSubOption;
