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
    } catch (err) {
      console.error('❌ 서비스 로드 실패:', err);
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

  // 더미 주소 데이터
  const dummyAddresses = [
    {
      id: 1,
      type: '집',
      main: '서울시 강남구 테헤란로 123',
      detail: '101동 202호',
      isDefault: true,
    },
    {
      id: 2,
      type: '회사',
      main: '서울시 서초구 서초대로 456',
      detail: '5층',
      isDefault: false,
    },
    {
      id: 3,
      type: '기타',
      main: '서울시 마포구 홍대입구역 12번 출구',
      detail: '2층 카페 앞',
      isDefault: false,
    },
  ];

  // 주소 목록 로드
  const loadAddresses = useCallback(async () => {
    try {
      console.log('🏠 주소 데이터 로드 시작...');
      console.log(
        '🔑 현재 localStorage 토큰:',
        localStorage.getItem('accessToken') ? '있음' : '없음'
      );

      const addressData = await apiCall(getCustomerAddresses);

      if (addressData && addressData.length > 0) {
        setAddresses(addressData);
      } else {
        setAddresses(dummyAddresses);
      }
      return addressData && addressData.length > 0
        ? addressData
        : dummyAddresses;
    } catch (err) {
      console.error('❌ 주소 로드 실패:', err);

      if (err.message.includes('403')) {
        console.log('🔍 토큰 확인:', localStorage.getItem('accessToken'));
      }
      setAddresses(dummyAddresses);
      return dummyAddresses;
    }
  }, [apiCall]);

  // 새 주소 추가
  const addAddress = useCallback(
    async (addressData) => {
      try {
        const newAddress = await apiCall(createCustomerAddress, addressData);
        setAddresses((prev) => [...prev, newAddress]);
        return newAddress;
      } catch (err) {
        console.error('Failed to add address:', err);
        throw err;
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
    async (page = 0, size = 50) => {
      try {
        const response = await apiCall(getCustomerReservations, page, size);
        console.log('🔍 백엔드 원본 응답:', response);

        // Spring Boot PagedResponseDto 구조 처리
        const reservationList =
          response.content || response.data || response || [];

        console.log('📋 예약 리스트:', reservationList);

        // ⭐️ 각 예약에 대해 상세 정보 추가 조회
        const enrichedReservations = await Promise.all(
          reservationList.map(async (reservation) => {
            try {
              // 개별 예약 상세 조회로 누락된 정보 보완
              const detailData = await apiCall(
                getCustomerReservation,
                reservation.reservationId
              );
              console.log(
                `🔍 예약 ${reservation.reservationId} 상세 정보:`,
                detailData
              );

              // 상세 정보와 목록 정보 병합
              return {
                ...reservation,
                ...detailData,
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
            } catch (error) {
              console.warn(
                `⚠️ 예약 ${reservation.reservationId} 상세 조회 실패:`,
                error
              );
              // 상세 조회 실패 시 원본 데이터 사용
              return reservation;
            }
          })
        );

        console.log('📋 보완된 예약 리스트:', enrichedReservations);

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
            console.log('🔧 변환 중인 원본 데이터:', r);

            // ⭐️ 실제 백엔드 데이터 구조에 맞춰서 변환
            // 현재 받고 있는 필드: reservationId, status, totalPrice, totalDuration, subOptionName
            const transformed = {
              id: r.reservationId || r.id,
              type: r.subOptionName || getServiceName(r.subOptionId),
              // ⭐️ 상세 조회로 받은 실제 데이터 우선 사용
              date: r.requestedDate || getTodayDate(),
              time: r.requestedTime
                ? formatTimeRange(r.requestedTime, r.totalDuration || 180)
                : getDefaultTimeRange(),
              price: r.totalPrice || getDefaultPrice(r.subOptionName),
              icon: getServiceIcon(r.subOptionId, r.subOptionName),
              status: mapBackendStatus(r.status),
              address: r.address || '서울시 강남구',
              addressDetail: r.addressDetail || '',
              customerNote: r.customerNote || '',
              backendData: r, // 원본 데이터 보존
              createdAt:
                r.createdAt || r.requestedDate || new Date().toISOString(),
            };

            console.log('✨ 변환된 데이터:', transformed);
            return transformed;
          });
        };

        const transformedData = {
          pending: transformData(categorized.pending),
          completed: transformData(categorized.completed),
          visited: transformData(categorized.visited),
          cancelled: transformData(categorized.cancelled),
        };

        console.log('✅ 변환된 예약 데이터:', transformedData);
        console.log('🔍 pending 데이터 상세:', transformedData.pending);
        console.log('📊 카테고리별 개수:', {
          pending: transformedData.pending.length,
          completed: transformedData.completed.length,
          visited: transformedData.visited.length,
          cancelled: transformedData.cancelled.length,
        });

        setReservations(transformedData);
        return transformedData;
      } catch (err) {
        console.error('Failed to load reservation list:', err);
        // 오류 시 더미 데이터로 페이징 테스트
        console.log('🧪 페이징 테스트용 더미 데이터 생성...');

        const createDummyReservation = (
          id,
          status,
          type,
          date,
          time,
          price
        ) => ({
          id,
          type,
          date,
          time,
          price,
          icon:
            type === '청소'
              ? 'cleaning'
              : type === '빨래'
                ? 'laundry'
                : 'childcare',
          status,
          address: '서울시 강남구',
          addressDetail: '',
          customerNote: '',
          backendData: {
            reservationId: id,
            status: status.toUpperCase(),
            subOptionName: type,
          },
          createdAt: new Date().toISOString(),
        });

        const dummyReservations = {
          pending: [
            createDummyReservation(
              1,
              'pending',
              '청소',
              '2025-01-20',
              '14:00~17:00',
              25000
            ),
            createDummyReservation(
              2,
              'pending',
              '빨래',
              '2025-01-21',
              '10:00~12:00',
              15000
            ),
            createDummyReservation(
              3,
              'pending',
              '육아',
              '2025-01-22',
              '09:00~15:00',
              50000
            ),
            createDummyReservation(
              4,
              'pending',
              '청소',
              '2025-01-23',
              '16:00~19:00',
              30000
            ),
            createDummyReservation(
              5,
              'pending',
              '빨래',
              '2025-01-24',
              '11:00~13:00',
              18000
            ),
            createDummyReservation(
              6,
              'pending',
              '청소',
              '2025-01-25',
              '14:00~17:00',
              25000
            ),
            createDummyReservation(
              7,
              'pending',
              '육아',
              '2025-01-26',
              '08:00~14:00',
              45000
            ),
          ],
          completed: [
            createDummyReservation(
              11,
              'completed',
              '청소',
              '2025-01-15',
              '14:00~17:00',
              25000
            ),
            createDummyReservation(
              12,
              'completed',
              '빨래',
              '2025-01-16',
              '10:00~12:00',
              15000
            ),
            createDummyReservation(
              13,
              'completed',
              '육아',
              '2025-01-17',
              '09:00~15:00',
              50000
            ),
            createDummyReservation(
              14,
              'completed',
              '청소',
              '2025-01-18',
              '16:00~19:00',
              30000
            ),
            createDummyReservation(
              15,
              'completed',
              '빨래',
              '2025-01-19',
              '11:00~13:00',
              18000
            ),
            createDummyReservation(
              16,
              'completed',
              '청소',
              '2025-01-20',
              '14:00~17:00',
              25000
            ),
          ],
          visited: [
            createDummyReservation(
              21,
              'visited',
              '청소',
              '2025-01-10',
              '14:00~17:00',
              25000
            ),
            createDummyReservation(
              22,
              'visited',
              '빨래',
              '2025-01-11',
              '10:00~12:00',
              15000
            ),
            createDummyReservation(
              23,
              'visited',
              '육아',
              '2025-01-12',
              '09:00~15:00',
              50000
            ),
            createDummyReservation(
              24,
              'visited',
              '청소',
              '2025-01-13',
              '16:00~19:00',
              30000
            ),
            createDummyReservation(
              25,
              'visited',
              '빨래',
              '2025-01-14',
              '11:00~13:00',
              18000
            ),
            createDummyReservation(
              26,
              'visited',
              '청소',
              '2025-01-15',
              '14:00~17:00',
              25000
            ),
            createDummyReservation(
              27,
              'visited',
              '육아',
              '2025-01-16',
              '08:00~14:00',
              45000
            ),
            createDummyReservation(
              28,
              'visited',
              '청소',
              '2025-01-17',
              '14:00~17:00',
              25000
            ),
          ],
          cancelled: [
            createDummyReservation(
              31,
              'cancelled',
              '청소',
              '2025-01-05',
              '14:00~17:00',
              25000
            ),
            createDummyReservation(
              32,
              'cancelled',
              '빨래',
              '2025-01-06',
              '10:00~12:00',
              15000
            ),
            createDummyReservation(
              33,
              'cancelled',
              '육아',
              '2025-01-07',
              '09:00~15:00',
              50000
            ),
          ],
        };

        setReservations(dummyReservations);
        return dummyReservations;
      }
    },
    [apiCall]
  );

  // ⭐️ 헬퍼 함수들
  const getServiceName = (subOptionId, subOptionName) => {
    // 1. 백엔드에서 직접 받은 subOptionName 우선 사용
    if (subOptionName) {
      return subOptionName;
    }

    // 2. subOptionId로 매핑
    const serviceMapping = {
      1: '빨래',
      2: '청소',
      3: '육아',
    };
    return serviceMapping[subOptionId] || '서비스';
  };

  const getServiceIcon = (subOptionId, subOptionName) => {
    // 1. subOptionName 우선 사용
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
    } catch (error) {
      console.warn('⚠️ 시간 형식 변환 실패:', startTime, error);
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

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDefaultTimeRange = () => {
    // 오늘 오후 2시부터 5시까지 기본 시간 설정
    return '14:00~17:00';
  };

  const getDefaultPrice = (subOptionName) => {
    const defaultPrice = {
      빨래: 10000,
      청소: 15000,
      육아: 20000,
    };
    return defaultPrice[subOptionName] || 0;
  };

  return {
    reservations,
    loading,
    error,
    clearError,
    loadReservations,
  };
};
