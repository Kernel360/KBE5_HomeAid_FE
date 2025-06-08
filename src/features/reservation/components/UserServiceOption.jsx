import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceOption.css';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
import clean1 from '../../../assets/images/clean1.png';
import housework2 from '../../../assets/images/housework2.png';
import cook3 from '../../../assets/images/cook3.png';

const UserServiceOption = () => {
  const navigate = useNavigate();

  const handleServiceClick = (serviceType) => {
    console.log(`${serviceType} 서비스 선택됨`);
    if (serviceType === '청소') {
      navigate('/user/service-sub-option');
    }
    // TODO: 다른 서비스 타입에 대한 로직 구현
  };

  const handleReservationClick = () => {
    console.log('365일 24시간 서비스 예약 버튼 클릭');
    // TODO: 예약 페이지로 이동하는 로직 구현
  };

  const handleEventClick = () => {
    console.log('이벤트 또는 공지사항 클릭');
    // TODO: 이벤트/공지사항 페이지로 이동하는 로직 구현
  };

  return (
    <div className="user-service-page">
      <Header />
      <div className="page-content-wrapper">
        <div className="user-service-option-container">
          {/* 인사말 섹션 */}
          <div className="greeting-section">
            <h1 className="greeting-text">양증진 님 반가워요.</h1>
          </div>

          {/* 로고 섹션 */}
          <div className="logo-section">
            <div className="logo-container">
              <div className="logo-text">
                <span className="logo-ant">ant</span>
                <span className="logo-work">work</span>
              </div>
              <p className="logo-subtitle">전문 가사도우미 매칭 플랫폼</p>
            </div>
          </div>

          {/* 질문 섹션 */}
          <div className="question-section">
            <h2 className="question-text">지금, 어떤 도움이 필요하신가요?</h2>
          </div>

          {/* 서비스 옵션 섹션 */}
          <div className="service-options">
            <div
              className="service-option"
              onClick={() => handleServiceClick('청소')}
            >
              <div className="service-icon">
                <img src={clean1} alt="청소 서비스" className="service-image" />
              </div>
            </div>
            <div
              className="service-option"
              onClick={() => handleServiceClick('인테리어')}
            >
              <div className="service-icon">
                <img
                  src={housework2}
                  alt="인테리어 서비스"
                  className="service-image"
                />
              </div>
            </div>
            <div
              className="service-option"
              onClick={() => handleServiceClick('요리')}
            >
              <div className="service-icon">
                <img src={cook3} alt="요리 서비스" className="service-image" />
              </div>
            </div>
          </div>

          {/* 예약 버튼 섹션 */}
          <div className="reservation-section">
            <button
              className="reservation-button"
              onClick={handleReservationClick}
            >
              <div className="reservation-button-text">
                <span className="main-text">365일 24시간 어디서든</span>
                <span className="sub-text">앤트워크의 서비스 이용 가능</span>
              </div>
            </button>
          </div>

          {/* 이벤트/공지사항 섹션 */}
          <div className="event-section">
            <div className="event-box" onClick={handleEventClick}>
              <span className="event-text">이벤트 또는 공지사항 영역</span>
            </div>
          </div>
        </div>
      </div>
      <Footer current="/user/service-option" />
    </div>
  );
};

export default UserServiceOption;
