import { useNavigate } from 'react-router-dom';
import useMatchingStore from '../../../stores/matchingStore';
import { MATCHING_STATUS } from '../constants/matchingData';

/**
 * 매칭 액션 관리 훅
 * 매칭 관련 사용자 액션과 네비게이션 로직을 담당합니다.
 */
export const useMatchingActions = () => {
  const navigate = useNavigate();
  const { setMatchingRequest } = useMatchingStore();

  // 서비스 시작 (매칭 완료 상태에서 청소하기 버튼)
  const handleServiceStart = (matchingItem) => {
    console.log('🚀 서비스 시작:', matchingItem);
    
    setMatchingRequest({
      matchingId: matchingItem.id,
      customerName: matchingItem.customerName,
      serviceType: matchingItem.serviceType,
      reservedDate: matchingItem.workTime.split(' ')[0],
      reservedTime: matchingItem.workTime.split(' ')[1],
      address: matchingItem.address,
      customerRequest: matchingItem.customerRequest,
      status: MATCHING_STATUS.CONFIRMED,
      estimatedDuration: matchingItem.estimatedDuration,
      reservationId: matchingItem.reservationId,
    });
    
    navigate('/matching/service-checkin');
  };

  // 매칭 요청 (매칭 대기 상태에서 매칭하기 버튼)
  const handleMatching = (matchingItem) => {
    console.log('🔄 매칭 요청 페이지로 이동:', {
      matchingId: matchingItem.id,
      status: matchingItem.originalStatus,
    });

    setMatchingRequest({
      matchingId: matchingItem.id,
      customerName: matchingItem.customerName,
      serviceType: matchingItem.serviceType,
      reservedDate: matchingItem.workTime.split(' ')[0],
      reservedTime: matchingItem.workTime.split(' ')[1],
      estimatedDuration: matchingItem.estimatedDuration,
      address: matchingItem.address,
      customerRequest: matchingItem.customerRequest,
      status: matchingItem.originalStatus,
    });

    navigate('/manager/matching/matching-request', {
      state: {
        matchingId: matchingItem.id,
      },
    });
  };

  return {
    handleServiceStart,
    handleMatching,
  };
};