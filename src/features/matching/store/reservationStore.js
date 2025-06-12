import { create } from 'zustand';

const reservationStore = create((set) => ({
  // 현재 활성화된 예약 ID
  reservationId: null,
  workLog: {
    status: 'PENDING'
  },
  matching: {},
  
  // 예약 ID 설정
  setReservationId: (reservationId) => 
    set({ reservationId }),
  // 예약 ID 초기화
  clearReservationId: () => 
    set({ activeReservation: null }),

  setWorkLog: (workLog) =>
    set({ workLog }),

  //매칭 수락하기에서 선택한 매칭 아이템 스토어
  setMatching: (matching) => 
    set( {matching} ),
}));

export default reservationStore;