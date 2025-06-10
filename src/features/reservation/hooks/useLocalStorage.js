import { useState } from 'react';

/**
 * localStorage를 사용하는 커스텀 훅
 * @param {string} key - localStorage 키
 * @param {any} initialValue - 초기값
 * @returns {[any, function]} [value, setValue]
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

/**
 * 장바구니 데이터를 관리하는 커스텀 훅
 */
export const useCartData = () => {
  const [cartData, setCartData, removeCartData] = useLocalStorage('cartData', {
    basePrice: { name: '기본 요금', price: 80000 },
    selectedServices: [],
    subOptionType: null,
  });

  const addServiceToCart = (service) => {
    setCartData((prev) => ({
      ...prev,
      selectedServices: [...prev.selectedServices, service],
    }));
  };

  const removeServiceFromCart = (serviceKey) => {
    setCartData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.filter(
        (service) => service.key !== serviceKey
      ),
    }));
  };

  const updateSubOptionType = (subOptionType) => {
    setCartData((prev) => ({
      ...prev,
      subOptionType,
    }));
  };

  const getTotalAmount = () => {
    const basePrice = cartData.basePrice.price;
    const servicesTotal = cartData.selectedServices.reduce(
      (sum, service) => sum + service.price,
      0
    );
    return basePrice + servicesTotal;
  };

  const clearCart = () => {
    removeCartData();
  };

  return {
    cartData,
    setCartData,
    addServiceToCart,
    removeServiceFromCart,
    updateSubOptionType,
    getTotalAmount,
    clearCart,
  };
};

/**
 * 결제 데이터를 관리하는 커스텀 훅
 */
export const usePaymentData = () => {
  const [paymentData, setPaymentData, removePaymentData] = useLocalStorage(
    'paymentData',
    null
  );

  const updatePaymentData = (data) => {
    setPaymentData(data);
  };

  const updateServiceInfo = (serviceInfo) => {
    setPaymentData((prev) => ({
      ...prev,
      serviceInfo: {
        ...prev?.serviceInfo,
        ...serviceInfo,
      },
    }));
  };

  const clearPaymentData = () => {
    removePaymentData();
  };

  return {
    paymentData,
    updatePaymentData,
    updateServiceInfo,
    clearPaymentData,
  };
};
