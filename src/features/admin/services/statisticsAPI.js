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

/**
 * 월별 일별 추이 통계 조회 (해당 월의 모든 일별 데이터)
 * @param {string} endpoint - 통계 엔드포인트 (users, settlements, payments, etc.)
 * @param {number} year - 연도
 * @param {number} month - 월
 * @returns {Promise<Object[]>} 일별 통계 데이터 배열
 */
export const fetchMonthlyTrendStats = async (endpoint, year, month) => {
  const dailyStats = [];
  const daysInMonth = new Date(year, month, 0).getDate(); // 해당 월의 일수
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // 현재 월인 경우 오늘까지만, 과거 월인 경우 전체 일수
  const maxDay =
    year === currentYear && month === currentMonth
      ? Math.min(currentDay, daysInMonth)
      : daysInMonth;

  console.log(`📅 ${endpoint} 월별 추이 데이터 수집 시작:`, {
    year,
    month,
    maxDay,
    daysInMonth,
  });

  // 각 날짜별로 병렬 API 호출
  const promises = [];
  for (let day = 1; day <= maxDay; day++) {
    promises.push(
      fetchStatistics(endpoint, year, month, day)
        .then((data) => ({ day, data, success: true }))
        .catch((error) => ({
          day,
          data: null,
          success: false,
          error: error.message,
        }))
    );
  }

  try {
    const results = await Promise.all(promises);

    for (const result of results) {
      if (result.success && result.data) {
        dailyStats.push({
          day: result.day,
          date: `${year}-${String(month).padStart(2, '0')}-${String(result.day).padStart(2, '0')}`,
          ...result.data,
        });
      } else {
        // 데이터가 없는 날은 기본값으로 설정
        dailyStats.push({
          day: result.day,
          date: `${year}-${String(month).padStart(2, '0')}-${String(result.day).padStart(2, '0')}`,
          hasData: false,
        });
      }
    }

    console.log(`✅ ${endpoint} 월별 추이 데이터 수집 완료:`, {
      총일수: maxDay,
      성공건수: dailyStats.filter((d) => d.hasData !== false).length,
      데이터: dailyStats,
    });

    return dailyStats;
  } catch (error) {
    console.error(`❌ ${endpoint} 월별 추이 데이터 수집 실패:`, error);
    throw error;
  }
};
