import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

// 메인 페이지 컴포넌트
const MainPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

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
          {/* 인사말 */}
          <div className="mb-8">
            <h1
              className="font-bold text-gray-900 text-center leading-relaxed whitespace-nowrap"
              style={{ fontSize: '30px' }}
            >
              오늘, 어떤 도움이 필요하신가요?
            </h1>
          </div>

          {/* 광고 배너 */}
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white overflow-hidden mb-8">
            {/* 배경 장식 */}
            <div className="absolute top-4 right-4 text-white/20">
              <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                2 / 3
              </div>
            </div>

            {/* 벨 아이콘 */}
            <div className="absolute top-6 right-12">
              <div className="w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center transform rotate-12">
                <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-sm font-medium mb-2 opacity-90">공지</p>
              <h2 className="text-2xl font-bold mb-4 leading-tight">
                365일 24시간 어디서든
                <br />
                앤트워크 서비스 이용가능!
              </h2>
            </div>
          </div>

          {/* 서비스 바로가기 버튼들 */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {user
                ? `${user.name || user.username}님, 어떤 서비스가 필요하세요?`
                : '서비스 이용을 위해 로그인해주세요'}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleServiceClick('/customer/service-option')}
                className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  🧹
                </div>
                <span className="text-sm font-medium text-gray-700">청소</span>
              </button>

              <button
                onClick={() => handleServiceClick('/customer/service-option')}
                className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  👕
                </div>
                <span className="text-sm font-medium text-gray-700">빨래</span>
              </button>

              <button
                onClick={() => handleServiceClick('/customer/service-option')}
                className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                  👶
                </div>
                <span className="text-sm font-medium text-gray-700">육아</span>
              </button>
            </div>

            {/* 로그인된 고객 사용자를 위한 추가 메뉴 */}
            {user && user.role === 'ROLE_CUSTOMER' && (
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
            )}
          </div>

          {/* 공지사항 리스트 */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-medium mr-3">
                  공지
                </span>
                <span className="text-gray-600 text-sm">앤트워크 이용안내</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-medium mr-3">
                  이벤트
                </span>
                <span className="text-gray-600 text-sm">
                  에어컨 청소 오픈 기념 할인 이벤트
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-medium mr-3">
                  공지
                </span>
                <span className="text-gray-600 text-sm">앤트워크 이용안내</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-medium mr-3">
                  공지
                </span>
                <span className="text-gray-600 text-sm">앤트워크 이용안내</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-medium mr-3">
                  공지
                </span>
                <span className="text-gray-600 text-sm">앤트워크 이용안내</span>
              </div>
            </div>
          </div>
        </main>

        {/* 로그인된 사용자에게만 Footer 표시 */}
        {user && <Footer current="/" />}
      </div>
    </div>
  );
};

export default MainPage;
