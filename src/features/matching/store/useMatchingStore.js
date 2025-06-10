// stores/useReservationStore.js
import { create } from 'zustand';

const useMatchingStore = create((set) => ({
  // 현재 활성화된 예약 ID
  activeReservation: null,
  activeMatching: {},
  
  // 예약 ID 설정
  setActiveReservation: (reservationId) => 
    set({ activeReservation: reservationId }),
  // 예약 ID 초기화
  clearActiveReservation: () => 
    set({ activeReservation: null }),

  setActiveMatching: (activeMatching) =>
    set({ activeMatching })
}));

export default useMatchingStore;