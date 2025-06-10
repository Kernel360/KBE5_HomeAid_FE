import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserPayment.css';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import useReservationStore from '../../../stores/reservationStore';
import { usePaymentData } from '../../reservation/hooks/useLocalStorage';

const UserPayment = () => {
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bank');

  // zustand store에서 예약 데이터 가져오기
  const { reservationData, getSelectedServicesWithDetails } =
    useReservationStore();
  const selectedServices = getSelectedServicesWithDetails();

  // localStorage에서 결제 데이터 가져오기
  const { paymentData: savedPaymentData } = usePaymentData();

  // ⭐️ 디버깅: 결제 데이터 확인
  useEffect(() => {
    console.log('💳 UserPayment - 결제 데이터 상태:');
    console.log('📊 zustand reservationData:', reservationData);
    console.log('💾 localStorage paymentData:', savedPaymentData);
    console.log('🛍️ selectedServices:', selectedServices);
  }, [reservationData, savedPaymentData, selectedServices]);

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
        '청소 서비스',
      manager: '매니저 배정 예정',
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

  const handlePayment = () => {
    // 결제 처리 로직
    console.log('💳 결제 처리 중...');
    console.log('💰 결제 데이터:', paymentData);
    console.log('📋 예약 데이터:', reservationData);
    console.log('📄 저장된 결제 데이터:', savedPaymentData);

    // 결제 완료 시뮬레이션
    alert('결제가 성공적으로 완료되었습니다!');
    navigate('/user/payment-complete');
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
              <div className="info-item">
                <span className="label">매니저</span>
                <span className="value">{paymentData.serviceInfo.manager}</span>
              </div>
              {reservationData.address && (
                <div className="info-item">
                  <span className="label">서비스 주소</span>
                  <span className="value">
                    {/* 위도, 경도가 포함된 addressDetail만 표시하거나, address가 좌표 정보인 경우 처리 */}
                    {reservationData.addressDetail &&
                    reservationData.addressDetail.includes('위도:')
                      ? reservationData.addressDetail
                      : reservationData.address.includes('위도:')
                        ? reservationData.address
                        : `${reservationData.address} ${reservationData.addressDetail || ''}`}
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
                  value="card"
                  checked={selectedPaymentMethod === 'card'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <i className="fas fa-credit-card method-icon"></i>
                  <span className="method-text">신용카드</span>
                </div>
              </label>
            </div>
          </div>

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
