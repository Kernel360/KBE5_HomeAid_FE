import React from 'react';
import './MatchingSystemCard.css';
import { useNavigate } from 'react-router-dom';

function MatchingSystemCard({ manager }) {
  const navigate = useNavigate();

  const handleMatchClick = () => {
    navigate('/admin/managers');
  };

  // Function to determine status label and class based on image
  const getStatusInfo = (status) => {
    switch (status) {
      case 'service_completed':
        return { label: '서비스 완료', className: 'status-service-completed' }; // Use specific class name
      case 'match_completed':
        return { label: '매칭 완료', className: 'status-match-completed' }; // Use specific class name
      case 'pending':
        return { label: '매칭 대기', className: 'status-pending' }; // Keep existing class name
      default:
        return { label: '', className: '' };
    }
  };

  const statusInfo = getStatusInfo(manager.status);

  return (
    <div className="manager-card">
      <div className="card-header">
        <span className="booking-number">#{manager.id}</span>
        {manager.status && statusInfo.label && (
          <span className={`status-badge ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        )}
      </div>
      <div className="card-details">
        <div className="detail-row">
          <span className="detail-label">고객명</span>
          <span className="detail-value">{manager.name}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">매니저명</span>
          <span className="detail-value">{manager.managerName || '-'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">서비스 유형</span>
          <span className="detail-value">{manager.service}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">
            {manager.status === 'pending' ? '희망 일시' : '일시'}
          </span>
          <span className="detail-value">{manager.date}</span>
        </div>
        {manager.price && (
          <div className="detail-row">
            <span className="detail-label">금액</span>
            <span className="detail-value price">{manager.price}원</span>
          </div>
        )}
      </div>
      <div className="card-actions">
        {manager.status === 'pending' ? (
          <button className="action-button primary" onClick={handleMatchClick}>
            매칭하기
          </button>
        ) : (
          (manager.status === 'match_completed' ||
            manager.status === 'service_completed') && (
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
