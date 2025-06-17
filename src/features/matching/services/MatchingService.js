/**
 * 매칭 비즈니스 로직 서비스
 * 데이터 변환과 필터링 로직을 담당
 */

export class MatchingService {
  // 탭 목록 정의
  static TABS = ['전체', '매칭 대기', '응답 대기', '매칭 완료', '거절'];

  // 페이지 새로고침 감지 로직
  static shouldRefreshOnLocationChange(location) {
    return location.pathname === '/matching/list' && location.state?.refreshData;
  }

  // 페이지 가시성 이벤트 설정
  static setupVisibilityListeners(refreshCallback) {
    const handleFocus = () => {
      console.log('🔄 페이지 포커스 - 매칭 목록 새로고침');
      refreshCallback();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 페이지 표시 - 매칭 목록 새로고침');
        refreshCallback();
      }
    };

    // 이벤트 리스너 추가
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 클린업 함수 반환
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }

  // 딜레이된 새로고침 (백엔드 업데이트 시간 고려)
  static delayedRefresh(refreshCallback, delay = 100) {
    setTimeout(() => {
      refreshCallback();
    }, delay);
  }
}

export default MatchingService;