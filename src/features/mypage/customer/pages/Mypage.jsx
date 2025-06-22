import { User, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CouponsView from '../components/CouponsView.jsx';
import couponData from '../data/couponData.js';
import pointsHistory from '../data/pointHistory.js';
import PointsHistoryView from '../components/PointsHistoryView.jsx'

export default function MyPage() {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'profile', 'address', 'review', 'inquiry', 'createInquiry', 'inquiryDetail', 'points', 'coupons'
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiService.user.getMyProfile();
        setUserProfile(res.data?.data || res.data);
      } catch (e) {
        setUserProfile(null);
      }
    }
    fetchProfile();
  }, []);

  const handleNavigateToCreate = () => {
    setCurrentView('createInquiry');
  };

  const handleNavigateToDetail = (id) => {
    setSelectedInquiryId(id);
    setCurrentView('inquiryDetail');
  };

  const handleInquiryCreated = () => {
    setCurrentView('inquiry'); // Back to inquiry list after creation
  };

  const handleInquiryUpdated = () => {
    setCurrentView('inquiry'); // Back to inquiry list after update
  };

  const handleInquiryDeleted = () => {
    setCurrentView('inquiry'); // Back to inquiry list after deletion
  };


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
                {userProfile?.name || user?.name || user?.username || '사용자'}님
              </h3>
              {/* <p className="text-sm text-gray-500">
                {user?.email || '이메일 정보 없음'}
              </p> */}
            </div>
          </div>
        </div>

        {/* 포인트 & 쿠폰 섹션 */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            {/* 포인트 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">💰</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">보유 포인트</p>
              {/* TODO: 하드코딩된 포인트 값 - API에서 실제 포인트 조회 필요 */}
              {/* API: GET /api/customer/points/balance */}
              <p className="text-lg font-bold text-orange-600">1,250P</p>
            </div>

            {/* 쿠폰 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">🎫</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">보유 쿠폰</p>
              {/* TODO: 하드코딩된 쿠폰 개수 - API에서 실제 사용가능 쿠폰 개수 조회 필요 */}
              {/* API: GET /api/customer/coupons/count */}
              <p className="text-lg font-bold text-green-600">3장</p>
            </div>
          </div>

          {/* 포인트/쿠폰 관리 버튼 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCurrentView('points')}
                className="py-2 px-4 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
              >
                포인트 내역
              </button>
              <button
                onClick={() => setCurrentView('coupons')}
                className="py-2 px-4 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
              >
                쿠폰함
              </button>
            </div>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <div className="bg-white rounded-2xl shadow-sm">
          <button
            onClick={() => setCurrentView('profile')}
            className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">내 정보 수정</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => setCurrentView('address')}
            className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">주소 관리</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => navigate('/customer/review/history')}
            className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">리뷰 관리</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => setCurrentView('inquiry')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">문의 게시판</span>
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
      return <MyProfile onBack={() => setCurrentView('main')} userProfile={userProfile} setUserProfile={setUserProfile} />;
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
          onNavigateToDetail={(id) => { setSelectedInquiryId(id); setCurrentView('inquiryDetail'); }}
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
    case 'points':
      return <PointsHistoryView onBack={() => setCurrentView('main')} point={pointsHistory} />;
    case 'coupons':
      return <CouponsView onBack={() => setCurrentView('main')} coupons={couponData} />;
    default:
      return <MainView />;
  }
}
