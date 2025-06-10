import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../payment/pages/UserPayment.css';
import '../styles/common.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import { usePaymentData } from '../hooks/useLocalStorage';

const UserPayment = () => {
  const navigate = useNavigate();
  const { paymentData, clearPaymentData } = usePaymentData();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  // 결제 데이터가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!paymentData) {
      alert('결제 정보가 없습니다.');
      navigate('/');
    }
  }, [paymentData, navigate]);

  const handleCardInputChange = (field, value) => {
    setCardInfo((prev) => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    if (!paymentData) {
      alert('결제 정보가 없습니다.');
      return;
    }

    // 카드 정보 검증
    if (selectedPaymentMethod === 'card') {
      if (
        !cardInfo.number ||
        !cardInfo.expiry ||
        !cardInfo.cvc ||
        !cardInfo.name
      ) {
        alert('카드 정보를 모두 입력해주세요.');
        return;
      }
    }

    try {
      // Spring Boot 결제 API 호출을 위한 데이터 준비
      const paymentRequestData = {
        reservationId: paymentData.reservationId, // Long - ReservationResponseDto에서 받은 ID
        paymentMethod: selectedPaymentMethod,
        amount: paymentData.amount, // Integer - ReservationResponseDto의 totalPrice
        paymentDetails:
          selectedPaymentMethod === 'card'
            ? {
                cardNumber: cardInfo.number.replace(/\s/g, ''),
                expiryDate: cardInfo.expiry,
                cvc: cardInfo.cvc,
                cardHolderName: cardInfo.name,
              }
            : null,
      };

      console.log('결제 요청 데이터 (Spring Boot):', paymentRequestData);
      console.log('예약 정보:', {
        reservationId: paymentData.reservationId,
        status: paymentData.status,
        totalPrice: paymentData.amount,
        totalDuration: paymentData.duration,
        subOptionName: paymentData.serviceInfo?.subOptionName,
      });

      // TODO: 실제 Spring Boot 결제 API 연동
      // const paymentResult = await customerAPI.processPayment(paymentRequestData);

      // 임시로 결제 성공 처리 (실제 API 연동 시 제거)
      console.log('결제 처리 완료');

      alert(
        `결제가 완료되었습니다!\n예약번호: ${paymentData.reservationId}\n결제금액: ${paymentData.amount.toLocaleString()}원`
      );
      clearPaymentData();
      navigate('/');
    } catch (error) {
      console.error('결제 실패:', error);
      alert('결제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (!paymentData) {
    return null;
  }

  return (
    <div className="reservation-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="reservation-container">
          {/* 제목 섹션 */}
          <div className="title-section">
            <h1 className="page-title">결제</h1>
            <p className="page-subtitle">
              결제 정보를 확인하고 결제를 진행해주세요.
            </p>
          </div>

          {/* 주문 정보 */}
          <div className="order-summary-section">
            <h3 className="section-title">주문 정보</h3>
            <div className="order-details">
              <div className="order-item">
                <span className="order-label">서비스 유형:</span>
                <span className="order-value">
                  {paymentData.serviceInfo?.type || '청소 서비스'}
                </span>
              </div>
              <div className="order-item">
                <span className="order-label">서비스명:</span>
                <span className="order-value">
                  {paymentData.serviceInfo?.subOptionName || '기본 서비스'}
                </span>
              </div>
              <div className="order-item">
                <span className="order-label">예약 날짜:</span>
                <span className="order-value">
                  {paymentData.serviceInfo?.date || '미정'}
                </span>
              </div>
              <div className="order-item">
                <span className="order-label">예약 시간:</span>
                <span className="order-value">
                  {paymentData.serviceInfo?.time || '미정'}
                </span>
              </div>
              <div className="order-item">
                <span className="order-label">예상 소요시간:</span>
                <span className="order-value">
                  {paymentData.duration ? `${paymentData.duration}분` : '미정'}
                </span>
              </div>
              <div className="order-item">
                <span className="order-label">예약 상태:</span>
                <span className="order-value">
                  {paymentData.status || 'PENDING'}
                </span>
              </div>
              {paymentData.serviceInfo?.address && (
                <div className="order-item">
                  <span className="order-label">서비스 주소:</span>
                  <span className="order-value">
                    {paymentData.serviceInfo.address.main}
                    {paymentData.serviceInfo.address.detail &&
                      ` ${paymentData.serviceInfo.address.detail}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 결제 금액 */}
          <div className="payment-amount-section">
            <h3 className="section-title">결제 금액</h3>
            <div className="amount-breakdown">
              <div className="amount-row">
                <span>서비스 요금</span>
                <span>{(paymentData.amount || 0).toLocaleString()}원</span>
              </div>
              <div className="amount-row total">
                <span>총 결제 금액</span>
                <span>{(paymentData.amount || 0).toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* 결제 방법 선택 */}
          <div className="payment-method-section">
            <h3 className="section-title">결제 방법</h3>
            <div className="payment-methods">
              <label className="payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={selectedPaymentMethod === 'card'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <span className="radio-checkmark"></span>
                <span className="payment-method-text">신용카드/체크카드</span>
              </label>
              <label className="payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={selectedPaymentMethod === 'bank'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <span className="radio-checkmark"></span>
                <span className="payment-method-text">무통장입금</span>
              </label>
              <label className="payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="kakao"
                  checked={selectedPaymentMethod === 'kakao'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <span className="radio-checkmark"></span>
                <span className="payment-method-text">카카오페이</span>
              </label>
            </div>
          </div>

          {/* 카드 정보 입력 */}
          {selectedPaymentMethod === 'card' && (
            <div className="card-info-section">
              <h3 className="section-title">카드 정보</h3>
              <div className="card-inputs">
                <div className="input-group">
                  <label>카드번호</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardInfo.number}
                    onChange={(e) =>
                      handleCardInputChange(
                        'number',
                        formatCardNumber(e.target.value)
                      )
                    }
                    maxLength="19"
                  />
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>유효기간</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardInfo.expiry}
                      onChange={(e) =>
                        handleCardInputChange(
                          'expiry',
                          formatExpiry(e.target.value)
                        )
                      }
                      maxLength="5"
                    />
                  </div>
                  <div className="input-group">
                    <label>CVC</label>
                    <input
                      type="text"
                      placeholder="000"
                      value={cardInfo.cvc}
                      onChange={(e) =>
                        handleCardInputChange(
                          'cvc',
                          e.target.value.replace(/[^0-9]/g, '')
                        )
                      }
                      maxLength="3"
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>카드소지자명</label>
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={cardInfo.name}
                    onChange={(e) =>
                      handleCardInputChange('name', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* 무통장입금 정보 */}
          {selectedPaymentMethod === 'bank' && (
            <div className="bank-info-section">
              <h3 className="section-title">입금 정보</h3>
              <div className="bank-details">
                <p>은행: 국민은행</p>
                <p>계좌번호: 123-456-789012</p>
                <p>예금주: (주)홈에이드</p>
                <p className="bank-note">
                  * 입금 후 확인까지 1-2시간 정도 소요될 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* 결제 버튼 */}
          <div className="payment-submit-section">
            <button className="payment-submit-btn" onClick={handlePayment}>
              {(paymentData.amount || 0).toLocaleString()}원 결제하기
            </button>
          </div>

          {/* 취소 버튼 */}
          <div className="cancel-section">
            <button className="cancel-btn" onClick={() => navigate(-1)}>
              취소
            </button>
          </div>
        </div>
      </div>
      <Footer current="/user/payment" />
    </div>
  );
};

export default UserPayment;
