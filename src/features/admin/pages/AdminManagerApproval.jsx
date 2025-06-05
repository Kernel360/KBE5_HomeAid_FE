import React, { useState } from 'react';
import './AdminManagerApproval.css'; // CSS 파일 import
import { useNavigate } from 'react-router-dom';

const AdminManagerApproval = () => {
  const navigate = useNavigate();

  // 선택된 매니저 상태 (모달 표시용)
  const [selectedManager, setSelectedManager] = useState(null);

  // 매니저 승인 요청 목록 (플레이스홀더 데이터)
  const [approvalRequests, setApprovalRequests] = useState([
    {
      id: 1,
      type: 'new', // 'urgent' 또는 'new'
      applicationDate: '3일 전',
      name: '홍길동',
      phone: '010-1234-5678',
      email: 'hong@example.com',
      experience: '청소 3년',
      serviceType: ['일반청소', '대청소'],
      activityArea: '서울시 강남구',
      submittedDocs: [
        { name: '신분증', status: 'verified' },
        { name: '경력증명서', status: 'pending' },
      ],
      status: 'pending', // overall request status: 'pending', 'review', 'approved', 'rejected'
    },
    {
      id: 2,
      type: 'new', // 'urgent' 또는 'new'
      applicationDate: '1일 전',
      name: '김매니저',
      phone: '010-2345-6789',
      email: 'kim@example.com',
      experience: '청소 1년',
      serviceType: ['입주 청소'],
      activityArea: '서울시 서초구',
      submittedDocs: [
        { name: '신분증', status: 'pending' },
        { name: '경력증명서', status: 'pending' },
      ],
      status: 'pending', // overall request status
    },
    {
      id: 3,
      type: 'new', // 'urgent' 또는 'new'
      applicationDate: '2일 전',
      name: '박승인',
      phone: '010-3456-7890',
      email: 'park@example.com',
      experience: '청소 2년',
      serviceType: ['이사 청소'],
      activityArea: '서울시 마포구',
      submittedDocs: [
        { name: '신분증', status: 'verified' },
        { name: '경력증명서', status: 'verified' },
      ],
      status: 'approved', // overall request status
    },
    {
      id: 4,
      type: 'new', // 'urgent' 또는 'new'
      applicationDate: '4일 전',
      name: '최반려',
      phone: '010-4567-8901',
      email: 'choi@example.com',
      experience: '청소 5년',
      serviceType: ['특수 청소'],
      activityArea: '서울시 영등포구',
      submittedDocs: [
        { name: '신분증', status: 'verified' },
        { name: '경력증명서', status: 'verified' },
      ],
      status: 'rejected', // overall request status
    },
    {
      id: 5,
      type: 'new', // 'urgent' 또는 'new'
      applicationDate: '5일 전',
      name: '정승인',
      phone: '010-5678-9012',
      email: 'jeong@example.com',
      experience: '청소 1년',
      serviceType: ['사무실 청소'],
      activityArea: '서울시 강서구',
      submittedDocs: [
        { name: '신분증', status: 'verified' },
        { name: '경력증명서', status: 'verified' },
      ],
      status: 'approved', // overall request status
    },
    {
      id: 6,
      type: 'new',
      applicationDate: '6일 전',
      name: '김철수',
      phone: '010-6789-0123',
      email: 'kimchulsu@example.com',
      experience: '청소 2년',
      serviceType: ['사무실 청소', '일반 청소'],
      activityArea: '서울시 서대문구',
      submittedDocs: [
        { name: '신분증', status: 'verified' },
        { name: '경력증명서', status: 'verified' },
      ],
      status: 'pending',
    },
    {
      id: 7,
      type: 'new',
      applicationDate: '2일 전',
      name: '이지영',
      phone: '010-7890-1234',
      email: 'leejy@example.com',
      experience: '청소 4년',
      serviceType: ['이사 청소'],
      activityArea: '서울시 송파구',
      submittedDocs: [
        { name: '신분증', status: 'verified' },
        { name: '경력증명서', status: 'verified' },
      ],
      status: 'pending',
    },
    {
      id: 8,
      type: 'new',
      applicationDate: '3일 전',
      name: '이지영',
      phone: '010-7890-1234',
      email: 'leejy@example.com',
      experience: '청소 4년',
      serviceType: ['이사 청소'],
      activityArea: '서울시 송파구',
      submittedDocs: [
        { name: '신분증', status: 'verified' },
        { name: '경력증명서', status: 'verified' },
      ],
      status: 'pending',
    },
    {
      id: 9,
      type: 'new',
      applicationDate: '1일 전',
      name: '이지영',
      phone: '010-7890-1234',
      email: 'leejy@example.com',
      experience: '청소 4년',
      serviceType: ['이사 청소'],
      activityArea: '서울시 송파구',
      submittedDocs: [
        { name: '신분증', status: 'verified' },
        { name: '경력증명서', status: 'verified' },
      ],
      status: 'pending',
    },
    {
      id: 10,
      type: 'new',
      applicationDate: '7일 전',
      name: '이지영',
      phone: '010-7890-1234',
      email: 'leejy@example.com',
      experience: '청소 4년',
      serviceType: ['이사 청소'],
      activityArea: '서울시 송파구',
      submittedDocs: [
        { name: '신분증', status: 'verified' },
        { name: '경력증명서', status: 'verified' },
      ],
      status: 'pending',
    },
  ]);

  // 현재 선택된 필터 상태 (승인 대기, 검토 중 등)
  const [filter, setFilter] = useState('all'); // 기본값: 전체
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 3; // 한 페이지에 보여줄 사용자 수

  // 상태별 요청 수 계산 (이미지 참고)
  const totalPending = approvalRequests.filter(
    (req) => req.status === 'pending'
  ).length;
  const totalReview = approvalRequests.filter(
    (req) => req.status === 'review'
  ).length;
  // 긴급 상태는 승인 대기 중인 요청 중에서 type이 'urgent'인 것으로 가정
  const totalApproved = approvalRequests.filter(
    (req) => req.status === 'approved'
  ).length;
  const totalRejected = approvalRequests.filter(
    (req) => req.status === 'rejected'
  ).length;

  // 현재 선택된 필터에 따라 매니저 요청 목록 필터링
  const filteredRequests = approvalRequests.filter((request) => {
    switch (filter) {
      case 'all':
        return true; // 'all' 필터일 경우 모든 요청 반환
      case 'pending':
        return request.status === 'pending';
      case 'review':
        return request.status === 'review';
      case 'approved':
        return request.status === 'approved';
      case 'rejected':
        return request.status === 'rejected';
      default:
        return true; // 정의된 필터 외의 경우는 모두 포함 (여기서는 발생하지 않음)
    }
  });

  // 매니저 승인 처리 함수
  const handleApprove = (managerId) => {
    // TODO: 실제 API 호출로 승인 처리 로직 구현
    console.log('Approve manager:', managerId);
    // 상태 업데이트 (플레이스홀더용)
    setApprovalRequests(
      approvalRequests.map((req) =>
        req.id === managerId ? { ...req, status: 'approved' } : req
      )
    );
  };

  // 매니저 거절 처리 함수
  const handleReject = (managerId) => {
    // TODO: 실제 API 호출로 거절 처리 로직 구현
    console.log('Reject manager:', managerId);
    // 상태 업데이트 (플레이스홀더용)
    setApprovalRequests(
      approvalRequests.map((req) =>
        req.id === managerId ? { ...req, status: 'rejected' } : req
      )
    );
  };

  // 매니저 검토 중 처리 함수
  const handleReview = (managerId) => {
    // TODO: 실제 API 호출로 검토 중 처리 로직 구현
    console.log('Review manager:', managerId);
    // 상태 업데이트 (플레이스홀더용)
    setApprovalRequests(
      approvalRequests.map((req) =>
        req.id === managerId ? { ...req, status: 'review' } : req
      )
    );
  };

  // // 매니저 빠른 승인 처리 함수
  // const handleQuickApprove = (managerId) => {
  //   // TODO: 실제 API 호출로 빠른 승인 처리 로직 구현
  //   console.log('Quick Approve manager:', managerId);
  //   // 상태 업데이트 (플레이스홀더용)
  //   setApprovalRequests(
  //     approvalRequests.map((req) =>
  //       req.id === managerId ? { ...req, status: 'approved' } : req
  //     )
  //   );
  // };

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const totalPages = Math.ceil(filteredRequests.length / usersPerPage);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="admin-approval-container">
      {' '}
      {/* 메인 컨테이너 (CSS에서 스타일링) */}
      <div className="admin-approval-header">
        {' '}
        {/* 헤더 (뒤로가기, 제목, 아이콘) */}
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> {/* 뒤로가기 아이콘 */}
        </button>
        <h2 className="admin-approval-title">매니저 승인 관리</h2>
        <div className="shield-icon">
          <i className="fas fa-shield-alt"></i> {/* 방패 아이콘 */}
        </div>
      </div>
      <div className="approval-status-overview">
        {' '}
        {/* 승인 대기 현황 섹션 */}
        <div className="status-overview-header">
          <i className="fas fa-clock"></i> {/* 시계 아이콘 */}
          <span>승인 대기 현황</span>
        </div>
        <div className="status-cards-row">
          {' '}
          {/* 상태 카드들 */}
          <div className="status-card pending-card">
            {' '}
            {/* 승인 대기 카드 */}
            <p>{totalPending}</p>
            <p>승인 대기</p>
          </div>
          <div className="status-card review-card">
            {' '}
            {/* 검토 중 카드 */}
            <p>{totalReview}</p>
            <p>검토 중</p>
          </div>
          <div className="status-card urgent-card">
            {' '}
            {/* 긴급 카드 */}
            <p>{totalApproved}</p>
            <p>승인 완료</p>
          </div>
          <div className="status-card rejected-card">
            {' '}
            {/* 반려 카드 */}
            <p>{totalRejected}</p>
            <p>반려</p>
          </div>
        </div>
      </div>
      <div className="filter-buttons">
        {' '}
        {/* 필터 버튼들 */}
        <button
          className={
            filter === 'all' ? 'filter-button active' : 'filter-button'
          }
          onClick={() => setFilter('all')}
        >
          전체
        </button>
        <button
          className={
            filter === 'pending' ? 'filter-button active' : 'filter-button'
          }
          onClick={() => setFilter('pending')}
        >
          승인 대기
        </button>
        <button
          className={
            filter === 'review' ? 'filter-button active' : 'filter-button'
          }
          onClick={() => setFilter('review')}
        >
          검토 중
        </button>
        <button
          className={
            filter === 'approved' ? 'filter-button active' : 'filter-button'
          }
          onClick={() => setFilter('approved')}
        >
          승인 완료
        </button>
        <button
          className={
            filter === 'rejected' ? 'filter-button active' : 'filter-button'
          }
          onClick={() => setFilter('rejected')}
        >
          반려
        </button>
      </div>
      <div className="manager-list-container">
        {' '}
        {/* 매니저 목록 (카드 형태) */}
        {filteredRequests
          .slice(indexOfFirstUser, indexOfLastUser)
          .map((manager) => (
            <div
              key={manager.id}
              className={`manager-approval-card ${manager.type === 'urgent' ? 'urgent' : 'new'}`}
            >
              {' '}
              {/* 개별 매니저 카드 */}
              <div className="card-header">
                {' '}
                {/* 카드 헤더 (긴급/신규 뱃지, 신청일) */}
                <span className={`type-badge ${manager.type}`}>
                  {manager.type === 'urgent' ? '▲ 긴급' : '신규'}
                </span>
                <span className="application-date">
                  {manager.applicationDate} 신청
                </span>
              </div>
              <div className="card-body">
                {' '}
                {/* 카드 바디 (아바타, 이름, 연락처) */}
                <div className="manager-avatar">
                  {/* 아바타 Placeholder */}
                  {manager.name.charAt(0)}
                </div>{' '}
                {/* 이름 첫 글자로 아바타 표시 예시 */}
                <div className="manager-details">
                  <h3>{manager.name}</h3>
                  <p>{manager.phone}</p>
                  <p>{manager.email}</p>
                </div>
              </div>
              <div className="card-section">
                {' '}
                {/* 경력, 서비스, 활동 지역 섹션 */}
                <p>
                  <strong>경력:</strong> {manager.experience}
                </p>
                <p>
                  <strong>서비스:</strong> {manager.serviceType.join(', ')}
                </p>
                <p>
                  <strong>활동지역:</strong> {manager.activityArea}
                </p>
              </div>
              <div className="card-section">
                {' '}
                {/* 제출 서류 섹션 */}
                <h4>제출 서류</h4>
                <ul>
                  {manager.submittedDocs.map((doc, index) => (
                    <li key={index}>
                      {doc.name}:{' '}
                      <span className={`doc-status ${doc.status}`}>
                        {doc.status === 'verified'
                          ? '확인완료'
                          : doc.status === 'pending'
                            ? '검토중'
                            : doc.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-actions">
                {' '}
                {/* 액션 버튼들 */}
                {/* 현재 상태에 따른 액션 버튼 조건부 렌더링 */}
                {manager.status === 'pending' && (
                  <>
                    <button
                      className="action-button reject"
                      onClick={() => handleReject(manager.id)}
                    >
                      반려
                    </button>
                    <button
                      className="action-button review"
                      onClick={() => handleReview(manager.id)}
                    >
                      검토 중
                    </button>
                    <button
                      className="action-button approve"
                      onClick={() => handleApprove(manager.id)}
                    >
                      승인
                    </button>
                  </>
                )}
                {manager.status === 'review' && (
                  <>
                    <button
                      className="action-button reject"
                      onClick={() => handleReject(manager.id)}
                    >
                      반려
                    </button>
                    <button
                      className="action-button approve"
                      onClick={() => handleApprove(manager.id)}
                    >
                      승인
                    </button>
                  </>
                )}
                {/* 상세 보기 버튼은 항상 표시 */}
                <button
                  className="action-button view"
                  onClick={() => setSelectedManager(manager)}
                >
                  상세 보기
                </button>
              </div>
            </div>
          ))}
        {/* 필터링된 요청이 없을 경우 메시지 표시 */}
        {filteredRequests.length === 0 && (
          <p className="no-requests">
            선택된 필터에 해당하는 매니저 승인 요청이 없습니다.
          </p>
        )}
      </div>
      {/* Pagination controls */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
      {/* 매니저 상세 정보 모달 */}
      {selectedManager && (
        <div className="manager-detail-modal">
          {' '}
          {/* 모달 오버레이 */}
          <div className="modal-content">
            {' '}
            {/* 모달 내용 */}
            <h2>매니저 상세 정보</h2>
            <div className="manager-info">
              {' '}
              {/* 상세 정보 내용 */}
              <p>
                <strong>이름:</strong> {selectedManager.name}
              </p>
              <p>
                <strong>이메일:</strong> {selectedManager.email}
              </p>
              <p>
                <strong>전화번호:</strong> {selectedManager.phone}
              </p>
              <p>
                <strong>신청일:</strong>{' '}
                {new Date(selectedManager.createdAt).toLocaleDateString()}
              </p>{' '}
              {/* 날짜 형식은 데이터에 맞게 수정 */}
              <p>
                <strong>상태:</strong>{' '}
                {
                  selectedManager.status === 'pending'
                    ? '대기중'
                    : selectedManager.status === 'approved'
                      ? '승인됨'
                      : selectedManager.status === 'rejected'
                        ? '거절됨'
                        : selectedManager.status // 다른 상태 추가 시
                }
              </p>
              {/* 제출 서류 상세 목록 등 추가 가능 */}
              {selectedManager.submittedDocs && (
                <div className="documents">
                  <h3>제출 서류</h3>
                  <ul>
                    {selectedManager.submittedDocs.map((doc, index) => (
                      <li key={index}>
                        {doc.name}:{' '}
                        <span className={`doc-status ${doc.status}`}>
                          {doc.status === 'verified'
                            ? '확인완료'
                            : doc.status === 'pending'
                              ? '검토중'
                              : doc.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              className="close-button"
              onClick={() => setSelectedManager(null)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagerApproval;
