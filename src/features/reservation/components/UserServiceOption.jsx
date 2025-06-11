import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceOption.css';
import '../styles/common.css';
import Footer from '../../../components/Footer.jsx';
import Header from '../../../components/Header.jsx';
import { useAuthStore } from '../../../stores/authStore.js';
import {
  SERVICE_DESCRIPTIONS,
  SERVICE_TYPES,
} from '../constants/serviceData.js';
import clean1 from '../../../assets/images/clean1.png';
import housework2 from '../../../assets/images/housework2.png';
import cook3 from '../../../assets/images/cook3.png';

const UserServiceOption = () => {
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();

  const getUserGreeting = () => {
    // 🔍 디버깅: 사용자 정보 상세 확인
    console.log('🔍 UserServiceOption - 전체 사용자 정보:', user);
    console.log('🔍 UserServiceOption - 사용자 이름 (name):', user?.name);
    console.log(
      '🔍 UserServiceOption - 사용자 이름 (username):',
      user?.username
    );
    console.log('🔍 UserServiceOption - 사용자 전화번호:', user?.phone);
    console.log('🔍 UserServiceOption - 사용자 ID:', user?.userId);
    console.log('🔍 UserServiceOption - 사용자 역할:', user?.role);

    if (!user) {
      return '안녕하세요, 고객님!';
    }

    // 🔧 백엔드에서 username 필드로 이름이 오므로 수정
    let userName = user.username || user.name || user.phone || '고객';

    // 이미 "님"이 붙어있다면 제거하여 중복 방지
    if (userName.endsWith('님')) {
      userName = userName.slice(0, -1);
    }

    console.log('🔍 UserServiceOption - 최종 표시될 이름:', userName);
    return `안녕하세요, ${userName}님!`;
  };

  const getPersonalizedQuestion = () => {
    if (!user) {
      return SERVICE_DESCRIPTIONS.MAIN_QUESTION;
    }

    // 🔧 백엔드에서 username 필드로 이름이 오므로 수정
    let userName = user.username || user.name || user.phone || '고객';

    if (userName.endsWith('님')) {
      userName = userName.slice(0, -1);
    }

    return `${userName}님, 오늘 어떤 도움이 필요하신가요?`;
  };

  React.useEffect(() => {
    console.log('🔐 UserServiceOption - 현재 사용자 정보:', user);
    console.log(
      '🔑 UserServiceOption - 액세스 토큰:',
      accessToken ? '있음' : '없음'
    );

    // 🔍 localStorage에서 직접 확인
    const storedAuth = localStorage.getItem('auth-storage');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        console.log(
          '🔍 UserServiceOption - localStorage auth-storage:',
          parsedAuth
        );
        console.log(
          '🔍 UserServiceOption - localStorage user:',
          parsedAuth.state?.user
        );
      } catch (error) {
        console.error('🔍 UserServiceOption - localStorage 파싱 오류:', error);
      }
    }

    if (!user || !accessToken) {
      console.log('로그인 정보가 없습니다. 로그인 페이지로 이동합니다.');
      navigate('/auth/signin');
    }
  }, [user, accessToken, navigate]);

  const handleServiceClick = (serviceType) => {
    console.log(`${serviceType} 서비스 선택됨`);
    if (serviceType === SERVICE_TYPES.CLEANING) {
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
    <div className="reservation-page">
      <Header showBackButton={true} />
      <div className="page-content-wrapper">
        <div className="reservation-container" style={{ marginTop: '64px' }}>
          {/* 인사말 섹션 */}
          <div className="greeting-section">
            <h1 className="greeting-text">{getUserGreeting()}</h1>
            {/* ⭐️ 사용자 추가 정보 표시 */}
            {user && (
              <div className="user-welcome-info">
                <p className="welcome-message">오늘도 깔끔한 하루 되세요! ✨</p>
                {/* {user.role === 'ROLE_CUSTOMER' && (
                  <span className="user-badge">고객</span>
                )} */}
              </div>
            )}
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
            <h2 className="question-text">{getPersonalizedQuestion()}</h2>
          </div>

          {/* 서비스 옵션 섹션 */}
          <div className="service-options">
            <div
              className="service-card service-option"
              onClick={() => handleServiceClick(SERVICE_TYPES.CLEANING)}
            >
              <div className="service-icon">
                <img src={clean1} alt="청소 서비스" className="service-image" />
              </div>
            </div>
            <div
              className="service-card service-option"
              onClick={() => handleServiceClick(SERVICE_TYPES.INTERIOR)}
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
              className="service-card service-option"
              onClick={() => handleServiceClick(SERVICE_TYPES.COOKING)}
            >
              <div className="service-icon">
                <img src={cook3} alt="요리 서비스" className="service-image" />
              </div>
            </div>
          </div>

          {/* 예약 버튼 섹션 */}
          <div className="reservation-section">
            <button
              className="reservation-button special-button"
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
