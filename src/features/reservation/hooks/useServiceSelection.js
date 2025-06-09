import { useState } from 'react';
import { SERVICE_OPTIONS } from '../constants/serviceData';

/**
 * 서비스 선택을 관리하는 커스텀 훅
 */
export const useServiceSelection = () => {
  const [selectedSubOption, setSelectedSubOption] = useState(null);
  const [serviceOptions, setServiceOptions] = useState(() => {
    // SERVICE_OPTIONS를 기반으로 selected 상태 추가
    const initialOptions = {};
    Object.entries(SERVICE_OPTIONS).forEach(([key, option]) => {
      initialOptions[key] = { ...option, selected: false };
    });
    return initialOptions;
  });

  const handleSubOptionClick = (optionType) => {
    console.log(`${optionType} 하위 옵션 선택됨`);
    setSelectedSubOption(optionType);
  };

  const handleServiceOptionChange = (optionKey, checked) => {
    setServiceOptions((prev) => ({
      ...prev,
      [optionKey]: { ...prev[optionKey], selected: checked },
    }));
  };

  const getSelectedServices = () => {
    return Object.entries(serviceOptions)
      .filter(([, option]) => option.selected)
      .map(([optionKey, option]) => ({
        key: optionKey,
        name: option.name,
        price: option.price,
      }));
  };

  const resetSelection = () => {
    setSelectedSubOption(null);
    const resetOptions = {};
    Object.entries(SERVICE_OPTIONS).forEach(([key, option]) => {
      resetOptions[key] = { ...option, selected: false };
    });
    setServiceOptions(resetOptions);
  };

  const isAnyServiceSelected = () => {
    return Object.values(serviceOptions).some((option) => option.selected);
  };

  return {
    selectedSubOption,
    serviceOptions,
    handleSubOptionClick,
    handleServiceOptionChange,
    getSelectedServices,
    resetSelection,
    isAnyServiceSelected,
  };
};
