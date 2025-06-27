import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';
import './BoardDetail.css';

const BoardDetail = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    // type에 따라 적절한 탭으로 이동
    navigate('/board', {
      state: { activeTab: type }, // 현재 타입(notice/faq)을 state로 전달
    });
  };

  // FAQ 데이터
  const faqData = [
    {
      id: 1,
      question: '서비스 예약은 어떻게 하나요?',
      answer: `홈페이지에서 원하는 서비스를 선택하고, 날짜와 시간을 지정하여 예약할 수 있습니다.

결제까지 완료하면 예약이 확정됩니다.`,
      category: '예약',
      views: 145,
      date: '2024-03-20',
    },
    {
      id: 2,
      question: '서비스 취소나 변경은 가능한가요?',
      answer: `서비스 24시간 전까지는 무료로 취소/변경이 가능합니다.

24시간 이내 취소 시에는 취소 수수료가 발생할 수 있습니다.`,
      category: '예약',
      views: 128,
      date: '2024-03-19',
    },
    {
      id: 3,
      question: '결제 방법은 무엇이 있나요?',
      answer: `다음과 같은 다양한 결제 수단을 지원합니다:

- 신용카드
- 체크카드
- 카카오페이
- 네이버페이

현금 결제는 지원하지 않습니다.`,
      category: '결제',
      views: 98,
      date: '2024-03-18',
    },
    {
      id: 4,
      question: '서비스 이용 중 문제가 발생하면 어떻게 하나요?',
      answer: `서비스 이용 중 문제가 발생하면 다음과 같이 연락해주세요:

1. 고객센터(1588-1234) 전화 연락
2. 앱 내 채팅 기능 이용

신속하게 처리해드리겠습니다.`,
      category: '서비스',
      views: 87,
      date: '2024-03-17',
    },
    {
      id: 5,
      question: '포인트는 어떻게 적립되나요?',
      answer: `서비스 이용 완료 후 자동으로 포인트가 적립됩니다.

- 적립률: 결제 금액의 3%
- 적립 시점: 서비스 완료 직후
- 사용 가능: 다음 결제 시 사용 가능`,
      category: '포인트',
      views: 76,
      date: '2024-03-16',
    },
    {
      id: 6,
      question: '매니저 변경 요청은 가능한가요?',
      answer: `서비스 시작 전까지는 매니저 변경 요청이 가능합니다.

고객센터로 연락주시면 가능한 범위 내에서 조치해드리겠습니다.

단, 서비스 시작 후에는 변경이 어려울 수 있습니다.`,
      category: '서비스',
      views: 65,
      date: '2024-03-15',
    },
    {
      id: 7,
      question: '쿠폰은 어떻게 사용하나요?',
      answer: `쿠폰 사용 방법:

1. 결제 페이지에서 보유한 쿠폰 선택
2. 할인 금액 확인
3. 결제 진행

주의사항:
- 쿠폰은 중복 사용 불가
- 최소 결제 금액 조건 확인 필요`,
      category: '쿠폰',
      views: 54,
      date: '2024-03-14',
    },
    {
      id: 8,
      question: '서비스 평가는 언제 작성하나요?',
      answer: `서비스 완료 후 24시간 내에 평가를 작성할 수 있습니다.

평가 작성 시 혜택:
- 추가 포인트 적립
- 서비스 품질 개선에 도움

* 정확하고 자세한 평가는 서비스 향상에 큰 도움이 됩니다.`,
      category: '평가',
      views: 43,
      date: '2024-03-13',
    },
  ];

  // 공지사항 데이터
  const noticeData = [
    {
      id: 1,
      title: '[공지] 서비스 이용 안내',
      content: `안녕하세요, 매니저님들!

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

이 지침들을 잘 숙지하여 서비스 품질 향상에 힘써주시기 바랍니다.`,
      author: '관리자',
      date: '2024-03-20',
      views: 328,
      isImportant: true,
    },
    {
      id: 2,
      title: '[공지] 매니저 안전 수칙 안내',
      content: `안녕하세요, 매니저님들!

안전한 서비스 제공을 위한 안전 수칙 안내드립니다.

1. 개인보호장비 착용
- 마스크, 장갑 필수
- 상황에 따라 보안경 착용

2. 화학제품 취급
- 제품 설명서 숙지
- 환기 필수
- 피부 접촉 주의

3. 응급상황 대처
- 비상연락망 숙지
- 응급처치 키트 확인

안전은 우리 모두의 책임입니다. 철저한 준수 부탁드립니다.`,
      author: '관리자',
      date: '2024-03-19',
      views: 256,
      isImportant: true,
    },
    {
      id: 3,
      title: '[안내] 청소 서비스 품질 관리 기준',
      content: `안녕하세요, 매니저님들!

청소 서비스의 품질 향상을 위한 관리 기준을 안내드립니다.

1. 기본 청소 절차
- 먼지 제거 및 진공 청소
- 물걸레 청소
- 화장실 및 주방 위생 관리

2. 품질 체크리스트
- 창문 및 거울 얼룩 확인
- 바닥 청결도 점검
- 쓰레기 분리수거 확인

3. 마무리 점검
- 전체 구역 최종 확인
- 고객 만족도 체크
- 특이사항 기록

철저한 품질 관리로 고객 만족도를 높여주시기 바랍니다.`,
      author: '관리자',
      date: '2024-03-18',
      views: 192,
      isImportant: false,
    },
    {
      id: 4,
      title: '[공지] 봄맞이 특별 서비스 안내',
      content: `안녕하세요, 매니저님들!

봄맞이 특별 서비스 진행과 관련하여 안내드립니다.

1. 특별 서비스 기간
- 2024년 4월 1일 ~ 4월 30일
- 대청소 서비스 20% 할인 적용

2. 서비스 내용
- 창문 및 베란다 대청소
- 에어컨 필터 청소
- 침구류 살균 소독

3. 주의사항
- 사전 예약 필수
- 할인 중복 적용 불가
- 서비스 시간 엄수

많은 관심과 참여 부탁드립니다.`,
      author: '관리자',
      date: '2024-03-17',
      views: 145,
      isImportant: true,
    },
    {
      id: 5,
      title: '[안내] 고객 만족도 조사 실시',
      content: `안녕하세요, 매니저님들!

서비스 품질 향상을 위한 고객 만족도 조사를 실시합니다.

1. 조사 기간
- 2024년 3월 20일 ~ 4월 10일
- 서비스 완료 후 자동 발송

2. 조사 항목
- 서비스 품질 만족도
- 매니저 친절도
- 시간 준수 여부

3. 활용 방안
- 서비스 개선 자료
- 우수 매니저 선정
- 교육 프로그램 개발

적극적인 협조 부탁드립니다.`,
      author: '관리자',
      date: '2024-03-16',
      views: 98,
      isImportant: false,
    },
    {
      id: 6,
      title: '[공지] 시스템 정기 점검 안내',
      content: `안녕하세요, 매니저님들!

시스템 안정화를 위한 정기 점검을 실시합니다.

1. 점검 일시
- 2024년 3월 25일 새벽 2시 ~ 6시
- 예상 소요시간 4시간

2. 점검 내용
- 서버 안정화
- 보안 업데이트
- 데이터베이스 최적화

3. 주의사항
- 점검 시간 동안 앱 사용 제한
- 예약 확인은 사전에 필수
- 긴급 연락처 숙지

불편을 끼쳐 죄송합니다.`,
      author: '관리자',
      date: '2024-03-15',
      views: 87,
      isImportant: false,
    },
  ];

  // 게시글 데이터 찾기
  let post;
  if (type === 'faq') {
    post = faqData.find((item) => item.id === parseInt(id));
  } else if (type === 'notice') {
    post = noticeData.find((item) => item.id === parseInt(id));
  }

  if (!post) {
    return (
      <div className="board-page">
        <Header showBackButton={true} onBackClick={handleGoBack} />
        <div className="board-content">
          <div className="board-container">
            <div className="board-detail-header">
              <button className="back-button" onClick={handleGoBack}>
                목록
              </button>
            </div>
            <div className="empty-state">
              <p>해당 게시글을 찾을 수 없습니다.</p>
            </div>
          </div>
        </div>
        <Footer current="board" />
      </div>
    );
  }

  return (
    <div className="board-page">
      <Header showBackButton={true} onBackClick={handleGoBack} />
      <div className="board-content">
        <div className="board-container">
          {type === 'notice' ? (
            <article className="post-detail">
              <h1 className="post-title">
                {post.isImportant && (
                  <span className="important-badge">중요</span>
                )}
                {post.title}
              </h1>
              <div className="post-meta">
                <span className="meta-item author">{post.author}</span>
                <span className="meta-item date">{post.date}</span>
                <span className="meta-item views">조회 {post.views}</span>
              </div>
              <div className="post-content">
                {post.content.split('\n').map((line, index) => (
                  <p key={index} className="content-line">
                    {line}
                  </p>
                ))}
              </div>
              <div className="button-container">
                <button className="back-button" onClick={handleGoBack}>
                  목록
                </button>
              </div>
            </article>
          ) : (
            <article className="post-detail faq-detail">
              <div className="faq-header">
                <span className={`category category-${post.category}`}>
                  {post.category}
                </span>
                <h2 className="question-title">{post.question}</h2>
                <div className="post-meta">
                  <span className="meta-item date">{post.date}</span>
                  <span className="meta-item views">조회 {post.views}</span>
                </div>
              </div>
              <div className="answer-section">
                <div className="answer">
                  {post.answer.split('\n').map((line, index) => (
                    <p key={index} className="answer-line">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
              <div className="button-container">
                <button className="back-button" onClick={handleGoBack}>
                  목록
                </button>
              </div>
            </article>
          )}
        </div>
      </div>
      <Footer current="board" />
    </div>
  );
};

export default BoardDetail;
