import React from 'react';
import './MatchingManagerCard.css';

function MatchingManagerCard({ manager }) {
  // Function to handle "상세 보기" button click (optional, can be implemented later)
  const handleViewDetails = () => {
    console.log('View details for manager:', manager.id);
    // TODO: Implement navigation to manager details page if needed
  };

  // Function to handle "매칭 완료" or "매칭하기" button click
  const handleActionButtonClick = () => {
    console.log('Action button clicked for manager:', manager.id);
    // TODO: Implement matching logic or navigation to matching action page
  };

  return (
    <div className="manager-list-card">
      <div className="card-header">
        <span className="manager-initial">{manager.name.charAt(0)}</span>
        <div className="manager-info-header">
          <span className="manager-name">{manager.name}</span>
          <span className="manager-id">ID: {manager.id}</span>
        </div>
      </div>
      <div className="card-details">
        <p>{manager.phone}</p>
        <p>{manager.email}</p>
        <p>가입일: {manager.joinDate}</p>
        <p>서비스: {manager.serviceType.join(', ')}</p>
        <p>활동 지역: {manager.activityArea}</p>
      </div>
      <div className="card-actions">
        <button className="action-button secondary" onClick={handleViewDetails}>
          상세 보기
        </button>
        {/* This button's text and action will depend on the context on the MatchingManagerList page */}
        <button
          className="action-button primary"
          onClick={handleActionButtonClick}
        >
          매칭하기
        </button>
      </div>
    </div>
  );
}

export default MatchingManagerCard;
