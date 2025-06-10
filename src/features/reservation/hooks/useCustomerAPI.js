import { useState, useEffect, useCallback } from 'react';
import {
  getCustomerServices,
  getCustomerAddresses,
  createCustomerAddress,
  deleteCustomerAddress,
  createCustomerReservation,
  getCustomerReservation,
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
