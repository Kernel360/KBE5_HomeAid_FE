import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './EventList.css';

const EventList = () => {
  const [activeTab, setActiveTab] = useState('ongoing'); // 'ongoing' or 'ended'

  // 진행중인 이벤트 더미 데이터
  const ongoingEvents = [
    {
      id: 1,
      title: '신규 매니저 특별 혜택',
      description: '새로 가입한 매니저님들을 위한 특별한 혜택을 제공합니다.',
      period: '2025.10.01 ~ 2025.10.31',
      image: '🎉',
      status: 'ongoing',
      isNew: true,
    },
    {
      id: 2,
      title: '봄맞이 청소 서비스 할인',
      description: '봄철 대청소를 위한 특별 할인 이벤트',
      period: '2025.10.01 ~ 2025.10.31',
      image: '🌸',
      status: 'ongoing',
      isNew: true,
    },
    {
      id: 3,
      title: '우수 매니저 시상식',
      description: '열심히 활동한 우수 매니저님들을 위한 시상식',
      period: '2025.10.01 ~ 2025.10.31',
      image: '🏆',
      status: 'ongoing',
      isNew: true,
    },
  ];

  // 종료된 이벤트 더미 데이터
  const endedEvents = [
    {
      id: 4,
      title: '겨울철 특별 보너스',
      description: '겨울철 매니저님들을 위한 특별 보너스 지급',
      period: '2024.01.01 ~ 2024.02.29',
      image: '❄️',
      status: 'ended',
      isNew: false,
    },
    {
      id: 5,
      title: '설날 연휴 이벤트',
      description: '설날 연휴 기간 동안 진행된 특별 이벤트',
      period: '2024.02.09 ~ 2024.02.12',
      image: '🧧',
      status: 'ended',
      isNew: false,
    },
  ];

  // 현재 탭에 따른 이벤트 데이터
  const currentEvents = activeTab === 'ongoing' ? ongoingEvents : endedEvents;

  // 이벤트 클릭 핸들러
  const handleEventClick = () => {
    alert('현재 진행중인 이벤트가 아닙니다');
  };

  return (
    <div className="event-page">
      <Header showBackButton={true} />
      <div className="page-content-wrapper">
        <div className="event-container">
          <div className="event-header">
            <h1 className="page-title">이벤트</h1>
            <p className="page-subtitle">다양한 이벤트와 혜택을 확인해보세요</p>
          </div>

          <div className="event-tabs">
            <button
              className={`tab-button ${activeTab === 'ongoing' ? 'active' : ''}`}
              onClick={() => setActiveTab('ongoing')}
            >
              진행중 이벤트
            </button>
            <button
              className={`tab-button ${activeTab === 'ended' ? 'active' : ''}`}
              onClick={() => setActiveTab('ended')}
            >
              종료된 이벤트
            </button>
          </div>

          <div className="event-list">
            {currentEvents.length > 0 ? (
              currentEvents.map((event) => (
                <div
                  key={event.id}
                  className={`event-item ${event.status}`}
                  onClick={() => handleEventClick()}
                >
                  <div className="event-image">
                    <span className="event-emoji">{event.image}</span>
                    {event.isNew && <span className="new-badge">NEW</span>}
                  </div>
                  <div className="event-content">
                    <div className="event-title-wrapper flex justify-between items-center mb-2">
                      <h3 className="event-title">{event.title}</h3>
                      <span className={`status-badge ${event.status}`}>
                        {event.status === 'ongoing' ? '진행예정' : '종료'}
                      </span>
                    </div>
                    <p className="event-description">{event.description}</p>
                    <div className="event-period">
                      <span className="period-icon">📅</span>
                      <span className="period-text">{event.period}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3 className="empty-title">
                  {activeTab === 'ongoing'
                    ? '진행중인 이벤트가 없습니다'
                    : '종료된 이벤트가 없습니다'}
                </h3>
                <p className="empty-description">
                  {activeTab === 'ongoing'
                    ? '새로운 이벤트가 곧 시작될 예정입니다.'
                    : '지난 이벤트를 확인할 수 있습니다.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer current="/event" />
    </div>
  );
};

export default EventList;
