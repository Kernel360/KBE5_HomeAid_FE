// Base API URL - 환경변수 사용
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// API 기본 URL 구성
const getBaseUrl = () => {
  const baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;
  return baseUrl;
};

// JWT 토큰을 헤더에 추가하는 함수
const getAuthHeaders = () => {
  let token = localStorage.getItem('accessToken');

  // JWT 토큰 상태 확인
  if (token && token.startsWith('eyJ')) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('auth-storage');
        token = null;
      }
    } catch (error) {
      console.warn('JWT 토큰 파싱 실패:', error.message);
    }
  }

  // 토큰이 없으면 에러 발생
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  return headers;
};

// 기본 API 호출 함수
const apiCall = async (url, options = {}) => {
  const fullUrl = `${getBaseUrl()}${url}`;

  const requestOptions = {
    headers: getAuthHeaders(),
    ...options,
  };

  const response = await fetch(fullUrl, requestOptions);

  if (!response.ok) {
    let errorData = null;
    let errorText = '';

    try {
      errorText = await response.text();
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || `HTTP ${response.status}` };
    }

    // 400 에러의 경우 더 자세한 정보 제공
    if (response.status === 400) {
      const detailedMessage =
        errorData?.message ||
        errorData?.error ||
        errorData?.details ||
        errorText ||
        '요청 형식이 잘못되었습니다.';
      throw new Error(`Bad Request (400): ${detailedMessage}`);
    }

    throw new Error(
      errorData?.message ||
        errorData?.error ||
        `HTTP error! status: ${response.status}`
    );
  }

  const result = await response.json();

  // Spring Boot CommonApiResponse 구조 처리
  if (result && typeof result === 'object' && 'data' in result) {
    return result.data;
  }

  return result;
};

// 리뷰 생성 - Spring Boot CustomerReviewRequestDto 형식에 맞게 수정
export const createReview = async (reviewData) => {
  try {
    // Spring Boot CustomerReviewRequestDto에 맞는 형식으로 변환
    const springBootReviewData = {
      targetId: Number(reviewData.targetId), // Long
      rating: Number(reviewData.rating), // int (1-5)
      comment: reviewData.comment, // String
      reservationId: Number(reviewData.reservationId), // Long
    };

    // 필수 필드 검증
    if (!springBootReviewData.targetId) {
      throw new Error('리뷰 대상자 ID가 필요합니다.');
    }
    if (
      !springBootReviewData.rating ||
      springBootReviewData.rating < 1 ||
      springBootReviewData.rating > 5
    ) {
      throw new Error('평점은 1-5 사이의 값이어야 합니다.');
    }
    if (
      !springBootReviewData.comment ||
      springBootReviewData.comment.trim().length < 10
    ) {
      throw new Error('리뷰 내용은 10자 이상 작성해주세요.');
    }
    if (!springBootReviewData.reservationId) {
      throw new Error('예약 ID가 필요합니다.');
    }

    // 백엔드 컨트롤러에 맞는 정확한 엔드포인트
    const endpoint = '/reviews';

    try {
      const response = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(springBootReviewData),
      });

      return response;
    } catch (error) {
      console.error('리뷰 API 호출 실패:', error);

      // 실제 에러 정보를 더 자세히 로깅
      console.error('요청 데이터:', springBootReviewData);
      console.error('요청 URL:', `${getBaseUrl()}${endpoint}`);

      throw error;
    }
  } catch (error) {
    console.error('리뷰 생성 실패:', error);

    // JWT 토큰 관련 에러 상세 처리
    if (
      error.message.includes('401') ||
      error.message.includes('JWT_INVALID')
    ) {
      throw new Error(
        'JWT_TOKEN_INVALID: JWT 토큰이 유효하지 않습니다. 다시 로그인해주세요.'
      );
    }

    // 403 Forbidden 에러 처리 - 더 자세한 정보 제공
    if (error.message.includes('403')) {
      // 현재 사용자 정보 확인
      const token = localStorage.getItem('accessToken');
      let userInfo = '알 수 없음';

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userInfo = `역할: ${payload.role}, ID: ${payload.sub || payload.userId}`;
        } catch {
          userInfo = '토큰 파싱 실패';
        }
      }

      throw new Error(
        `BACKEND_AUTH_ERROR: 리뷰 작성 권한이 없습니다.\n현재 사용자: ${userInfo}\n백엔드 API 권한 설정을 확인해주세요.`
      );
    }

    // 400 Bad Request 에러 처리
    if (error.message.includes('400')) {
      let detailMessage = error.message;
      if (error.message.includes('Bad Request (400):')) {
        detailMessage = error.message.split('Bad Request (400):')[1].trim();
      }

      if (detailMessage.includes('validation')) {
        detailMessage +=
          '\n\n가능한 원인:\n- 평점 범위 오류 (1-5)\n- 리뷰 내용 길이 부족\n- 필수 필드 누락';
      }

      throw new Error(`리뷰 데이터 형식 오류: ${detailMessage}`);
    }

    throw new Error(`리뷰 생성 실패: ${error.message}`);
  }
};

// 리뷰 목록 조회
export const getReviews = async () => {
  try {
    const response = await apiCall('/reviews');
    return response;
  } catch (error) {
    console.error('리뷰 목록 조회 실패:', error);
    throw error;
  }
};

// 사용자별 리뷰 조회
export const getReviewsByUserId = async (userId) => {
  try {
    const response = await apiCall(`/reviews/user/${userId}`);
    return response;
  } catch (error) {
    console.error('사용자별 리뷰 조회 실패:', error);
    throw error;
  }
};

// 리뷰 수정
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await apiCall(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
    return response;
  } catch (error) {
    console.error('리뷰 수정 실패:', error);
    throw error;
  }
};

// 리뷰 삭제
export const deleteReview = async (reviewId) => {
  try {
    const response = await apiCall(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('리뷰 삭제 실패:', error);
    throw error;
  }
};
