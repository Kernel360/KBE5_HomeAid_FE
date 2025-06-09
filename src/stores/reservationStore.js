import { create } from 'zustand';

const useReservationStore = create((set, get) => ({
  // 예약 데이터 초기 상태
  reservationData: {
    selectedServices: [], // 선택된 서비스 ID 배열
    serviceDetails: [], // 선택된 서비스의 상세 정보
    totalPrice: 0,
    totalDuration: 0,
    reservationDate: '',
    reservationTime: '',
    address: '',
    addressDetail: '',
    customerNote: '',
    status: 'PENDING', // PENDING, CONFIRMED, COMPLETED, CANCELLED
  },

  // 선택된 서비스 추가/제거
  toggleService: (serviceId) =>
    set((state) => {
      const isSelected =
        state.reservationData.selectedServices.includes(serviceId);
      const updatedServices = isSelected
        ? state.reservationData.selectedServices.filter(
            (id) => id !== serviceId
          )
        : [...state.reservationData.selectedServices, serviceId];

      return {
        reservationData: {
          ...state.reservationData,
          selectedServices: updatedServices,
        },
      };
    }),

  // 서비스 세부 정보 설정 (API에서 받은 데이터)
  setServiceDetails: (services) =>
    set((state) => ({
      reservationData: {
        ...state.reservationData,
        serviceDetails: services,
      },
    })),

  // 선택된 서비스들로 총 가격과 시간 계산
  calculateTotals: () =>
    set((state) => {
      const { selectedServices, serviceDetails } = state.reservationData;

      let totalPrice = 0;
      let totalDuration = 0;

      selectedServices.forEach((serviceId) => {
        const service = serviceDetails.find((s) => s.id === serviceId);
        if (service) {
          totalPrice += service.price || service.totalPrice || 0;
          totalDuration += service.duration || service.totalDuration || 0;
        }
      });

      return {
        reservationData: {
          ...state.reservationData,
          totalPrice,
          totalDuration,
        },
      };
    }),

  // 예약 정보 업데이트
  setReservationInfo: (info) =>
    set((state) => ({
      reservationData: {
        ...state.reservationData,
        ...info,
      },
    })),

  // 예약 날짜 설정
  setReservationDate: (date) =>
    set((state) => ({
      reservationData: {
        ...state.reservationData,
        reservationDate: date,
      },
    })),

  // 예약 시간 설정
  setReservationTime: (time) =>
    set((state) => ({
      reservationData: {
        ...state.reservationData,
        reservationTime: time,
      },
    })),

  // 주소 정보 설정
  setAddress: (address, addressDetail = '') =>
    set((state) => ({
      reservationData: {
        ...state.reservationData,
        address,
        addressDetail,
      },
    })),

  // 고객 메모 설정
  setCustomerNote: (note) =>
    set((state) => ({
      reservationData: {
        ...state.reservationData,
        customerNote: note,
      },
    })),

  // 예약 상태 변경
  setReservationStatus: (status) =>
    set((state) => ({
      reservationData: {
        ...state.reservationData,
        status,
      },
    })),

  // 선택된 서비스 가져오기 (계산된 값 포함)
  getSelectedServicesWithDetails: () => {
    const state = get();
    const { selectedServices, serviceDetails } = state.reservationData;

    return selectedServices.map((serviceId) => {
      const service = serviceDetails.find((s) => s.id === serviceId);
      return service || { id: serviceId, name: 'Unknown Service', price: 0 };
    });
  },

  // 예약 데이터 초기화
  resetReservationData: () =>
    set({
      reservationData: {
        selectedServices: [],
        serviceDetails: [],
        totalPrice: 0,
        totalDuration: 0,
        reservationDate: '',
        reservationTime: '',
        address: '',
        addressDetail: '',
        customerNote: '',
        status: 'PENDING',
      },
    }),

  // 예약 완료 데이터 가져오기
  getReservationSummary: () => {
    const state = get();
    return {
      ...state.reservationData,
      selectedServicesDetails: state.getSelectedServicesWithDetails(),
    };
  },
}));

export default useReservationStore;
