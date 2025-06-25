import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserServiceSubOption.css';
import '../styles/common.css';
import Footer from '../../../components/Footer.jsx';
import Header from '../../../components/Header.jsx';
import { useAuthStore } from '../../../stores/authStore.js';
import { SERVICE_DESCRIPTIONS, USER_INFO } from '../constants/serviceData.js';
import { useCustomerServices } from '../hooks/useCustomerAPI.js';
import useReservationStore from '../../../stores/reservationStore.js';
import balconyIcon from '../../../assets/images/balcony.png';
import hotTubIcon from '../../../assets/images/hot-tub.png';
import windowIcon from '../../../assets/images/window.png';

const UserServiceSubOption = () => {
  const navigate = useNavigate();

  const [memo, setMemo] = useState('');

  // zustand store 사용
  const { setServiceDetails, setReservationInfo } = useReservationStore();

  // API 훅 사용
  const { services, loading, loadServices } = useCustomerServices();

  // ⭐️ 인증된 사용자 정보 가져오기
  const { user, accessToken } = useAuthStore();

  // 개인화된 서비스 질문 메시지 생성 함수
  const getPersonalizedServiceQuestion = () => {
    if (!user) {
      return '어떤 서비스가 필요하신가요?';
    }

    let userName = user.username || user.name || user.phone || '고객';

    if (userName.endsWith('님')) {
      userName = userName.slice(0, -1);
    }

    return `${userName}님, 오늘도 깨끗한 하루되세요!`;
  };

  // ⭐️ 자동으로 통합 청소 서비스 설정
  useEffect(() => {
    // 통합 청소 서비스 데이터를 reservationStore에 저장
    const selectedServiceData = getServiceData('combined_cleaning');
    const totalPrice = selectedServiceData.services.reduce(
      (total, service) => total + service.price,
      0
    );

    // 예약 데이터에 서비스 정보 저장
    setReservationInfo({
      selectedServices: selectedServiceData.services.map((service, index) => ({
        id: `combined_cleaning-${index}`,
        name: service.name,
        price: service.price,
        selected: true,
      })),
      serviceDetails: selectedServiceData.services,
      totalPrice: totalPrice,
      totalDuration: 240, // 통합 청소: 4시간
      serviceTitle: selectedServiceData.title,
      serviceDuration: selectedServiceData.duration,
    });
  }, [setReservationInfo]);

  const handleContinue = () => {
    // 메모를 store에 저장
    setReservationInfo({
      memo: memo,
    });

    navigate('/customer/service-request');
  };

  // ⭐️ 로그인 상태 확인
  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/auth/signin');
    }
  }, [user, accessToken, navigate]);

  // 컴포넌트 마운트 시 서비스 옵션 로드
  useEffect(() => {
    loadServices().catch(() => {
      // API 호출 실패 시에도 더미 데이터 설정 (무음)
    });
  }, [loadServices]);

  // 서비스 데이터가 로드되면 store에 저장
  useEffect(() => {
    // ⭐️ 실제 API 서비스 데이터를 store에 설정
    if (services && services.length > 0) {
      setServiceDetails(services);
    }
  }, [services, setServiceDetails]);

  // ⭐️ 서브옵션별 서비스 데이터 정의
  const getServiceData = (subOptionId) => {
    const serviceData = {
      laundry: {
        title: '기본 빨래 서비스',
        duration: '약 2-3시간 소요',
        services: [
          { name: '세탁물 분류 및 세탁', price: 15000 },
          { name: '건조 및 정리', price: 8000 },
          { name: '다림질 (기본)', price: 12000 },
          { name: '세탁 후 정리정돈', price: 5000 },
        ],
      },
      general_cleaning: {
        title: '베란다 청소 서비스',
        duration: '약 1-2시간 소요',
        services: [
          { name: '베란다 바닥 청소', price: 18000 },
          { name: '난간 및 창틀 청소', price: 15000 },
          { name: '베란다 유리창 청소', price: 12000 },
          { name: '베란다 정리정돈', price: 10000 },
        ],
      },
      bathroom_cleaning: {
        title: '욕실 청소 서비스',
        duration: '약 1-2시간 소요',
        services: [
          { name: '욕조 및 샤워부스 청소', price: 25000 },
          { name: '화장실 변기 청소', price: 15000 },
          { name: '타일 및 바닥 청소', price: 18000 },
          { name: '거울 및 세면대 청소', price: 12000 },
        ],
      },
      window_cleaning: {
        title: '창문 청소 서비스',
        duration: '약 1-2시간 소요',
        services: [
          { name: '창문 유리 청소', price: 20000 },
          { name: '창틀 및 방충망 청소', price: 15000 },
          { name: '베란다 바닥 청소', price: 12000 },
          { name: '창문 주변 정리', price: 8000 },
        ],
      },
      cleaning: {
        title: '기본 청소 서비스',
        duration: '약 2-3시간 소요',
        services: [
          { name: '바닥 청소 및 걸레질', price: 20000 },
          { name: '먼지 제거 및 정돈', price: 15000 },
          { name: '쓰레기통 비우기', price: 5000 },
          { name: '화장실 기본 청소', price: 18000 },
        ],
      },
      childcare: {
        title: '기본 육아 서비스',
        duration: '약 3-4시간 소요',
        services: [
          { name: '아이 돌봄 및 놀이', price: 25000 },
          { name: '식사 준비 및 수유', price: 15000 },
          { name: '기저귀 교체 및 위생관리', price: 10000 },
          { name: '아이 안전 관리', price: 12000 },
        ],
      },
      combined_cleaning: {
        title: '통합 청소 서비스',
        duration: '약 3-4시간 소요',
        services: [
          { name: '베란다 바닥 청소', price: 18000 },
          { name: '난간 및 창틀 청소', price: 15000 },
          { name: '베란다 유리창 청소', price: 12000 },
          { name: '욕조 및 샤워부스 청소', price: 25000 },
          { name: '화장실 변기 청소', price: 15000 },
          { name: '타일 및 바닥 청소', price: 18000 },
          { name: '창문 유리 청소', price: 20000 },
          { name: '창틀 및 방충망 청소', price: 15000 },
          { name: '전체 정리정돈', price: 10000 },
        ],
      },
    };

    return serviceData[subOptionId] || serviceData.combined_cleaning; // 기본값은 통합 청소
  };

  // 로딩 상태 표시 (단순화)
  if (loading && (!services || services.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div
          className="w-full bg-gray-50 h-screen flex flex-col"
          style={{
            maxWidth: '512px',
            margin: '0 auto',
            position: 'relative',
          }}
        >
          <Header showBackButton={true} />

          <main
            className="px-6 py-6 flex-1 overflow-y-auto"
            style={{ paddingBottom: '100px', paddingTop: '80px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
                fontSize: '16px',
                color: '#666',
              }}
            >
              서비스 옵션을 불러오는 중...
            </div>
          </main>

          <Footer current="/customer/service-sub-option" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div
        className="w-full bg-white h-screen flex flex-col"
        style={{
          maxWidth: '512px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <Header showBackButton={true} />

        <main
          className="px-6 py-6 flex-1 overflow-y-auto"
          style={{ paddingBottom: '100px', paddingTop: '80px' }}
        >
          {/* 서비스 선택 메시지 섹션 */}
          <div className="service-message-section">
            <h2 className="service-message">
              {getPersonalizedServiceQuestion()}
            </h2>
          </div>

          {/* 하위 서비스 옵션 섹션 */}
          <div className="sub-service-options">
            {/* 빨래 옵션 - 주석처리 */}
            {/* 
            <div
              className={`service-card sub-service-option ${
                selectedSubOption && selectedSubOption.id === 'laundry'
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleOptionSelect('빨래', 'laundry')}
            >
              <div className="laundry-icon">
                <div className="washing-machine">
                  <div className="machine-body"></div>
                  <div className="machine-door"></div>
                  <div className="water-drops">
                    <span>💧</span>
                    <span>💧</span>
                    <span>💧</span>
                  </div>
                </div>
              </div>
              <div className="option-label">빨래</div>
            </div>
            */}

            {/* 베란다 청소 옵션 */}
            <div
              className="service-card sub-service-option"
              style={{ backgroundColor: 'white', background: 'white' }}
            >
              <div className="cleaning-icon">
                <img
                  src={balconyIcon}
                  alt="베란다 청소"
                  className="cleaning-image"
                />
              </div>
              <div className="option-label">베란다 청소</div>
            </div>

            {/* 욕실 청소 옵션 */}
            <div
              className="service-card sub-service-option"
              style={{ backgroundColor: 'white', background: 'white' }}
            >
              <div className="cleaning-icon">
                <img
                  src={hotTubIcon}
                  alt="욕실 청소"
                  className="cleaning-image"
                />
              </div>
              <div className="option-label">욕실 청소</div>
            </div>

            {/* 창문 청소 옵션 */}
            <div
              className="service-card sub-service-option"
              style={{ backgroundColor: 'white', background: 'white' }}
            >
              <div className="cleaning-icon">
                <img
                  src={windowIcon}
                  alt="창문 청소"
                  className="cleaning-image"
                />
              </div>
              <div className="option-label">창문 청소</div>
            </div>

            {/* 육아 옵션 - 주석처리 */}
            {/* 
            <div
              className={`service-card sub-service-option ${
                selectedSubOption && selectedSubOption.id === 'childcare'
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleOptionSelect('육아', 'childcare')}
            >
              <div className="childcare-icon">
                <div className="baby-items">
                  <div className="baby-bottle"></div>
                  <div className="baby-toy"></div>
                  <div className="hearts">
                    <span>💕</span>
                    <span>💕</span>
                  </div>
                </div>
              </div>
              <div className="option-label">육아</div>
            </div>
            */}
          </div>

          {/* 기본 서비스 섹션 */}
          <div className="basic-service-section">
            <div className="service-header">
              <div className="service-title">
                <h3>서비스 메모</h3>
                <span className="service-duration">
                  추가 요청사항이나 특별한 사항을 적어주세요
                </span>
              </div>
            </div>

            {/* 메모 입력 칸 */}
            <div className="memo-section">
              <textarea
                className="memo-textarea"
                placeholder="예: 반려동물이 있어요, 특정 시간에 조용히 해주세요, 특별히 신경써야 할 부분이 있어요 등..."
                value={memo}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setMemo(e.target.value);
                  }
                }}
                rows={6}
                maxLength={500}
              />
              <div
                className={`memo-counter ${memo.length > 450 ? 'over-limit' : ''}`}
              >
                {memo.length}/500자
              </div>
            </div>

            <div className="service-note">
              <span>
                * 메모 내용은 매니저에게 전달되어 서비스 시 참고됩니다.
              </span>
            </div>
          </div>

          {/* 다음 단계 버튼 섹션 */}
          <div className="reservation-section">
            <button
              className="primary-button reservation-button"
              onClick={handleContinue}
            >
              다음 단계
            </button>
          </div>
        </main>

        <Footer current="/customer/service-sub-option" />
      </div>
    </div>
  );
};

export default UserServiceSubOption;
