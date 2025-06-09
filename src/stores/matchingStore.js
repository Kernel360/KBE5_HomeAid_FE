import { create } from 'zustand';

const useMatchingStore = create((set, get) => ({
  // 매칭 요청 데이터
  matchingRequest: {
    id: null,
    status: '신규 요청',
    serviceType: '',
    dateTime: '',
    estimatedTime: '',
    address: '',
    estimatedEarnings: 0,
    customerRequest: '',
    customerName: '',
    isAccepted: false,
  },

  // 서비스 진행 상태
  serviceProgress: {
    checkInStatus: '미완료',
    checkOutStatus: '미완료',
    checkInTime: null,
    checkOutTime: null,
  },

  // UI 상태
  uiState: {
    isLoading: false,
    showAcceptModal: false,
    showRejectModal: false,
    showCheckInModal: false,
    showCheckOutModal: false,
    rejectReason: '',
  },

  // 매칭 요청 데이터 설정
  setMatchingRequest: (requestData) =>
    set((state) => ({
      matchingRequest: { ...state.matchingRequest, ...requestData },
    })),

  // 서비스 진행 상태 업데이트
  setServiceProgress: (progressData) =>
    set((state) => ({
      serviceProgress: { ...state.serviceProgress, ...progressData },
    })),

  // 체크인 완료
  completeCheckIn: () =>
    set((state) => ({
      serviceProgress: {
        ...state.serviceProgress,
        checkInStatus: '완료',
        checkInTime: new Date().toISOString(),
      },
    })),

  // 체크아웃 완료
  completeCheckOut: () =>
    set((state) => ({
      serviceProgress: {
        ...state.serviceProgress,
        checkOutStatus: '완료',
        checkOutTime: new Date().toISOString(),
      },
    })),

  // UI 상태 관리
  setUIState: (uiData) =>
    set((state) => ({
      uiState: { ...state.uiState, ...uiData },
    })),

  // 모달 토글 함수들
  toggleAcceptModal: () =>
    set((state) => ({
      uiState: {
        ...state.uiState,
        showAcceptModal: !state.uiState.showAcceptModal,
      },
    })),

  toggleRejectModal: () =>
    set((state) => ({
      uiState: {
        ...state.uiState,
        showRejectModal: !state.uiState.showRejectModal,
      },
    })),

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

  // 거절 사유 설정
  setRejectReason: (reason) =>
    set((state) => ({
      uiState: { ...state.uiState, rejectReason: reason },
    })),

  // 로딩 상태 설정
  setLoading: (loading) =>
    set((state) => ({
      uiState: { ...state.uiState, isLoading: loading },
    })),

  // 매칭 수락 처리
  acceptMatching: () =>
    set((state) => ({
      matchingRequest: {
        ...state.matchingRequest,
        isAccepted: true,
        status: '수락됨',
      },
    })),

  // 매칭 거절 처리
  rejectMatching: (reason) =>
    set((state) => ({
      matchingRequest: {
        ...state.matchingRequest,
        isAccepted: false,
        status: '거절됨',
        rejectReason: reason,
      },
    })),

  // 상태 초기화
  resetMatchingData: () =>
    set({
      matchingRequest: {
        id: null,
        status: '신규 요청',
        serviceType: '',
        dateTime: '',
        estimatedTime: '',
        address: '',
        estimatedEarnings: 0,
        customerRequest: '',
        customerName: '',
        isAccepted: false,
      },
      serviceProgress: {
        checkInStatus: '미완료',
        checkOutStatus: '미완료',
        checkInTime: null,
        checkOutTime: null,
      },
      uiState: {
        isLoading: false,
        showAcceptModal: false,
        showRejectModal: false,
        showCheckInModal: false,
        showCheckOutModal: false,
        rejectReason: '',
      },
    }),

  // 서비스 상태 계산 함수들
  isCheckInComplete: () => {
    const { serviceProgress } = get();
    return serviceProgress.checkInStatus === '완료';
  },

  isCheckOutComplete: () => {
    const { serviceProgress } = get();
    return serviceProgress.checkOutStatus === '완료';
  },

  getCurrentStatus: () => {
    const state = get();
    const isCheckInComplete = state.isCheckInComplete();
    const isCheckOutComplete = state.isCheckOutComplete();

    if (isCheckOutComplete) return '서비스 완료';
    if (isCheckInComplete) return '서비스 진행 중';
    return '체크인 필요';
  },

  // 버튼 활성화 상태 계산
  getButtonStates: () => {
    const state = get();
    const isMatchingAccepted = state.matchingRequest.isAccepted;
    const isCheckInComplete = state.isCheckInComplete();
    const isCheckOutComplete = state.isCheckOutComplete();

    return {
      // 매칭이 수락되어야만 체크인 버튼 활성화
      isCheckInButtonEnabled:
        isMatchingAccepted && !isCheckInComplete && !isCheckOutComplete,
      // 체크인 완료되어야만 체크아웃 버튼 활성화
      isCheckOutButtonEnabled:
        isMatchingAccepted && isCheckInComplete && !isCheckOutComplete,
    };
  },
}));

export default useMatchingStore;
