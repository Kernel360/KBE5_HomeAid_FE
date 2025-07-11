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

// 결제 상태 확인을 위한 간단한 함수 추가 (파일 최상단 근처에 추가)
const checkIfPaymentCompleted = async (reservationId) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return { isPaid: false, isRefunded: false, status: null };

    const API_BASE_URL =
      import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const response = await fetch(`${API_BASE_URL}/api/v1/my/payments/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const payment = result.data.find(
          (p) => p.reservationId === parseInt(reservationId)
        );
        if (payment) {
          console.log('🔒 결제 상태 확인:', payment);
          return {
            isPaid: payment.status === 'PAID',
            isRefunded:
              payment.status === 'REFUNDED' ||
              payment.status === 'PARTIAL_REFUNDED',
            status: payment.status,
            payment: payment,
          };
        }
      }
    }
  } catch (error) {
    console.error('결제 상태 확인 중 오류:', error);
  }
  return { isPaid: false, isRefunded: false, status: null };
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

  // 별도로 결제 정보를 조회하는 함수
  const checkPaymentStatus = useCallback(async (reservationId) => {
    try {
      console.log('🔍 별도 결제 정보 조회 시작:', reservationId);

      // 결제 정보 조회 API 호출 (여러 가능한 엔드포인트 시도)
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('❌ 인증 토큰이 없어 결제 정보 조회 생략');
        return null;
      }

      const baseUrl = getBaseUrl();

      // 먼저 결제 목록 API 시도
      try {
        const response = await fetch(`${baseUrl}/my/payments/list`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // 해당 예약의 결제 정보 찾기
            const payment = result.data.find(
              (p) => p.reservationId === parseInt(reservationId)
            );
            if (payment) {
              console.log(
                '✅ 결제 목록에서 해당 예약의 결제 정보 발견:',
                payment
              );

              // 결제 상태 업데이트
              setPaymentStatus(payment.status);
              setIsPaymentCompleted(payment.status === 'PAID');

              return payment;
            }
          }
        }
      } catch (error) {
        console.log('❌ 결제 목록 조회 실패:', error);
      }

      // 가능한 결제 정보 조회 엔드포인트들을 시도
      const possibleEndpoints = [
        `/my/payments?reservationId=${reservationId}`,
        `/customer/payments?reservationId=${reservationId}`,
        `/payments?reservationId=${reservationId}`,
        `/reservations/${reservationId}/payment`,
        `/customer/reservations/${reservationId}/payment`,
      ];

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔍 결제 정보 조회 시도: ${endpoint}`);

          const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const paymentData = await response.json();
            console.log('✅ 결제 정보 조회 성공:', { endpoint, paymentData });

            // 결제 데이터가 있으면 반환
            if (paymentData?.data) {
              return paymentData.data;
            } else if (paymentData && typeof paymentData === 'object') {
              return paymentData;
            }
          } else if (response.status === 404) {
            console.log(`ℹ️ ${endpoint}: 결제 정보 없음 (404)`);
            continue;
          } else if (response.status === 403) {
            console.log(`⚠️ ${endpoint}: 권한 없음 (403)`);
            continue;
          } else {
            console.log(`❌ ${endpoint}: 오류 (${response.status})`);
            continue;
          }
        } catch (error) {
          console.log(`❌ ${endpoint}: 네트워크 오류`, error);
          continue;
        }
      }

      console.log('ℹ️ 모든 엔드포인트에서 결제 정보를 찾을 수 없음');
      return null;
    } catch (error) {
      console.error('❌ 결제 정보 조회 중 오류:', error);
      return null;
    }
  }, []);

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
          // ⭐️ 디버깅: 백엔드에서 받은 데이터 전체 확인
          console.log('📋 백엔드 예약 데이터 전체:', data);
          console.log('📋 결제 관련 데이터 확인:', {
            paymentId: data.paymentId,
            paidAt: data.paidAt,
            paymentStatus: data.paymentStatus,
            isPaid: data.isPaid,
            payment: data.payment,
            paymentInfo: data.paymentInfo,
            paymentResult: data.paymentResult,
            status: data.status,
          });

          // ⭐️ 별도 결제 정보 조회 시도
          let additionalPaymentInfo = null;
          try {
            additionalPaymentInfo = await checkPaymentStatus(reservationId);
            console.log('💳 별도 조회한 결제 정보:', additionalPaymentInfo);
          } catch (error) {
            console.log('⚠️ 별도 결제 정보 조회 실패 (무시):', error);
          }

          const transformedReservation = {
            id: data.reservationId || data.id || reservationId,
            reservationId: data.reservationId || data.id || reservationId,
            type: data.serviceOptionName || getServiceName(1, '청소', data),
            icon: getServiceIcon(1),
            status: data.status || 'REQUESTED',
            startTime: data.startTime,
            price: data.totalPrice || getServicePrice(null, 1, '청소', data),

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

            // ⭐️ 별도 조회한 결제 정보도 포함
            paymentInfo: additionalPaymentInfo,

            // ⭐️ 백엔드 DTO의 모든 필드들을 보존하여 결제 상태 확인에 사용
            backendData: {
              ...data,
              // 중첩된 데이터 구조가 있을 경우 평탄화
              paymentId:
                data.paymentId || data.payment?.id || additionalPaymentInfo?.id,
              paidAt:
                data.paidAt ||
                data.payment?.paidAt ||
                additionalPaymentInfo?.paidAt,
              paymentStatus:
                data.paymentStatus ||
                data.payment?.status ||
                additionalPaymentInfo?.status,
              isPaid:
                data.isPaid ||
                data.payment?.isPaid ||
                additionalPaymentInfo?.isPaid ||
                (additionalPaymentInfo &&
                  additionalPaymentInfo.status === 'PAID'),
              // 별도 조회한 결제 정보 추가
              additionalPaymentInfo: additionalPaymentInfo,
            },
          };

          // ⭐️ 디버깅: 최종 변환된 예약 데이터 확인
          console.log('🎯 최종 변환된 예약 데이터:', transformedReservation);
          console.log(
            '🎯 변환된 백엔드 데이터:',
            transformedReservation.backendData
          );

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
  }, [reservationId, getReservationById, location.state, checkPaymentStatus]);

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

  const formatTimeRange = (startTime, durationMinutes = 180) => {
    if (!startTime) return '시간 정보 없음';

    const timeStr = startTime.includes(':')
      ? startTime.substring(0, 5)
      : startTime;

    if (!durationMinutes) return timeStr;

    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;

    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
    return `${timeStr} ~ ${endTime}`;
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

  // 결제 상태 state 추가
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

  const canMakePayment = (status) => {
    console.log('🔍 결제 가능 여부 확인 시작:', {
      status,
      reservationId: reservation?.id || reservationId,
      paymentStatus,
      isPaymentCompleted,
      backendData: reservation?.backendData,
      fullReservation: reservation, // 전체 예약 객체 로그
    });

    // ⭐️ 사용자 디버깅 안내
    console.log(`
    🔧 결제 버튼 문제 디버깅 안내:
    1. 브라우저 개발자 도구(F12)를 열어주세요
    2. Console 탭에서 위의 로그를 확인하세요
    3. 'backendData'와 'fullReservation' 객체에서 결제 관련 필드를 찾아보세요
    4. 결제가 완료되었다면 paymentId, paidAt, paymentStatus 등의 필드가 있어야 합니다
    `);

    // 0. 결제 상태 API 조회 결과 우선 확인 (비동기 처리)
    const currentReservationId = reservation?.id || reservationId;

    // 즉시 결제 상태 확인 (동기적 처리를 위해)
    if (isPaymentCompleted || paymentStatus === 'PAID') {
      console.log('🔒 API 조회 결과로 결제 완료 확인 - 결제 버튼 비활성화:', {
        paymentStatus,
        isPaymentCompleted,
      });
      return false;
    }

    // 1. localStorage에서 최근 결제 완료 정보 확인
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
      }
    }

    // 2. 백엔드 데이터에서 결제 정보 확인 (다양한 데이터 구조 지원)
    if (reservation?.backendData) {
      const backendData =
        reservation.backendData.data || reservation.backendData;

      console.log('🔍 백엔드 데이터 상세 확인:', {
        'entire backendData': backendData,
        'backendData keys': Object.keys(backendData),
        paymentId: backendData.paymentId,
        paidAt: backendData.paidAt,
        paymentStatus: backendData.paymentStatus,
        isPaid: backendData.isPaid,
        status: backendData.status,
        // 가능한 모든 결제 관련 필드 확인
        payment: backendData.payment,
        paymentInfo: backendData.paymentInfo,
        paymentResult: backendData.paymentResult,
        paymentDetails: backendData.paymentDetails,
        paymentData: backendData.paymentData,
        isPaymentCompleted: backendData.isPaymentCompleted,
        paymentCompleted: backendData.paymentCompleted,
        // 상태 관련 필드들
        reservationStatus: backendData.reservationStatus,
        currentStatus: backendData.currentStatus,
        // 별도 조회한 결제 정보
        additionalPaymentInfo: backendData.additionalPaymentInfo,
      });

      // 다양한 결제 완료 상태 체크 (더 확장된 버전)
      const hasPayment =
        // 기존 체크 필드들
        backendData.paymentId ||
        backendData.paidAt ||
        backendData.paymentStatus === 'PAID' ||
        backendData.paymentStatus === 'COMPLETED' ||
        backendData.isPaid === true ||
        // 추가적인 결제 완료 상태 확인
        backendData.payment ||
        backendData.paymentInfo ||
        backendData.paymentResult ||
        backendData.paymentDetails ||
        backendData.paymentData ||
        backendData.isPaymentCompleted === true ||
        backendData.paymentCompleted === true ||
        // 상태가 이미 결제 완료를 의미하는 경우
        backendData.status === 'PAID' ||
        // 예약 상태가 결제 완료 이후 단계인지 확인
        (backendData.status === 'MATCHED' && backendData.paymentStatus) ||
        (status === 'completed' && backendData.paymentStatus) ||
        // 별도 조회한 결제 정보 확인
        backendData.additionalPaymentInfo;

      if (hasPayment) {
        console.log('🔒 백엔드에서 결제 완료 확인 - 결제 버튼 비활성화:', {
          hasPayment: true,
          paymentId: backendData.paymentId,
          paidAt: backendData.paidAt,
          paymentStatus: backendData.paymentStatus,
          isPaid: backendData.isPaid,
          payment: backendData.payment,
          paymentInfo: backendData.paymentInfo,
          paymentResult: backendData.paymentResult,
          status: backendData.status,
          additionalPaymentInfo: backendData.additionalPaymentInfo,
        });
        return false;
      }
    }

    // 3. 실제 예약 객체 자체에서도 결제 정보 확인
    if (reservation) {
      console.log('🔍 예약 객체 직접 확인:', {
        'reservation keys': Object.keys(reservation),
        paymentId: reservation.paymentId,
        paidAt: reservation.paidAt,
        paymentStatus: reservation.paymentStatus,
        isPaid: reservation.isPaid,
        payment: reservation.payment,
        paymentInfo: reservation.paymentInfo,
      });

      const reservationHasPayment =
        reservation.paymentId ||
        reservation.paidAt ||
        reservation.paymentStatus === 'PAID' ||
        reservation.paymentStatus === 'COMPLETED' ||
        reservation.isPaid === true ||
        reservation.payment ||
        reservation.paymentInfo;

      if (reservationHasPayment) {
        console.log('🔒 예약 객체에서 결제 완료 확인 - 결제 버튼 비활성화');
        return false;
      }
    }

    // 4. ⭐️ 임시 해결책: "completed" 상태이고 현재 시간이 예약 생성 시간보다 30분 이후라면 결제 완료로 간주
    if (status === 'completed' || status === 'MATCHED') {
      const reservationCreatedAt =
        reservation?.createdAt || reservation?.backendData?.createdAt;
      if (reservationCreatedAt) {
        const createdTime = new Date(reservationCreatedAt);
        const now = new Date();
        const timeDiff = now - createdTime;
        const thirtyMinutes = 30 * 60 * 1000; // 30분을 밀리초로

        if (timeDiff > thirtyMinutes) {
          console.log(
            '🔒 임시 해결책: 생성 후 30분 경과된 completed/MATCHED 상태 - 결제 완료로 간주'
          );
          return false;
        }
      }
    }

    // 5. 예약 상태별 결제 가능 여부 확인
    // 서비스 완료 상태 확인
    if (status === 'COMPLETED' || status === 'visited') {
      console.log('🔒 서비스 완료 상태 - 결제 불가능:', status);
      return false;
    }

    // 취소된 예약 확인
    if (status === 'CANCELLED' || status === 'cancelled') {
      console.log('🔒 취소된 예약 - 결제 불가능:', status);
      return false;
    }

    // 6. UserReservationList.jsx와 동일한 결제 완료 상태 체크 로직 추가
    // localStorage에서 결제 완료 상태 확인 (UserReservationList.jsx와 동일)
    const paymentCompletedKey = `payment_completed_${currentReservationId}`;
    const reservationStatusKey = `reservation_status_${currentReservationId}`;

    const paymentCompleted = localStorage.getItem(paymentCompletedKey);
    const reservationStatus = localStorage.getItem(reservationStatusKey);

    if (paymentCompleted || reservationStatus) {
      try {
        const statusData = reservationStatus
          ? JSON.parse(reservationStatus)
          : null;
        if (
          statusData?.status === 'COMPLETED' &&
          statusData?.paymentCompleted
        ) {
          console.log('🔒 localStorage 예약 상태에서 결제 완료 확인:', {
            reservationId: currentReservationId,
            statusData,
          });
          return false;
        }
      } catch (error) {
        console.error('예약 상태 파싱 오류:', error);
      }
    }

    // 7. 매칭 완료 상태에서만 결제 가능
    const canPay = status === 'MATCHED' || status === 'completed';

    console.log('💳 최종 결제 가능 여부 결정:', {
      status,
      canPay,
      hasBackendData: !!reservation?.backendData,
      reservationId: reservation?.id || reservationId,
      '최종 결정': canPay,
    });

    return canPay;
  };

  const handlePayment = () => {
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
    setLoading(true);

    try {
      const updatedReservation = await getReservationById(reservationId);
      const data = updatedReservation.data;

      if (data) {
        console.log('🔄 새로고침된 백엔드 데이터:', data);
        console.log('🔄 새로고침된 결제 관련 데이터:', {
          paymentId: data.paymentId,
          paidAt: data.paidAt,
          paymentStatus: data.paymentStatus,
          isPaid: data.isPaid,
          payment: data.payment,
          status: data.status,
        });

        const refreshedReservation = {
          id: data.reservationId || data.id || reservationId,
          reservationId: data.reservationId || data.id || reservationId,
          type: data.serviceOptionName || getServiceName(1, '청소', data),
          icon: getServiceIcon(1),
          status: data.status || 'REQUESTED',
          startTime: data.startTime,
          price: data.totalPrice || getServicePrice(null, 1, '청소', data),
          address: (() => {
            const mainAddress = data.address || reservation?.address || '';
            const detailAddress =
              data.addressDetail || reservation?.addressDetail || '';
            if (mainAddress && detailAddress)
              return `${mainAddress} ${detailAddress}`;
            if (mainAddress) return mainAddress;
            if (detailAddress) return detailAddress;
            return '주소 정보 없음';
          })(),
          customerNote: data.customerMemo || '',
          createdAt: data.startTime || new Date().toISOString(),
          // ⭐️ 백엔드 DTO의 모든 필드들을 보존하여 결제 상태 확인에 사용
          backendData: {
            ...data,
            // 중첩된 데이터 구조가 있을 경우 평탄화
            paymentId: data.paymentId || data.payment?.id,
            paidAt: data.paidAt || data.payment?.paidAt,
            paymentStatus: data.paymentStatus || data.payment?.status,
            isPaid: data.isPaid || data.payment?.isPaid,
          },
        };

        setReservation(refreshedReservation);
        console.log('✅ 예약 정보 새로고침 완료:', refreshedReservation);
      }
    } catch (error) {
      console.error('❌ 예약 정보 새로고침 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [reservationId, getReservationById, reservation]);

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

  const getServicePrice = (
    totalPrice,
    subOptionId,
    subOptionName,
    backendData
  ) => {
    if (totalPrice && totalPrice > 0) return totalPrice;

    if (backendData?.totalPrice && backendData.totalPrice > 0)
      return backendData.totalPrice;
    if (backendData?.price && backendData.price > 0) return backendData.price;

    if (subOptionName) {
      if (subOptionName.includes('빨래') || subOptionName.includes('세탁'))
        return 40000;
      if (subOptionName.includes('청소')) return 58000;
      if (subOptionName.includes('육아')) return 62000;
    }

    const priceMapping = {
      1: 40000,
      2: 58000,
      3: 62000,
    };

    if (subOptionId && priceMapping[subOptionId]) {
      return priceMapping[subOptionId];
    }

    return 50000;
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

      const backendReservation = await getReservationById(reservationId);
      const data = backendReservation.data;

      const response = await fetch(
        `${getBaseUrl()}/customer/matchings/${data.data.matchingId}/to-manager`,
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

      if (data) {
        const transformedReservation = {
          id: data.reservationId || data.id || reservationId,
          type: data.serviceOptionName || getServiceName(1, '청소', data),
          icon: getServiceIcon(1),
          status: data.status || 'REQUESTED',
          date: data.requestedDate,
          time: data.requestedTime,
          price: data.totalPrice || getServicePrice(null, 1, '청소', data),

          address: (() => {
            const mainAddress = data.address || reservation?.address || '';
            const detailAddress =
              data.addressDetail || reservation?.addressDetail || '';
            if (mainAddress && detailAddress)
              return `${mainAddress} ${detailAddress}`;
            if (mainAddress) return mainAddress;
            if (detailAddress) return detailAddress;
            return '주소 정보 없음';
          })(),
          addressDetail: '',

          customerNote: data.customerMemo || '',
          createdAt: data.startTime || new Date().toISOString(),

          backendData: data,
        };

        setReservation(transformedReservation);
      }

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
      price: getServicePrice(null, 2, '청소', {}),
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

  const price = detail.totalPrice ?? reservation.price ?? 0;

  const type = detail.serviceOptionName ?? reservation.type ?? '서비스';

  const date = detail.startTime
    ? detail.startTime.split('T')[0]
    : '요청 날짜 없음';

  const time = detail.startTime.split('T')[1]
    ? formatTimeRange(
        detail.startTime.split('T')[1],
        (detail.totalDuration ?? 3) * 60
      )
    : (reservation.time ?? '시간 정보 없음');

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
              <div className="info-row">
                <span className="info-label">예약 금액</span>
                <span className="info-value price">
                  {price.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

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

          <PaymentButtonWrapper
            reservationId={reservationId}
            status={status}
            price={price}
            managerName={managerName}
            onPayment={handlePayment}
            canMakePayment={canMakePayment}
            checkIfPaymentCompleted={checkIfPaymentCompleted}
          />

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
            <div
              className="cancelled-section"
              style={{
                backgroundColor: '#ffebee',
                border: '2px solid #f44336',
                borderRadius: '12px',
                padding: '20px',
                margin: '15px 0',
              }}
            >
              <div className="cancelled-info">
                <p
                  className="cancelled-notice"
                  style={{
                    color: '#d32f2f',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    margin: '0 0 10px 0',
                    textAlign: 'center',
                  }}
                >
                  ❌ 예약이 취소되었습니다.
                </p>
                <p
                  className="cancelled-description"
                  style={{
                    color: '#c62828',
                    fontSize: '14px',
                    textAlign: 'center',
                    margin: '10px 0 0 0',
                  }}
                >
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

// PaymentButtonWrapper 컴포넌트 정의 (파일 하단에 추가)
const PaymentButtonWrapper = ({
  reservationId,
  status,
  price,
  managerName,
  onPayment,
  canMakePayment,
  checkIfPaymentCompleted,
}) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPayment = async () => {
      setIsLoading(true);
      const paymentResult = await checkIfPaymentCompleted(reservationId);
      setPaymentStatus(paymentResult);
      setIsLoading(false);
    };

    if (reservationId) {
      checkPayment();
    }
  }, [reservationId, checkIfPaymentCompleted]);

  if (isLoading) {
    return (
      <div className="payment-section">
        <div className="payment-info">
          <p className="payment-notice">결제 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  // 환불 완료 상태
  if (paymentStatus?.isRefunded) {
    return (
      <div
        className="refund-completed-section"
        style={{
          backgroundColor: '#fff3e0',
          border: '2px solid #ff9800',
          borderRadius: '12px',
          padding: '20px',
          margin: '15px 0',
        }}
      >
        <div className="refund-completed-info">
          <p
            className="refund-completed-notice"
            style={{
              color: '#ef6c00',
              fontWeight: 'bold',
              fontSize: '16px',
              margin: '0 0 10px 0',
              textAlign: 'center',
            }}
          >
            ↩️ 환불이 완료되었습니다!
          </p>
          {paymentStatus?.payment?.paidAt && (
            <div
              className="refund-date-info"
              style={{
                backgroundColor: '#ffe0b2',
                padding: '10px',
                borderRadius: '8px',
                margin: '10px 0',
                fontSize: '14px',
              }}
            >
              <span
                className="refund-date-label"
                style={{ color: '#bf360c', fontWeight: 'bold' }}
              >
                결제 일시:
              </span>
              <span
                className="refund-date-value"
                style={{ color: '#e65100', marginLeft: '8px' }}
              >
                {new Date(paymentStatus.payment.paidAt).toLocaleString('ko-KR')}
              </span>
            </div>
          )}
          <div className="refund-info">
            <p
              className="refund-notice"
              style={{
                color: '#f57c00',
                fontSize: '14px',
                textAlign: 'center',
                margin: '10px 0 0 0',
              }}
            >
              💰 환불 처리가 완료되었습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 결제 완료 상태
  if (paymentStatus?.isPaid) {
    return (
      <div className="payment-completed-section">
        <div className="payment-completed-info">
          <p className="payment-completed-notice">✅ 결제가 완료되었습니다!</p>
          {paymentStatus?.payment?.paidAt && (
            <div className="payment-date-info">
              <span className="payment-date-label">결제 일시:</span>
              <span className="payment-date-value">
                {new Date(paymentStatus.payment.paidAt).toLocaleString('ko-KR')}
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
    );
  }

  // 결제 가능 상태
  if (canMakePayment(status)) {
    return (
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
        <button className="payment-btn" onClick={onPayment}>
          💳 {price.toLocaleString()}원 결제하기
        </button>
      </div>
    );
  }

  return null;
};

export default UserReservationDetail;
