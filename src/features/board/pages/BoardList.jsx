import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import './BoardList.css';

const BoardList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notice'); // 'notice' or 'inquiry'

  // 임시 공지사항 데이터
  const notices = [
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
  ];

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

  const handlePostClick = (postId, type) => {
    navigate(`/board/${type}/${postId}`);
  };

  const handleWriteClick = () => {
    navigate('/board/write');
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
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className={`post-item ${notice.isImportant ? 'important' : ''}`}
                  onClick={() => handlePostClick(notice.id, 'notice')}
                >
                  <div className="post-main">
                    {notice.isImportant && (
                      <span className="important-badge">중요</span>
                    )}
                    <h2 className="post-title">{notice.title}</h2>
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
                <button className="write-button" onClick={handleWriteClick}>
                  문의글 작성
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
