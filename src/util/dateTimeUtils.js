/**
 * 날짜/시간 변환 유틸리티 함수들
 * @author HomeAid Team
 */

// ========== 날짜 변환 함수들 ==========

/**
 * "2025-06-12" → "2025년 6월 12일"로 변환
 * @param {string} dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @returns {string} 한국어 날짜 형식
 */
export const formatKoreanDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const [year, month, day] = dateString.split('-');
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  } catch (error) {
    console.warn('날짜 형식 변환 실패:', dateString);
    return dateString; // 원본 반환
  }
};

/**
 * "2025-06-12" → "6월 12일" (년도 제외)
 * @param {string} dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @returns {string} 한국어 날짜 형식 (년도 제외)
 */
export const formatKoreanDateShort = (dateString) => {
  if (!dateString) return '';
  
  try {
    const [, month, day] = dateString.split('-');
    return `${parseInt(month)}월 ${parseInt(day)}일`;
  } catch (error) {
    console.warn('날짜 형식 변환 실패:', dateString);
    return dateString;
  }
};

// ========== 시간 변환 함수들 ==========

/**
 * "09:05:00" → "9시 5분"으로 변환
 * @param {string} timeString - HH:mm:ss 형식의 시간 문자열
 * @returns {string} 한국어 시간 형식
 */
export const formatKoreanTime = (timeString) => {
  if (!timeString) return '';
  
  try {
    const [hour, minute] = timeString.split(':');
    const h = parseInt(hour);
    const m = parseInt(minute);
    
    if (m === 0) {
      return `${h}시`;
    } else {
      return `${h}시 ${m}분`;
    }
  } catch (error) {
    console.warn('시간 형식 변환 실패:', timeString);
    return timeString;
  }
};

/**
 * "09:05:00" → "오전 9시 5분" (오전/오후 포함)
 * @param {string} timeString - HH:mm:ss 형식의 시간 문자열
 * @returns {string} 한국어 시간 형식 (오전/오후 포함)
 */
export const formatKoreanTimeWithAmPm = (timeString) => {
  if (!timeString) return '';
  
  try {
    const [hour, minute] = timeString.split(':');
    const h = parseInt(hour);
    const m = parseInt(minute);
    
    const ampm = h < 12 ? '오전' : '오후';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    
    if (m === 0) {
      return `${ampm} ${displayHour}시`;
    } else {
      return `${ampm} ${displayHour}시 ${m}분`;
    }
  } catch (error) {
    console.warn('시간 형식 변환 실패:', timeString);
    return timeString;
  }
};

// ========== 조합 함수들 ==========

/**
 * 날짜와 시간을 함께 변환
 * @param {string} dateString - YYYY-MM-DD 형식
 * @param {string} timeString - HH:mm:ss 형식
 * @returns {string} "2025년 6월 12일 9시 5분" 형식
 */
export const formatKoreanDateTime = (dateString, timeString) => {
  const date = formatKoreanDate(dateString);
  const time = formatKoreanTime(timeString);
  
  if (!date && !time) return '';
  if (!date) return time;
  if (!time) return date;
  
  return `${date} ${time}`;
};

/**
 * 날짜와 시간을 함께 변환 (오전/오후 포함)
 * @param {string} dateString - YYYY-MM-DD 형식
 * @param {string} timeString - HH:mm:ss 형식
 * @returns {string} "2025년 6월 12일 오전 9시 5분" 형식
 */
export const formatKoreanDateTimeWithAmPm = (dateString, timeString) => {
  const date = formatKoreanDate(dateString);
  const time = formatKoreanTimeWithAmPm(timeString);
  
  if (!date && !time) return '';
  if (!date) return time;
  if (!time) return date;
  
  return `${date} ${time}`;
};

// ========== 추가 유틸 함수들 ==========

/**
 * 현재 날짜가 오늘인지 확인
 * @param {string} dateString - YYYY-MM-DD 형식
 * @returns {boolean} 오늘 여부
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
};

/**
 * 날짜가 과거인지 확인
 * @param {string} dateString - YYYY-MM-DD 형식
 * @returns {boolean} 과거 날짜 여부
 */
export const isPastDate = (dateString) => {
  if (!dateString) return false;
  
  const today = new Date().toISOString().split('T')[0];
  return dateString < today;
};

/**
 * 상대적 날짜 표시 (오늘, 내일, 어제 등)
 * @param {string} dateString - YYYY-MM-DD 형식
 * @returns {string} "오늘", "내일", "어제" 또는 한국어 날짜
 */
export const formatRelativeDate = (dateString) => {
  if (!dateString) return '';
  
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  if (dateString === today) return '오늘';
  if (dateString === tomorrow) return '내일';
  if (dateString === yesterday) return '어제';
  
  return formatKoreanDateShort(dateString);
};

// ========== 사용 예시 ==========

/*
// 기본 사용법
console.log(formatKoreanDate("2025-06-12"));     // "2025년 6월 12일"
console.log(formatKoreanTime("09:05:00"));       // "9시 5분"
console.log(formatKoreanTime("14:00:00"));       // "14시"
console.log(formatKoreanTimeWithAmPm("09:05:00")); // "오전 9시 5분"
console.log(formatKoreanTimeWithAmPm("14:30:00")); // "오후 2시 30분"

// 조합 사용법
console.log(formatKoreanDateTime("2025-06-12", "09:05:00")); 
// "2025년 6월 12일 9시 5분"

console.log(formatKoreanDateTimeWithAmPm("2025-06-12", "09:05:00")); 
// "2025년 6월 12일 오전 9시 5분"

// 상대적 날짜
console.log(formatRelativeDate("2025-06-12")); // "오늘" (오늘이라면)

// React 컴포넌트에서 사용
const ReservationItem = ({ reservation }) => {
  return (
    <div>
      <h3>{formatKoreanDateTime(reservation.requestedDate, reservation.requestedTime)}</h3>
      <p>예약일: {formatRelativeDate(reservation.requestedDate)}</p>
    </div>
  );
};
*/