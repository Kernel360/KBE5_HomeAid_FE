import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import SlideShow from './components/SlideShow.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { memo } from 'react';

// 메인 페이지 컴포넌트
const MainPage = memo(() => {
  console.log('🟣 MainPage 렌더링됨', new Date().toLocaleTimeString());
  
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // 슬라이드 데이터는 이제 SlideShow 컴포넌트로 이동
  // 자동 슬라이드 기능도 SlideShow 컴포넌트로 이동

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
          {/* 로그인 사용자용 반갑습니다 텍스트 */}
          {user && (
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

          {/* 슬라이드쇼 배너 - 별도 컴포넌트로 분리 */}
          <SlideShow />

          {/* 서비스 바로가기 버튼들 */}
          <div className="mb-8">
            {/* 비로그인 사용자와 고객을 위한 안내 텍스트 */}
            {(!user || user?.role === 'ROLE_CUSTOMER') && (
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                서비스를 선택해주세요
              </h3>
            )}

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
});

export default MainPage;
