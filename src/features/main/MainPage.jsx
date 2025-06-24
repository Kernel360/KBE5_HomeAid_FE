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

          {/* 슬라이드쇼 배너 */}
          <SlideShow />
        </main>
        <Footer />
      </div>
    </div>
  );
});

export default MainPage;
