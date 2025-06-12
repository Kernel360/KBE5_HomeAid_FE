import { User, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../stores/authStore';
import Header from '../../../../components/Header.jsx';
import Footer from '../../../../components/Footer.jsx';
import MyProfile from '../components/MyProfile.jsx';
import MyAddress from '../components/MyAddress.jsx';
import MyReview from '../components/MyReview.jsx';
import InquiryBoard from '../components/InquiryBoard.jsx';
import AddressRegister from '../components/AddressRegister.jsx';
import CreateInquiry from '../components/CreateInquiry.jsx';
import InquiryDetail from '../components/InquiryDetail.jsx';

export default function MyPage() {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'profile', 'address', 'review', 'inquiry', 'createInquiry', 'inquiryDetail', 'points', 'coupons'
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

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

  // TODO: 포인트 내역 더미 데이터 - 실제 API 연동 필요
  // API: GET /api/customer/points/history
  // Response: { points: [{ id, date, type, amount, reason, balance }] }
  const pointsHistory = [
    {
      id: 1,
      date: '2025-01-15',
      type: '적립',
      amount: '+500',
      reason: '서비스 이용 적립',
      balance: 1250,
    },
    {
      id: 2,
      date: '2025-01-10',
      type: '사용',
      amount: '-300',
      reason: '할인 쿠폰 구매',
      balance: 750,
    },
    {
      id: 3,
      date: '2025-01-05',
      type: '적립',
      amount: '+800',
      reason: '신규 가입 보너스',
      balance: 1050,
    },
    {
      id: 4,
      date: '2025-01-01',
      type: '적립',
      amount: '+250',
      reason: '리뷰 작성 적립',
      balance: 250,
    },
  ];

  // TODO: 쿠폰 더미 데이터 - 실제 API 연동 필요
  // API: GET /api/customer/coupons
  // Response: { coupons: [{ id, name, discount, minAmount, expiry, status }] }
  const coupons = [
    {
      id: 1,
      name: '신규 회원 20% 할인',
      discount: '20%',
      minAmount: 30000,
      expiry: '2025-02-28',
      status: 'available',
    },
    {
      id: 2,
      name: '청소 서비스 5,000원 할인',
      discount: '5,000원',
      minAmount: 40000,
      expiry: '2025-03-15',
      status: 'available',
    },
    {
      id: 3,
      name: '첫 주문 30% 할인',
      discount: '30%',
      minAmount: 50000,
      expiry: '2025-01-20',
      status: 'expired',
    },
  ];

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
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {user?.name || user?.username || '사용자'}님
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

  // 포인트 내역 페이지 컴포넌트
  const PointsHistoryView = () => (
    <div
      className="min-h-screen bg-white"
      style={{
        paddingTop: '64px',
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      <Header
        showBackButton={true}
        onBackClick={() => setCurrentView('main')}
      />

      <div className="px-6 py-4">
        <h3 className="text-xl font-bold text-gray-900">포인트 내역</h3>
        {/* TODO: 하드코딩된 현재 포인트 값 - API에서 실시간 포인트 조회 필요 */}
        <p className="text-sm text-gray-500 mt-1">
          현재 보유: <span className="font-bold text-orange-600">1,250P</span>
        </p>
      </div>

      <main className="px-6 py-6">
        <div className="space-y-4">
          {/* TODO: pointsHistory 배열을 실제 API 데이터로 교체 필요 */}
          {pointsHistory.map((point) => (
            <div
              key={point.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">{point.reason}</p>
                  <p className="text-sm text-gray-500">{point.date}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${point.type === '적립' ? 'text-blue-600' : 'text-red-600'}`}
                  >
                    {point.amount}P
                  </p>
                  <p className="text-sm text-gray-500">
                    잔액: {point.balance}P
                  </p>
                </div>
              </div>
              <div
                className={`inline-block px-2 py-1 rounded text-xs ${
                  point.type === '적립'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {point.type}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer current="/customer/mypage" />
    </div>
  );

  // 쿠폰함 페이지 컴포넌트
  const CouponsView = () => (
    <div
      className="min-h-screen bg-white"
      style={{
        paddingTop: '64px',
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      <Header
        showBackButton={true}
        onBackClick={() => setCurrentView('main')}
      />

      <div className="px-6 py-4">
        <h3 className="text-xl font-bold text-gray-900">쿠폰함</h3>
        {/* TODO: 하드코딩된 사용가능 쿠폰 개수 - API에서 실시간 쿠폰 개수 조회 필요 */}
        <p className="text-sm text-gray-500 mt-1">
          사용 가능한 쿠폰:{' '}
          <span className="font-bold text-green-600">2장</span>
        </p>
      </div>

      <main className="px-6 py-6">
        <div className="space-y-4">
          {/* TODO: coupons 배열을 실제 API 데이터로 교체 필요 */}
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`rounded-lg border p-4 ${
                coupon.status === 'available'
                  ? 'bg-white border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4
                    className={`font-semibold ${coupon.status === 'available' ? 'text-gray-900' : 'text-gray-500'}`}
                  >
                    {coupon.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    최소 주문금액: {coupon.minAmount.toLocaleString()}원
                  </p>
                </div>
                <div
                  className={`text-right ${coupon.status === 'available' ? 'text-green-600' : 'text-gray-400'}`}
                >
                  <p className="text-lg font-bold">{coupon.discount}</p>
                  <p className="text-xs">할인</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">만료일: {coupon.expiry}</p>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    coupon.status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {coupon.status === 'available' ? '사용 가능' : '만료됨'}
                </div>
              </div>

              {coupon.status === 'available' && (
                <button className="w-full mt-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                  {/* TODO: 쿠폰 사용 기능 구현 필요 - API: POST /api/customer/coupons/use */}
                  사용하기
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer current="/customer/mypage" />
    </div>
  );

  // 조건부 렌더링
  switch (currentView) {
    case 'profile':
      return <MyProfile onBack={() => setCurrentView('main')} />;
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
    case 'points':
      return <PointsHistoryView />;
    case 'coupons':
      return <CouponsView />;
    default:
      return <MainView />;
  }
}
