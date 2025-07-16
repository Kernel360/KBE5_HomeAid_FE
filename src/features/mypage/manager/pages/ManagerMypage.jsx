import { User, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/api';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import MyProfile from '../components/MyProfile.jsx';
import InquiryBoard from '../components/InquiryBoard.jsx';
import CreateInquiry from '../components/CreateInquiry.jsx';
import InquiryDetail from '../components/InquiryDetail.jsx';
import ManagerDocumentUpload from '../components/ManagerDocumentUpload.jsx';
import SettlementHistory from '../components/SettlementHistory.jsx';
import ServiceRegistration from '../../../additional-info/pages/index.jsx';

function MatchingInfoView({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div
        className="w-full bg-gray-50 h-screen flex flex-col"
        style={{ maxWidth: '512px', margin: '0 auto', position: 'relative' }}
      >
        <Header showBackButton={true} onBackClick={onBack} />
        <main
          className="px-6 py-6 flex-1 overflow-y-auto"
          style={{ paddingBottom: '100px', paddingTop: '80px' }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">근무 정보 입력</h3>
          </div>
          <ServiceRegistration />
        </main>
        <Footer current="/manager/mypage" />
      </div>
    </div>
  );
}

export default function ManagerMypage() {
  const [currentView, setCurrentView] = useState('main');
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();
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

  const handleNavigateToCreate = () => setCurrentView('createInquiry');
  const handleNavigateToDetail = (id) => {
    setSelectedInquiryId(id);
    setCurrentView('inquiryDetail');
  };
  const handleInquiryCreated = () => setCurrentView('inquiry');
  const handleInquiryUpdated = () => setCurrentView('inquiry');
  const handleInquiryDeleted = () => setCurrentView('inquiry');

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
      <div className="px-6 py-4">
        <h3 className="text-xl font-bold text-gray-900">마이페이지</h3>
      </div>
      <main className="px-6 py-6">
        {/* 프로필 정보 */}
        <div className="bg-white rounded-2xl p-6 mb-10 shadow-sm">
          <div className="flex items-start mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 overflow-hidden flex-shrink-0">
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
            <div className="pt-0">
              <div className="font-semibold text-gray-900 leading-tight">
                👋{' '}
                {userProfile?.name || user?.name || user?.username || '매니저'}
                님, 안녕하세요!
              </div>
              <div className="text-gray-500 text-sm leading-tight mt-0">
                매니저 활동 현황을 확인해보세요
              </div>
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
            onClick={() => setCurrentView('matchingInfo')}
            className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">📝 근무 정보 입력</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => setCurrentView('documentUpload')}
            className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">📄 매니저 활동 승인 서류 제출</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => navigate('/manager/review/history')}
            className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">⭐ 받은 리뷰 보기</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => setCurrentView('inquiry')}
            className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">💬 1:1 문의하기</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => setCurrentView('settlement')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">💰 정산조회하기</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </main>
      <Footer current="/manager/mypage" />
    </div>
  );

  switch (currentView) {
    case 'profile':
      return (
        <MyProfile
          onBack={() => setCurrentView('main')}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
        />
      );
    case 'inquiry':
      return (
        <InquiryBoard
          onBack={() => setCurrentView('main')}
          onNavigateToCreate={handleNavigateToCreate}
          onNavigateToDetail={handleNavigateToDetail}
        />
      );
    case 'createInquiry':
      return (
        <CreateInquiry
          onBack={() => setCurrentView('inquiry')}
          onInquiryCreated={handleInquiryCreated}
        />
      );
    case 'inquiryDetail':
      return (
        <InquiryDetail
          boardId={selectedInquiryId}
          onBack={() => setCurrentView('inquiry')}
          onInquiryDeleted={handleInquiryDeleted}
          onInquiryUpdated={handleInquiryUpdated}
        />
      );
    case 'matchingInfo':
      return <MatchingInfoView onBack={() => setCurrentView('main')} />;
    case 'documentUpload':
      return <ManagerDocumentUpload onBack={() => setCurrentView('main')} />;
    case 'settlement':
      return <SettlementHistory onBack={() => setCurrentView('main')} />;
    default:
      return <MainView />;
  }
}
