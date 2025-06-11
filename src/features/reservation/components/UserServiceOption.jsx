// ⭐️ UserServiceOption 컴포넌트
// 로그인한 고객이 서비스를 선택하는 첫 번째 페이지
// 인증된 사용자의 이름을 동적으로 표시합니다.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceOption.css';
import '../styles/common.css';
import Footer from '../../../components/Footer.jsx';
import Header from '../../../components/Header.jsx';
import { useAuthStore } from '../../../stores/authStore.js';
import { SERVICE_DESCRIPTIONS, SERVICE_TYPES } from '../constants/serviceData.js';
import clean1 from '../../../assets/images/clean1.png';
import housework2 from '../../../assets/images/housework2.png';
import cook3 from '../../../assets/images/cook3.png';

const UserServiceOption = () => {
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();

  const getUserGreeting = () => {
    if (!user) {
      return '안녕하세요, 고객님!';
    }

    let userName = user.name || user.phone || '고객';

    if (userName.endsWith('님')) {
      userName = userName.slice(0, -1);
    }

    return `안녕하세요, ${userName}님!`;
  };

  React.useEffect(() => {
    console.log('🔐 UserServiceOption - 현재 사용자 정보:', user);
    console.log(
      '🔑 UserServiceOption - 액세스 토큰:',
      accessToken ? '있음' : '없음'
    );

    if (!user || !accessToken) {
      console.log('로그인 정보가 없습니다. 로그인 페이지로 이동합니다.');
      navigate('/auth/signin');
    }
  }, [user, accessToken, navigate]);

  // ⭐️ 개발용 테스트 함수
  const testUserInfo = () => {
    const testUser = {
      userId: 'test123',
      role: 'ROLE_CUSTOMER',
      name: '김철수',
      phone: '010-1234-5678',
      email: 'kimcs@test.com',
    };

    const { setUser, setAccessToken } = useAuthStore.getState();
    setUser(testUser);
    setAccessToken('test-token');

    console.log('🧪 테스트 사용자 정보 설정:', testUser);
    console.log('📝 표시될 인사말:', `안녕하세요, ${testUser.name}님!`);
  };

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
      <Header />
      <div className="page-content-wrapper">
        <div className="reservation-container">
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

            {/* ⭐️ 개발용 테스트 버튼 (프로덕션에서 제거) */}
            {!user && (
              <div
                style={{
                  marginTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#495057',
                  }}
                >
                  🧪 테스트용 로그인:
                </div>
                <button
                  onClick={testUserInfo}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #2196f3',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: '#1976d2',
                  }}
                >
                  🧪 정상 사용자 (김철수)
                </button>
                <button
                  onClick={() => {
                    // 실제 백엔드 응답과 유사한 형태로 시뮬레이션
                    const simulatedBackendResponse = {
                      userId: 12345,
                      role: 'ROLE_CUSTOMER',
                      name: '이영희',
                      phone: '010-1234-5678',
                      email: 'lee@example.com',
                    };

                    const { setUser, setAccessToken } = useAuthStore.getState();
                    setUser(simulatedBackendResponse);
                    setAccessToken('simulated-jwt-token-12345');

                    // localStorage에도 저장 (실제 로그인과 동일하게)
                    localStorage.setItem(
                      'accessToken',
                      'simulated-jwt-token-12345'
                    );

                    console.log(
                      '💡 실제 로그인 시뮬레이션:',
                      simulatedBackendResponse
                    );
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#e8f5e8',
                    border: '1px solid #4caf50',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: '#2e7d32',
                  }}
                >
                  💡 실제 로그인 시뮬레이션 (이영희)
                </button>
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
            <h2 className="question-text">
              {SERVICE_DESCRIPTIONS.MAIN_QUESTION}
            </h2>
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
