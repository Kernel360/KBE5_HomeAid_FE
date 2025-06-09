import { useState, useCallback } from 'react';
import {
  API_ENDPOINTS,
  NOTIFICATION_MESSAGES,
  DUMMY_MATCHING_DATA,
  MATCHING_STATUS,
  MANAGER_ACTION,
  CUSTOMER_ACTION,
} from '../constants/matchingData';

// 더미 데이터 (백엔드 연동 전까지 사용)
const DUMMY_MATCHING_REQUEST = {
  id: 1,
  status: '신규 요청',
  serviceType: '대청소',
  dateTime: '2024-01-15 14:00',
  estimatedTime: '3시간',
  address: '서울시 강남구 테헤란로 123',
  estimatedEarnings: 60000,
  customerRequest:
    '주방 기름때 제거에 신경써주세요. 욕실 곰팡이도 꼼꼼하게 청소 부탁드립니다.',
  customerName: '김고객',
};

const DUMMY_SERVICE_DETAILS = {
  id: 1,
  customerName: '김고객',
  serviceType: '대청소',
  dateTime: '2024-01-15 14:00',
  address: '서울시 강남구 테헤란로 123',
  checkInStatus: '미완료',
  checkOutStatus: '미완료',
};

// 매니저 매칭 관련 API 훅
export const useManagerMatching = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 매칭 목록 조회
  const getMatchingList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: 실제 API 호출
      // const response = await fetch(API_ENDPOINTS.MANAGER_MATCHING_LIST);
      // const data = await response.json();

      // 더미 데이터 반환
      const dummyList = [
        {
          ...DUMMY_MATCHING_DATA,
          matchingId: 5001,
          customerName: '김고객',
          serviceType: '일반 청소',
          reservedDate: '2023-06-15',
          reservedTime: '14:00',
          status: MATCHING_STATUS.CONFIRMED,
          price: 80000,
        },
        {
          ...DUMMY_MATCHING_DATA,
          matchingId: 5002,
          customerName: '이고객',
          serviceType: '입주 청소',
          reservedDate: '2023-06-20',
          reservedTime: '10:00',
          status: MATCHING_STATUS.PENDING_CUSTOMER_RESPONSE,
          price: 60000,
        },
        {
          ...DUMMY_MATCHING_DATA,
          matchingId: 5003,
          customerName: '박고객',
          serviceType: '회사 청소',
          reservedDate: '2023-06-25',
          reservedTime: '14:00',
          status: MATCHING_STATUS.REJECTED_BY_CUSTOMER,
          price: null,
        },
        {
          ...DUMMY_MATCHING_DATA,
          matchingId: 5004,
          customerName: '최고객',
          serviceType: '일반 청소',
          reservedDate: '2023-06-25',
          reservedTime: '14:00',
          status: MATCHING_STATUS.PENDING_MANAGER_RESPONSE,
          price: null,
        },
      ];

      return dummyList;
    } catch (err) {
      setError(NOTIFICATION_MESSAGES.MATCHING.LOAD_ERROR);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 매칭 상세 조회
  const getMatchingDetail = useCallback(async (matchingId) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: 실제 API 호출
      // const response = await fetch(API_ENDPOINTS.MATCHING_DETAIL(matchingId));
      // const data = await response.json();

      // 더미 데이터 반환
      return {
        ...DUMMY_MATCHING_DATA,
        matchingId,
        customerName: '김고객',
        address: '서울시 강남구 테헤란로 123',
      };
    } catch (err) {
      setError(NOTIFICATION_MESSAGES.MATCHING.LOAD_ERROR);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 매니저 매칭 응답 (수락/거절)
  const respondToMatching = useCallback(
    async (matchingId, action, memo = '') => {
      setLoading(true);
      setError(null);

      try {
        // eslint-disable-next-line no-unused-vars
        const requestBody = {
          action,
          memo: action === MANAGER_ACTION.REJECT ? memo : undefined,
        };

        // TODO: 실제 API 호출
        // const response = await fetch(API_ENDPOINTS.MANAGER_RESPONSE(matchingId), {
        //   method: 'PATCH',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${getAccessToken()}`
        //   },
        //   body: JSON.stringify(requestBody)
        // });

        // if (!response.ok) {
        //   throw new Error('매칭 응답 실패');
        // }

        // 더미 응답 시뮬레이션
        console.log('매니저 응답:', { matchingId, action, memo });

        return {
          success: true,
          message:
            action === MANAGER_ACTION.ACCEPT
              ? NOTIFICATION_MESSAGES.MATCHING.ACCEPT_SUCCESS
              : NOTIFICATION_MESSAGES.MATCHING.REJECT_SUCCESS,
        };
      } catch (err) {
        const errorMessage =
          action === MANAGER_ACTION.ACCEPT
            ? NOTIFICATION_MESSAGES.MATCHING.ACCEPT_ERROR
            : NOTIFICATION_MESSAGES.MATCHING.REJECT_ERROR;
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    getMatchingList,
    getMatchingDetail,
    respondToMatching,
  };
};

// 서비스 체크인/아웃 관련 API 훅
export const useServiceCheckIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 서비스 상세 정보 조회
  const getServiceDetails = useCallback(async (matchingId) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: 실제 API 호출
      // const response = await fetch(API_ENDPOINTS.MATCHING_DETAIL(matchingId));
      // const data = await response.json();

      // 더미 데이터 반환
      return {
        ...DUMMY_MATCHING_DATA,
        matchingId,
        customerName: '김고객',
        address: '서울시 강남구 테헤란로 123',
      };
    } catch (err) {
      setError(NOTIFICATION_MESSAGES.MATCHING.LOAD_ERROR);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 체크인 수행
  const performCheckIn = useCallback(async (matchingId) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: 실제 API 호출
      // const response = await fetch(API_ENDPOINTS.SERVICE_CHECKIN(matchingId), {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${getAccessToken()}`
      //   }
      // });

      // if (!response.ok) {
      //   throw new Error('체크인 실패');
      // }

      // 더미 응답 시뮬레이션
      console.log('체크인 수행:', matchingId);

      return {
        success: true,
        checkInTime: new Date().toISOString(),
        message: NOTIFICATION_MESSAGES.SERVICE.CHECKIN_SUCCESS,
      };
    } catch (err) {
      setError(NOTIFICATION_MESSAGES.SERVICE.CHECKIN_ERROR);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 체크아웃 수행
  const performCheckOut = useCallback(async (matchingId) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: 실제 API 호출
      // const response = await fetch(API_ENDPOINTS.SERVICE_CHECKOUT(matchingId), {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${getAccessToken()}`
      //   }
      // });

      // if (!response.ok) {
      //   throw new Error('체크아웃 실패');
      // }

      // 더미 응답 시뮬레이션
      console.log('체크아웃 수행:', matchingId);

      return {
        success: true,
        checkOutTime: new Date().toISOString(),
        message: NOTIFICATION_MESSAGES.SERVICE.CHECKOUT_SUCCESS,
      };
    } catch (err) {
      setError(NOTIFICATION_MESSAGES.SERVICE.CHECKOUT_ERROR);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 파일 업로드 (TODO: 구현 예정)
  const uploadServiceFile = useCallback(async (matchingId, file) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: 실제 파일 업로드 API 호출
      // const formData = new FormData();
      // formData.append('file', file);

      // const response = await fetch(`/manager/services/${matchingId}/upload`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${getAccessToken()}`
      //   },
      //   body: formData
      // });

      // if (!response.ok) {
      //   throw new Error('파일 업로드 실패');
      // }

      // 더미 응답 시뮬레이션
      console.log('파일 업로드:', { matchingId, fileName: file.name });

      return {
        success: true,
        fileUrl: 'https://dummy-url.com/uploaded-file.jpg',
        message: NOTIFICATION_MESSAGES.SERVICE.FILE_UPLOAD_SUCCESS,
      };
    } catch (err) {
      setError(NOTIFICATION_MESSAGES.SERVICE.FILE_UPLOAD_ERROR);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getServiceDetails,
    performCheckIn,
    performCheckOut,
    uploadServiceFile,
  };
};

// 고객 매칭 응답 시뮬레이션 (개발/테스트용)
export const useCustomerMatching = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 고객 매칭 응답 (수락/거절)
  const respondToMatching = useCallback(
    async (matchingId, action, memo = '') => {
      setLoading(true);
      setError(null);

      try {
        // eslint-disable-next-line no-unused-vars
        const requestBody = {
          action,
          memo: action === CUSTOMER_ACTION.REJECT ? memo : undefined,
        };

        // TODO: 실제 API 호출
        // const response = await fetch(API_ENDPOINTS.CUSTOMER_RESPONSE(matchingId), {
        //   method: 'PATCH',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${getAccessToken()}`
        //   },
        //   body: JSON.stringify(requestBody)
        // });

        // if (!response.ok) {
        //   throw new Error('고객 응답 실패');
        // }

        // 더미 응답 시뮬레이션
        console.log('고객 응답:', { matchingId, action, memo });

        return {
          success: true,
          message:
            action === CUSTOMER_ACTION.CONFIRM
              ? '매칭이 확정되었습니다.'
              : '매칭을 거절하였습니다.',
        };
      } catch (err) {
        setError('고객 응답 처리 중 오류가 발생했습니다.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    respondToMatching,
  };
};
