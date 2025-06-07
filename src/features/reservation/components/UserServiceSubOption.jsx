import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceSubOption.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';

const UserServiceSubOption = () => {
  const navigate = useNavigate();
  const [selectedSubOption, setSelectedSubOption] = useState(null);
  const [serviceOptions, setServiceOptions] = useState({
    furniture: { name: '쇼파 등 가구 먼지제거', price: 15000, selected: false },
    floor: { name: '바닥청소(물걸레 포함)', price: 20000, selected: false },
    organization: {
      name: '침구, 물건 정리정돈',
      price: 18000,
      selected: false,
    },
    kitchen: { name: '설거지 및 주방정리', price: 25000, selected: false },
    trash: { name: '일반/음식물/재활용 배출', price: 30000, selected: false },
    laundry: { name: '분류된 세탁물 세탁', price: 22000, selected: false },
  });

  const handleSubOptionClick = (optionType) => {
    console.log(`${optionType} 하위 옵션 선택됨`);
    setSelectedSubOption(optionType);
  };

  const handleServiceOptionChange = (optionKey, checked) => {
    setServiceOptions((prev) => ({
      ...prev,
      [optionKey]: { ...prev[optionKey], selected: checked },
    }));
  };

  const handleReservationClick = () => {
    console.log('예약하기 버튼 클릭');

    // 선택된 서비스 옵션들을 localStorage에 저장
    const selectedServices = Object.entries(serviceOptions)
      .filter(([, option]) => option.selected)
      .map(([optionKey, option]) => ({
        key: optionKey,
        name: option.name,
        price: option.price,
      }));

    // 기본 요금 추가
    const cartData = {
      basePrice: { name: '기본 요금', price: 80000 },
      selectedServices,
      subOptionType: selectedSubOption,
    };

    localStorage.setItem('cartData', JSON.stringify(cartData));
    navigate('/user/service-option-cart');
  };

  return (
    <div className="user-service-sub-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="user-service-sub-container">
          {/* 인사말 섹션 */}
          <div className="greeting-section">
            <h1 className="greeting-text">양증진 님</h1>
          </div>

          {/* 서비스 선택 메시지 */}
          <div className="service-message-section">
            <h2 className="service-message">가사 서비스를 선택하셨네요!</h2>
            <p className="sub-message">하위 옵션을 선택해 주세요.</p>
          </div>

          {/* 하위 서비스 옵션 섹션 */}
          <div className="sub-service-options">
            <div
              className={`sub-service-option ${selectedSubOption === '화장실청소' ? 'selected' : ''}`}
              onClick={() => handleSubOptionClick('화장실청소')}
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
              className={`sub-service-option ${selectedSubOption === '건물청소' ? 'selected' : ''}`}
              onClick={() => handleSubOptionClick('건물청소')}
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
            <div className="sub-service-option empty">{/* 빈 박스 */}</div>
          </div>

          {/* 기본 서비스 섹션 */}
          <div className="basic-service-section">
            <div className="service-header">
              <div className="service-icon-small">
                <div className="clock-icon">⏰</div>
              </div>
              <div className="service-title">
                <h3>기본서비스</h3>
                <span className="service-duration">(소요시간: 약 3시간)</span>
              </div>
            </div>

            <div className="service-checklist">
              {Object.entries(serviceOptions).map(([key, option]) => (
                <div key={key} className="checklist-item">
                  <label className="service-checkbox-label">
                    <input
                      type="checkbox"
                      checked={option.selected}
                      onChange={(e) =>
                        handleServiceOptionChange(key, e.target.checked)
                      }
                    />
                    <span className="service-checkmark"></span>
                    <span className="service-name">{option.name}</span>
                    <span className="service-price">
                      +{option.price.toLocaleString()}원
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <div className="service-note">
              <span>(1회 한정 서비스)</span>
            </div>
          </div>

          {/* 예약 버튼 섹션 */}
          <div className="reservation-section">
            <button
              className="reservation-button"
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
