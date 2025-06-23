import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 기본 상태 정의 (테스트용 샘플 데이터 포함)
const defaultState = {
  pending: [
    {
      id: 1001,
      type: '가사도우미',
      date: '2024-01-20',
      time: '09:00~12:00',
      price: 80000,
      icon: 'home',
      status: 'pending',
      address: '서울시 강남구 테헤란로 123',
      addressDetail: '101동 1004호',
      customerNote: '현관문 비밀번호는 1234입니다.',
      createdAt: '2024-01-15T09:00:00Z',
    },
    {
      id: 1002,
      type: '청소 서비스',
      date: '2024-01-21',
      time: '14:00~16:00',
      price: 60000,
      icon: 'cleaning',
      status: 'pending',
      address: '서울시 서초구 반포대로 456',
      addressDetail: '202동 503호',
      customerNote: '애완동물이 있습니다.',
      createdAt: '2024-01-16T10:30:00Z',
    },
  ],
  completed: [
    {
      id: 2001,
      type: '세탁 서비스',
      date: '2024-01-18',
      time: '10:00~11:00',
      price: 40000,
      icon: 'laundry',
      status: 'completed',
      address: '서울시 마포구 월드컵로 789',
      addressDetail: '3층',
      customerNote: '울 소재 의류 조심히 부탁드립니다.',
      createdAt: '2024-01-12T14:20:00Z',
    },
    {
      id: 2002,
      type: '육아도우미',
      date: '2024-01-19',
      time: '13:00~18:00',
      price: 120000,
      icon: 'childcare',
      status: 'completed',
      address: '서울시 용산구 이태원로 321',
      addressDetail: '아파트 B동 702호',
      customerNote: '아이가 5세이고 알레르기가 있습니다.',
      createdAt: '2024-01-14T11:45:00Z',
    },
  ],
  visited: [
    {
      id: 3001,
      type: '가사도우미',
      date: '2024-01-17',
      time: '09:00~12:00',
      price: 80000,
      icon: 'home',
      status: 'visited',
      address: '서울시 송파구 올림픽로 654',
      addressDetail: '1002호',
      customerNote: '만족스러운 서비스였습니다.',
      createdAt: '2024-01-10T08:15:00Z',
    },
  ],
  cancelled: [
    {
      id: 4001,
      type: '청소 서비스',
      date: '2024-01-16',
      time: '15:00~17:00',
      price: 50000,
      icon: 'cleaning',
      status: 'cancelled',
      address: '서울시 종로구 세종대로 987',
      addressDetail: '5층 사무실',
      customerNote: '일정 변경으로 인한 취소',
      createdAt: '2024-01-11T16:30:00Z',
    },
  ],
};

// 예약 목록을 관리하는 스토어
const useReservationListStore = create(
  persist(
    (set, get) => ({
      // 예약 목록
      reservations: defaultState,

      // 새 예약 추가 (예약중 상태로)
      addReservation: (reservationData) =>
        set((state) => {
          // 안전한 상태 확인
          const currentReservations = state.reservations || defaultState;
          const pendingList = Array.isArray(currentReservations.pending)
            ? currentReservations.pending
            : [];

          const newReservation = {
            id: Date.now(), // 임시 ID (실제로는 백엔드에서 받아야 함)
            type:
              reservationData.serviceType ||
              reservationData.selectedSubOption?.name ||
              '서비스',
            date: reservationData.reservationDate,
            time: `${reservationData.reservationTime}~${reservationData.endTime || '완료시까지'}`,
            price: reservationData.totalPrice || 0,
            icon:
              reservationData.selectedSubOption?.id === 'cleaning'
                ? 'cleaning'
                : reservationData.selectedSubOption?.id === 'laundry'
                  ? 'laundry'
                  : reservationData.selectedSubOption?.id === 'childcare'
                    ? 'childcare'
                    : 'home',
            status: 'pending', // 예약중으로 변경
            address: reservationData.address,
            addressDetail: reservationData.addressDetail,
            customerNote: reservationData.customerNote,
            selectedServices: reservationData.selectedServices || [],
            serviceDetails: reservationData.serviceDetails || [],
            createdAt: new Date().toISOString(),
          };

          return {
            reservations: {
              ...currentReservations,
              pending: [...pendingList, newReservation], // 예약중에 추가
            },
          };
        }),

      // 예약을 완료로 이동
      markAsCompleted: (reservationId) =>
        set((state) => {
          const currentReservations = state.reservations || defaultState;
          const pendingList = Array.isArray(currentReservations.pending)
            ? currentReservations.pending
            : [];
          const completedList = Array.isArray(currentReservations.completed)
            ? currentReservations.completed
            : [];
          const visitedList = Array.isArray(currentReservations.visited)
            ? currentReservations.visited
            : [];

          const reservationToMove = pendingList.find(
            (res) => res.id === reservationId
          );

          if (!reservationToMove) return state;

          const updatedReservation = {
            ...reservationToMove,
            status: 'completed',
          };

          return {
            reservations: {
              pending: pendingList.filter((res) => res.id !== reservationId),
              completed: [...completedList, updatedReservation],
              visited: visitedList,
            },
          };
        }),

      // 예약을 방문 완료로 이동
      markAsVisited: (reservationId) =>
        set((state) => {
          const currentReservations = state.reservations || defaultState;
          const pendingList = Array.isArray(currentReservations.pending)
            ? currentReservations.pending
            : [];
          const completedList = Array.isArray(currentReservations.completed)
            ? currentReservations.completed
            : [];
          const visitedList = Array.isArray(currentReservations.visited)
            ? currentReservations.visited
            : [];

          const reservationToMove = completedList.find(
            (res) => res.id === reservationId
          );

          if (!reservationToMove) return state;

          const updatedReservation = {
            ...reservationToMove,
            status: 'visited',
          };

          return {
            reservations: {
              pending: pendingList,
              completed: completedList.filter(
                (res) => res.id !== reservationId
              ),
              visited: [...visitedList, updatedReservation],
            },
          };
        }),

      // 예약 삭제
      removeReservation: (reservationId, type = 'pending') =>
        set((state) => {
          const currentReservations = state.reservations || defaultState;
          const targetList = Array.isArray(currentReservations[type])
            ? currentReservations[type]
            : [];

          return {
            reservations: {
              ...currentReservations,
              [type]: targetList.filter((res) => res.id !== reservationId),
            },
          };
        }),

      // 모든 예약 목록 초기화
      clearAllReservations: () =>
        set({
          reservations: { ...defaultState },
        }),

      // 특정 타입의 예약 목록 가져오기
      getReservationsByType: (type) => {
        const state = get();
        const currentReservations = state.reservations || defaultState;
        return Array.isArray(currentReservations[type])
          ? currentReservations[type]
          : [];
      },

      // 전체 예약 목록 가져오기
      getAllReservations: () => {
        const state = get();
        const currentReservations = state.reservations || defaultState;
        const pendingList = Array.isArray(currentReservations.pending)
          ? currentReservations.pending
          : [];
        const completedList = Array.isArray(currentReservations.completed)
          ? currentReservations.completed
          : [];
        const visitedList = Array.isArray(currentReservations.visited)
          ? currentReservations.visited
          : [];
        const cancelledList = Array.isArray(currentReservations.cancelled)
          ? currentReservations.cancelled
          : [];

        return {
          pending: pendingList,
          completed: completedList,
          visited: visitedList,
          cancelled: cancelledList,
          total:
            pendingList.length +
            completedList.length +
            visitedList.length +
            cancelledList.length,
        };
      },

      // 전체 예약 목록을 한 번에 덮어쓰기 (API 응답 가로채기용)
      setReservations: (newReservations) =>
        set({
          reservations: {
            pending: newReservations.pending || [],
            completed: newReservations.completed || [],
            visited: newReservations.visited || [],
            cancelled: newReservations.cancelled || [],
          },
        }),
    }),
    {
      name: 'reservation-list-storage-v2', // localStorage 키 이름 변경 (새 데이터 적용)
      getStorage: () => localStorage, // localStorage 사용
    }
  )
);

export default useReservationListStore;
