import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useAuthStore } from '../../../stores/authStore';
import './BoardList.css';

const BoardList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notice'); // 'notice' or 'inquiry'

  // ⭐️ 인증 상태 및 권한 확인
  const { user, accessToken } = useAuthStore();
  const isLoggedIn = user && accessToken;
  const isAdmin = user && user.role === 'ROLE_ADMIN';

  // 임시 공지사항 데이터 (조회수 상태 추가)
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
  ]);

  // 임시 문의글 데이터
  const inquiries = [
    {
      id: 1,
      title: '서비스 시간 변경 문의',
      author: '김매니저',
      date: '2024-03-20',
      status: '답변완료',
      isPrivate: true,
    },
    {
      id: 2,
      title: '청소도구 지원 관련 문의',
      author: '이매니저',
      date: '2024-03-19',
      status: '답변대기',
      isPrivate: false,
    },
    {
      id: 3,
      title: '고객 응대 관련 문의드립니다',
      author: '박매니저',
      date: '2024-03-18',
      status: '답변완료',
      isPrivate: true,
    },
  ];

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

  return (
    <div className="board-page">
      <Header title={activeTab === 'notice' ? '공지사항' : '문의하기'} />
      <div className="board-content">
        <div className="board-container">
          <div className="board-tabs">
            <button
              className={`tab-button ${activeTab === 'notice' ? 'active' : ''}`}
              onClick={() => setActiveTab('notice')}
            >
              공지사항
            </button>
            <button
              className={`tab-button ${activeTab === 'inquiry' ? 'active' : ''}`}
              onClick={() => setActiveTab('inquiry')}
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

              {notices.map((notice) => (
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
              {inquiries.map((inquiry) => (
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
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer current="board" />
    </div>
  );
};

export default BoardList;
