import { useState, useEffect, useCallback } from 'react';
import {
  getCustomerServices,
  getCustomerAddresses,
  createCustomerAddress,
  deleteCustomerAddress,
  createCustomerReservation,
  getCustomerReservation,
  getCustomerReservations,
  cancelCustomerReservation,
  getMatchedManagers,
  getManagerProfile,
  sendManagerMemo,
  requestPayment,
  handleApiError,
} from '../api/customerAPI';

// API 호출 상태 관리를 위한 기본 훅
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // API 호출 래퍼 함수
  const apiCall = useCallback(async (apiFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err.message);
      handleApiError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    clearError,
    apiCall,
  };
};

// 서비스 관리 훅
export const useCustomerServices = () => {
  const [services, setServices] = useState([]);
  const { loading, error, clearError, apiCall } = useApiCall();

  // 더미 서비스 데이터
  const dummyServices = [
    { id: 1, name: '화장실 청소', price: 15000, duration: 30 },
    { id: 2, name: '주방 청소', price: 20000, duration: 45 },
    { id: 3, name: '거실 청소', price: 18000, duration: 40 },
    { id: 4, name: '침실 청소', price: 12000, duration: 25 },
    { id: 5, name: '베란다 청소', price: 8000, duration: 20 },
    { id: 6, name: '창문 청소', price: 10000, duration: 30 },
    { id: 7, name: '에어컨 청소', price: 25000, duration: 60 },
    { id: 8, name: '냉장고 청소', price: 15000, duration: 35 },
  ];

  // 서비스 목록 로드
  const loadServices = useCallback(async () => {
    try {
      const serviceData = await apiCall(getCustomerServices);

      // 페이징된 응답에서 실제 데이터 배열 추출
      const list = serviceData.content || serviceData || [];

      if (list.length > 0) {
        // ⭐️ 실제 DB 데이터를 UI 형태로 변환
        const transformedServices = list.map((service) => ({
          id: service.id,
          name: service.name,
          price: service.base_price || service.basePrice || service.price,
          duration:
            service.duration_minutes ||
            service.durationMinutes ||
            service.duration ||
            60, // 분 단위
        }));

        setServices(transformedServices);
        return transformedServices;
      } else {
        setServices(dummyServices);
        return dummyServices;
      }
    } catch {
      setServices(dummyServices);
      return dummyServices;
    }
  }, [apiCall]);

  return {
    services,
    loading,
    error,
    clearError,
    loadServices,
  };
};

// 주소 관리 훅
export const useCustomerAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const { loading, error, clearError, apiCall } = useApiCall();

  // 주소 목록 로드
  const loadAddresses = useCallback(async () => {
    try {
      const addressData = await apiCall(getCustomerAddresses);

      if (addressData && addressData.length > 0) {
        setAddresses(addressData);
        return addressData;
      } else {
        setAddresses([]);
        return [];
      }
    } catch {
      // ⭐️ 에러 시에도 빈 배열 설정
      setAddresses([]);
      return [];
    }
  }, [apiCall]);

  // 새 주소 추가
  const addAddress = useCallback(
    async (addressData) => {
      try {
        const newAddress = await apiCall(createCustomerAddress, addressData);

        // 로컬 상태 업데이트 (즉시 반영)
        setAddresses((prev) => [...prev, newAddress]);
        return newAddress;
      } catch (err) {
        // 에러 타입별 상세 메시지
        if (err.message.includes('403')) {
          throw new Error(
            '주소 저장 권한이 없습니다. 로그인 상태를 확인해주세요.'
          );
        } else if (err.message.includes('400')) {
          throw new Error(
            '주소 정보가 올바르지 않습니다. 필수 정보를 확인해주세요.'
          );
        } else if (err.message.includes('409')) {
          throw new Error('이미 동일한 주소가 저장되어 있습니다.');
        } else {
          throw new Error(`주소 저장에 실패했습니다: ${err.message}`);
        }
      }
    },
    [apiCall]
  );

  // 주소 삭제
  const removeAddress = useCallback(
    async (addressId) => {
      try {
        await apiCall(deleteCustomerAddress, addressId);
        setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      } catch (err) {
        console.error('Failed to delete address:', err);
        throw err;
      }
    },
    [apiCall]
  );

  // 컴포넌트 마운트 시 주소 목록 로드
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  return {
    addresses,
    loading,
    error,
    clearError,
    loadAddresses,
    addAddress,
    removeAddress,
  };
};

// 예약 관리 훅
export const useCustomerReservation = () => {
  const [reservation, setReservation] = useState(null);
  const { loading, error, clearError, apiCall } = useApiCall();

  // 예약 생성
  const createReservation = useCallback(
    async (reservationData) => {
      try {
        // ReservationResponseDto 형태로 응답받음
        // { reservationId, status, totalPrice, totalDuration, subOptionName }
        const newReservation = await apiCall(
          createCustomerReservation,
          reservationData
        );
        setReservation(newReservation);
        return newReservation;
      } catch (err) {
        console.error('Failed to create reservation:', err);
        throw err;
      }
    },
    [apiCall]
  );

  // 예약 조회
  const loadReservation = useCallback(
    async (reservationId) => {
      try {
        const reservationData = await apiCall(
          getCustomerReservation,
          reservationId
        );
        setReservation(reservationData);
        return reservationData;
      } catch (err) {
        console.error('Failed to load reservation:', err);
        throw err;
      }
    },
    [apiCall]
  );

  // 예약 취소
  const cancelReservation = useCallback(
    async (reservationId) => {
      try {
        const result = await apiCall(cancelCustomerReservation, reservationId);
        if (reservation && reservation.reservationId === reservationId) {
          setReservation((prev) => ({ ...prev, status: 'CANCELLED' }));
        }
        return result;
      } catch (err) {
        console.error('Failed to cancel reservation:', err);
        throw err;
      }
    },
    [apiCall, reservation]
  );

  return {
    reservation,
    loading,
    error,
    clearError,
    createReservation,
    loadReservation,
    cancelReservation,
    getReservationById: loadReservation,
  };
};

// 매니저 관리 훅
export const useManagerMatching = () => {
  const [matchedManagers, setMatchedManagers] = useState([]);
  const [managerProfile, setManagerProfile] = useState(null);
  const { loading, error, clearError, apiCall } = useApiCall();

  // 매칭된 매니저 목록 조회
  const loadMatchedManagers = useCallback(
    async (reservationId) => {
      try {
        const managers = await apiCall(getMatchedManagers, reservationId);
        setMatchedManagers(managers);
        return managers;
      } catch (err) {
        console.error('Failed to load matched managers:', err);
      }
    },
    [apiCall]
  );

  // 매니저 상세 정보 조회
  const loadManagerProfile = useCallback(
    async (managerId) => {
      try {
        const profile = await apiCall(getManagerProfile, managerId);
        setManagerProfile(profile);
        return profile;
      } catch (err) {
        console.error('Failed to load manager profile:', err);
      }
    },
    [apiCall]
  );

  // 매니저에게 메모 전달
  const sendMemo = useCallback(
    async (reservationId, memoData) => {
      try {
        const result = await apiCall(sendManagerMemo, reservationId, memoData);
        return result;
      } catch (err) {
        console.error('Failed to send memo:', err);
        throw err;
      }
    },
    [apiCall]
  );

  return {
    matchedManagers,
    managerProfile,
    loading,
    error,
    clearError,
    loadMatchedManagers,
    loadManagerProfile,
    sendMemo,
  };
};

// 결제 관리 훅
export const useCustomerPayment = () => {
  const [paymentResult, setPaymentResult] = useState(null);
  const { loading, error, clearError, apiCall } = useApiCall();

  // 결제 요청
  const makePayment = useCallback(
    async (reservationId, paymentData) => {
      try {
        const result = await apiCall(
          requestPayment,
          reservationId,
          paymentData
        );
        setPaymentResult(result);
        return result;
      } catch (err) {
        console.error('Failed to process payment:', err);
        throw err;
      }
    },
    [apiCall]
  );

  return {
    paymentResult,
    loading,
    error,
    clearError,
    makePayment,
  };
};

// 예약 목록 관리 훅
export const useCustomerReservationList = () => {
  const [reservations, setReservations] = useState({
    pending: [],
    completed: [],
    visited: [],
    cancelled: [],
  });
  const { loading, error, clearError, apiCall } = useApiCall();

  // 예약 목록 로드
  const loadReservations = useCallback(
    async (page = 0, size = 20) => {
      try {
        const response = await apiCall(getCustomerReservations, page, size);

        // Spring Boot PagedResponseDto 구조 처리
        const reservationList =
          response.content || response.data || response || [];

        // ⭐️ 각 예약에 대해 상세 정보 추가 조회
        const enrichedReservations = await Promise.all(
          reservationList.map(async (reservation) => {
            try {
              // 개별 예약 상세 조회로 누락된 정보 보완
              const detailData = await apiCall(
                getCustomerReservation,
                reservation.reservationId
              );

              // ⭐️ 결제 정보도 함께 조회 시도 (있다면)
              let paymentInfo = null;
              try {
                // 결제 정보 조회 API가 있다면 호출
                // paymentInfo = await apiCall(getCustomerPayment, reservation.reservationId);
              } catch {
                // 결제 정보 조회 실패는 무시 (아직 결제하지 않은 예약일 수 있음)
              }

              // 상세 정보와 목록 정보 병합
              return {
                ...reservation,
                ...detailData,
                // ⭐️ 결제 정보 추가
                paymentInfo: paymentInfo,
                // 기존 데이터 우선, 상세 데이터로 보완
                requestedDate:
                  detailData.requestedDate || reservation.requestedDate,
                requestedTime:
                  detailData.requestedTime || reservation.requestedTime,
                totalPrice: detailData.totalPrice || reservation.totalPrice,
                totalDuration:
                  detailData.totalDuration || reservation.totalDuration,
                address: detailData.address || reservation.address,
                customerNote:
                  detailData.customerNote || reservation.customerNote,
              };
            } catch {
              // 상세 조회 실패 시 원본 데이터 사용
              return reservation;
            }
          })
        );

        // ⭐️ Spring Boot ReservationStatus에 맞게 상태 매핑
        const categorized = {
          pending: enrichedReservations.filter((r) => {
            // REQUESTED("예약 요청됨"), MATCHING("매칭 중")
            return r.status === 'REQUESTED' || r.status === 'MATCHING';
          }),
          completed: enrichedReservations.filter((r) => {
            // MATCHED("매칭 완료")
            return r.status === 'MATCHED';
          }),
          visited: enrichedReservations.filter((r) => {
            // COMPLETED("서비스 완료")
            return r.status === 'COMPLETED';
          }),
          cancelled: enrichedReservations.filter((r) => {
            // CANCELLED("예약 취소됨")
            return r.status === 'CANCELLED';
          }),
        };

        // ⭐️ 프론트엔드 UI 형태로 데이터 변환
        const transformData = (reservations) => {
          return reservations.map((r) => {
            // ⭐️ 실제 백엔드 데이터 구조에 맞춰서 변환
            // 현재 받고 있는 필드: reservationId, status, totalPrice, totalDuration, subOptionName
            const transformed = {
              id: r.reservationId || r.id,
              type: r.subOptionName || getServiceName(r.subOptionId),
              // ⭐️ 실제 DB 데이터 사용 (고정값 제거)
              date: r.requestedDate || formatDateFromDB(r.createdAt),
              time:
                r.requestedTime && r.totalDuration
                  ? formatTimeRange(r.requestedTime, r.totalDuration)
                  : formatTimeRange(
                      r.requestedTime || '09:00',
                      r.totalDuration || 180
                    ),
              price:
                r.totalPrice || getServicePrice(r.subOptionId, r.subOptionName),
              icon: getServiceIcon(r.subOptionId, r.subOptionName),
              status: mapBackendStatus(r.status),
              address: r.address || '주소 정보 없음',
              addressDetail: r.addressDetail || '',
              customerNote: r.customerNote || r.customerMemo || '',
              backendData: r, // 원본 데이터 보존
              createdAt: r.createdAt || new Date().toISOString(),
            };

            return transformed;
          });
        };

        const transformedData = {
          pending: transformData(categorized.pending),
          completed: transformData(categorized.completed),
          visited: transformData(categorized.visited),
          cancelled: transformData(categorized.cancelled),
        };

        setReservations(transformedData);
        return transformedData;
      } catch {
        // 에러 시 빈 데이터 반환
        const emptyData = {
          pending: [],
          completed: [],
          visited: [],
          cancelled: [],
        };
        setReservations(emptyData);
        return emptyData;
      }
    },
    [apiCall]
  );

  // 헬퍼 함수들
  const getServiceName = (subOptionId, subOptionName) => {
    if (subOptionName) return subOptionName;

    const serviceNames = {
      1: '빨래',
      2: '청소',
      3: '육아',
    };
    return serviceNames[subOptionId] || '서비스';
  };

  const getServiceIcon = (subOptionId, subOptionName) => {
    // 1. subOptionName으로 우선 판단
    if (subOptionName) {
      if (subOptionName.includes('빨래')) return 'laundry';
      if (subOptionName.includes('청소')) return 'cleaning';
      if (subOptionName.includes('육아')) return 'childcare';
    }

    // 2. subOptionId로 매핑 (백업)
    const iconMapping = {
      1: 'laundry',
      2: 'cleaning',
      3: 'childcare',
    };
    return iconMapping[subOptionId] || 'home';
  };

  const formatTimeRange = (startTime, durationMinutes = 180) => {
    if (!startTime) return '시간 정보 없음';

    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      const startTotalMinutes = hours * 60 + minutes;
      const endTotalMinutes = startTotalMinutes + durationMinutes;

      const endHours = Math.floor(endTotalMinutes / 60) % 24;
      const endMins = endTotalMinutes % 60;

      const formatTime = (h, m) =>
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      return `${formatTime(hours, minutes)}~${formatTime(endHours, endMins)}`;
    } catch {
      return '시간 정보 오류';
    }
  };

  const mapBackendStatus = (backendStatus) => {
    const statusMapping = {
      REQUESTED: 'pending',
      MATCHING: 'pending',
      MATCHED: 'completed',
      COMPLETED: 'visited',
      CANCELLED: 'cancelled',
    };
    return statusMapping[backendStatus] || 'pending';
  };

  // ⭐️ DB 날짜 형식을 UI 형식으로 변환
  const formatDateFromDB = (dbDate) => {
    if (!dbDate) return new Date().toISOString().split('T')[0];

    try {
      // ISO 날짜 문자열이나 Date 객체를 YYYY-MM-DD 형식으로 변환
      const date = new Date(dbDate);
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  // ⭐️ 서비스별 금액 설정 (사용자 요구사항)
  const getServicePrice = (subOptionId, subOptionName) => {
    // 1. subOptionName으로 우선 판단
    if (subOptionName) {
      if (subOptionName.includes('빨래')) return 40000;
      if (subOptionName.includes('청소')) return 58000;
      if (subOptionName.includes('육아')) return 62000;
    }

    // 2. subOptionId로 매핑 (백업)
    const priceMapping = {
      1: 40000, // 빨래
      2: 58000, // 청소
      3: 62000, // 육아
    };
    return priceMapping[subOptionId] || 40000; // 기본값
  };

  return {
    reservations,
    loading,
    error,
    clearError,
    loadReservations,
  };
};
