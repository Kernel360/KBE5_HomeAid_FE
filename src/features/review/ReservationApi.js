import { apiService } from '../../store/api';

// 고객의 예약 내역 조회
export const getCustomerReservations = async () => {
  try {
    const response = await apiService.reservation.getAll();
    return response;
  } catch (error) {
    console.error('예약 내역 조회 실패:', error);
    throw error;
  }
};

// 예약 상세 정보 조회
export const getReservationById = async (reservationId) => {
  try {
    const response = await apiService.reservation.getById(reservationId);
    return response;
  } catch (error) {
    console.error('예약 상세 조회 실패:', error);
    throw error;
  }
};
