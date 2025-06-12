import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';
import { useAuthStore } from '../../../stores/authStore.js';
import axios from 'axios';
import './BoardList.css';

const BoardList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notice'); // 'notice' or 'inquiry'

  // 페이징 상태 관리
  const [currentPage, setCurrentPage] = useState({
    notice: 1,
    inquiry: 1,
  });
  const itemsPerPage = 5;

  // ⭐️ 인증 상태 및 권한 확인
  const { user, accessToken } = useAuthStore();
  const isLoggedIn = user && accessToken;
  const isAdmin = user && user.role === 'ROLE_ADMIN';

  // 문의글 상태 관리
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [inquiryError, setInquiryError] = useState(null);

  // 임시 공지사항 데이터 (6개로 확장)
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: '[공지] 서비스 이용 안내',
      author: '관리자',
      date: '2024-03-20',
      views: 328,
      isImportant: true,
    },
    {
      id: 2,
      title: '[공지] 매니저 안전 수칙 안내',
      author: '관리자',
      date: '2024-03-19',
      views: 256,
      isImportant: true,
    },
    {
      id: 3,
      title: '[안내] 청소 서비스 품질 관리 기준',
      author: '관리자',
      date: '2024-03-18',
      views: 192,
      isImportant: false,
    },
    {
      id: 4,
      title: '[공지] 봄맞이 특별 서비스 안내',
      author: '관리자',
      date: '2024-03-17',
      views: 145,
      isImportant: true,
    },
    {
      id: 5,
      title: '[안내] 고객 만족도 조사 실시',
      author: '관리자',
      date: '2024-03-16',
      views: 98,
      isImportant: false,
    },
    {
      id: 6,
      title: '[공지] 시스템 정기 점검 안내',
      author: '관리자',
      date: '2024-03-15',
      views: 87,
      isImportant: false,
    },
  ]);

  // 사용자 문의글 가져오기
  const fetchUserInquiries = async () => {
    if (!isLoggedIn) {
      setInquiries([]);
      return;
    }

    setLoadingInquiries(true);
    setInquiryError(null);

    try {
      const response = await axios.get('/api/v1/boards', {
        params: {
          page: 0,
          size: 100, // 충분히 큰 수로 설정하여 모든 게시글 가져오기
          sortBy: 'createdAt',
          sortDirection: 'desc',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.success) {
        const userInquiries = response.data.data.content.map((inquiry) => ({
          id: inquiry.id,
          title: inquiry.title,
          author: user?.name || user?.username || '사용자',
          date: new Date(inquiry.createdAt).toLocaleDateString(),
          status: inquiry.isAnswered ? '답변완료' : '답변대기',
          isPrivate: false, // API에서 제공하지 않는 경우 기본값
        }));
        setInquiries(userInquiries);
      } else {
        throw new Error('문의글을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to fetch user inquiries:', err);
      setInquiryError('문의글을 불러오는데 실패했습니다.');
      // 에러 시 빈 배열로 설정
      setInquiries([]);
    } finally {
      setLoadingInquiries(false);
    }
  };

  // 로그인 상태나 탭 변경 시 문의글 가져오기
  useEffect(() => {
    if (activeTab === 'inquiry') {
      fetchUserInquiries();
    }
  }, [activeTab, isLoggedIn, accessToken]);

  // 페이징 처리 함수
  const getCurrentPageData = (data, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // 전체 페이지 수 계산
  const getTotalPages = (data) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page, type) => {
    setCurrentPage((prev) => ({
      ...prev,
      [type]: page,
    }));
  };

  // 탭 변경 시 페이지 초기화
  const handleTabChange = (tab) => {
    if (tab === 'inquiry') {
      alert('준비중입니다');
      return;
    }
    setActiveTab(tab);
    setCurrentPage((prev) => ({
      ...prev,
      [tab]: 1,
    }));
  };

  // ⭐️ 조회수 증가 함수
  const increaseViews = (postId, type) => {
    if (type === 'notice') {
      setNotices((prevNotices) =>
        prevNotices.map((notice) =>
          notice.id === postId ? { ...notice, views: notice.views + 1 } : notice
        )
      );
    }
    // 실제 구현 시에는 여기서 API 호출하여 서버에 조회수 증가 요청
    // await updatePostViews(postId, type);
  };

  // ⭐️ 게시글 클릭 핸들러 (조회수 증가 포함)
  const handlePostClick = (postId, type) => {
    // 조회수 증가
    increaseViews(postId, type);
    // 상세 페이지로 이동
    navigate(`/board/${type}/${postId}`);
  };

  // ⭐️ 문의글 작성 핸들러
  const handleInquiryWriteClick = () => {
    // ⭐️ 문의글 작성 시 로그인 체크
    if (!isLoggedIn) {
      alert('문의글 작성은 로그인이 필요합니다.\n로그인 후 이용해주세요.');
      navigate('/auth/signin');
      return;
    }
    navigate('/board/write?type=inquiry');
  };

  // ⭐️ 공지사항 작성 핸들러 (관리자만)
  const handleNoticeWriteClick = () => {
    if (!isAdmin) {
      alert('공지사항 작성은 관리자만 가능합니다.');
      return;
    }
    navigate('/board/write?type=notice');
  };

  // 현재 탭에 따른 데이터와 페이지 정보
  const currentData = activeTab === 'notice' ? notices : inquiries;

  // 공지사항의 경우 중요도에 따라 정렬 (중요 공지사항이 상단에)
  const sortedData =
    activeTab === 'notice'
      ? [...currentData].sort((a, b) => {
          // 먼저 중요도로 정렬 (중요한 것이 위로)
          if (a.isImportant && !b.isImportant) return -1;
          if (!a.isImportant && b.isImportant) return 1;
          // 같은 중요도라면 날짜순으로 정렬 (최신이 위로)
          return new Date(b.date) - new Date(a.date);
        })
      : currentData;

  const currentPageNumber = currentPage[activeTab];
  const paginatedData = getCurrentPageData(sortedData, currentPageNumber);
  const totalPages = getTotalPages(sortedData);

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="board-page">
      <Header showBackButton={true} />
      <div className="page-content-wrapper">
        <div className="board-container">
          <div className="board-tabs">
            <button
              className={`tab-button ${activeTab === 'notice' ? 'active' : ''}`}
              onClick={() => handleTabChange('notice')}
            >
              공지사항
            </button>
            <button
              className={`tab-button ${activeTab === 'inquiry' ? 'active' : ''}`}
              onClick={() => handleTabChange('inquiry')}
            >
              문의하기
            </button>
          </div>

          {activeTab === 'notice' ? (
            <div className="notice-list">
              {/* 관리자만 공지사항 작성 가능 */}
              {isAdmin && (
                <div className="write-button-container">
                  <button
                    className="write-button"
                    onClick={handleNoticeWriteClick}
                  >
                    공지사항 작성
                  </button>
                </div>
              )}

              {paginatedData.map((notice) => (
                <div
                  key={notice.id}
                  className={`post-item ${notice.isImportant ? 'important' : ''}`}
                  onClick={() => handlePostClick(notice.id, 'notice')}
                >
                  <div className="post-main">
                    <div className="post-title-container">
                      {notice.isImportant && (
                        <span className="important-badge">중요</span>
                      )}
                      <h2 className="post-title">{notice.title}</h2>
                    </div>
                    <div className="post-info">
                      <span className="post-author">{notice.author}</span>
                      <span className="post-date">{notice.date}</span>
                    </div>
                  </div>
                  <div className="post-stats">
                    <span className="post-views">조회 {notice.views}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="inquiry-list">
              <div className="write-button-container">
                <button
                  className="write-button"
                  onClick={handleInquiryWriteClick}
                  disabled={!isLoggedIn}
                  title={!isLoggedIn ? '로그인이 필요합니다' : ''}
                >
                  {isLoggedIn ? '문의글 작성' : '로그인 후 문의글 작성'}
                </button>
              </div>

              {/* 로그인하지 않은 경우 */}
              {!isLoggedIn ? (
                <div className="empty-state">
                  <p>문의글을 확인하려면 로그인이 필요합니다.</p>
                  <button
                    className="login-button"
                    onClick={() => navigate('/auth/signin')}
                  >
                    로그인하러 가기
                  </button>
                </div>
              ) : loadingInquiries ? (
                /* 로딩 중 */
                <div className="loading-state">
                  <p>문의글을 불러오는 중...</p>
                </div>
              ) : inquiryError ? (
                /* 에러 발생 */
                <div className="error-state">
                  <p>{inquiryError}</p>
                  <button className="retry-button" onClick={fetchUserInquiries}>
                    다시 시도
                  </button>
                </div>
              ) : paginatedData.length === 0 ? (
                /* 문의글이 없는 경우 */
                <div className="empty-state">
                  <p>작성한 문의글이 없습니다.</p>
                  <p>궁금한 것이 있으시면 문의글을 작성해보세요!</p>
                </div>
              ) : (
                /* 문의글 목록 표시 */
                paginatedData.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="post-item"
                    onClick={() => handlePostClick(inquiry.id, 'inquiry')}
                  >
                    <div className="post-main">
                      <h2 className="post-title">
                        {inquiry.isPrivate && (
                          <span className="private-badge">비공개</span>
                        )}
                        {inquiry.title}
                      </h2>
                      <div className="post-info">
                        <span className="post-author">{inquiry.author}</span>
                        <span className="post-date">{inquiry.date}</span>
                      </div>
                    </div>
                    <div className="post-status">
                      <span
                        className={`status-badge ${inquiry.status === '답변완료' ? 'completed' : 'pending'}`}
                      >
                        {inquiry.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn prev-btn"
                onClick={() =>
                  handlePageChange(currentPageNumber - 1, activeTab)
                }
                disabled={currentPageNumber === 1}
              >
                ‹
              </button>

              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  className={`page-btn ${currentPageNumber === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum, activeTab)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                className="page-btn next-btn"
                onClick={() =>
                  handlePageChange(currentPageNumber + 1, activeTab)
                }
                disabled={currentPageNumber === totalPages}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer current="/board" />
    </div>
  );
};

export default BoardList;
