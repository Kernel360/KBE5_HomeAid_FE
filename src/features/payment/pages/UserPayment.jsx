import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserPayment.css';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';
import Modal from '../../../components/Modal.jsx';
import useReservationStore from '../../../stores/reservationStore.js';
import { usePaymentData } from '../../reservation/hooks/useLocalStorage.js';
import { api } from '../../../api/config/api.js';
import { useAuthStore } from '../../../stores/authStore.js';

const UserPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bank');
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

  // 결제 완료 상태 확인
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [paymentCompletionInfo, setPaymentCompletionInfo] = useState(null);

  // 예약 완료 모달 상태
  const [showReservationCompleteModal, setShowReservationCompleteModal] =
    useState(false);

  // 결제 완료 상태 확인 함수
  const checkPaymentStatus = () => {
    const reservationId =
      reservationFromDetail?.id ||
      reservationFromDetail?.reservationId ||
      savedPaymentData?.reservationId;

    if (!reservationId) return false;

    console.log('🔍 결제 상태 확인 시작 - 예약 ID:', reservationId);

    // 1. 백엔드 데이터에서 결제 정보 확인 (최우선 - 실제 DB 상태)
    if (reservationFromDetail?.backendData) {
      const backendData =
        reservationFromDetail.backendData.data ||
        reservationFromDetail.backendData;
      const hasBackendPayment =
        backendData.paymentId ||
        backendData.paidAt ||
        backendData.paymentStatus === 'PAID' ||
        backendData.paymentStatus === 'COMPLETED' ||
        backendData.paymentStatus === 'SUCCESS' ||
        backendData.isPaid === true ||
        backendData.paid === true ||
        backendData.status === 'PAID';

      if (hasBackendPayment) {
        console.log('💳 백엔드에서 결제 완료 확인됨:', backendData);
        const paymentInfo = {
          reservationId: reservationId,
          paymentId: backendData.paymentId,
          completedAt: backendData.paidAt || new Date().toISOString(),
          amount: backendData.totalPrice || savedPaymentData?.amount || 20000,
          paymentMethod: backendData.paymentMethod || 'UNKNOWN',
        };

        setPaymentCompletionInfo(paymentInfo);
        return true;
      } else {
        // 백엔드에 결제 정보가 없으면 localStorage 정보 정리 (동기화)
        console.log('🔄 백엔드에 결제 정보 없음 - localStorage 정리');

        // localStorage 결제 완료 정보 제거
        const recentPaymentCompletion = localStorage.getItem(
          'recentPaymentCompletion'
        );
        if (recentPaymentCompletion) {
          try {
            const paymentInfo = JSON.parse(recentPaymentCompletion);
            if (paymentInfo.reservationId === parseInt(reservationId)) {
              console.log('🧹 localStorage 최근 결제 정보 제거:', paymentInfo);
              localStorage.removeItem('recentPaymentCompletion');
            }
          } catch (error) {
            console.error('localStorage 결제 정보 파싱 오류:', error);
          }
        }

        // 예약별 결제 완료 정보 제거
        const reservationPaymentKey = `payment_completed_${reservationId}`;
        const reservationPaymentInfo = localStorage.getItem(
          reservationPaymentKey
        );
        if (reservationPaymentInfo) {
          console.log('🧹 예약별 결제 정보 제거:', reservationPaymentKey);
          localStorage.removeItem(reservationPaymentKey);
        }
      }
    }

    // 2. 결제 진행 중 상태 확인 (10분간 중복 결제 방지)
    const paymentInProgressKey = `payment_in_progress_${reservationId}`;
    const paymentInProgress = localStorage.getItem(paymentInProgressKey);
    if (paymentInProgress) {
      try {
        const progressInfo = JSON.parse(paymentInProgress);
        const progressTime = new Date(progressInfo.startTime);
        const now = new Date();
        const diffMinutes = (now - progressTime) / (1000 * 60);

        if (diffMinutes < 10) {
          // 10분 이내면 결제 진행 중으로 간주
          console.log('⏳ 결제 진행 중 상태 확인됨:', progressInfo);
          return true; // 결제 진행 중이므로 버튼 비활성화
        } else {
          // 10분 경과시 진행 상태 제거
          localStorage.removeItem(paymentInProgressKey);
        }
      } catch (error) {
        console.error('결제 진행 상태 파싱 오류:', error);
        localStorage.removeItem(paymentInProgressKey);
      }
    }

    console.log('💳 결제 완료 상태 없음');
    return false;
  };

  // 결제 상태 확인
  useEffect(() => {
    const isCompleted = checkPaymentStatus();
    setIsPaymentCompleted(isCompleted);
  }, [reservationFromDetail, savedPaymentData]);

  // 페이지 포커스 시 결제 상태 재확인 (뒤로가기 등에서 돌아올 때)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 페이지 포커스 - 결제 상태 재확인');
      const isCompleted = checkPaymentStatus();
      setIsPaymentCompleted(isCompleted);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // URL 변경 감지 시 결제 상태 재확인
  useEffect(() => {
    console.log('🔄 URL 변경 감지 - 결제 상태 재확인');
    const isCompleted = checkPaymentStatus();
    setIsPaymentCompleted(isCompleted);
  }, [location.pathname, location.search]);

  // ⭐️ 디버깅용: 전달받은 데이터 확인
  useEffect(() => {
    console.log('🔍 UserPayment 페이지 데이터 확인:');
    console.log('📋 예약 상세에서 전달받은 데이터:', reservationFromDetail);
    console.log('🏪 Zustand 스토어 데이터:', {
      reservationData,
      selectedServices,
    });
    console.log('💾 localStorage 저장된 데이터:', savedPaymentData);
    console.log('💳 결제 완료 상태:', isPaymentCompleted);
    console.log('💳 결제 완료 정보:', paymentCompletionInfo);
    // paymentData는 콘솔에서 직접 확인하도록 주석 처리 (무한 루프 방지)
    // console.log('📊 최종 결제 데이터:', paymentData);
  }, [
    reservationFromDetail,
    reservationData,
    selectedServices,
    savedPaymentData,
    isPaymentCompleted,
    paymentCompletionInfo,
  ]);

  // Card formatting functions
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

  const handleCardInputChange = (field, value) => {
    setCardInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
    // 예약 ID 확인 (함수 상단에서 선언)
    const currentReservationId = parseInt(
      location.state?.reservation?.reservationId ||
        reservationData.reservationId ||
        location.state?.reservation?.id ||
        paymentData.serviceInfo.reservationId
    );

    const paymentInProgressKey = `payment_in_progress_${currentReservationId}`;

    try {
      // 결제 완료 상태 재확인
      const currentPaymentStatus = checkPaymentStatus();
      if (currentPaymentStatus || isPaymentCompleted) {
        alert('이미 결제가 완료되었거나 진행 중인 예약입니다.');
        return;
      }

      if (!currentReservationId) {
        alert('예약 정보를 찾을 수 없습니다.');
        return;
      }

      // 결제 진행 상태 설정 (중복 결제 방지)
      const progressInfo = {
        reservationId: currentReservationId,
        startTime: new Date().toISOString(),
        status: 'IN_PROGRESS',
      };
      localStorage.setItem(paymentInProgressKey, JSON.stringify(progressInfo));

      // 인증 상태 확인
      const localStorageToken = localStorage.getItem('accessToken');
      const authStoreToken = useAuthStore.getState().accessToken;
      const currentUser = useAuthStore.getState().user;

      console.log('🔐 인증 상태 확인:');
      console.log(
        '- localStorage token:',
        localStorageToken ? '존재함' : '없음'
      );
      console.log('- authStore token:', authStoreToken ? '존재함' : '없음');
      console.log('- 현재 사용자:', currentUser);

      // 토큰이 없으면 로그인 페이지로 리다이렉트
      if (!localStorageToken && !authStoreToken) {
        // 결제 진행 상태 제거
        localStorage.removeItem(paymentInProgressKey);
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        navigate('/auth/signin');
        return;
      }

      // 결제 수단 매핑 (프론트엔드 값 → 백엔드 enum 값)
      const paymentMethodMapping = {
        card: 'CARD',
        bank: 'TRANSFER',
        kakao: 'KAKAO',
      };

      const paymentRequestData = {
        reservationId: currentReservationId,
        amount: parseInt(paymentData.totalAmount),
        paymentMethod:
          paymentMethodMapping[selectedPaymentMethod] ||
          selectedPaymentMethod.toUpperCase(),
      };

      console.log('📤 결제 요청:', paymentRequestData);
      console.log('🔍 예약 상태 확인:', {
        reservationId: currentReservationId,
        reservationFromDetail: location.state?.reservation,
        reservationData: reservationData,
        paymentData: paymentData.serviceInfo,
      });

      // 결제 API 호출 (백엔드 엔드포인트에 맞춤)
      const response = await api.post('/my/payments/', paymentRequestData);

      if (response.data?.data) {
        const paymentResult = response.data.data;
        console.log('✅ 결제 성공:', paymentResult);

        // 결제 진행 상태 제거
        localStorage.removeItem(paymentInProgressKey);

        // 결제 완료 정보를 localStorage에 저장 (다른 페이지에서 참조용)
        const paymentCompletionInfo = {
          reservationId: paymentResult.reservationId || currentReservationId,
          paymentId: paymentResult.id,
          completedAt: new Date().toISOString(),
          amount: paymentResult.amount,
          paymentMethod: paymentResult.paymentMethod,
        };

        // 1. 최근 결제 정보 저장 (기존 방식)
        localStorage.setItem(
          'recentPaymentCompletion',
          JSON.stringify(paymentCompletionInfo)
        );

        // 2. 예약별 결제 완료 정보 저장 (중복 결제 방지용)
        const reservationPaymentKey = `payment_completed_${currentReservationId}`;
        localStorage.setItem(
          reservationPaymentKey,
          JSON.stringify(paymentCompletionInfo)
        );

        // 결제 완료 상태 업데이트
        setIsPaymentCompleted(true);
        setPaymentCompletionInfo(paymentCompletionInfo);

        // 결제 완료 페이지로 이동할 데이터 준비 (전역 변수로 저장)
        window.paymentCompleteData = {
          paymentResult: {
            id: paymentResult.id,
            reservationId: paymentResult.reservationId,
            amount: paymentResult.amount,
            paymentMethod: paymentResult.paymentMethod,
            status: paymentResult.status,
            paidAt: paymentResult.paidAt,
            customerName: paymentResult.customerName,
          },
          serviceInfo: paymentData.serviceInfo,
          totalAmount: paymentData.totalAmount,
        };

        // 🎉 예약 완료 모달 표시
        setShowReservationCompleteModal(true);
      }
    } catch (error) {
      console.error('❌ 결제 실패:', error);
      console.error('❌ 에러 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config,
      });

      // 결제 실패 시 진행 상태 제거
      localStorage.removeItem(paymentInProgressKey);

      let errorMessage = '결제 처리 중 오류가 발생했습니다.';

      if (error.response?.status === 403) {
        errorMessage = '결제 권한이 없습니다. 로그인 상태를 확인해주세요.';
        // 403 에러의 경우 로그인 페이지로 리다이렉트
        setTimeout(() => {
          navigate('/auth/signin');
        }, 2000);
      } else if (error.response?.status === 401) {
        errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
        // 401 에러의 경우 로그인 페이지로 리다이렉트
        setTimeout(() => {
          navigate('/auth/signin');
        }, 2000);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  // 예약 완료 모달 확인 핸들러
  const handleReservationCompleteConfirm = () => {
    setShowReservationCompleteModal(false);

    // 결제 완료 페이지로 이동
    if (window.paymentCompleteData) {
      navigate('/customer/payment-complete', {
        state: window.paymentCompleteData,
      });
      // 전역 변수 정리
      delete window.paymentCompleteData;
    }
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

              {/* 카카오페이 옵션 주석처리 */}
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

          {/* 카드 정보 입력 섹션 주석처리 */}
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

          {/* 카카오페이 정보 섹션 주석처리 */}
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

            {/* 결제 버튼 - 결제 완료 상태에 따라 조건부 렌더링 */}
            {isPaymentCompleted ? (
              <>
                <button className="payment-button disabled completed" disabled>
                  ✅ 결제 완료됨
                </button>
                <div
                  className="payment-notice success"
                  style={{ marginTop: '10px' }}
                >
                  <p style={{ fontWeight: 'bold' }}>
                    💳 이미 결제가 완료된 예약입니다.
                  </p>
                </div>
              </>
            ) : (
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
            )}

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

      {/* 예약 완료 모달 */}
      <Modal
        open={showReservationCompleteModal}
        title="🎉 예약 완료!"
        message="결제가 성공적으로 처리되었습니다.
예약이 완료되었습니다!"
        onClose={handleReservationCompleteConfirm}
        onConfirm={handleReservationCompleteConfirm}
        confirmText="확인"
      />
    </div>
  );
};

export default UserPayment;
