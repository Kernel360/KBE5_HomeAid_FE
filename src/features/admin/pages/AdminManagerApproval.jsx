import React, { useState, useEffect } from 'react';
import './AdminManagerApproval.css';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../api';
// import api from '@/services/apiClient';

const AdminManagerApproval = () => {
  const navigate = useNavigate();

  const [approvalRequests, setApprovalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 3;

  // DB 목록 불러오기 (최신 가입순 정렬 추가!)
  const fetchManagers = async () => {
    setLoading(true);
    try {
      const res = apiService.manager.getManagerList();
      // console.log('API 응답:', res.data.data);
      if (res.data.data) {
        const sorted = res.data.data.slice().sort((a, b) => {
          if (!a.signupDate || !b.signupDate) return 0;
          return new Date(b.signupDate) - new Date(a.signupDate);
        });
        setApprovalRequests(sorted);
      }
    } catch (err) {
      console.error('매니저 목록 불러오기 실패:', err);
      alert('매니저 목록 불러오기 실패\n' + err.message);
      setApprovalRequests([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  // ✅ 서버에 반영 후 DB에서 최신 목록으로 갱신 (최적 패턴)
  const changeStatus = async (id, status) => {
    try {
      // const response = await api.patch(`/api/v1/managers/${id}/status`, {
      //   status,
      // });
      const response = await apiService.manager.changeStatus(id, status);

      if (response.status === 200) {
        // 서버 응답이 성공적일 때만 상태 업데이트
        setApprovalRequests((prevRequests) =>
          prevRequests.map((manager) =>
            manager.id === id ? { ...manager, status } : manager
          )
        );
      } else {
        throw new Error('서버 응답이 성공적이지 않습니다.');
      }
    } catch (e) {
      console.error('상태 변경 중 오류 발생:', e);
      alert('상태 변경 실패\n' + e.message);
      // 에러 발생 시 최신 데이터로 다시 불러오기
      await fetchManagers();
    }
  };

  // 카운트
  const totalPending = approvalRequests.filter(
    (m) => m.status?.toLowerCase() === 'pending'
  ).length;
  const totalReview = approvalRequests.filter(
    (m) => m.status?.toLowerCase() === 'review'
  ).length;
  const totalApproved = approvalRequests.filter(
    (m) => m.status?.toLowerCase() === 'active'
  ).length;
  const totalRejected = approvalRequests.filter(
    (m) => m.status?.toLowerCase() === 'rejected'
  ).length;

  // 필터링
  const filteredRequests = approvalRequests.filter((manager) => {
    if (filter === 'all') return true;
    if (filter === 'pending')
      return manager.status?.toLowerCase() === 'pending';
    if (filter === 'approved')
      return manager.status?.toLowerCase() === 'active';
    if (filter === 'rejected')
      return manager.status?.toLowerCase() === 'rejected';
    if (filter === 'review') return manager.status?.toLowerCase() === 'review';
    return true;
  });

  // 페이지네이션
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredRequests.slice(
    indexOfFirstUser,
    indexOfLastUser
  );
  const totalPages = Math.ceil(filteredRequests.length / usersPerPage);

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  return (
    <div className="admin-approval-container">
      <div className="admin-approval-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className="admin-approval-title">매니저 승인 관리</h2>
        <div className="shield-icon">
          <i className="fas fa-shield-alt"></i>
        </div>
      </div>

      {/* 승인 대기 현황 */}
      <div className="approval-status-overview">
        <div className="status-cards-row">
          <div className="status-card pending">
            <p>{totalPending}</p>
            <p>승인 대기</p>
          </div>
          <div className="status-card review">
            <p>{totalReview}</p>
            <p>검토 중</p>
          </div>
          <div className="status-card approved">
            <p>{totalApproved}</p>
            <p>승인 완료</p>
          </div>
          <div className="status-card rejected">
            <p>{totalRejected}</p>
            <p>반려</p>
          </div>
        </div>
      </div>

      {/* 필터 버튼 */}
      <div className="filter-buttons">
        <button
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          전체
        </button>
        <button
          className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          승인 대기
        </button>
        <button
          className={`filter-button ${filter === 'review' ? 'active' : ''}`}
          onClick={() => setFilter('review')}
        >
          검토 중
        </button>
        <button
          className={`filter-button ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          승인 완료
        </button>
        <button
          className={`filter-button ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          반려
        </button>
      </div>

      {/* 매니저 목록 */}
      <div className="manager-list-container">
        {loading ? (
          <div>로딩중...</div>
        ) : currentUsers.length === 0 ? (
          <div>데이터 없음</div>
        ) : (
          currentUsers.map((manager) => {
            // const status = manager.status?.toLowerCase();
            const status = (manager.status || '').trim().toLowerCase();
            console.log(manager.name, status);
            return (
              <div key={manager.id} className="manager-approval-card">
                <div className="card-header">
                  <span className="type-badge">
                    {status === 'pending'
                      ? '신규'
                      : status === 'active'
                        ? '승인'
                        : status === 'review'
                          ? '검토 중'
                          : status === 'rejected'
                            ? '반려'
                            : status}
                  </span>
                  <span className="application-date">
                    {manager.signupDate} 가입
                  </span>
                </div>
                <div className="card-body">
                  <div className="manager-avatar">
                    {manager.name?.charAt(0)}
                  </div>
                  <div className="manager-details">
                    <h3>{manager.name}</h3>
                    <p>{manager.phone}</p>
                    <p>{manager.email}</p>
                  </div>
                </div>
                <div className="card-section">
                  <p>
                    <strong>경력:</strong> {manager.career}
                  </p>
                  <p>
                    <strong>경험:</strong> {manager.experience}
                  </p>
                </div>
                {/* 상태별 버튼: pending/review만 노출 */}
                <div className="card-actions">
                  {status === 'pending' && (
                    <>
                      <button
                        className="action-button reject"
                        onClick={() => changeStatus(manager.id, 'rejected')}
                      >
                        반려
                      </button>
                      <button
                        className="action-button review"
                        onClick={() => changeStatus(manager.id, 'review')}
                      >
                        검토 중
                      </button>
                      <button
                        className="action-button approve"
                        onClick={() => changeStatus(manager.id, 'active')}
                      >
                        승인
                      </button>
                    </>
                  )}
                  {status === 'review' && (
                    <>
                      <button
                        className="action-button reject"
                        onClick={() => changeStatus(manager.id, 'rejected')}
                      >
                        반려
                      </button>
                      <button
                        className="action-button approve"
                        onClick={() => changeStatus(manager.id, 'active')}
                      >
                        승인
                      </button>
                    </>
                  )}
                  {(status === 'active' || status === 'rejected') && (
                    <span className="status-complete">처리완료</span>
                  )}
                  <button
                    className="action-button view"
                    onClick={() => setSelectedManager(manager)}
                  >
                    상세 보기
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* 페이지네이션 */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
      {/* 상세 모달 */}
      {selectedManager && (
        <div className="manager-detail-modal">
          <div className="modal-content">
            <h2>매니저 상세 정보</h2>
            <div className="manager-info">
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
                <strong>가입일:</strong> {selectedManager.signupDate}
              </p>
              <p>
                <strong>상태:</strong>
                {selectedManager.status?.toLowerCase() === 'pending'
                  ? '대기중'
                  : selectedManager.status?.toLowerCase() === 'active'
                    ? '승인됨'
                    : selectedManager.status?.toLowerCase() === 'rejected'
                      ? '거절됨'
                      : selectedManager.status?.toLowerCase() === 'review'
                        ? '검토 중'
                        : selectedManager.status}
              </p>
              <p>
                <strong>경력:</strong> {selectedManager.career}
              </p>
              <p>
                <strong>경험:</strong> {selectedManager.experience}
              </p>
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
