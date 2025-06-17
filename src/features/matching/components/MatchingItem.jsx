import React from 'react';

/**
 * 개별 매칭 아이템 컴포넌트
 * 순수 컴포넌트로 액션은 props로 전달받음
 */
const MatchingItem = ({ item, onDetailView, onServiceStart, onMatching }) => {
  
  // 상태별 배지 색상
  const getStatusBadgeClass = (statusColor) => {
    return `status-badge ${statusColor}`;
  };

  // 버튼 렌더링 로직
  const renderActionButtons = () => {
    console.log(
      `🔘 버튼 렌더링: ID ${item.id}, 상태: ${item.status}, 원본상태: ${item.originalStatus}`
    );

    switch (item.status) {
      case '매칭 대기':
        return (
          <button
            className="action-button matching-button"
            onClick={() => onMatching(item)}
          >
            매칭하기
          </button>
        );
      case '매칭 완료':
        return (
          <div className="button-group">
            <button
              className="action-button detail-button"
              onClick={() => onDetailView(item)}
            >
              상세보기
            </button>
            <button
              className="action-button service-button"
              onClick={() => onServiceStart(item)}
            >
              청소하기
            </button>
          </div>
        );
      case '고객 응답 대기':
      case '거절됨':
        return (
          <button
            className="action-button detail-button"
            onClick={() => onDetailView(item)}
          >
            상세보기
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="matching-item">
      <div className="item-header">
        <span className="item-id">#{item.id}</span>
        <span className={getStatusBadgeClass(item.statusColor)}>
          {item.status}
        </span>
      </div>

      <div className="item-content">
        <div className="item-info">
          <div className="info-row">
            <span className="label">고객명</span>
            <span className="value">{item.customerName}</span>
          </div>
          <div className="info-row">
            <span className="label">서비스 유형</span>
            <span className="value">{item.serviceType}</span>
          </div>
          <div className="info-row">
            <span className="label">일시</span>
            <span className="value">{item.workTime}</span>
          </div>
          {item.price && (
            <div className="info-row">
              <span className="label">금액</span>
              <span className="value price">
                {item.price.toLocaleString()}원
              </span>
            </div>
          )}
        </div>

        <div className="item-actions">
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
};

export default MatchingItem;