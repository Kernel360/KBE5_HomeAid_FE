import React from 'react';
import './ManagerApprovalCard.css';
import { useNavigate } from 'react-router-dom';

function ManagerApprovalCard({ request }) {
  const navigate = useNavigate();

  // Helper function to render document status
  const renderDocumentStatus = (status) => {
    switch (status) {
      case 'verified':
        return <span className="document-status verified">확인완료</span>;
      case 'pending':
        return <span className="document-status pending">검토중</span>;
      default:
        return null;
    }
  };

  // Helper function to render action buttons based on request type/status
  const renderActionButtons = () => {
    if (request.type === 'urgent') {
      return (
        <div className="action-buttons">
          <button className="action-button reject">반려</button>
          <button className="action-button review">검토</button>
          <button className="action-button approve">승인</button>
        </div>
      );
    } else if (request.type === 'new') {
      // "상세 보기" button navigates to the manager detail approval page
      const handleViewDetailsClick = () => {
        navigate(`/admin/manager-approval/${request.id}`);
      };
      return (
        <div className="action-buttons">
          <button
            className="action-button secondary"
            onClick={handleViewDetailsClick}
          >
            상세 보기
          </button>
          <button className="action-button primary">빠른 승인</button>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`manager-approval-card ${request.type === 'urgent' ? 'urgent' : ''}`}
    >
      <div className="card-header">
        {request.type === 'urgent' && (
          <span className="badge urgent">긴급</span>
        )}
        {request.type === 'new' && <span className="badge new">신규</span>}
        <span className="application-date">{request.applicationDate} 신청</span>
      </div>
      <div className="card-content">
        <div className="manager-info">
          <span className="manager-initial">{request.name.charAt(0)}</span>
          <div className="manager-details">
            <span className="manager-name">{request.name}</span>
            <p>{request.phone}</p>
            <p>{request.email}</p>
          </div>
        </div>
        <div className="approval-details">
          <div className="detail-row">
            <span className="detail-label">경력</span>
            <span className="detail-value">{request.experience}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">서비스</span>
            <span className="detail-value">
              {request.serviceType.join(', ')}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">활동지역</span>
            <span className="detail-value">{request.activityArea}</span>
          </div>
        </div>
        <div className="submitted-docs">
          <span className="docs-label">제출 서류</span>
          <div className="docs-list">
            {request.submittedDocs.map((doc) => (
              <div key={doc.name} className="doc-item">
                <span>{doc.name}</span>
                {renderDocumentStatus(doc.status)}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card-actions">{renderActionButtons()}</div>
    </div>
  );
}

export default ManagerApprovalCard;
