import { User, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { apiService } from '@/api';
import Header from '../../../../components/Header.jsx';
import Footer from '../../../../components/Footer.jsx';
import MyProfile from '../components/MyProfile.jsx';
import MyAddress from '../components/MyAddress.jsx';
import MyReview from '../components/MyReview.jsx';
import InquiryBoard from '../components/InquiryBoard.jsx';
import AddressRegister from '../components/AddressRegister.jsx';
import CreateInquiry from '../components/CreateInquiry.jsx';
import InquiryDetail from '../components/InquiryDetail.jsx';
import PaymentHistory from '../components/PaymentHistory.jsx';

export default function MyPage() {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'profile', 'address', 'review', 'inquiry', 'createInquiry', 'inquiryDetail', 'paymentHistory'
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const { user } = useAuthStore();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiService.user.getMyProfile();
        setUserProfile(res.data?.data || res.data);
      } catch {
        setUserProfile(null);
      }
    }
    fetchProfile();
  }, []);

  const MainView = () => (
    <div
      className="min-h-screen bg-white"
      style={{
        paddingTop: '64px',
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      <Header showBackButton={true} />

      {/* 페이지 제목 */}
      <div className="px-6 py-4">
        <h3 className="text-xl font-bold text-gray-900">마이페이지</h3>
      </div>

      <main className="px-6 py-6">
        {/* 프로필 정보 */}
        <div className="bg-white rounded-2xl p-6 mb-10 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 overflow-hidden">
              {userProfile?.profileImageUrl ? (
                <img
                  src={userProfile.profileImageUrl}
                  alt="프로필 이미지"
                  className="w-12 h-12 object-cover object-center rounded-full"
                />
              ) : (
                <User className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                👋{' '}
                {userProfile?.name || user?.name || user?.username || '사용자'}
                님, 환영합니다!
                <div className="text-gray-500 text-sm leading-tight mt-0">
                  필요한 서비스를 한눈에 확인하세요.
                </div>
              </h3>
            </div>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <div className="bg-white rounded-2xl shadow-sm">
          <button
            onClick={() => setCurrentView('profile')}
            className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">✏️ 내 정보 수정</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => setCurrentView('address')}
            className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">📍 주소 관리</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => setCurrentView('review')}
            className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">⭐ 작성한 리뷰 보기</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => setCurrentView('inquiry')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">💬 1:1 문의하기</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => setCurrentView('paymentHistory')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">💳 결제 확인하기</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 로그아웃 */}
        {/* <div className="mt-6">
                    <button className="text-red-500 text-sm">로그아웃</button>
                </div> */}
      </main>

      <Footer current="/customer/mypage" />
    </div>
  );

  // 조건부 렌더링
  switch (currentView) {
    case 'profile':
      return (
        <MyProfile
          onBack={() => setCurrentView('main')}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
        />
      );
    case 'address':
      return (
        <MyAddress
          onBack={() => setCurrentView('main')}
          onAddAddress={() => setCurrentView('addressRegister')}
        />
      );
    case 'addressRegister':
      console.log('AddressRegister 렌더링'); // 디버깅 로그
      return <AddressRegister onBack={() => setCurrentView('address')} />;
    case 'review':
      return <MyReview onBack={() => setCurrentView('main')} />;
    case 'inquiry':
      return (
        <InquiryBoard
          onBack={() => setCurrentView('main')}
          onNavigateToCreate={() => setCurrentView('createInquiry')}
          onNavigateToDetail={(id) => {
            setSelectedInquiryId(id);
            setCurrentView('inquiryDetail');
          }}
        />
      );
    case 'createInquiry':
      return (
        <CreateInquiry
          onBack={() => setCurrentView('inquiry')}
          onInquiryCreated={() => setCurrentView('inquiry')}
        />
      );
    case 'inquiryDetail':
      return (
        <InquiryDetail
          boardId={selectedInquiryId}
          onBack={() => setCurrentView('inquiry')}
          onInquiryDeleted={() => setCurrentView('inquiry')}
          onInquiryUpdated={() => setCurrentView('inquiry')}
        />
      );
    case 'paymentHistory':
      return <PaymentHistory onBack={() => setCurrentView('main')} />;
    default:
      return <MainView />;
  }
}
