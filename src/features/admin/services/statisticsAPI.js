/**
 * 공통 API 호출 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {number} year - 연도
 * @param {number|null} month - 월 (optional)
 * @param {number|null} day - 일 (optional)
 * @returns {Promise<Object>} API 응답 데이터
 */
const fetchStatistics = async (endpoint, year, month, day) => {
  try {
    const token = localStorage.getItem('accessToken');
    let url = `/api/v1/admin/statistics/${endpoint}?year=${year}`;

    if (month) {
      url += `&month=${month}`;
    }
    if (day) {
      url += `&day=${day}`;
    }

    console.log(`🔗 ${endpoint} 통계 API 호출 URL:`, url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${endpoint} 통계 API 응답 데이터:`, data);

      // CommonApiResponse 구조 처리
      if (data && data.data) {
        return data.data;
      } else {
        return data;
      }
    } else {
      const errorText = await response.text();
      console.error(`❌ ${endpoint} 통계 API 오류:`, {
        status: response.status,
        error: errorText,
        url: url,
        requestDate: { year, month, day },
      });

      // 404 오류의 경우 더 구체적인 메시지 제공
      if (response.status === 404) {
        const dateStr = `${year}년${month ? ` ${month}월` : ''}${day ? ` ${day}일` : ''}`;
        throw new Error(
          `${endpoint} 통계 API 오류: 404 - ${dateStr} 데이터가 존재하지 않습니다.`
        );
      }

      throw new Error(`${endpoint} 통계 API 오류: ${response.status}`);
    }
  } catch (err) {
    console.error(`💥 ${endpoint} 통계 조회 실패:`, err);
    throw err;
  }
};

/**
 * 전체 통계 API 호출
 * @param {number} year - 연도
 * @param {number|null} month - 월
 * @param {number|null} day - 일
 * @returns {Promise<Object>} 전체 통계 데이터
 */
export const fetchAllStats = async (year, month, day) => {
  return await fetchStatistics('all', year, month, day);
};

/**
 * 회원 통계 API 호출
 * @param {number} year - 연도
 * @param {number|null} month - 월
 * @param {number|null} day - 일
 * @returns {Promise<Object>} 회원 통계 데이터
 */
export const fetchUserStats = async (year, month, day) => {
  return await fetchStatistics('users', year, month, day);
};

/**
 * 정산 통계 API 호출
 * @param {number} year - 연도
 * @param {number|null} month - 월
 * @param {number|null} day - 일
 * @returns {Promise<Object>} 정산 통계 데이터
 */
export const fetchSettlementStats = async (year, month, day) => {
  return await fetchStatistics('settlements', year, month, day);
};

/**
 * 결제 통계 API 호출
 * @param {number} year - 연도
 * @param {number|null} month - 월
 * @param {number|null} day - 일
 * @returns {Promise<Object>} 결제 통계 데이터
 */
export const fetchPaymentStats = async (year, month, day) => {
  return await fetchStatistics('payments', year, month, day);
};

/**
 * 예약 통계 API 호출
 * @param {number} year - 연도
 * @param {number|null} month - 월
 * @param {number|null} day - 일
 * @returns {Promise<Object>} 예약 통계 데이터
 */
export const fetchReservationStats = async (year, month, day) => {
  return await fetchStatistics('reservations', year, month, day);
};

/**
 * 매칭 통계 API 호출
 * @param {number} year - 연도
 * @param {number|null} month - 월
 * @param {number|null} day - 일
 * @returns {Promise<Object>} 매칭 통계 데이터
 */
/**
 * 매니저 평점 통계 조회
 * @param {number} year - 연도
 * @param {number|null} month - 월 (optional)
 * @param {number|null} day - 일 (optional)
 * @returns {Promise<Object>} 매니저 평점 통계 데이터
 */
export const fetchManagerRatingStats = async (year, month, day) => {
  return await fetchStatistics('manager-ratings', year, month, day);
};

export const fetchMatchingStats = async (year, month, day) => {
  return await fetchStatistics('matching', year, month, day);
};
