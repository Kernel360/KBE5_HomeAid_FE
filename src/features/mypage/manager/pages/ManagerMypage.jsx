import { User, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import MyProfile from '../components/MyProfile.jsx';
import MyAddress from '../components/MyAddress.jsx';
import InquiryBoard from '../components/InquiryBoard.jsx';
import AddressRegister from '../components/AddressRegister.jsx';
import CreateInquiry from '../components/CreateInquiry.jsx';
import InquiryDetail from '../components/InquiryDetail.jsx';

// 더미 포인트/수익 데이터
const pointsHistory = [
  { id: 1, date: '2025-01-15', type: '적립', amount: '+1200', reason: '서비스 완료 적립', balance: 2450 },
  { id: 2, date: '2025-01-12', type: '적립', amount: '+800', reason: '5점 리뷰 보너스', balance: 1250 },
  { id: 3, date: '2025-01-08', type: '사용', amount: '-500', reason: '광고 비용 결제', balance: 450 },
  { id: 4, date: '2025-01-05', type: '적립', amount: '+950', reason: '서비스 완료 적립', balance: 950 },
];
const earningsData = [
  { id: 1, date: '2025-05-15', service: '청소 서비스', amount: 60000, commission: 12000, net: 48000, week: '이번 주' },
  { id: 2, date: '2025-05-14', service: '설치 서비스', amount: 100000, commission: 20000, net: 80000, week: '이번 주' },
  { id: 3, date: '2025-05-13', service: '수리 서비스', amount: 45000, commission: 9000, net: 36000, week: '이번 주' },
];
const weeklyStats = {
  thisWeek: {
    totalEarnings: 205000,
    totalCommission: 41000,
    netEarnings: 164000,
    serviceCount: 3,
    period: '2025-05-13 ~ 2025-05-19',
  },
  lastWeek: {
    totalEarnings: 245000,
    totalCommission: 49000,
    netEarnings: 196000,
    serviceCount: 4,
    period: '2025-05-06 ~ 2025-05-12',
  },
  twoWeeksAgo: {
    totalEarnings: 180000,
    totalCommission: 36000,
    netEarnings: 144000,
    serviceCount: 3,
    period: '2025-04-30 ~ 2025-05-05',
  },
};
const monthlyStats = {
  totalEarnings: 630000,
  totalCommission: 126000, // 20% 수수료
  netEarnings: 504000,
  serviceCount: 10,
  averageRating: 4.8,
};

function PointsHistoryView({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full bg-gray-50 h-screen flex flex-col" style={{ maxWidth: '512px', margin: '0 auto', position: 'relative' }}>
        <Header showBackButton={true} onBackClick={onBack} />
        <main className="px-6 py-6 flex-1 overflow-y-auto" style={{ paddingBottom: '100px', paddingTop: '80px' }}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">포인트 내역</h3>
            <p className="text-sm text-gray-500 mt-1">현재 보유: <span className="font-bold text-orange-600">2,450P</span></p>
          </div>
          <div className="space-y-4">
            {pointsHistory.map((point) => (
              <div key={point.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{point.reason}</p>
                    <p className="text-sm text-gray-500">{point.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${point.type === '적립' ? 'text-blue-600' : 'text-red-600'}`}>{point.amount}P</p>
                    <p className="text-sm text-gray-500">잔액: {point.balance}P</p>
                  </div>
                </div>
                <div className={`inline-block px-2 py-1 rounded text-xs ${point.type === '적립' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{point.type}</div>
              </div>
            ))}
          </div>
        </main>
        <Footer current="/manager/mypage" />
      </div>
    </div>
  );
}

function EarningsView({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full bg-gray-50 h-screen flex flex-col" style={{ maxWidth: '512px', margin: '0 auto', position: 'relative' }}>
        <Header showBackButton={true} onBackClick={onBack} />
        <main className="px-6 py-6 flex-1 overflow-y-auto" style={{ paddingBottom: '100px', paddingTop: '80px' }}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">주별 정산 관리</h3>
            <p className="text-sm text-gray-500 mt-1">수수료 20% 제외한 실수익</p>
          </div>
          {/* 이번 달 전체 통계 */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">이번 달 전체 수익</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">총 수익</p>
                <p className="text-lg font-bold text-blue-600">{monthlyStats.totalEarnings.toLocaleString()}원</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">수수료 (20%)</p>
                <p className="text-lg font-bold text-red-600">-{monthlyStats.totalCommission.toLocaleString()}원</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-sm text-gray-500">실제 수익</p>
                <p className="text-2xl font-bold text-green-600">{monthlyStats.netEarnings.toLocaleString()}원</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">완료 서비스</p>
                  <p className="font-medium">{monthlyStats.serviceCount}건</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">평균 평점</p>
                  <p className="font-medium">⭐ {monthlyStats.averageRating}</p>
                </div>
              </div>
            </div>
          </div>
          {/* 주별 정산 요약 */}
          <div className="space-y-4 mb-6">
            {/* 이번 주 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-gray-900">이번 주 정산</h5>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">진행중</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{weeklyStats.thisWeek.period}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">총 수익</p>
                  <p className="font-bold text-gray-900">{weeklyStats.thisWeek.totalEarnings.toLocaleString()}원</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">수수료</p>
                  <p className="font-bold text-red-600">-{weeklyStats.thisWeek.totalCommission.toLocaleString()}원</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">실수익</p>
                  <p className="font-bold text-green-600">{weeklyStats.thisWeek.netEarnings.toLocaleString()}원</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">완료 서비스: {weeklyStats.thisWeek.serviceCount}건</p>
              </div>
            </div>
            {/* 지난 주 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-gray-900">지난 주 정산</h5>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">정산완료</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{weeklyStats.lastWeek.period}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">총 수익</p>
                  <p className="font-bold text-gray-900">{weeklyStats.lastWeek.totalEarnings.toLocaleString()}원</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">수수료</p>
                  <p className="font-bold text-red-600">-{weeklyStats.lastWeek.totalCommission.toLocaleString()}원</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">실수익</p>
                  <p className="font-bold text-green-600">{weeklyStats.lastWeek.netEarnings.toLocaleString()}원</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">완료 서비스: {weeklyStats.lastWeek.serviceCount}건</p>
              </div>
            </div>
            {/* 2주 전 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-gray-400">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-gray-900">2주 전 정산</h5>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">정산완료</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{weeklyStats.twoWeeksAgo.period}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">총 수익</p>
                  <p className="font-bold text-gray-900">{weeklyStats.twoWeeksAgo.totalEarnings.toLocaleString()}원</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">수수료</p>
                  <p className="font-bold text-red-600">-{weeklyStats.twoWeeksAgo.totalCommission.toLocaleString()}원</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">실수익</p>
                  <p className="font-bold text-green-600">{weeklyStats.twoWeeksAgo.netEarnings.toLocaleString()}원</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">완료 서비스: {weeklyStats.twoWeeksAgo.serviceCount}건</p>
              </div>
            </div>
          </div>
          {/* 상세 수익 내역 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">상세 수익 내역</h4>
            <div className="space-y-3">
              {earningsData.map((earning) => (
                <div key={earning.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-medium text-gray-900">{earning.service}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">{earning.date}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">예정</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{earning.amount.toLocaleString()}원</p>
                      <p className="text-xs text-red-500">수수료: -{earning.commission.toLocaleString()}원 (20%)</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">완료</span>
                    <p className="text-sm font-medium text-green-600">실수익: {earning.net.toLocaleString()}원</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

  const handleNavigateToCreate = () => setCurrentView('createInquiry');
  const handleNavigateToDetail = (id) => { setSelectedInquiryId(id); setCurrentView('inquiryDetail'); };
  const handleInquiryCreated = () => setCurrentView('inquiry');
  const handleInquiryUpdated = () => setCurrentView('inquiry');
  const handleInquiryDeleted = () => setCurrentView('inquiry');

  const MainView = () => (
    <div className="min-h-screen bg-white" style={{ paddingTop: '64px', paddingBottom: '80px', maxWidth: '512px', margin: '0 auto' }}>
      <Header showBackButton={true} />
      <div className="px-6 py-4">
        <h3 className="text-xl font-bold text-gray-900">마이페이지</h3>
      </div>
      <main className="px-6 py-6">
        {/* 프로필 정보 */}
        <div className="bg-white rounded-2xl p-6 mb-10 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user?.name || user?.username || '매니저'}님</h3>
            </div>
          </div>
        </div>
        {/* 포인트 & 수익 더미 데이터 */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            {/* 포인트 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">💰</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">보유 포인트</p>
              <p className="text-lg font-bold text-orange-600">2,450P</p>
            </div>
            {/* 이번 달 수익 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">📊</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">이번 달 수익</p>
              <p className="text-lg font-bold text-blue-600">185,000원</p>
            </div>
          </div>
          {/* 포인트/수익 관리 버튼 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCurrentView('points')}
                className="py-2 px-4 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
              >
                포인트 내역
              </button>
              <button
                onClick={() => setCurrentView('earnings')}
                className="py-2 px-4 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                수익 관리
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
            onClick={() => navigate('/manager/review/history')}
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
      </main>
      <Footer current="/manager/mypage" />
    </div>
  );

  switch (currentView) {
    case 'profile':
      return <MyProfile onBack={() => setCurrentView('main')} />;
    case 'address':
      return <MyAddress onBack={() => setCurrentView('main')} onAddAddress={() => setCurrentView('addressRegister')} />;
    case 'addressRegister':
      return <AddressRegister onBack={() => setCurrentView('address')} />;
    case 'inquiry':
      return <InquiryBoard onBack={() => setCurrentView('main')} onNavigateToCreate={handleNavigateToCreate} onNavigateToDetail={handleNavigateToDetail} />;
    case 'createInquiry':
      return <CreateInquiry onBack={() => setCurrentView('inquiry')} onInquiryCreated={handleInquiryCreated} />;
    case 'inquiryDetail':
      return <InquiryDetail boardId={selectedInquiryId} onBack={() => setCurrentView('inquiry')} onInquiryDeleted={handleInquiryDeleted} onInquiryUpdated={handleInquiryUpdated} />;
    case 'points':
      return <PointsHistoryView onBack={() => setCurrentView('main')} />;
    case 'earnings':
      return <EarningsView onBack={() => setCurrentView('main')} />;
    default:
      return <MainView />;
  }
}
