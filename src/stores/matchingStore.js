import { create } from 'zustand';
import {
  MATCHING_STATUS,
  SERVICE_STATUS,
  CHECKIN_STATUS,
  MATCHING_STATUS_LABELS,
  MANAGER_ACTION,
  CUSTOMER_ACTION,
} from '../features/matching/constants/matchingData';

const useMatchingStore = create((set, get) => ({
  // 매칭 요청 정보
  matchingRequest: {
    matchingId: null,
    serviceType: '',
    reservedDate: '',
    reservedTime: '',
    estimatedDuration: 0,
    latitude: null,
    longitude: null,
    customerRequest: '',
    customerName: '',
    address: '',
    status: MATCHING_STATUS.PENDING_MANAGER_RESPONSE,
    managerMemo: '',
    customerMemo: '',
  },

  // 서비스 진행 상태
  serviceProgress: {
    status: SERVICE_STATUS.NOT_STARTED,
    checkInStatus: CHECKIN_STATUS.PENDING,
    checkOutStatus: CHECKIN_STATUS.PENDING,
    checkInTime: null,
    checkOutTime: null,
  },

  // UI 상태
  uiState: {
    showCheckInModal: false,
    showCheckOutModal: false,
    showRejectModal: false,
    isLoading: false,
  },

  // 액션: 매칭 요청 정보 설정
  setMatchingRequest: (requestData) =>
    set((state) => ({
      matchingRequest: {
        ...state.matchingRequest,
        ...requestData,
      },
    })),

  // 액션: 매칭 상태 업데이트
  updateMatchingStatus: (status, memo = '') =>
    set((state) => ({
      matchingRequest: {
        ...state.matchingRequest,
        status,
        ...(status === MATCHING_STATUS.REJECTED_BY_MANAGER && {
          managerMemo: memo,
        }),
        ...(status === MATCHING_STATUS.REJECTED_BY_CUSTOMER && {
          customerMemo: memo,
        }),
      },
    })),

  // 액션: 매니저 응답 처리
  respondAsManager: (action, memo = '') =>
    set((state) => {
      const newStatus =
        action === MANAGER_ACTION.ACCEPT
          ? MATCHING_STATUS.PENDING_CUSTOMER_RESPONSE
          : MATCHING_STATUS.REJECTED_BY_MANAGER;

      return {
        matchingRequest: {
          ...state.matchingRequest,
          status: newStatus,
          managerMemo: memo,
        },
      };
    }),

  // 액션: 고객 응답 처리 (시뮬레이션용)
  respondAsCustomer: (action, memo = '') =>
    set((state) => {
      const newStatus =
        action === CUSTOMER_ACTION.CONFIRM
          ? MATCHING_STATUS.CONFIRMED
          : MATCHING_STATUS.REJECTED_BY_CUSTOMER;

      return {
        matchingRequest: {
          ...state.matchingRequest,
          status: newStatus,
          customerMemo: memo,
        },
      };
    }),

  // 액션: 서비스 진행 상태 업데이트
  updateServiceProgress: (progressData) =>
    set((state) => ({
      serviceProgress: {
        ...state.serviceProgress,
        ...progressData,
      },
    })),

  // 액션: 체크인 처리
  performCheckIn: () =>
    set((state) => ({
      serviceProgress: {
        ...state.serviceProgress,
        checkInStatus: CHECKIN_STATUS.COMPLETED,
        checkInTime: new Date().toISOString(),
        status: SERVICE_STATUS.IN_PROGRESS,
      },
    })),

  // 액션: 체크아웃 처리
  performCheckOut: () =>
    set((state) => ({
      serviceProgress: {
        ...state.serviceProgress,
        checkOutStatus: CHECKIN_STATUS.COMPLETED,
        checkOutTime: new Date().toISOString(),
        status: SERVICE_STATUS.COMPLETED,
      },
    })),

  // UI 상태 토글
  toggleCheckInModal: () =>
    set((state) => ({
      uiState: {
        ...state.uiState,
        showCheckInModal: !state.uiState.showCheckInModal,
      },
    })),

  toggleCheckOutModal: () =>
    set((state) => ({
      uiState: {
        ...state.uiState,
        showCheckOutModal: !state.uiState.showCheckOutModal,
      },
    })),

  toggleRejectModal: () =>
    set((state) => ({
      uiState: {
        ...state.uiState,
        showRejectModal: !state.uiState.showRejectModal,
      },
    })),

  setLoading: (isLoading) =>
    set((state) => ({
      uiState: {
        ...state.uiState,
        isLoading,
      },
    })),

  // 헬퍼: 현재 상태 가져오기
  getCurrentStatus: () => {
    const { matchingRequest } = get();
    return MATCHING_STATUS_LABELS[matchingRequest.status] || '알 수 없음';
  },

  // 헬퍼: 버튼 활성화 상태 계산
  getButtonStates: () => {
    const { matchingRequest, serviceProgress } = get();

    const isMatchingConfirmed =
      matchingRequest.status === MATCHING_STATUS.CONFIRMED;
    const isCheckInCompleted =
      serviceProgress.checkInStatus === CHECKIN_STATUS.COMPLETED;
    const isCheckOutCompleted =
      serviceProgress.checkOutStatus === CHECKIN_STATUS.COMPLETED;

    return {
      isCheckInButtonEnabled: isMatchingConfirmed && !isCheckInCompleted,
      isCheckOutButtonEnabled:
        isMatchingConfirmed && isCheckInCompleted && !isCheckOutCompleted,
    };
  },

  // 헬퍼: 매칭 응답 가능 여부
  canRespondToMatching: () => {
    const { matchingRequest } = get();
    return matchingRequest.status === MATCHING_STATUS.PENDING_MANAGER_RESPONSE;
  },

  // 스토어 초기화
  resetStore: () =>
    set({
      matchingRequest: {
        matchingId: null,
        serviceType: '',
        reservedDate: '',
        reservedTime: '',
        estimatedDuration: 0,
        latitude: null,
        longitude: null,
        customerRequest: '',
        customerName: '',
        address: '',
        status: MATCHING_STATUS.PENDING_MANAGER_RESPONSE,
        managerMemo: '',
        customerMemo: '',
      },
      serviceProgress: {
        status: SERVICE_STATUS.NOT_STARTED,
        checkInStatus: CHECKIN_STATUS.PENDING,
        checkOutStatus: CHECKIN_STATUS.PENDING,
        checkInTime: null,
        checkOutTime: null,
      },
      uiState: {
        showCheckInModal: false,
        showCheckOutModal: false,
        showRejectModal: false,
        isLoading: false,
      },
    }),
}));

export default useMatchingStore;
