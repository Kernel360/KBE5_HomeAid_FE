import React from 'react';
import './MatchingSystemCard.css';
import { useNavigate } from 'react-router-dom';

function MatchingSystemCard({ reservation }) {
  const navigate = useNavigate();

  const handleMatchClick = () => {
    navigate(`/admin/managers?reservationId=${reservation.reservationId}`);
  };

  // Function to determine status label and class based on image
  const getStatusInfo = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { label: '서비스 완료', className: 'status-service-completed' };
      case 'MATCHED':
        return { label: '매칭 완료', className: 'status-match-completed' };
      case 'REQUESTED':
        return { label: '매칭 대기', className: 'status-pending' };
      case 'MATCHING':
        return { label: '매칭 중', className: 'status-pending' };
      default:
        return { label: '', className: '' };
    }
  };

  const statusInfo = getStatusInfo(reservation?.status);

  return (
    <div className="manager-card">
      <div className="card-header">
        <span className="booking-number">#{reservation?.reservationId}</span>
        {reservation?.status && statusInfo.label && (
          <span className={`status-badge ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        )}
      </div>
      <div className="card-details">
        <div className="detail-row">
          <span className="detail-label">고객명</span>
          <span className="detail-value">{reservation?.customerName}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">매니저명</span>
          <span className="detail-value">{reservation?.matchedManagerName || '-'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">서비스 유형</span>
          <span className="detail-value">{reservation?.subOptionName}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">
            {reservation?.status === 'REQUESTED' ? '희망 일시' : '일시'}
          </span>
          <span className="detail-value">{reservation?.startTime}</span>
        </div>
        {reservation?.price && (
          <div className="detail-row">
            <span className="detail-label">금액</span>
            <span className="detail-value price">{reservation.price.toLocaleString()}원</span>
          </div>
        )}
      </div>
      <div className="card-actions">
        {reservation?.status === 'REQUESTED' ? (
          <button className="action-button primary" onClick={handleMatchClick}>
            매칭하기
          </button>
        ) : (
          (reservation?.status === 'MATCHED' ||
            reservation?.status === 'COMPLETED') && (
            <div className="action-icons">
              <button className="icon-button view-icon">
                <i className="fas fa-eye"></i>
              </button>
              <button className="icon-button edit-icon">
                <i className="fas fa-edit"></i>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default MatchingSystemCard;
