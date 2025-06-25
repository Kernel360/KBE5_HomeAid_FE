import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';
import { useAuthStore } from '../../../stores/authStore.js';
import './BoardList.css';

const BoardList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('notice'); // 'notice' or 'faq'

  // 페이징 상태 관리
  const [currentPage, setCurrentPage] = useState({
    notice: 1,
    faq: 1,
  });
  const itemsPerPage = 5;

  // ⭐️ 인증 상태 및 권한 확인
  const { user } = useAuthStore();
  const isAdmin = user && user.role === 'ROLE_ADMIN';

  // 임시 공지사항 데이터
  const [notices] = useState([
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

  // FAQ 데이터
  const [faqs] = useState([
    {
      id: 1,
      question: '서비스 예약은 어떻게 하나요?',
      answer:
        '홈페이지에서 원하는 서비스를 선택하고, 날짜와 시간을 지정하여 예약할 수 있습니다. 결제까지 완료하면 예약이 확정됩니다.',
      category: '예약',
      views: 145,
      date: '2024-03-20',
    },
    {
      id: 2,
      question: '서비스 취소나 변경은 가능한가요?',
      answer:
        '서비스 24시간 전까지는 무료로 취소/변경이 가능합니다. 24시간 이내 취소 시에는 취소 수수료가 발생할 수 있습니다.',
      category: '예약',
      views: 128,
      date: '2024-03-19',
    },
    {
      id: 3,
      question: '결제 방법은 무엇이 있나요?',
      answer:
        '신용카드, 체크카드, 카카오페이, 네이버페이 등 다양한 결제 수단을 지원합니다. 현금 결제는 지원하지 않습니다.',
      category: '결제',
      views: 98,
      date: '2024-03-18',
    },
    {
      id: 4,
      question: '서비스 이용 중 문제가 발생하면 어떻게 하나요?',
      answer:
        '서비스 이용 중 문제가 발생하면 즉시 고객센터(1588-1234)로 연락주시거나 앱 내 채팅 기능을 이용해주세요. 신속하게 처리해드리겠습니다.',
      category: '서비스',
      views: 87,
      date: '2024-03-17',
    },
    {
      id: 5,
      question: '포인트는 어떻게 적립되나요?',
      answer:
        '서비스 이용 완료 후 자동으로 포인트가 적립됩니다. 적립률은 결제 금액의 3%이며, 적립된 포인트는 다음 결제 시 사용 가능합니다.',
      category: '포인트',
      views: 76,
      date: '2024-03-16',
    },
    {
      id: 6,
      question: '매니저 변경 요청은 가능한가요?',
      answer:
        '서비스 시작 전까지는 매니저 변경 요청이 가능합니다. 고객센터로 연락주시면 가능한 범위 내에서 조치해드리겠습니다.',
      category: '서비스',
      views: 65,
      date: '2024-03-15',
    },
    {
      id: 7,
      question: '쿠폰은 어떻게 사용하나요?',
      answer:
        '결제 페이지에서 보유한 쿠폰을 선택하여 사용할 수 있습니다. 쿠폰은 중복 사용이 불가하며, 최소 결제 금액 조건을 만족해야 합니다.',
      category: '쿠폰',
      views: 54,
      date: '2024-03-14',
    },
    {
      id: 8,
      question: '서비스 평가는 언제 작성하나요?',
      answer:
        '서비스 완료 후 24시간 내에 평가를 작성할 수 있습니다. 평가를 작성하면 추가 포인트를 적립해드립니다.',
      category: '평가',
      views: 43,
      date: '2024-03-13',
    },
  ]);

  // location.state에서 activeTab 가져오기
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // state 초기화 (뒤로가기 시 state가 유지되는 것 방지)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
    setActiveTab(tab);
    setCurrentPage((prev) => ({
      ...prev,
      [tab]: 1,
    }));
  };

  // ⭐️ 게시글 클릭 핸들러
  const handlePostClick = (postId, type) => {
    // 상세 페이지로 이동
    navigate(`/board/${type}/${postId}`);
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
  const currentData = activeTab === 'notice' ? notices : faqs;

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
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-lg relative bg-white">
        <Header showBackButton={true} />
        <main
          className="px-6 py-6 min-h-screen flex flex-col"
          style={{ marginTop: '64px', paddingBottom: '100px' }}
        >
          <div className="board-tabs">
            <button
              className={`tab-button ${activeTab === 'notice' ? 'active' : ''}`}
              onClick={() => handleTabChange('notice')}
            >
              공지사항
            </button>
            <button
              className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
              onClick={() => handleTabChange('faq')}
            >
              FAQ
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
            <div className="faq-list">
              {paginatedData.length === 0 ? (
                /* FAQ가 없는 경우 */
                <div className="empty-state">
                  <p>등록된 자주묻는질문이 없습니다.</p>
                </div>
              ) : (
                /* FAQ 목록 표시 */
                paginatedData.map((faq) => (
                  <div
                    key={faq.id}
                    className="post-item faq-item"
                    onClick={() => handlePostClick(faq.id, 'faq')}
                  >
                    <div className="post-main">
                      <div className="post-title-container">
                        <span
                          className={`category-badge category-${faq.category}`}
                        >
                          {faq.category}
                        </span>
                        <h2 className="post-title">{faq.question}</h2>
                      </div>
                      <div className="post-info">
                        <span className="post-date">{faq.date}</span>
                      </div>
                    </div>
                    <div className="post-stats">
                      <span className="post-views">조회 {faq.views}</span>
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
        </main>
        <Footer current="/board" />
      </div>
    </div>
  );
};

export default BoardList;
