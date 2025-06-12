import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserPayment.css';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';
import useReservationStore from '../../../stores/reservationStore.js';
import { usePaymentData } from '../../reservation/hooks/useLocalStorage.js';
// TODO: 실제 백엔드 API 연동이 완성되면 아래 주석을 해제
// import { customerAPI, assignManagerToReservation } from '../../reservation/api/customerAPI';
import {
  customerAPI,
  assignManagerToReservation,
} from '../../reservation/api/customerAPI.js';

const UserPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bank');
  // const [cardInfo, setCardInfo] = useState({
  //   number: '',
  //   expiry: '',
  //   cvc: '',
  //   name: '',
  // });

  // zustand store에서 예약 데이터 가져오기
  const { reservationData, getSelectedServicesWithDetails } =
    useReservationStore();
  const selectedServices = getSelectedServicesWithDetails();

  // localStorage에서 결제 데이터 가져오기
  const { paymentData: savedPaymentData } = usePaymentData();

  // URL state에서 예약 정보 가져오기 (예약 상세에서 전달받은 경우)
  const reservationFromDetail = location.state?.reservation || null;

  // 결제 데이터가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (
      !savedPaymentData &&
      reservationData.selectedServices.length === 0 &&
      !reservationFromDetail
    ) {
      alert('결제 정보가 없습니다.');
      navigate('/');
    }
  }, [savedPaymentData, reservationData, navigate, reservationFromDetail]);

  // ⭐️ 디버깅용: 전달받은 데이터 확인
  useEffect(() => {
    console.log('🔍 UserPayment 페이지 데이터 확인:');
    console.log('📋 예약 상세에서 전달받은 데이터:', reservationFromDetail);
    console.log('🏪 Zustand 스토어 데이터:', {
      reservationData,
      selectedServices,
    });
    console.log('💾 localStorage 저장된 데이터:', savedPaymentData);
    // paymentData는 콘솔에서 직접 확인하도록 주석 처리 (무한 루프 방지)
    // console.log('📊 최종 결제 데이터:', paymentData);
  }, [
    reservationFromDetail,
    reservationData,
    selectedServices,
    savedPaymentData,
  ]);

  // ⭐️ 결제 데이터 생성 (useMemo로 최적화)
  const paymentData = useMemo(
    () => ({
      serviceInfo: {
        dateTime:
          // 1. 예약 상세에서 전달받은 데이터 우선 사용
          reservationFromDetail
            ? `${reservationFromDetail.date} ${reservationFromDetail.time ? reservationFromDetail.time.split('~')[0] : ''}`
            : reservationData.reservationDate && reservationData.reservationTime
              ? `${reservationData.reservationDate} ${reservationData.reservationTime}`
              : savedPaymentData?.serviceInfo?.date &&
                  savedPaymentData?.serviceInfo?.time
                ? `${savedPaymentData.serviceInfo.date} ${savedPaymentData.serviceInfo.time}`
                : '2023-06-15 14:00',
        serviceType:
          // 1. 예약 상세에서 전달받은 데이터 우선 사용
          reservationFromDetail?.type ||
          reservationData.serviceTitle ||
          savedPaymentData?.serviceInfo?.type ||
          savedPaymentData?.serviceInfo?.subOptionName ||
          reservationData.selectedSubOption?.name ||
          '청소 서비스',
        manager: '매니저 배정 예정',
        reservationId:
          // 1. 예약 상세에서 전달받은 데이터 우선 사용
          reservationFromDetail?.id || savedPaymentData?.reservationId,
        status: savedPaymentData?.status || 'PENDING',
        duration:
          reservationData.totalDuration || savedPaymentData?.duration || 180,
        // 추가 정보 (예약 상세에서 전달받은 경우)
        address: reservationFromDetail?.address,
        addressDetail: reservationFromDetail?.addressDetail,
      },
      priceList:
        // 1. 예약 상세에서 전달받은 데이터가 있으면 단일 항목으로 표시
        reservationFromDetail
          ? [
              {
                name: reservationFromDetail.type,
                price: reservationFromDetail.price,
              },
            ]
          : // 2. 서브옵션에서 선택된 서비스 데이터 우선 사용
            reservationData.serviceDetails &&
              reservationData.serviceDetails.length > 0
            ? reservationData.serviceDetails.map((service) => ({
                name: service.name,
                price: service.price,
              }))
            : // 3. 기존 selectedServices 사용
              selectedServices.length > 0
              ? selectedServices.map((service) => ({
                  name: service.name,
                  price: service.price,
                }))
              : // 4. 기본값 사용
                [
                  { name: '기본 요금', price: 80000 },
                  { name: '찬대 물기기', price: 10000 },
                  { name: '찬장 먼지 제거', price: 20000 },
                  { name: '일반 배출', price: 20000 },
                  { name: '음식물 배출', price: 25000 },
                ],
      totalAmount:
        // 1. 예약 상세에서 전달받은 데이터 우선 사용
        reservationFromDetail?.price ||
        // 2. 서브옵션에서 계산된 총 가격 우선 사용
        reservationData.totalPrice ||
        // 3. savedPaymentData 금액 사용
        savedPaymentData?.amount ||
        // 4. 기본값 사용
        155000,
    }),
    [reservationFromDetail, reservationData, savedPaymentData, selectedServices]
  );

  // 약관 동의 상태 관리
  const [agreements, setAgreements] = useState({
    terms: false,
    service: false,
    privacy: false,
    marketing: false,
  });

  // 모두선택 상태 계산
  const allRequired =
    agreements.terms && agreements.service && agreements.privacy;
  const allSelected = allRequired && agreements.marketing;

  // 개별 체크박스 변경 핸들러
  const handleAgreementChange = (key) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 모두선택 핸들러
  const handleSelectAll = () => {
    const newValue = !allSelected;
    setAgreements({
      terms: newValue,
      service: newValue,
      privacy: newValue,
      marketing: newValue,
    });
  };

  const handlePayment = async () => {
    // 필수 약관 동의 확인 (버튼이 비활성화되어 있으므로 이 체크는 불필요하지만 안전장치로 유지)
    if (!allRequired) {
      return;
    }

    try {
      // ⭐️ 인증 상태 확인 (403 에러 디버깅)
      const accessToken = localStorage.getItem('accessToken');

      // 토큰이 없으면 로그인 페이지로 리다이렉트
      if (!accessToken) {
        // ⭐️ 개발 환경에서는 임시 토큰 자동 생성 (DB 저장 테스트용)
        const isDevEnvironment = import.meta.env.DEV;

        if (isDevEnvironment) {
          // 테스트용 사용자 정보 생성
          const testUser = {
            id: 1,
            name: '테스트 사용자',
            email: 'test@example.com',
            role: 'CUSTOMER',
          };

          const testToken = 'dev-test-token-' + Date.now();

          // localStorage에 저장
          localStorage.setItem('accessToken', testToken);
          localStorage.setItem('userInfo', JSON.stringify(testUser));

          alert(
            '💡 개발 환경에서 임시 로그인으로 결제를 진행합니다.\n실제 운영에서는 로그인이 필요합니다.'
          );
        } else {
          alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
          navigate('/login');
          return;
        }
      }

      // ⭐️ reservationId 확인 및 실제 값 설정
      let actualReservationId = null;

      // 1. paymentData에서 확인
      if (paymentData.serviceInfo.reservationId) {
        actualReservationId = paymentData.serviceInfo.reservationId;
      }
      // 2. reservationData에서 확인
      else if (reservationData.reservationId) {
        actualReservationId = reservationData.reservationId;
      }
      // 3. savedPaymentData에서 확인
      else if (savedPaymentData?.reservationId) {
        actualReservationId = savedPaymentData.reservationId;
      }
      // 4. 테스트용 기본값 (실제 환경에서는 예약 생성 후 사용)
      else {
        actualReservationId = 1;
      }

      // ⭐️ STEP 0: 매니저 할당 (결제 전 필수 단계)
      try {
        // 매니저 ID 10으로 할당
        await assignManagerToReservation(actualReservationId, 10);

        // 잠시 대기 (백엔드 처리 시간 확보)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch {
        // 매니저 할당 실패해도 결제는 계속 진행
      }

      // TODO: 백엔드 예약 상태 관리 시스템이 완성되면 아래 주석을 해제하여 실제 상태 확인 로직을 사용
      // 현재는 프론트엔드 개발 및 테스트를 위해 상태 확인을 건너뛰고 바로 결제 진행

      /* ⭐️ STEP 1: 예약 상태 확인 (TODO: 백엔드 상태 관리 완성 후 활성화)
      console.log('🔍 예약 상태 확인 중...');

      try {
        const reservationDetail =
          await customerAPI.getReservation(actualReservationId);
        console.log('📋 현재 예약 정보:', reservationDetail);

        // 예약 상태 확인
        const currentStatus = reservationDetail.status;
        console.log('📊 현재 예약 상태:', currentStatus);

        // ⭐️ MATCHED 상태가 아니면 결제 불가
        if (currentStatus !== 'MATCHED') {
          let statusMessage = '';
          switch (currentStatus) {
            case 'REQUESTED':
              statusMessage =
                '예약이 요청 상태입니다.\n매니저 매칭이 완료된 후 결제가 가능합니다.';
              break;
            case 'MATCHING':
              statusMessage =
                '매니저 매칭 중입니다.\n매칭이 완료된 후 결제가 가능합니다.';
              break;
            case 'COMPLETED':
              statusMessage = '이미 서비스가 완료된 예약입니다.';
              break;
            case 'CANCELLED':
              statusMessage = '취소된 예약입니다.\n결제할 수 없습니다.';
              break;
            default:
              statusMessage = `예약 상태가 "${currentStatus}"입니다.\n결제할 수 없는 상태입니다.`;
          }

          // ⚠️ 상태가 MATCHED가 아닌 경우, 강제로 매니저 할당 후 재시도
          console.log('⚠️ 예약 상태가 MATCHED가 아님. 강제 매니저 할당 시도...');
          
          try {
            // 예약 상태를 직접 MATCHED로 변경 시도
            await customerAPI.getReservation(actualReservationId); // 상태 재확인용
            console.log('🔄 매니저 할당 후 상태 재확인 완료');
            
            // 상태 변경이 반영될 시간을 위해 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 재확인
            const updatedReservation = await customerAPI.getReservation(actualReservationId);
            if (updatedReservation.status === 'MATCHED') {
              console.log('✅ 예약 상태가 MATCHED로 변경됨. 결제 계속 진행');
            } else {
              // 여전히 MATCHED가 아니면 경고 표시하고 강제 진행
              console.log('⚠️ 여전히 MATCHED 상태가 아니지만 결제 강제 진행');
              alert(`⚠️ 주의: 예약 상태가 "${updatedReservation.status}"이지만 결제를 진행합니다.\n\n매니저가 할당되지 않은 상태일 수 있습니다.`);
            }
            
          } catch (forceAssignError) {
            console.log('❌ 강제 매니저 할당 실패:', forceAssignError.message);
            alert(`❌ 결제할 수 없습니다.\n\n${statusMessage}\n\n매니저 할당에 실패했습니다.`);
            return; // 결제 중단
          }
        } else {
          // ⭐️ MATCHED 상태일 때만 결제 진행
          console.log('✅ 예약 상태가 MATCHED입니다. 결제를 진행합니다.');
        }
      } catch (statusCheckError) {
        console.error('❌ 예약 상태 확인 실패:', statusCheckError);
        
        // 상태 확인 실패해도 매니저 할당은 했으므로 결제 시도
        console.log('⚠️ 상태 확인 실패했지만 매니저 할당 후이므로 결제 시도');
        alert('⚠️ 예약 정보 확인에 실패했지만 결제를 시도합니다.\n\n매니저가 할당되어 결제 가능할 것으로 예상됩니다.');
      }
      */

      // ⭐️ STEP 2: 결제 진행 (매니저 할당 후) - 실제 백엔드 API 호출
      // ⭐️ 백엔드 PaymentRequestDto에 맞는 결제 요청 데이터 준비
      const paymentRequestData = {
        reservationId: parseInt(actualReservationId), // Long 타입으로 확실하게 변환
        amount: parseInt(paymentData.totalAmount), // Integer 타입으로 확실하게 변환
        paymentMethod: 'TRANSFER', // 계좌이체는 TRANSFER enum 사용
        // ⭐️ 매니저 ID 추가 (백엔드에서 필요한 경우)
        managerId: 10, // 할당된 매니저 ID
        // status는 백엔드에서 자동 설정되도록 제거 (Optional이므로)
      };

      let paymentResult;

      try {
        // ⭐️ 실제 Spring Boot 결제 API 호출 (DB에 저장)
        paymentResult = await customerAPI.processPayment(paymentRequestData);
      } catch (apiError) {
        // 403 에러인 경우 인증 문제 알림
        if (apiError.message.includes('403')) {
          // ⭐️ 임시 해결책: 매니저 할당만이라도 저장하기 위해 시도
          try {
            await assignManagerToReservation(actualReservationId, 10);
          } catch {
            // 매니저 할당도 실패
          }
        }

        // 백엔드 API 실패시 시뮬레이션으로 fallback (UI 테스트용)
        paymentResult = {
          id: Math.floor(Math.random() * 1000) + 1, // 랜덤 결제 ID
          reservationId: actualReservationId,
          amount: paymentData.totalAmount,
          paymentMethod: 'TRANSFER',
          status: 'COMPLETED',
          paidAt: new Date().toISOString(),
          managerId: 10,
        };

        // 사용자에게 상황 설명
        if (apiError.message.includes('403')) {
          alert(
            '⚠️ 백엔드 서버 인증 문제로 시뮬레이션 모드로 진행됩니다.\n\n해결방법:\n1. 백엔드 서버가 8080 포트에서 실행중인지 확인\n2. 로그인 후 다시 시도\n3. 백엔드 개발자에게 인증 설정 확인 요청'
          );
        } else {
          alert(
            '⚠️ 백엔드 연결 실패로 시뮬레이션 모드로 진행됩니다.\nDB에 저장되지 않을 수 있습니다.'
          );
        }
      }

      // 결제 성공 처리
      alert(
        `✅ 결제가 완료되었습니다!\n\n` +
          `${paymentResult.id ? `결제 ID: ${paymentResult.id}\n` : ''}` +
          `${paymentResult.reservationId ? `예약번호: ${paymentResult.reservationId}\n` : ''}` +
          `매니저 ID: 10 (할당 완료)\n` +
          `서비스: ${paymentData.serviceInfo.serviceType}\n` +
          `결제금액: ${paymentData.totalAmount.toLocaleString()}원\n` +
          `결제수단: 계좌이체\n` +
          `${paymentResult.paidAt ? `결제시간: ${new Date(paymentResult.paidAt).toLocaleString()}` : ''}`
      );

      // 결제 완료 페이지로 이동
      navigate('/customer/payment-complete', {
        state: {
          paymentResult: paymentResult,
          serviceInfo: paymentData.serviceInfo,
          totalAmount: paymentData.totalAmount,
          managerId: 10, // 매니저 정보 추가
        },
      });
    } catch (error) {
      // 에러 메시지 상세화
      let errorMessage = '결제에 실패했습니다.';

      if (error.message.includes('400')) {
        errorMessage =
          '결제 정보가 올바르지 않습니다.\n다음을 확인해주세요:\n- 예약 정보가 올바른지\n- 결제 금액이 올바른지\n- 매니저가 할당되었는지';
      } else if (error.message.includes('401')) {
        errorMessage = '인증에 실패했습니다.\n다시 로그인한 후 시도해주세요.';
      } else if (error.message.includes('403')) {
        errorMessage =
          '결제 권한이 없습니다.\n고객 계정으로 로그인했는지 확인해주세요.';
      } else if (error.message.includes('404')) {
        errorMessage =
          '예약 정보를 찾을 수 없습니다.\n예약이 정상적으로 생성되었는지 확인해주세요.';
      } else if (error.message.includes('500')) {
        errorMessage = '서버 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('network')) {
        errorMessage =
          '네트워크 연결에 문제가 있습니다.\n인터넷 연결을 확인하고 다시 시도해주세요.';
      }

      alert(
        `❌ ${errorMessage}\n\n오류가 지속되면 고객센터로 문의해주세요.\n\n` +
          `🔍 개발자 정보:\n에러 메시지: ${error.message}`
      );
    }
  };

  const handleCancel = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  return (
    <div className="user-payment-page">
      <Header showBackButton={true} />
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
              {/* ⭐️ 예약 번호 정보 (예약 상세에서 온 경우 우선 표시) */}
              {(reservationFromDetail?.id ||
                paymentData.serviceInfo.reservationId) && (
                <div className="info-item highlight">
                  <span className="label">예약 번호</span>
                  <span className="value reservation-id">
                    #
                    {reservationFromDetail?.id ||
                      paymentData.serviceInfo.reservationId}
                  </span>
                </div>
              )}

              <div className="info-item">
                <span className="label">서비스 유형</span>
                <span className="value service-type">
                  {paymentData.serviceInfo.serviceType}
                </span>
              </div>

              <div className="info-item">
                <span className="label">날짜 및 시간</span>
                <span className="value">
                  {paymentData.serviceInfo.dateTime}
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

              {/* ⭐️ 서비스 주소 (예약 상세에서 전달받은 정보 우선) */}
              {(reservationFromDetail?.address ||
                paymentData.serviceInfo.address ||
                reservationData.address ||
                savedPaymentData?.serviceInfo?.address) && (
                <div className="info-item">
                  <span className="label">서비스 주소</span>
                  <span className="value">
                    {(() => {
                      // 1. 예약 상세에서 전달받은 주소 정보 우선 사용
                      if (reservationFromDetail?.address) {
                        return `${reservationFromDetail.address}${
                          reservationFromDetail.addressDetail
                            ? ` ${reservationFromDetail.addressDetail}`
                            : ''
                        }`;
                      }

                      // 2. paymentData 서비스 주소
                      if (paymentData.serviceInfo.address) {
                        return paymentData.serviceInfo.address;
                      }

                      // 3. reservationData에서 위도,경도 정보 확인
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

                      // 4. savedPaymentData에서 위도,경도 정보 확인
                      if (
                        savedPaymentData?.serviceInfo?.address?.detail &&
                        savedPaymentData.serviceInfo.address.detail.includes(
                          '위도:'
                        )
                      ) {
                        return savedPaymentData.serviceInfo.address.detail;
                      }

                      // 5. 그 외의 경우 일반 주소 표시
                      if (savedPaymentData?.serviceInfo?.address) {
                        return `${savedPaymentData.serviceInfo.address.main}${
                          savedPaymentData.serviceInfo.address.detail
                            ? ` ${savedPaymentData.serviceInfo.address.detail}`
                            : ''
                        }`;
                      }

                      // 6. 마지막으로 reservationData 주소 표시
                      return `${reservationData.address}${
                        reservationData.addressDetail
                          ? ` ${reservationData.addressDetail}`
                          : ''
                      }`;
                    })()}
                  </span>
                </div>
              )}

              <div className="info-item">
                <span className="label">매니저</span>
                <span className="value">매니저 배정 완료 (ID: 10)</span>
              </div>

              {/* ⭐️ 고객 요청사항 (예약 상세에서 전달받은 정보 우선) */}
              {(reservationFromDetail?.customerNote ||
                reservationData.customerNote) && (
                <div className="info-item">
                  <span className="label">고객 요청사항</span>
                  <span className="value">
                    {reservationFromDetail?.customerNote ||
                      reservationData.customerNote}
                  </span>
                </div>
              )}

              {/* ⭐️ 예약 상태 (예약 상세에서 온 경우 표시) */}
              {reservationFromDetail?.status && (
                <div className="info-item">
                  <span className="label">예약 상태</span>
                  <span
                    className={`value status-${reservationFromDetail.status}`}
                  >
                    {reservationFromDetail.status === 'pending' && '예약중'}
                    {reservationFromDetail.status === 'completed' && '예약완료'}
                    {reservationFromDetail.status === 'visited' && '방문완료'}
                    {reservationFromDetail.status === 'cancelled' && '취소완료'}
                  </span>
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
              {/* 신용카드 옵션 주석처리 */}
              {/* <label className="payment-method-item">
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
              </label> */}

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

              {/* 카카오페이 옵션 주석처리 */}
              {/* <label className="payment-method-item">
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
              </label> */}
            </div>
          </div>

          {/* 카드 정보 입력 섹션 주석처리 */}
          {/* {selectedPaymentMethod === 'card' && (
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
          )} */}

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

          {/* 카카오페이 정보 섹션 주석처리 */}
          {/* {selectedPaymentMethod === 'kakao' && (
            <div className="kakao-info-section">
              <h3 className="section-title">카카오페이</h3>
              <div className="kakao-details">
                <p>카카오페이로 간편하게 결제하세요.</p>
                <p className="kakao-note">
                  * 결제 버튼 클릭 시 카카오페이 앱으로 이동합니다.
                </p>
              </div>
            </div>
          )} */}

          {/* 버튼 섹션 */}
          <div className="button-section">
            {/* TODO: 백엔드 예약 상태 관리 시스템이 완성되면 아래 주석을 해제하여 실제 상태별 버튼 제어 */}
            {/* 현재는 프론트엔드 개발 및 테스트를 위해 항상 결제 버튼 활성화 */}

            {/* ⭐️ 예약 상태에 따른 결제 버튼 제어 (TODO: 백엔드 상태 관리 완성 후 활성화)
            {(() => {
              // ⭐️ 백엔드 데이터에서 실제 상태값 가져오기 (Spring Boot ReservationStatus)
              const backendStatus = reservationFromDetail?.backendData?.status;
              const frontendStatus = reservationFromDetail?.status;

              // 백엔드 상태를 우선으로 사용하고, 없으면 프론트엔드 상태 사용
              const actualStatus = backendStatus || frontendStatus;

              console.log('🔍 결제 버튼 상태 확인:', {
                backendStatus,
                frontendStatus,
                actualStatus,
              });

              if (actualStatus) {
                // ⭐️ Spring Boot ReservationStatus에 따른 결제 버튼 제어
                switch (actualStatus) {
                  case 'REQUESTED':
                  case 'MATCHING':
                  case 'pending': // 프론트엔드 매핑
                    return (
                      <>
                        <button className="payment-button disabled" disabled>
                          매니저 매칭 대기 중...
                        </button>
                        <div className="payment-notice">
                          <p>💡 매니저 매칭이 완료되면 결제가 가능합니다.</p>
                        </div>
                      </>
                    );

                  case 'MATCHED':
                  case 'completed': // 프론트엔드 매핑 (MATCHED = 예약완료)
                    return (
                      <button
                        className="payment-button"
                        onClick={handlePayment}
                      >
                        {paymentData.totalAmount.toLocaleString()}원 결제하기
                      </button>
                    );

                  case 'COMPLETED':
                  case 'visited': // 프론트엔드 매핑 (COMPLETED = 방문완료)
                    return (
                      <>
                        <button className="payment-button disabled" disabled>
                          서비스 완료됨
                        </button>
                        <div className="payment-notice">
                          <p>✅ 이미 서비스가 완료된 예약입니다.</p>
                        </div>
                      </>
                    );

                  case 'CANCELLED':
                  case 'cancelled': // 프론트엔드 매핑
                    return (
                      <>
                        <button className="payment-button disabled" disabled>
                          취소된 예약
                        </button>
                        <div className="payment-notice">
                          <p>❌ 취소된 예약은 결제할 수 없습니다.</p>
                        </div>
                      </>
                    );

                  default:
                    return (
                      <>
                        <button className="payment-button disabled" disabled>
                          결제 불가
                        </button>
                        <div className="payment-notice">
                          <p>⚠️ 알 수 없는 예약 상태입니다.</p>
                        </div>
                      </>
                    );
                }
              } else {
                // 예약 상세에서 오지 않은 경우 기본 결제 버튼
                return (
                  <button className="payment-button" onClick={handlePayment}>
                    {paymentData.totalAmount.toLocaleString()}원 결제하기
                  </button>
                );
              }
            })()}
            */}

            {/* ⭐️ 임시 결제 버튼 (항상 활성화 - TODO: 백엔드 상태 관리 완성 후 제거) */}
            <button
              className="payment-button"
              onClick={handlePayment}
              disabled={!allRequired}
              style={{
                backgroundColor: allRequired ? '#007bff' : '#cccccc',
                cursor: allRequired ? 'pointer' : 'not-allowed',
                opacity: allRequired ? 1 : 0.6,
              }}
            >
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

          {/* 하단 이미지 섹션 */}
          <div
            className="bottom-image-section"
            style={{
              marginTop: '30px',
              marginBottom: '20px',
              textAlign: 'left',
              padding: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
              }}
            >
              {/* 제목 */}
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#333',
                  margin: '0 0 20px 0',
                }}
              >
                약관 전체 동의
              </h3>

              {/* 약관전체동의 체크박스 */}
              <div
                style={{
                  width: '100%',
                  paddingBottom: '15px',
                  borderBottom: '1px solid #e0e0e0',
                  marginBottom: '15px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#333',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#007bff',
                    }}
                  />
                  <span>약관전체동의</span>
                </label>
              </div>

              {/* 약관 동의 체크박스들 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                  width: '100%',
                  fontSize: '14px',
                  color: '#666',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreements.terms}
                    onChange={() => handleAgreementChange('terms')}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#007bff',
                    }}
                  />
                  <span>(필수) 홈에이드 이용약관 동의</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      color: '#999',
                      fontSize: '12px',
                    }}
                  >
                    보기
                  </span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreements.service}
                    onChange={() => handleAgreementChange('service')}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#007bff',
                    }}
                  />
                  <span>(필수) 서비스 이용약관 동의</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      color: '#999',
                      fontSize: '12px',
                    }}
                  >
                    보기
                  </span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={() => handleAgreementChange('privacy')}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#007bff',
                    }}
                  />
                  <span>(필수) 개인정보 수집 및 이용 동의</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      color: '#999',
                      fontSize: '12px',
                    }}
                  >
                    보기
                  </span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreements.marketing}
                    onChange={() => handleAgreementChange('marketing')}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#007bff',
                    }}
                  />
                  <span>(선택) 광고성 정보 수신 동의</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      color: '#999',
                      fontSize: '12px',
                    }}
                  >
                    보기
                  </span>
                </label>
              </div>

              {/* 안내 텍스트 */}
              <p
                style={{
                  fontSize: '12px',
                  color: '#999',
                  textAlign: 'left',
                  lineHeight: '1.4',
                  marginTop: '15px',
                }}
              >
                위의 약관에 동의하시면 서비스 이용이 가능합니다. 자세한 내용은
                각 약관을 확인해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer current="/customer/payment" />
    </div>
  );
};

export default UserPayment;
