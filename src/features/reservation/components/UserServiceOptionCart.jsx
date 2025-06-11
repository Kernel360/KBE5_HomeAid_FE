import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceOptionCart.css';
import '../styles/common.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import useReservationStore from '../../../stores/reservationStore';

const UserServiceOptionCart = () => {
  const navigate = useNavigate();
  const {
    selectedServices,
    selectedSubOption,
    customerNote,
    totalPrice,
    totalDuration,
    setCustomerNote,
    removeService,
    getServiceDetails,
  } = useReservationStore();

  const [note, setNote] = useState(customerNote || '');

  useEffect(() => {
    setCustomerNote(note);
  }, [note, setCustomerNote]);

  const serviceDetails = getServiceDetails();

  const handleServiceRequest = () => {
    console.log('서비스 요청하기 버튼 클릭');
    // 서비스 요청 처리
    navigate('/customer/service-request');
  };

  const handleRemoveService = (serviceId) => {
    removeService(serviceId);
  };

  return (
    <div className="service-cart-page">
      <Header showBackButton={true} />
      <div className="page-content-wrapper">
        <div className="cart-container" style={{ marginTop: '64px' }}>
          {/* 제목 섹션 */}
          <div className="title-section">
            <h1 className="page-title">서비스 상세 확인</h1>
            <p className="page-subtitle">선택하신 서비스를 확인해주세요.</p>
          </div>

          {/* 선택된 서브옵션 표시 */}
          {selectedSubOption && (
            <div className="selected-sub-option">
              <div className="sub-option-header">
                <div className="sub-option-icon">
                  {selectedSubOption.id === 'cleaning'
                    ? '🧹'
                    : selectedSubOption.id === 'laundry'
                      ? '👕'
                      : selectedSubOption.id === 'childcare'
                        ? '👶'
                        : '🏠'}
                </div>
                <div className="sub-option-info">
                  <h3 className="sub-option-name">{selectedSubOption.name}</h3>
                  <p className="sub-option-description">
                    {selectedSubOption.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 선택된 서비스 목록 */}
          <div className="selected-services-section">
            <h3 className="section-title">선택된 서비스</h3>
            {selectedServices.length > 0 ? (
              <div className="services-list">
                {selectedServices.map((service) => (
                  <div key={service.id} className="service-item">
                    <div className="service-info">
                      <h4 className="service-name">{service.name}</h4>
                      <p className="service-description">
                        {service.description}
                      </p>
                      <div className="service-details">
                        <span className="service-duration">
                          {service.duration}분
                        </span>
                        <span className="service-price">
                          {service.price.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveService(service.id)}
                    >
                      제거
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-services">
                <p>선택된 서비스가 없습니다.</p>
              </div>
            )}
          </div>

          {/* 서비스 요약 */}
          <div className="service-summary">
            <h3 className="section-title">서비스 요약</h3>
            <div className="summary-details">
              {serviceDetails.map((detail, index) => (
                <div key={index} className="summary-item">
                  <span className="summary-label">{detail.label}</span>
                  <span className="summary-value">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 총 가격 및 시간 */}
          <div className="total-section">
            <div className="total-item">
              <span className="total-label">총 소요 시간</span>
              <span className="total-value">{totalDuration}분</span>
            </div>
            <div className="total-item total-price">
              <span className="total-label">총 금액</span>
              <span className="total-value">
                {totalPrice.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 고객 메모 */}
          <div className="customer-note-section">
            <h3 className="section-title">서비스 요청사항</h3>
            <textarea
              className="note-textarea"
              placeholder="서비스에 대한 특별한 요청사항이 있으시면 작성해주세요."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>

          {/* 서비스 요청 버튼 */}
          <div className="action-section">
            <button
              className="service-request-btn"
              onClick={handleServiceRequest}
              disabled={selectedServices.length === 0}
            >
              서비스 요청하기
            </button>
          </div>
        </div>
      </div>
      <Footer current="/customer/service-option-cart" />
    </div>
  );
};

export default UserServiceOptionCart;
