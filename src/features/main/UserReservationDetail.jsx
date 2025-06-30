import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import './UserReservationDetail.css';
import { useCustomerReservation } from '../reservation/hooks/useCustomerAPI.js';

// API 기본 URL 구성
const getBaseUrl = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
  return `${API_BASE_URL}/api/${API_VERSION}`;
};

const UserReservationDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: reservationId } = useParams();

  const { getReservationById } = useCustomerReservation();

  const [reservation, setReservation] = useState(
    location.state?.reservation || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectMemo, setRejectMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadReservationDetail = async () => {
      if (!reservationId) {
        setError('예약 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🔍 예약 상세 조회 시작 - reservationId:', reservationId);

        const backendReservation = await getReservationById(reservationId);
        const data = backendReservation.data;

        console.log('✅ API 호출 완료 - 백엔드 응답:', backendReservation);

        if (data) {
          // ⭐️ 디버깅: 백엔드에서 받은 주소 데이터 확인
          console.log('📋 백엔드 예약 데이터 전체:', data);
          console.log('📍 주소 관련 필드들:', {
            address: data.address,
            addressDetail: data.addressDetail,
            customerAddress: data.customerAddress,
            fullAddress: data.fullAddress,
          });

          const transformedReservation = {
            id: data.reservationId || data.id || reservationId,
            type: data.serviceOptionName || getServiceName(1, '청소', data),
            icon: getServiceIcon(1),
            status: data.status || 'REQUESTED',
            // 예약 목록에서 전달된 데이터를 우선 사용
            date: location.state?.reservation?.date || data.requestedDate,
            time: location.state?.reservation?.time || data.requestedTime,
            requestedDate:
              location.state?.reservation?.requestedDate || data.requestedDate,
            requestedTime:
              location.state?.reservation?.requestedTime || data.requestedTime,
            price: data.totalPrice || getServicePrice(),

            // ⭐️ address와 addressDetail을 모두 받아와서 조합
            address: (() => {
              const mainAddress =
                data.address || location.state?.reservation?.address || '';
              const detailAddress =
                data.addressDetail ||
                location.state?.reservation?.addressDetail ||
                '';
              if (mainAddress && detailAddress)
                return `${mainAddress} ${detailAddress}`;
              if (mainAddress) return mainAddress;
              if (detailAddress) return detailAddress;
              return '주소 정보 없음';
            })(),
            addressDetail: '', // 상세 주소는 별도로 표시하지 않음

            customerNote: data.customerMemo || '',
            createdAt: data.startTime || new Date().toISOString(),

            // ⭐️ 백엔드 DTO의 추가 필드들도 보존
            backendData: data,
          };

          // ⭐️ 디버깅: 최종 변환된 예약 데이터 확인
          console.log('🎯 최종 변환된 예약 데이터:', transformedReservation);

          setReservation(transformedReservation);
        } else {
          console.error('❌ 백엔드에서 예약 데이터를 받지 못함');
          setError('예약 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('❌ 예약 상세 조회 실패:', err);

        if (location.state?.reservation) {
          console.log('🔄 URL state 데이터로 fallback');
          setReservation(location.state.reservation);
          setError(null);
        } else {
          setError(`예약 정보를 불러오는데 실패했습니다: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadReservationDetail();
  }, [reservationId, getReservationById, location.state]);

  const getServiceName = (subOptionId, subOptionName, backendData) => {
    if (subOptionName) return subOptionName;

    if (backendData?.subOptionName) return backendData.subOptionName;
    if (backendData?.serviceName) return backendData.serviceName;
    if (backendData?.type) return backendData.type;

    const serviceMapping = {
      1: '빨래/세탁',
      2: '청소',
      3: '육아',
    };

    if (subOptionId && serviceMapping[subOptionId]) {
      return serviceMapping[subOptionId];
    }

    return '서비스';
  };

  const getServiceIcon = (subOptionId) => {
    const iconMapping = {
      1: 'laundry',
      2: 'cleaning',
      3: 'childcare',
    };
    return iconMapping[subOptionId] || 'home';
  };

  const getServiceEmoji = (icon) => {
    const emojiMapping = {
      cleaning: '🧹',
      laundry: '👕',
      childcare: '👶',
      home: '🏠',
    };
    return emojiMapping[icon] || '🏠';
  };

  const getStatusText = (status) => {
    const statusMapping = {
      pending: '예약 요청됨',
      REQUESTED: '예약 요청됨',
      MATCHING: '매니저 매칭 중',
      MATCHED: '매칭 완료',
      completed: '매칭 완료',
      COMPLETED: '서비스 완료',
      visited: '서비스 완료',
      CANCELLED: '예약 취소됨',
      cancelled: '예약 취소됨',
    };
    return statusMapping[status] || '알 수 없음';
  };

  const getStatusColor = (status) => {
    const colorMapping = {
      pending: '#ffc107',
      REQUESTED: '#ffc107',
      MATCHING: '#17a2b8',
      MATCHED: '#28a745',
      completed: '#28a745',
      COMPLETED: '#6c757d',
      visited: '#6c757d',
      CANCELLED: '#dc3545',
      cancelled: '#dc3545',
    };
    return colorMapping[status] || '#6c757d';
  };

  const canMakePayment = (status) => {
    // 디버깅을 위한 상세 로그
    console.log('💳 결제 가능 여부 확인 시작:', {
      status,
      reservation,
      backendData: reservation?.backendData,
    });

    const currentReservationId = reservation.id || reservationId;

    // 1. 백엔드 데이터에서 결제 정보 확인 (최우선 - 실제 DB 상태)
    const backendData =
      reservation?.backendData?.data || reservation?.backendData || {};

    // 결제 관련 필드들을 확인 (더 포괄적으로)
    const hasBackendPayment =
      backendData.paymentId ||
      backendData.paidAt ||
      backendData.paymentStatus === 'PAID' ||
      backendData.paymentStatus === 'COMPLETED' ||
      backendData.paymentStatus === 'SUCCESS' ||
      backendData.paymentStatus === 'COMPLETE' ||
      backendData.isPaid === true ||
      backendData.paid === true ||
      backendData.status === 'PAID' ||
      // 추가 결제 완료 상태 확인
      backendData.paymentCompleted === true ||
      backendData.payment_completed === true ||
      backendData.payment_status === 'PAID' ||
      backendData.payment_status === 'COMPLETED' ||
      backendData.payment_status === 'SUCCESS' ||
      // 금액 정보와 결제 일시가 모두 있는 경우
      (backendData.totalPrice && backendData.paidAt) ||
      (backendData.amount && backendData.paymentDate) ||
      // 결제 ID와 상태가 모두 있는 경우
      (backendData.paymentId && backendData.paymentStatus);

    if (hasBackendPayment) {
      console.log('🔒 백엔드에서 결제 완료 확인 - 결제 버튼 비활성화:', {
        paymentId: backendData.paymentId,
        paidAt: backendData.paidAt,
        paymentStatus: backendData.paymentStatus,
        isPaid: backendData.isPaid,
        paid: backendData.paid,
        status: backendData.status,
        paymentCompleted: backendData.paymentCompleted,
        payment_completed: backendData.payment_completed,
        payment_status: backendData.payment_status,
        totalPrice: backendData.totalPrice,
        amount: backendData.amount,
        paymentDate: backendData.paymentDate,
        allBackendData: backendData, // 전체 백엔드 데이터 확인용
      });
      return false;
    }

    // 2. localStorage에서 결제 완료 정보 확인 (백엔드 정보가 없을 때)
    console.log('🔄 localStorage에서 결제 완료 정보 확인');

    // 일반 결제 완료 정보 확인
    const recentPaymentCompletion = localStorage.getItem(
      'recentPaymentCompletion'
    );
    if (recentPaymentCompletion) {
      try {
        const paymentInfo = JSON.parse(recentPaymentCompletion);
        if (paymentInfo.reservationId === parseInt(currentReservationId)) {
          console.log(
            '🔒 localStorage에서 결제 완료 확인 - 결제 버튼 비활성화:',
            paymentInfo
          );
          return false;
        }
      } catch (error) {
        console.error('localStorage 결제 정보 파싱 오류:', error);
        // 파싱 오류 시 제거
        localStorage.removeItem('recentPaymentCompletion');
      }
    }

    // 예약별 결제 완료 정보 확인
    const reservationPaymentKey = `payment_completed_${currentReservationId}`;
    const reservationPaymentData = localStorage.getItem(reservationPaymentKey);
    if (reservationPaymentData) {
      try {
        const paymentInfo = JSON.parse(reservationPaymentData);
        console.log(
          '🔒 예약별 결제 완료 확인 - 결제 버튼 비활성화:',
          paymentInfo
        );
        return false;
      } catch (error) {
        console.error('예약별 결제 정보 파싱 오류:', error);
        // 파싱 오류 시 제거
        localStorage.removeItem(reservationPaymentKey);
      }
    }

    // 3. 결제 진행 중 상태 확인 (최근 10분 이내만)
    const paymentInProgress = localStorage.getItem('paymentInProgress');
    if (paymentInProgress) {
      try {
        const progressInfo = JSON.parse(paymentInProgress);
        const timeDiff = new Date().getTime() - progressInfo.timestamp;

        if (
          progressInfo.reservationId === parseInt(currentReservationId) &&
          timeDiff < 10 * 60 * 1000
        ) {
          // 10분 이내
          console.log(
            '🔒 결제 진행 중 상태 확인 - 결제 버튼 비활성화:',
            progressInfo
          );
          return false;
        } else if (timeDiff >= 10 * 60 * 1000) {
          // 10분이 지나면 진행 상태 제거
          localStorage.removeItem('paymentInProgress');
        }
      } catch (error) {
        console.error('localStorage 결제 진행 정보 파싱 오류:', error);
      }
    }

    // 4. 서비스 완료 상태 확인
    if (status === 'COMPLETED' || status === 'visited') {
      console.log('🔒 서비스 완료 상태 - 결제 버튼 비활성화');
      return false;
    }

    // 5. 취소된 예약 확인
    if (status === 'CANCELLED' || status === 'cancelled') {
      console.log('🔒 취소된 예약 - 결제 버튼 비활성화');
      return false;
    }

    // 6. 매칭 완료 상태에서만 결제 가능 (다양한 매칭 상태 확인)
    const matchedStatuses = [
      'MATCHED', // 기본 매칭 완료
      'matched', // 소문자
      'completed', // 완료
      'COMPLETED', // 대문자 완료
      'CONFIRMED', // 확정
      'confirmed', // 소문자 확정
      'ACCEPTED', // 수락
      'accepted', // 소문자 수락
      'READY', // 준비완료
      'ready', // 소문자 준비완료
    ];

    const canPay = matchedStatuses.includes(status);

    // 백엔드 데이터에서도 매칭 상태 확인
    const reservationBackendData =
      reservation?.backendData?.data || reservation?.backendData || {};
    const backendMatched =
      reservationBackendData.status &&
      matchedStatuses.includes(reservationBackendData.status);

    // 매칭된 관리자 정보가 있는지도 확인
    const hasMatchedManager =
      reservationBackendData.managerId ||
      reservationBackendData.manager ||
      reservationBackendData.matchedManagerId;

    const finalCanPay = canPay || backendMatched || hasMatchedManager;

    console.log('💳 최종 결제 가능 여부:', {
      status,
      backendStatus: reservationBackendData.status,
      canPay,
      backendMatched,
      hasMatchedManager,
      finalCanPay,
      hasBackendPayment,
      reservationId: currentReservationId,
    });

    return finalCanPay;
  };

  const handlePayment = () => {
    const currentReservationId = reservation?.id || reservationId;
    const currentStatus =
      reservation?.status || reservation?.backendData?.status;

    console.log('🔍 결제 버튼 클릭 - 상세 정보:', {
      reservationId: currentReservationId,
      status: currentStatus,
      reservation: reservation,
      backendData: reservation?.backendData,
    });

    // localStorage 상태 확인
    console.log('🔍 현재 localStorage 결제 관련 데이터:');
    const paymentKeys = ['recentPaymentCompletion', 'paymentInProgress'];
    paymentKeys.forEach((key) => {
      const data = localStorage.getItem(key);
      if (data) {
        console.log(`📦 ${key}:`, JSON.parse(data));
      }
    });

    // 예약별 결제 데이터 확인
    const reservationPaymentKey = `payment_completed_${currentReservationId}`;
    const reservationPaymentData = localStorage.getItem(reservationPaymentKey);
    if (reservationPaymentData) {
      console.log(
        `📦 ${reservationPaymentKey}:`,
        JSON.parse(reservationPaymentData)
      );
    }

    // 결제 가능 여부 재확인
    const canPay = canMakePayment(currentStatus);
    console.log('💳 결제 가능 여부:', canPay);

    if (!canPay) {
      console.log('❌ 결제 불가 - 사용자에게 알림');

      // 더 구체적인 안내 메시지
      const backendData =
        reservation?.backendData?.data || reservation?.backendData || {};
      let message = '결제할 수 없는 예약입니다.\n\n';

      if (backendData.paymentId || backendData.paidAt) {
        message += '이미 결제가 완료된 예약입니다.';
      } else if (currentStatus === 'COMPLETED' || currentStatus === 'visited') {
        message += '이미 서비스가 완료된 예약입니다.';
      } else if (
        currentStatus === 'CANCELLED' ||
        currentStatus === 'cancelled'
      ) {
        message += '취소된 예약입니다.';
      } else {
        const matchedStatuses = [
          'MATCHED',
          'matched',
          'completed',
          'COMPLETED',
          'CONFIRMED',
          'confirmed',
          'ACCEPTED',
          'accepted',
          'READY',
          'ready',
        ];
        const isMatched = matchedStatuses.includes(currentStatus);
        const backendData =
          reservation?.backendData?.data || reservation?.backendData || {};
        const backendMatched =
          backendData.status && matchedStatuses.includes(backendData.status);
        const hasManager =
          backendData.managerId ||
          backendData.manager ||
          backendData.matchedManagerId;

        if (!isMatched && !backendMatched && !hasManager) {
          message += `현재 예약 상태(${currentStatus})에서는 결제할 수 없습니다.\n매칭 완료 후 결제가 가능합니다.`;
        } else {
          message += '결제 정보를 확인 중입니다. 잠시 후 다시 시도해주세요.';
        }
      }

      alert(message);
      return;
    }

    // 결제 버튼 클릭 시 localStorage에 임시 결제 진행 상태 저장
    const paymentInProgress = {
      reservationId: currentReservationId,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem(
      'paymentInProgress',
      JSON.stringify(paymentInProgress)
    );

    console.log('💳 결제 페이지로 이동:', paymentInProgress);

    navigate('/customer/payment', {
      state: {
        reservation: reservation,
        fromDetail: true,
      },
    });
  };

  // 결제 완료 후 예약 정보 새로고침을 위한 함수
  const refreshReservationData = useCallback(async () => {
    if (!reservationId) return;

    console.log('🔄 예약 정보 새로고침 중...');

    try {
      const updatedReservation = await getReservationById(reservationId);

      // 기존 예약 데이터와 새로운 데이터를 병합하여 설정
      const mergedReservation = {
        ...reservation,
        ...updatedReservation,
        // 백엔드 데이터 업데이트
        backendData: {
          ...reservation?.backendData,
          ...updatedReservation?.data,
          data: {
            ...reservation?.backendData?.data,
            ...updatedReservation?.data,
          },
        },
      };

      setReservation(mergedReservation);
      console.log('✅ 예약 정보 새로고침 완료:', {
        original: reservation,
        updated: updatedReservation,
        merged: mergedReservation,
      });
    } catch (error) {
      console.error('❌ 예약 정보 새로고침 실패:', error);
    }
  }, [reservationId, reservation, getReservationById]);

  // 페이지 포커스 시 데이터 새로고침 (결제 완료 후 돌아왔을 때)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && reservationId) {
        console.log('📱 페이지 포커스 - 예약 정보 새로고침');
        refreshReservationData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshReservationData, reservationId]);

  // 결제 완료 후 돌아왔을 때 즉시 상태 업데이트
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('paymentSuccess');
    const fromPayment = location.state?.fromPayment;

    if (paymentSuccess === 'true' || fromPayment) {
      console.log('💳 결제 완료 후 돌아옴 - 즉시 새로고침');
      // 즉시 한 번, 그리고 추가로 2초 후에 한 번 더 새로고침
      refreshReservationData();
      setTimeout(() => {
        refreshReservationData();
      }, 2000); // 2초 후 추가 새로고침으로 백엔드 업데이트 확실히 반영
    }
  }, [location.state, refreshReservationData]);

  // 결제 완료 후 주기적 상태 확인 (5초마다)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('paymentSuccess');
    const fromPayment = location.state?.fromPayment;

    if (paymentSuccess === 'true' || fromPayment) {
      console.log('💳 결제 완료 후 주기적 상태 확인 시작');

      const intervalId = setInterval(() => {
        console.log('🔄 주기적 예약 정보 새로고침');
        refreshReservationData();
      }, 5000); // 5초마다

      // 30초 후 주기적 확인 중단
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        console.log('⏹️ 주기적 상태 확인 종료');
      }, 30000);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
  }, [location.state, refreshReservationData]);

  const getServicePrice = () => {
    // 통일된 금액 반환
    return 20000;
  };

  const handleMatchingResponse = async (action) => {
    if (action === 'REJECT') {
      setShowRejectModal(true);
      return;
    }

    await submitMatchingResponse(action);
  };

  const submitMatchingResponse = async (action, memo = '') => {
    if (!reservationId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('로그인이 필요합니다');
        navigate('/auth/signin');
        return;
      }

      const response = await fetch(
        `${getBaseUrl()}/customer/matchings/${reservationId}/to-manager`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: action,
            memo: memo,
          }),
        }
      );

      if (response.status === 401) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('accessToken');
        navigate('/auth/signin');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '매칭 응답 처리에 실패했습니다.');
      }

      const updatedReservation = await getReservationById(reservationId);
      setReservation(updatedReservation);

      setShowRejectModal(false);
      setRejectMemo('');

      alert(
        action === 'CONFIRM'
          ? '매칭이 확인되었습니다.'
          : '매칭이 거절되었습니다.'
      );
    } catch (error) {
      console.error('매칭 응답 처리 실패:', error);
      setError(
        error.message ||
          '매칭 응답 처리에 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-white flex flex-col"
        style={{ maxWidth: '512px', margin: '0 auto' }}
      >
        <Header
          showBackButton
          onBackClick={() => navigate('/customer/reservations')}
        />
        <div
          style={{
            width: '100%',
            paddingTop: '80px',
            paddingBottom: '100px',
            padding: '80px 16px 100px 16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="loading-container">
            <div className="loading-spinner">예약 정보를 불러오는 중...</div>
            <p
              style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}
            >
              예약 ID: {reservationId}
            </p>
          </div>
        </div>
        <Footer current="/customer/reservations" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-white flex flex-col"
        style={{ maxWidth: '512px', margin: '0 auto' }}
      >
        <Header
          showBackButton
          onBackClick={() => navigate('/customer/reservations')}
        />
        <div
          style={{
            width: '100%',
            paddingTop: '80px',
            paddingBottom: '100px',
            padding: '80px 16px 100px 16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="error-container">
            <p>{error}</p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              예약 ID: {reservationId}
            </p>
            <button onClick={() => navigate('/customer/reservations')}>
              목록으로 돌아가기
            </button>
          </div>
        </div>
        <Footer current="/customer/reservations" />
      </div>
    );
  }

  if (!reservation) {
    const defaultReservation = {
      id: reservationId,
      type: getServiceName(1, '청소', {}),
      icon: 'cleaning',
      status: 'REQUESTED',
      date: '날짜 정보 없음',
      time: '시간 정보 없음',
      price: getServicePrice(),
      address: '주소 정보 없음',
      addressDetail: '',
      customerNote: '',
      createdAt: new Date().toISOString(),
      backendData: {},
    };
    setReservation(defaultReservation);
  }

  const detail = reservation.backendData?.data || {};

  const address =
    (detail.address && detail.addressDetail
      ? `${detail.address} ${detail.addressDetail}`
      : detail.address
        ? detail.address
        : detail.addressDetail
          ? detail.addressDetail
          : reservation.address) || '주소 정보 없음';

  const customerNote =
    detail.customerMemo ?? reservation.customerNote ?? '요청사항 없음';

  const managerName =
    detail.matchedManagerName ??
    reservation.backendData?.matchedManagerName ??
    '배정된 매니저 없음';

  const price = 20000; // 통일된 금액

  const type = detail.serviceOptionName ?? reservation.type ?? '서비스';

  // 예약 목록과 동일한 방식으로 날짜와 시간 처리
  const date =
    reservation.requestedDate ||
    reservation.date ||
    detail.requestedDate ||
    '날짜 정보 없음';
  const time =
    reservation.requestedTime ||
    reservation.time ||
    detail.requestedTime ||
    '시간 정보 없음';

  const status = detail.status || reservation.status || 'REQUESTED';

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      style={{ maxWidth: '512px', margin: '0 auto' }}
    >
      <Header
        showBackButton
        onBackClick={() => navigate('/customer/reservations')}
      />
      <div
        style={{
          width: '100%',
          paddingTop: '80px',
          paddingBottom: '100px',
          padding: '80px 16px 100px 16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="reservation-detail-container">
          <div className="status-section">
            <div
              className="status-badge"
              style={{
                backgroundColor: getStatusColor(status),
              }}
            >
              {getStatusText(status)}
            </div>
          </div>

          <div className="info-section">
            <h3 className="section-title">
              <span className="section-icon">
                {getServiceEmoji(reservation?.icon || 'home')}
              </span>
              서비스 정보
            </h3>
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">서비스 유형</span>
                <span className="info-value">{type}</span>
              </div>
              {detail.totalDuration && (
                <div className="info-row">
                  <span className="info-label">예상 소요시간</span>
                  <span className="info-value">{detail.totalDuration}시간</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">예약 금액</span>
                <span className="info-value price">
                  {price.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          {/* 서비스 상세 옵션 정보 표시 */}
          {reservation?.selectedServices &&
            reservation.selectedServices.length > 0 && (
              <div className="info-section">
                <h3 className="section-title">
                  <span className="section-icon">⚙️</span>
                  선택한 서비스 옵션
                </h3>
                <div className="info-card">
                  {reservation.selectedServices.map((service, index) => (
                    <div key={index} className="info-row">
                      <span className="info-label">{service.name}</span>
                      <span className="info-value">
                        {service.price?.toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* 서비스 세부사항 표시 */}
          {reservation?.serviceDetails &&
            reservation.serviceDetails.length > 0 && (
              <div className="info-section">
                <h3 className="section-title">
                  <span className="section-icon">📋</span>
                  서비스 세부사항
                </h3>
                <div className="info-card">
                  {reservation.serviceDetails.map((detail, index) => (
                    <div key={index} className="info-row">
                      <span className="info-label">{detail.category}</span>
                      <span className="info-value">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          <div className="info-section">
            <h3 className="section-title">
              <span className="section-icon">📅</span>
              일정 정보
            </h3>
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">예약 날짜</span>
                <span className="info-value">{date}</span>
              </div>
              <div className="info-row">
                <span className="info-label">예약 시간</span>
                <span className="info-value">{time}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3 className="section-title">
              <span className="section-icon">📍</span>
              주소 정보
            </h3>
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">서비스 주소</span>
                <span className="info-value">{address}</span>
              </div>
            </div>
          </div>

          {customerNote && (
            <div className="info-section">
              <h3 className="section-title">
                <span className="section-icon">📝</span>
                고객 요청사항
              </h3>
              <div className="info-card">
                <div className="note-content">{customerNote}</div>
              </div>
            </div>
          )}

          <div className="info-section">
            <h3 className="section-title">
              <span className="section-icon">🔢</span>
              예약 정보
            </h3>
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">예약 번호</span>
                <span className="info-value">
                  {reservation?.id || reservationId}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">예약 일시</span>
                <span className="info-value">
                  {reservation?.createdAt
                    ? new Date(reservation.createdAt).toLocaleString('ko-KR')
                    : '정보 없음'}
                </span>
              </div>
            </div>
          </div>

          {canMakePayment(status) && (
            <div className="payment-section">
              <div className="payment-info">
                <p className="payment-notice">
                  매니저가 배정되었습니다! 이제 결제를 진행하세요.
                </p>
                <div className="manager-info">
                  <span className="manager-label">배정된 매니저:</span>
                  <span className="manager-value">{managerName}</span>
                </div>
              </div>
              <button className="payment-btn" onClick={handlePayment}>
                💳 {price.toLocaleString()}원 결제하기
              </button>
            </div>
          )}

          {!canMakePayment(status) &&
            (status === 'MATCHED' || status === 'completed') && (
              <div className="payment-completed-section">
                <div className="payment-completed-info">
                  <p className="payment-completed-notice">
                    ✅ 결제가 완료되었습니다!
                  </p>
                  {reservation?.backendData &&
                    reservation.backendData.paidAt && (
                      <div className="payment-date-info">
                        <span className="payment-date-label">결제 일시:</span>
                        <span className="payment-date-value">
                          {new Date(
                            reservation.backendData.paidAt
                          ).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    )}
                  <div className="service-ready-info">
                    <p className="service-ready-notice">
                      💼 매니저가 서비스 준비 중입니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {status === 'pending' ||
          status === 'REQUESTED' ||
          status === 'MATCHING' ? (
            <div className="waiting-section">
              <div className="waiting-info">
                {reservation?.backendData?.data?.matchingStatus ===
                'ACCEPTED' ? (
                  <>
                    <p className="waiting-notice">
                      🎉 매니저가 매칭되었습니다!
                    </p>
                    <p className="waiting-description">
                      매니저의 매칭을 확인해주세요.
                    </p>
                    <div className="matching-actions">
                      <button
                        className="accept-btn"
                        onClick={() => handleMatchingResponse('CONFIRM')}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? '처리 중...' : '확인'}
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleMatchingResponse('REJECT')}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? '처리 중...' : '거절'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="waiting-notice">
                      ⏳ 매니저 매칭을 기다리고 있습니다...
                    </p>
                    <p className="waiting-description">
                      매니저가 배정되면 결제를 진행할 수 있습니다.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : null}

          {showRejectModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>매칭 거절 사유</h3>
                <textarea
                  value={rejectMemo}
                  onChange={(e) => setRejectMemo(e.target.value)}
                  placeholder="거절 사유를 입력해주세요 (선택사항)"
                  rows={4}
                />
                <div className="modal-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectMemo('');
                    }}
                    disabled={isSubmitting}
                  >
                    취소
                  </button>
                  <button
                    className="submit-btn"
                    onClick={() => submitMatchingResponse('REJECT', rejectMemo)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '처리 중...' : '확인'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {(status === 'COMPLETED' || status === 'visited') && (
            <div className="service-completed-section">
              <div className="service-completed-info">
                <p className="service-completed-notice">
                  🎊 서비스가 완료되었습니다!
                </p>
                <p className="service-completed-description">
                  서비스를 이용해 주셔서 감사합니다.
                </p>
                <button
                  className="review-btn"
                  onClick={() => {
                    const targetReservationId =
                      reservation?.id || reservationId;
                    console.log(
                      '리뷰 쓰기 버튼 클릭 - reservationId:',
                      targetReservationId
                    );
                    console.log(
                      '리뷰 쓰기 이동 URL:',
                      `/customer/review/write?reservationId=${targetReservationId}`
                    );
                    navigate(
                      `/customer/review/write?reservationId=${targetReservationId}`
                    );
                  }}
                  style={{
                    marginTop: '15px',
                    padding: '12px 24px',
                    backgroundColor: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  리뷰 쓰기
                </button>
              </div>
            </div>
          )}

          {(status === 'CANCELLED' || status === 'cancelled') && (
            <div className="cancelled-section">
              <div className="cancelled-info">
                <p className="cancelled-notice">❌ 예약이 취소되었습니다.</p>
                <p className="cancelled-description">
                  새로운 예약을 원하시면 다시 신청해 주세요.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer current="/customer/reservations" />
    </div>
  );
};

export default UserReservationDetail;
