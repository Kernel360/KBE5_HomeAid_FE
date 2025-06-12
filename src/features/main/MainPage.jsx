import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useState, useEffect } from 'react';

// 메인 페이지 컴포넌트
const MainPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // 슬라이드 데이터
  const slides = [
    {
      id: 1,
      title: '365일 24시간 어디서든',
      subtitle: '앤트워크 서비스 이용가능!',
      badge: '공지',
      bgGradient: 'from-blue-500 to-purple-600',
      iconBg: 'bg-orange-400',
      iconInnerBg: 'bg-orange-500',
    },
    {
      id: 2,
      title: '전문 매니저가',
      subtitle: '최고의 서비스를 제공합니다!',
      badge: '서비스',
      bgGradient: 'from-green-500 to-teal-600',
      iconBg: 'bg-yellow-400',
      iconInnerBg: 'bg-yellow-500',
    },
    {
      id: 3,
      title: '신규 가입하면',
      subtitle: '첫 서비스 30% 할인!',
      badge: '이벤트',
      bgGradient: 'from-pink-500 to-rose-600',
      iconBg: 'bg-red-400',
      iconInnerBg: 'bg-red-500',
    },
  ];

  // 자동 슬라이드 기능
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000); // 3초마다 슬라이드 변경

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleServiceClick = (servicePath) => {
    if (user) {
      // 로그인된 사용자는 바로 서비스로 이동
      if (user.role === 'ROLE_CUSTOMER') {
        navigate(servicePath);
      } else if (user.role === 'ROLE_MANAGER') {
        navigate('/manager/mypage');
      } else if (user.role === 'ROLE_ADMIN') {
        navigate('/admin');
      }
    } else {
      // 비로그인 사용자는 로그인 페이지로 이동
      navigate('/auth/signin');
    }
  };

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-lg relative bg-white">
        {/* Header */}
        <Header isMainPage={true} />

        {/* 메인 컨텐츠 */}
        <main
          className={`px-6 py-6 min-h-screen flex flex-col ${user ? 'pb-24' : ''}`}
          style={{ marginTop: '64px' }}
        >
          {/* 매니저용 반갑습니다 텍스트 */}
          {user?.role === 'ROLE_MANAGER' && (
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.name || user.username}님, 반갑습니다
              </h2>
            </div>
          )}

          {/* 인사말 */}
          <div className="mb-8">
            <h1
              className="font-bold text-gray-900 text-center leading-relaxed whitespace-nowrap"
              style={{ fontSize: '30px' }}
            >
              오늘, 어떤 도움이 필요하신가요?
            </h1>
          </div>

          {/* 슬라이드쇼 배너 */}
          <div className="relative mb-8 overflow-hidden rounded-3xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`w-full flex-shrink-0 relative bg-gradient-to-r ${slide.bgGradient} rounded-3xl p-8 text-white overflow-hidden`}
                >
                  {/* 슬라이드 인디케이터 */}
                  <div className="absolute top-4 right-4 text-white/20">
                    <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {index + 1} / {slides.length}
                    </div>
                  </div>

                  {/* 아이콘 */}
                  <div className="absolute top-6 right-12">
                    <div
                      className={`w-16 h-16 ${slide.iconBg} rounded-full flex items-center justify-center transform rotate-12`}
                    >
                      <div
                        className={`w-8 h-8 ${slide.iconInnerBg} rounded-full`}
                      ></div>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <p className="text-sm font-medium mb-2 opacity-90">
                      {slide.badge}
                    </p>
                    <h2 className="text-2xl font-bold mb-4 leading-tight">
                      {slide.title}
                      <br />
                      {slide.subtitle}
                    </h2>
                  </div>
                </div>
              ))}
            </div>

            {/* 슬라이드 점 인디케이터 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-white' : 'bg-white/50'
                  }`}
                  style={{
                    width: '2px',
                    height: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* 서비스 바로가기 버튼들 */}
          <div className="mb-8">
            {/* 매니저가 아닌 경우에만 서비스 버튼들 표시 */}
            {user?.role !== 'ROLE_MANAGER' && (
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleServiceClick('/customer/service-option')}
                  className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    🧹
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    청소
                  </span>
                </button>

                <button
                  onClick={() => handleServiceClick('/customer/service-option')}
                  className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    👕
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    빨래
                  </span>
                </button>

                <button
                  onClick={() => handleServiceClick('/customer/service-option')}
                  className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200"
                >
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                    👶
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    육아
                  </span>
                </button>
              </div>
            )}

            {/* 로그인된 고객 사용자를 위한 추가 메뉴 */}
            {/* TODO: 예약내역과 마이페이지 버튼 기능 구현 예정 */}
            {/* {user && user.role === 'ROLE_CUSTOMER' && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/customer/reservations')}
                  className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors duration-200"
                >
                  <span className="text-sm font-medium text-blue-700">
                    예약 내역
                  </span>
                </button>

                <button
                  onClick={() => navigate('/customer/mypage')}
                  className="flex items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="text-sm font-medium text-gray-700">
                    마이페이지
                  </span>
                </button>
              </div>
            )} */}
          </div>
        </main>

        {/* 로그인된 사용자에게만 Footer 표시 */}
        {user && <Footer current="/" />}
      </div>
    </div>
  );
};

export default MainPage;
