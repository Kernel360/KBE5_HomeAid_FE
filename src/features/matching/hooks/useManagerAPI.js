import { useState, useCallback } from 'react';
import useMatchingStore from '../../../stores/matchingStore';

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

// 매칭 요청 관리 훅
export const useManagerMatching = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setMatchingRequest, setLoading: setStoreLoading } =
    useMatchingStore();

  // 매칭 요청 조회
  const getMatchingRequest = useCallback(
    // eslint-disable-next-line no-unused-vars
    async (requestId) => {
      setLoading(true);
      setStoreLoading(true);
      setError(null);

      try {
        // TODO: 실제 API 호출로 교체
        // const response = await api.get(`/api/v1/manager/matching-request/${requestId}`);
        // const data = response.data;

        // 더미 데이터 사용 (개발용)
        await new Promise((resolve) => setTimeout(resolve, 500)); // API 응답 시뮬레이션
        const data = DUMMY_MATCHING_REQUEST;

        setMatchingRequest(data);
        return data;
      } catch (err) {
        console.error('매칭 요청 조회 실패:', err);
        setError('매칭 요청 정보를 불러오는데 실패했습니다.');

        // 에러 시 더미 데이터로 폴백
        setMatchingRequest(DUMMY_MATCHING_REQUEST);
        return DUMMY_MATCHING_REQUEST;
      } finally {
        setLoading(false);
        setStoreLoading(false);
      }
    },
    [setMatchingRequest, setStoreLoading]
  );

  // 매칭 요청 수락
  const acceptMatchingRequest = useCallback(
    // eslint-disable-next-line no-unused-vars
    async (requestId) => {
      setLoading(true);
      setStoreLoading(true);
      setError(null);

      try {
        // TODO: 실제 API 호출로 교체
        // const response = await api.patch(`/api/v1/manager/matching-request/${requestId}/accept`);
        // return response.data;

        // 더미 응답 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log('매칭 요청 수락됨:', requestId);
        return { success: true, message: '매칭 요청이 수락되었습니다.' };
      } catch (err) {
        console.error('매칭 요청 수락 실패:', err);
        setError('매칭 요청 수락에 실패했습니다.');
        throw err;
      } finally {
        setLoading(false);
        setStoreLoading(false);
      }
    },
    [setStoreLoading]
  );

  // 매칭 요청 거절
  const rejectMatchingRequest = useCallback(
    // eslint-disable-next-line no-unused-vars
    async (requestId, reason) => {
      if (!reason?.trim()) {
        throw new Error('거절 사유를 입력해주세요.');
      }

      setLoading(true);
      setStoreLoading(true);
      setError(null);

      try {
        // TODO: 실제 API 호출로 교체
        // const response = await api.patch(`/api/v1/manager/matching-request/${requestId}/reject`, {
        //   reason: reason.trim()
        // });
        // return response.data;

        // 더미 응답 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log('매칭 요청 거절됨:', { requestId, reason });
        return { success: true, message: '매칭 요청이 거절되었습니다.' };
      } catch (err) {
        console.error('매칭 요청 거절 실패:', err);
        setError('매칭 요청 거절에 실패했습니다.');
        throw err;
      } finally {
        setLoading(false);
        setStoreLoading(false);
      }
    },
    [setStoreLoading]
  );

  return {
    loading,
    error,
    getMatchingRequest,
    acceptMatchingRequest,
    rejectMatchingRequest,
  };
};

// 서비스 체크인/아웃 관리 훅
export const useServiceCheckIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {
    setMatchingRequest,
    setServiceProgress,
    completeCheckIn,
    completeCheckOut,
    setLoading: setStoreLoading,
  } = useMatchingStore();

  // 서비스 상세 정보 조회
  const getServiceDetails = useCallback(
    // eslint-disable-next-line no-unused-vars
    async (serviceId) => {
      setLoading(true);
      setStoreLoading(true);
      setError(null);

      try {
        // TODO: 실제 API 호출로 교체
        // const response = await api.get(`/api/v1/manager/service/${serviceId}`);
        // const data = response.data;

        // 더미 데이터 사용
        await new Promise((resolve) => setTimeout(resolve, 500));
        const data = DUMMY_SERVICE_DETAILS;

        setMatchingRequest({
          customerName: data.customerName,
          serviceType: data.serviceType,
          dateTime: data.dateTime,
          address: data.address,
        });

        setServiceProgress({
          checkInStatus: data.checkInStatus,
          checkOutStatus: data.checkOutStatus,
        });

        return data;
      } catch (err) {
        console.error('서비스 상세 정보 조회 실패:', err);
        setError('서비스 정보를 불러오는데 실패했습니다.');

        // 에러 시 더미 데이터로 폴백
        const data = DUMMY_SERVICE_DETAILS;
        setMatchingRequest({
          customerName: data.customerName,
          serviceType: data.serviceType,
          dateTime: data.dateTime,
          address: data.address,
        });
        setServiceProgress({
          checkInStatus: data.checkInStatus,
          checkOutStatus: data.checkOutStatus,
        });
        return data;
      } finally {
        setLoading(false);
        setStoreLoading(false);
      }
    },
    [setMatchingRequest, setServiceProgress, setStoreLoading]
  );

  // 체크인 처리
  const performCheckIn = useCallback(
    // eslint-disable-next-line no-unused-vars
    async (serviceId) => {
      setLoading(true);
      setStoreLoading(true);
      setError(null);

      try {
        // TODO: 실제 API 호출로 교체
        // const response = await api.patch(`/api/v1/manager/service/${serviceId}/checkin`);
        // return response.data;

        // 더미 응답 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 1000));

        completeCheckIn();
        console.log('체크인 완료:', serviceId);
        return { success: true, message: '체크인이 완료되었습니다.' };
      } catch (err) {
        console.error('체크인 실패:', err);
        setError('체크인에 실패했습니다.');
        throw err;
      } finally {
        setLoading(false);
        setStoreLoading(false);
      }
    },
    [completeCheckIn, setStoreLoading]
  );

  // 체크아웃 처리
  const performCheckOut = useCallback(
    // eslint-disable-next-line no-unused-vars
    async (serviceId) => {
      setLoading(true);
      setStoreLoading(true);
      setError(null);

      try {
        // TODO: 실제 API 호출로 교체
        // const response = await api.patch(`/api/v1/manager/service/${serviceId}/checkout`);
        // return response.data;

        // 더미 응답 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 1000));

        completeCheckOut();
        console.log('체크아웃 완료:', serviceId);
        return { success: true, message: '체크아웃이 완료되었습니다.' };
      } catch (err) {
        console.error('체크아웃 실패:', err);
        setError('체크아웃에 실패했습니다.');
        throw err;
      } finally {
        setLoading(false);
        setStoreLoading(false);
      }
    },
    [completeCheckOut, setStoreLoading]
  );

  // 파일 업로드 (체크아웃과 함께)
  const uploadServiceFile = useCallback(
    // eslint-disable-next-line no-unused-vars
    async (serviceId, file) => {
      if (!file) {
        throw new Error('파일을 선택해주세요.');
      }

      setLoading(true);
      setStoreLoading(true);
      setError(null);

      try {
        // TODO: 실제 파일 업로드 API 호출로 교체
        // const formData = new FormData();
        // formData.append('file', file);
        // const response = await api.post(`/api/v1/manager/service/${serviceId}/upload`, formData);
        // return response.data;

        // 더미 업로드 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 2000));

        completeCheckOut();
        console.log('파일 업로드 및 체크아웃 완료:', {
          serviceId,
          fileName: file.name,
        });
        return {
          success: true,
          message: '파일 업로드 및 체크아웃이 완료되었습니다.',
        };
      } catch (err) {
        console.error('파일 업로드 실패:', err);
        setError('파일 업로드에 실패했습니다.');
        throw err;
      } finally {
        setLoading(false);
        setStoreLoading(false);
      }
    },
    [completeCheckOut, setStoreLoading]
  );

  return {
    loading,
    error,
    getServiceDetails,
    performCheckIn,
    performCheckOut,
    uploadServiceFile,
  };
};
