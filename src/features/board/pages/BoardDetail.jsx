import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import './BoardDetail.css';

const BoardDetail = ({ type = 'notice' }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 임시 게시글 상세 데이터
  const post = {
    id: parseInt(id),
    title:
      type === 'notice' ? '[공지] 서비스 이용 안내' : '서비스 시간 변경 문의',
    content:
      type === 'notice'
        ? `안녕하세요, 매니저님들!

서비스 이용에 관한 중요 안내사항입니다.

1. 서비스 시간 준수
- 정시 도착이 매우 중요합니다
- 부득이한 지각 시 최소 30분 전 연락 필수

2. 안전 수칙 준수
- 안전장비 착용 필수
- 위험 상황 발생 시 즉시 보고

3. 고객 응대 매뉴얼
- 항상 친절하고 예의 바른 태도 유지
- 고객 요청사항 메모 필수

이 지침들을 잘 숙지하여 서비스 품질 향상에 힘써주시기 바랍니다.`
        : `안녕하세요, 

현재 배정받은 서비스 시간을 변경하고 싶습니다.
다음 주 수요일 오전 9시에서 오후 2시로 변경 가능할까요?

사유: 개인 병원 일정으로 인한 변경 요청

확인 후 답변 부탁드립니다.
감사합니다.`,
    author: type === 'notice' ? '관리자' : '김매니저',
    date: '2024-03-20',
    views: type === 'notice' ? 328 : 12,
    status: type === 'inquiry' ? '답변대기' : null,
    isPrivate: type === 'inquiry',
  };

  const handleBackClick = () => {
    navigate('/board');
  };

  return (
    <div className="board-page">
      <Header title={type === 'notice' ? '공지사항' : '문의하기'} />
      <div className="board-content">
        <div className="board-container">
          <div className="board-detail-header">
            <button className="back-button" onClick={handleBackClick}>
              목록으로
            </button>
            {type === 'inquiry' && (
              <div className="post-status">
                <span
                  className={`status-badge ${post.status === '답변완료' ? 'completed' : 'pending'}`}
                >
                  {post.status}
                </span>
              </div>
            )}
          </div>

          <article className="post-detail">
            <h1 className="post-title">
              {type === 'inquiry' && post.isPrivate && (
                <span className="private-badge">비공개</span>
              )}
              {post.title}
            </h1>
            <div className="post-meta">
              <div className="post-info">
                <span className="post-author">{post.author}</span>
                <span className="post-date">{post.date}</span>
              </div>
              {type === 'notice' && (
                <div className="post-stats">
                  <span className="post-views">조회 {post.views}</span>
                </div>
              )}
            </div>
            <div className="post-content">
              {post.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </article>
        </div>
      </div>
      <Footer current="board" />
    </div>
  );
};

export default BoardDetail;
