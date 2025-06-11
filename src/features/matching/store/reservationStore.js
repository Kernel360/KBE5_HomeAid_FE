import { create } from 'zustand';

const reservationStore = create((set) => ({
  // 현재 활성화된 예약 ID
  reservationId: null,
  workLog: {
    status: 'PENDING'
  },
  
  // 예약 ID 설정
  setReservationId: (reservationId) => 
    set({ reservationId }),
  // 예약 ID 초기화
  clearReservationId: () => 
    set({ activeReservation: null }),

  setWorkLog: (workLog) =>
    set({ workLog })
}));

export default reservationStore;