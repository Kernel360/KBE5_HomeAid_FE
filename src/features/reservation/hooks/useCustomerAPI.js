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
    { id: 'vacuum', name: '진공청소기 청소', price: 5000, duration: 30 },
    { id: 'mop', name: '걸레질', price: 3000, duration: 20 },
    { id: 'dust', name: '먼지 제거', price: 2000, duration: 15 },
    { id: 'bathroom', name: '화장실 청소', price: 8000, duration: 45 },
    { id: 'kitchen', name: '주방 청소', price: 10000, duration: 60 },
  ];

  // 서비스 목록 로드
  const loadServices = useCallback(async () => {
    try {
      const serviceData = await apiCall(getCustomerServices);
      if (serviceData && serviceData.length > 0) {
        setServices(serviceData);
      } else {
        // API 응답이 비어있으면 더미 데이터 사용
        console.log('API 응답이 비어있습니다. 더미 데이터를 사용합니다.');
        setServices(dummyServices);
      }
      return serviceData;
    } catch (err) {
      console.error('Failed to load services:', err);
      console.log('API 호출 실패 - 더미 데이터로 대체합니다.');
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
      setAddresses(addressData);
      return addressData;
    } catch (err) {
      console.error('Failed to load addresses:', err);
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
