import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserPayment.css';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import useReservationStore from '../../../stores/reservationStore';
import { usePaymentData } from '../../reservation/hooks/useLocalStorage';

const UserPayment = () => {
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  // zustand store에서 예약 데이터 가져오기
  const { reservationData, getSelectedServicesWithDetails } =
    useReservationStore();
  const selectedServices = getSelectedServicesWithDetails();

  // localStorage에서 결제 데이터 가져오기
  const { paymentData: savedPaymentData } = usePaymentData();

  // 결제 데이터가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!savedPaymentData && reservationData.selectedServices.length === 0) {
      alert('결제 정보가 없습니다.');
      navigate('/');
    }
  }, [savedPaymentData, reservationData, navigate]);

  // 카드 입력 헬퍼 함수들
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

  // 결제 데이터 생성 (localStorage 데이터 우선 사용)
  const paymentData = {
    serviceInfo: {
      dateTime:
        reservationData.reservationDate && reservationData.reservationTime
          ? `${reservationData.reservationDate} ${reservationData.reservationTime}`
          : savedPaymentData?.serviceInfo?.date &&
              savedPaymentData?.serviceInfo?.time
            ? `${savedPaymentData.serviceInfo.date} ${savedPaymentData.serviceInfo.time}`
            : '2023-06-15 14:00',
      serviceType:
        savedPaymentData?.serviceInfo?.type ||
        savedPaymentData?.serviceInfo?.subOptionName ||
        reservationData.selectedSubOption?.name ||
        '청소 서비스',
      manager: '매니저 배정 예정',
      reservationId: savedPaymentData?.reservationId,
      status: savedPaymentData?.status || 'PENDING',
      duration: savedPaymentData?.duration,
    },
    priceList:
      selectedServices.length > 0
        ? selectedServices.map((service) => ({
            name: service.name,
            price: service.price,
          }))
        : [
            { name: '기본 요금', price: 80000 },
            { name: '찬대 물기기', price: 10000 },
            { name: '찬장 먼지 제거', price: 20000 },
            { name: '일반 배출', price: 20000 },
            { name: '음식물 배출', price: 25000 },
          ],
    totalAmount:
      savedPaymentData?.amount ||
      (reservationData.totalPrice > 0 ? reservationData.totalPrice : 155000),
  };

  const handlePayment = async () => {
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
        reservationId: paymentData.serviceInfo.reservationId,
        paymentMethod: selectedPaymentMethod,
        amount: paymentData.totalAmount,
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

      // TODO: 실제 Spring Boot 결제 API 연동
      // const paymentResult = await customerAPI.processPayment(paymentRequestData);
      console.log('결제 요청 데이터 (추후 API 연동용):', paymentRequestData);

      // 임시로 결제 성공 처리
      alert(
        `결제가 완료되었습니다!${
          paymentData.serviceInfo.reservationId
            ? `\n예약번호: ${paymentData.serviceInfo.reservationId}`
            : ''
        }\n결제금액: ${paymentData.totalAmount.toLocaleString()}원`
      );

      navigate('/user/payment-complete');
    } catch (error) {
      console.error('결제 실패:', error);
      alert('결제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  return (
    <div className="user-payment-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="user-payment-container">
          {/* 제목 섹션 */}
          <div className="title-section">
            <h1 className="page-title">결제하기</h1>
            <p className="page-subtitle">서비스 결제를 진행해주세요</p>
          </div>

          {/* 서비스 정보 섹션 */}
          <div className="service-info-section">
            <h3 className="section-title">서비스 정보</h3>
            <div className="info-card">
              <div className="info-item">
                <span className="label">날짜 및 시간</span>
                <span className="value">
                  {paymentData.serviceInfo.dateTime}
                </span>
              </div>
              <div className="info-item">
                <span className="label">서비스 유형</span>
                <span className="value">
                  {paymentData.serviceInfo.serviceType}
                </span>
              </div>
              {paymentData.serviceInfo.duration && (
                <div className="info-item">
                  <span className="label">예상 소요시간</span>
                  <span className="value">
                    {paymentData.serviceInfo.duration}분
                  </span>
                </div>
              )}
              <div className="info-item">
                <span className="label">매니저</span>
                <span className="value">{paymentData.serviceInfo.manager}</span>
              </div>
              {/* 통합된 서비스 주소 표시 (위도, 경도 값 우선) */}
              {(reservationData.address ||
                savedPaymentData?.serviceInfo?.address) && (
                <div className="info-item">
                  <span className="label">서비스 주소</span>
                  <span className="value">
                    {(() => {
                      // 1. reservationData에서 위도,경도 정보 확인
                      if (
                        reservationData.addressDetail &&
                        reservationData.addressDetail.includes('위도:')
                      ) {
                        return reservationData.addressDetail;
                      }
                      if (
                        reservationData.address &&
                        reservationData.address.includes('위도:')
                      ) {
                        return reservationData.address;
                      }

                      // 2. savedPaymentData에서 위도,경도 정보 확인
                      if (
                        savedPaymentData?.serviceInfo?.address?.detail &&
                        savedPaymentData.serviceInfo.address.detail.includes(
                          '위도:'
                        )
                      ) {
                        return savedPaymentData.serviceInfo.address.detail;
                      }

                      // 3. 그 외의 경우 일반 주소 표시
                      if (savedPaymentData?.serviceInfo?.address) {
                        return `${savedPaymentData.serviceInfo.address.main}${
                          savedPaymentData.serviceInfo.address.detail
                            ? ` ${savedPaymentData.serviceInfo.address.detail}`
                            : ''
                        }`;
                      }

                      // 4. 마지막으로 reservationData 주소 표시
                      return `${reservationData.address}${
                        reservationData.addressDetail
                          ? ` ${reservationData.addressDetail}`
                          : ''
                      }`;
                    })()}
                  </span>
                </div>
              )}
              {reservationData.customerNote && (
                <div className="info-item">
                  <span className="label">고객 요청사항</span>
                  <span className="value">{reservationData.customerNote}</span>
                </div>
              )}
            </div>
          </div>

          {/* 결제 정보 섹션 */}
          <div className="payment-info-section">
            <h3 className="section-title">결제 정보</h3>
            <div className="payment-card">
              <div className="price-list">
                {paymentData.priceList.map((item, index) => (
                  <div key={index} className="price-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">
                      {item.price.toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>
              <div className="total-amount">
                <div className="total-row">
                  <span className="total-label">총 결제 금액</span>
                  <span className="total-price">
                    {paymentData.totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 결제 수단 섹션 */}
          <div className="payment-method-section">
            <h3 className="section-title">결제 수단</h3>
            <div className="payment-methods">
              <label className="payment-method-item">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={selectedPaymentMethod === 'card'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <i className="fas fa-credit-card method-icon"></i>
                  <span className="method-text">신용카드/체크카드</span>
                </div>
              </label>
              <label className="payment-method-item">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={selectedPaymentMethod === 'bank'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <i className="fas fa-university method-icon"></i>
                  <span className="method-text">계좌이체</span>
                </div>
              </label>
              <label className="payment-method-item">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="kakao"
                  checked={selectedPaymentMethod === 'kakao'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <i className="fas fa-comment method-icon"></i>
                  <span className="method-text">카카오페이</span>
                </div>
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

          {/* 카카오페이 정보 */}
          {selectedPaymentMethod === 'kakao' && (
            <div className="kakao-info-section">
              <h3 className="section-title">카카오페이</h3>
              <div className="kakao-details">
                <p>카카오페이로 간편하게 결제하세요.</p>
                <p className="kakao-note">
                  * 결제 버튼 클릭 시 카카오페이 앱으로 이동합니다.
                </p>
              </div>
            </div>
          )}

          {/* 버튼 섹션 */}
          <div className="button-section">
            <button className="payment-button" onClick={handlePayment}>
              {paymentData.totalAmount.toLocaleString()}원 결제하기
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              취소하기
            </button>
          </div>

          {/* 안내 문구 */}
          <div className="notice-section">
            <p className="notice-text">
              매칭 확정 후에는 취소 시 수수료가 발생할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
      <Footer current="/user/payment" />
    </div>
  );
};

export default UserPayment;
