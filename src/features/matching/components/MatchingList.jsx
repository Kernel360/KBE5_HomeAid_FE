import React from 'react';
import MatchingItem from './MatchingItem';

/**
 * 매칭 리스트 컴포넌트
 * 리스트 렌더링과 상태 표시를 담당
 */
const MatchingList = ({ 
  matchingList, 
  loading, 
  error, 
  onRetry,
  onDetailView,
  onServiceStart,
  onMatching 
}) => {
  // 로딩 상태
  if (loading) {
    return (
      <div className="loading-state">
        <p>로딩 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (error && !loading) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={onRetry} className="retry-button">
          다시 시도
        </button>
      </div>
    );
  }

  // 빈 상태
  if (matchingList.length === 0) {
    return (
      <div className="empty-state">
        <p>매칭 내역이 없습니다.</p>
      </div>
    );
  }

  // 리스트 렌더링
  return (
    <div className="matching-list">
      {matchingList.map((item) => (
        <MatchingItem
          key={item.id}
          item={item}
          onDetailView={onDetailView}
          onServiceStart={onServiceStart}
          onMatching={onMatching}
        />
      ))}
    </div>
  );
};

export default MatchingList;