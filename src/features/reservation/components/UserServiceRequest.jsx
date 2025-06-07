import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import './UserServiceRequest.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';

const UserServiceRequest = () => {
  // const navigate = useNavigate();
  const [serviceType, setServiceType] = useState('정기청소');
  const [selectedDate, setSelectedDate] = useState('2023-06-15');
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [managerGender, setManagerGender] = useState('무관');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState({
    type: '집',
    main: '서울시 강남구 테헤란로 123',
    detail: '삼성아파트 101동 1001호',
  });

  const handleServiceTypeChange = (type) => {
    setServiceType(type);
  };

  const handleManagerGenderChange = (gender) => {
    setManagerGender(gender);
  };

  const handleAddressEdit = () => {
    setShowAddressModal(true);
  };

  const handleAddressModalClose = () => {
    setShowAddressModal(false);
  };

  const handleServiceSubmit = () => {
    console.log('서비스 요청하기 클릭');
    // TODO: 서비스 요청 제출 로직
  };

  if (showAddressModal) {
    return (
      <AddressModal
        onClose={handleAddressModalClose}
        onSelect={setSelectedAddress}
      />
    );
  }

  return (
    <div className="user-service-request-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="user-service-request-container">
          {/* 서비스 요청 제목 */}
          <div className="title-section">
            <h1 className="page-title">서비스 요청</h1>
            <p className="page-subtitle">
              청소 서비스 요청 정보를 입력해주세요
            </p>
          </div>

          {/* 간격 맞춤을 위한 스페이서 */}
          <div className="spacer-section"></div>

          {/* 서비스 유형 섹션 */}
          <div className="service-type-section">
            <h3 className="section-title">서비스 유형</h3>
            <div className="service-type-options">
              <button
                className={`service-type-btn ${serviceType === '정기청소' ? 'active' : ''}`}
                onClick={() => handleServiceTypeChange('정기청소')}
              >
                정기 청소
              </button>
              <button
                className={`service-type-btn ${serviceType === '일회성청소' ? 'active' : ''}`}
                onClick={() => handleServiceTypeChange('일회성청소')}
              >
                일회성 청소
              </button>
            </div>
          </div>

          {/* 날짜 및 시간 섹션 */}
          <div className="datetime-section">
            <h3 className="section-title">날짜 및 시간</h3>
            <div className="datetime-inputs">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input"
              />
              <div className="time-options">
                <button
                  className={`time-btn ${selectedTime === '14:00' ? 'active' : ''}`}
                  onClick={() => setSelectedTime('14:00')}
                >
                  14:00
                </button>
                <button
                  className={`time-btn ${selectedTime === '17:00' ? 'active' : ''}`}
                  onClick={() => setSelectedTime('17:00')}
                >
                  17:00
                </button>
              </div>
            </div>
          </div>

          {/* 매니저 성별 섹션 */}
          <div className="manager-gender-section">
            <h3 className="section-title">매니저 성별</h3>
            <div className="gender-options">
              {['무관', '남성', '여성'].map((gender) => (
                <button
                  key={gender}
                  className={`gender-btn ${managerGender === gender ? 'active' : ''}`}
                  onClick={() => handleManagerGenderChange(gender)}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* 주소 섹션 */}
          <div className="address-section">
            <div className="address-header">
              <div className="address-icon">🏠</div>
              <div className="address-content">
                <h3 className="address-type">{selectedAddress.type}</h3>
                <p className="address-main">{selectedAddress.main}</p>
                <p className="address-detail">{selectedAddress.detail}</p>
              </div>
              <div className="address-actions">
                <button className="edit-btn" onClick={handleAddressEdit}>
                  수정
                </button>
                <span className="time-indicator">시간</span>
              </div>
            </div>
          </div>

          {/* 서비스 요청 버튼 */}
          <div className="submit-section">
            <button className="submit-btn" onClick={handleServiceSubmit}>
              서비스 요청하기
            </button>
          </div>
        </div>
      </div>
      <Footer current="/user/service-request" />
    </div>
  );
};

// 주소 선택 모달 컴포넌트
const AddressModal = ({ onClose, onSelect }) => {
  // const navigate = useNavigate();
  const [addresses] = useState([
    {
      type: '집',
      main: '서울시 강남구 테헤란로 123',
      detail: '삼성아파트 101동 1001호',
    },
    {
      type: '회사',
      main: '서울시 서초구 서초대로 456',
      detail: '서초빌딩 7층',
    },
  ]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [detailAddress, setDetailAddress] = useState('');

  const handleCurrentLocation = () => {
    console.log('현재 위치 사용하기');
    // TODO: 현재 위치 사용 로직
  };

  const handleAddressSave = () => {
    console.log('주소 저장하기');
    // TODO: 주소 저장 로직
    onClose();
  };

  const handleContinueWithAddress = () => {
    console.log('선택한 주소로 계속하기');
    onSelect(addresses[selectedAddressIndex]);
    onClose();
  };

  return (
    <div className="user-service-request-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="address-modal-container">
          {/* 제목 섹션 */}
          <div className="title-section">
            <h1 className="page-title">주소 등록</h1>
            <p className="page-subtitle">서비스를 받을 주소를 등록해주세요</p>
          </div>

          {/* 현재 위치 사용 */}
          <div className="current-location-section">
            <button
              className="current-location-btn"
              onClick={handleCurrentLocation}
            >
              📍 현재 위치 사용하기
            </button>
          </div>

          {/* 저장된 주소 */}
          <div className="saved-addresses-section">
            <h3 className="section-title">저장된 주소</h3>
            {addresses.map((address, index) => (
              <div
                key={index}
                className={`address-item ${selectedAddressIndex === index ? 'selected' : ''}`}
                onClick={() => setSelectedAddressIndex(index)}
              >
                <div className="address-radio">
                  <div
                    className={`radio-circle ${selectedAddressIndex === index ? 'active' : ''}`}
                  >
                    {selectedAddressIndex === index && (
                      <div className="radio-dot"></div>
                    )}
                  </div>
                </div>
                <div className="address-info">
                  <div className="address-icon">🏠</div>
                  <div className="address-text">
                    <h4>{address.type}</h4>
                    <p className="address-main">{address.main}</p>
                    <p className="address-detail">{address.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 세부 주소 등록 */}
          <div className="detail-address-section">
            <h3 className="section-title">세부 주소</h3>
            <input
              type="text"
              placeholder="동, 호수 등 상세 주소를 입력"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              className="detail-address-input"
            />
          </div>

          {/* 주소 방법 */}
          <div className="address-method-section">
            <h3 className="section-title">주소 방법</h3>
            <input
              type="text"
              placeholder="예: 현관, 현관, 복도"
              className="address-method-input"
            />
          </div>

          {/* 기본 주소로 설정 체크박스 */}
          <div className="default-address-section">
            <label className="default-address-label">
              <input type="checkbox" />
              <span className="checkmark"></span>
              기본 주소로 설정
            </label>
          </div>

          {/* 버튼 섹션 */}
          <div className="modal-buttons">
            <button className="save-btn" onClick={handleAddressSave}>
              주소 저장하기
            </button>
            <button
              className="continue-btn"
              onClick={handleContinueWithAddress}
            >
              선택한 주소로 계속하기
            </button>
          </div>
        </div>
      </div>
      <Footer current="/user/service-request" />
    </div>
  );
};

export default UserServiceRequest;
