import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';
import './BoardDetail.css';

const BoardDetail = ({ type = 'notice' }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // FAQ 데이터 (BoardList와 동일한 데이터)
  const faqData = [
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
  ];

  // 게시글 데이터 결정
  let post;

  if (type === 'faq') {
    const faqItem = faqData.find((item) => item.id === parseInt(id));
    post = faqItem
      ? {
          id: faqItem.id,
          title: faqItem.question,
          content: faqItem.answer,
          author: 'FAQ',
          date: faqItem.date,
          views: faqItem.views,
          category: faqItem.category,
        }
      : null;
  } else {
    // 기존 공지사항/문의 데이터
    post = {
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
  }

  const handleBackClick = () => {
    navigate('/board');
  };

  if (type === 'faq' && !post) {
    return (
      <div className="board-page">
        <Header title="자주묻는질문" />
        <div className="board-content">
          <div className="board-container">
            <div className="board-detail-header">
              <button className="back-button" onClick={handleBackClick}>
                목록으로
              </button>
            </div>
            <div className="empty-state">
              <p>해당 FAQ를 찾을 수 없습니다.</p>
            </div>
          </div>
        </div>
        <Footer current="board" />
      </div>
    );
  }

  return (
    <div className="board-page">
      <Header
        title={
          type === 'notice'
            ? '공지사항'
            : type === 'faq'
              ? '자주묻는질문'
              : '문의하기'
        }
      />
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
              {type === 'faq' && post.category && (
                <span className={`category-badge category-${post.category}`}>
                  {post.category}
                </span>
              )}
              {post.title}
            </h1>
            <div className="post-meta">
              <div className="post-info">
                <span className="post-author">{post.author}</span>
                <span className="post-date">{post.date}</span>
              </div>
              {(type === 'notice' || type === 'faq') && (
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
