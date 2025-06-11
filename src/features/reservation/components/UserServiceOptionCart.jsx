import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceOptionCart.css';
import '../styles/common.css';
import Footer from '../../../components/Footer.jsx';
import Header from '../../../components/Header.jsx';
import { useCartData, usePaymentData } from '../hooks/useLocalStorage.js';
import { PRICING } from '../constants/serviceData.js';

const UserServiceOptionCart = () => {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState({
    all: false,
    age: false,
    terms: false,
    privacy: false,
    marketing: false,
  });

  const { cartData, getTotalAmount } = useCartData();
  const { updatePaymentData } = usePaymentData();

  const handleAllAgreement = (checked) => {
    setAgreements({
      all: checked,
      age: checked,
      terms: checked,
      privacy: checked,
      marketing: checked,
    });
  };

  const handleIndividualAgreement = (key, checked) => {
    const newAgreements = { ...agreements, [key]: checked };
    const requiredAgreements = ['age', 'terms', 'privacy'];
    const allRequired = requiredAgreements.every((req) => newAgreements[req]);
    const allChecked = allRequired && newAgreements.marketing;

    newAgreements.all = allChecked;
    setAgreements(newAgreements);
  };

  const canSubmit = agreements.age && agreements.terms && agreements.privacy;

  const handleServiceRequest = () => {
    if (canSubmit) {
      console.log('서비스 요청하기 버튼 클릭');

      // 결제 데이터 구성
      const priceList = [
        { name: cartData.basePrice.name, price: cartData.basePrice.price },
        ...cartData.selectedServices.map((service) => ({
          name: service.name,
          price: service.price,
        })),
      ];

      const paymentData = {
        serviceInfo: {
          dateTime: '2023-06-15 14:00',
          serviceType: cartData.subOptionType
            ? `${cartData.subOptionType} (1인)`
            : '일회성 청소 (1인)',
          manager: '김청소 매니저',
        },
        priceList: priceList,
        totalAmount: getTotalAmount(),
      };

      // 결제 데이터를 localStorage에 저장
      updatePaymentData(paymentData);

      // 서비스 요청 페이지로 이동
      navigate('/user/service-request');
    }
  };

  return (
    <div className="reservation-page">
      <Header showBackButton={true} />
      <div className="page-content-wrapper">
        <div className="reservation-container" style={{ marginTop: '64px' }}>
          {/* 제목 섹션 */}
          <div className="title-section">
            <h1 className="page-title">장바구니</h1>
          </div>

          {/* 설명 섹션 */}
          <div className="description-section">
            <p className="description-text">
              현재 내가 선택한 옵션을 보여줍니다.
            </p>
          </div>

          {/* 결제 정보 섹션 */}
          <div className="payment-info-section">
            <h2 className="section-title">결제 정보</h2>

            <div className="price-list">
              {/* 기본 요금 */}
              <div className="price-item">
                <span className="item-name">{cartData.basePrice.name}</span>
                <span className="item-price">
                  {cartData.basePrice.price.toLocaleString()}원
                </span>
              </div>

              {/* 선택된 서비스들 */}
              {cartData.selectedServices.map((service) => (
                <div key={service.key} className="price-item">
                  <span className="item-name">{service.name}</span>
                  <span className="item-price">
                    {service.price.toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>

            <div className="total-amount">
              <div className="total-row">
                <span className="total-label">총 결제 금액</span>
                <span className="total-price">
                  {getTotalAmount().toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* 약관 동의 섹션 */}
          <div className="agreements-section">
            <div className="agreement-item all-agreement">
              <label className="custom-checkbox-label agreement-label">
                <input
                  type="checkbox"
                  checked={agreements.all}
                  onChange={(e) => handleAllAgreement(e.target.checked)}
                />
                <span className="custom-checkmark checkmark"></span>
                약관 전체 동의
              </label>
            </div>

            <div className="agreement-item">
              <label className="custom-checkbox-label agreement-label">
                <input
                  type="checkbox"
                  checked={agreements.age}
                  onChange={(e) =>
                    handleIndividualAgreement('age', e.target.checked)
                  }
                />
                <span className="custom-checkmark checkmark"></span>
                (필수) 본인은 만 14세 이상입니다
              </label>
            </div>

            <div className="agreement-item">
              <label className="custom-checkbox-label agreement-label">
                <input
                  type="checkbox"
                  checked={agreements.terms}
                  onChange={(e) =>
                    handleIndividualAgreement('terms', e.target.checked)
                  }
                />
                <span className="custom-checkmark checkmark"></span>
                (필수) 서비스 이용약관 동의
                <button className="view-button">보기</button>
              </label>
            </div>

            <div className="agreement-item">
              <label className="custom-checkbox-label agreement-label">
                <input
                  type="checkbox"
                  checked={agreements.privacy}
                  onChange={(e) =>
                    handleIndividualAgreement('privacy', e.target.checked)
                  }
                />
                <span className="custom-checkmark checkmark"></span>
                (필수) 개인정보 수집 및 이용 동의
                <button className="view-button">보기</button>
              </label>
            </div>

            <div className="agreement-item marketing-agreement">
              <label className="custom-checkbox-label agreement-label">
                <input
                  type="checkbox"
                  checked={agreements.marketing}
                  onChange={(e) =>
                    handleIndividualAgreement('marketing', e.target.checked)
                  }
                />
                <span className="custom-checkmark checkmark"></span>
                (선택) 광고성 정보 수신 전체동의
              </label>
              <p className="marketing-description">
                마케팅 정보 수집에 동의하지만, 이벤트 및 할인 혜택 안내를
                누구보다 빨리 받아보실 수 있어요!
              </p>
            </div>
          </div>

          {/* 서비스 요청 버튼 섹션 */}
          <div className="service-request-section">
            <button
              className="primary-button service-request-button"
              onClick={handleServiceRequest}
              disabled={!canSubmit}
            >
              서비스 요청하기
            </button>
          </div>
        </div>
      </div>
      <Footer current="/user/service-option-cart" />
    </div>
  );
};

export default UserServiceOptionCart;
