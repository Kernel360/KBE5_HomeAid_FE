import { User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { apiService } from '../../../store/api';
import Footer from '../../../components/Footer.jsx';
import Header from '../../../components/Header.jsx';

// 프로필 수정 페이지 컴포넌트 분리
const ProfileEditView = ({
  formData,
  setFormData,
  error,
  setError,
  success,
  setSuccess,
  loading,
  handleSave,
  setCurrentView,
}) => (
  <div className="min-h-screen bg-gray-100">
    <div
      className="w-full bg-gray-50 h-screen flex flex-col"
      style={{
        maxWidth: '512px',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      <Header
        showBackButton={true}
        onBackClick={() => setCurrentView('main')}
      />

      <main
        className="px-6 py-6 flex-1"
        style={{ paddingBottom: '100px', paddingTop: '80px' }}
      >
        {/* 페이지 제목 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">내 정보 수정</h2>
        </div>

        {/* 프로필 사진 */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <button className="text-blue-600 text-sm">사진 업데이트</button>
        </div>

        {/* 에러/성공 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-xl text-sm">
            {success}
          </div>
        )}

        {/* 폼 입력 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }));
                setError('');
                setSuccess('');
              }}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }));
                setError('');
                setSuccess('');
              }}
              placeholder="이메일을 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전화번호
            </label>
            <input
              type="tel"
              value={formData.phone}
              readOnly
              disabled
              placeholder="010-1234-5678"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              전화번호는 보안상의 이유로 수정할 수 없습니다.
            </p>
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setCurrentView('main')}
            className="flex-1 py-3 px-6 border border-gray-300 rounded-xl text-gray-700 font-medium"
            disabled={loading}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 px-6 bg-blue-600 text-black rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>

        {/* 추가 옵션 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <button
            onClick={() => alert('관리자에게 문의 바랍니다.')}
            className="text-red-500 text-sm block"
          >
            회원 탈퇴
          </button>
        </div>
      </main>

      <Footer current="/manager/mypage" />
    </div>
  </div>
);

export default function ManagerMypage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [currentView, setCurrentView] = useState('main'); // 'main', 'profile', 'points', 'earnings'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // TODO: 포인트 내역 더미 데이터 - 실제 API 연동 필요
  // API: GET /api/manager/points/history
  // Response: { points: [{ id, date, type, amount, reason, balance }] }
  const pointsHistory = [
    {
      id: 1,
      date: '2025-01-15',
      type: '적립',
      amount: '+1200',
      reason: '서비스 완료 적립',
      balance: 2450,
    },
    {
      id: 2,
      date: '2025-01-12',
      type: '적립',
      amount: '+800',
      reason: '5점 리뷰 보너스',
      balance: 1250,
    },
    {
      id: 3,
      date: '2025-01-08',
      type: '사용',
      amount: '-500',
      reason: '광고 비용 결제',
      balance: 450,
    },
    {
      id: 4,
      date: '2025-01-05',
      type: '적립',
      amount: '+950',
      reason: '서비스 완료 적립',
      balance: 950,
    },
  ];

  // TODO: 수익 내역 더미 데이터 (주별 정산) - 실제 API 연동 필요
  // API: GET /api/manager/earnings/weekly
  // Response: { earnings: [{ id, date, service, amount, commission, net, week }] }
  const earningsData = [
    // 이번 주 (2025-01-13 ~ 2025-01-19)
    {
      id: 1,
      date: '2025-05-15',
      service: '청소 서비스',
      amount: 60000,
      commission: 12000,
      net: 48000,
      week: '이번 주',
    },
    {
      id: 2,
      date: '2025-05-14',
      service: '설치 서비스',
      amount: 100000,
      commission: 20000,
      net: 80000,
      week: '이번 주',
    },
    {
      id: 3,
      date: '2025-05-13',
      service: '수리 서비스',
      amount: 45000,
      commission: 9000,
      net: 36000,
      week: '이번 주',
    },

    // 지난 주 (2025-01-06 ~ 2025-01-12)
    {
      id: 4,
      date: '2025-05-12',
      service: '청소 서비스',
      amount: 70000,
      commission: 14000,
      net: 56000,
      week: '지난 주',
    },
    {
      id: 5,
      date: '2025-05-10',
      service: '정리 서비스',
      amount: 35000,
      commission: 7000,
      net: 28000,
      week: '지난 주',
    },
    {
      id: 6,
      date: '2025-05-08',
      service: '설치 서비스',
      amount: 85000,
      commission: 17000,
      net: 68000,
      week: '지난 주',
    },
    {
      id: 7,
      date: '2025-05-07',
      service: '수리 서비스',
      amount: 55000,
      commission: 11000,
      net: 44000,
      week: '지난 주',
    },

    // 2주 전 (2024-12-30 ~ 2025-01-05)
    {
      id: 8,
      date: '2025-05-05',
      service: '청소 서비스',
      amount: 50000,
      commission: 10000,
      net: 40000,
      week: '2주 전',
    },
    {
      id: 9,
      date: '2025-05-03',
      service: '정리 서비스',
      amount: 40000,
      commission: 8000,
      net: 32000,
      week: '2주 전',
    },
    {
      id: 10,
      date: '2025-05-01',
      service: '설치 서비스',
      amount: 90000,
      commission: 18000,
      net: 72000,
      week: '2주 전',
    },
  ];

  // TODO: 주별 정산 통계 더미 데이터 - 실제 API 연동 필요
  // API: GET /api/manager/earnings/weekly-stats
  // Response: { thisWeek: {}, lastWeek: {}, twoWeeksAgo: {} }
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

  // TODO: 월별 통계 더미 데이터 - 실제 API 연동 필요
  // API: GET /api/manager/earnings/monthly-stats
  // Response: { totalEarnings, totalCommission, netEarnings, serviceCount, averageRating }
  const monthlyStats = {
    totalEarnings: 630000,
    totalCommission: 126000, // 20% 수수료
    netEarnings: 504000,
    serviceCount: 10,
    averageRating: 4.8,
  };

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');

    // 길이에 따른 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    } else {
      // 11자리 초과시 11자리까지만 사용
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // 백엔드에서 받은 전화번호에 하이픈 추가하는 함수
  const addHyphensToPhone = (phone) => {
    if (!phone) return '';
    // 이미 하이픈이 있으면 그대로 반환
    if (phone.includes('-')) return phone;
    // 숫자만 있으면 하이픈 추가
    return formatPhoneNumber(phone);
  };

  // 컴포넌트 마운트 시 사용자 정보로 폼 초기화
  useEffect(() => {
    if (user) {
      // 백엔드 API 호출 대신 기존 사용자 정보로 초기화
      console.log('=== 사용자 정보로 폼 초기화 ===');
      console.log('현재 사용자:', user);

      setFormData({
        name: user.name || user.username || '',
        email: user.email || '', // 사용자가 직접 입력해야 함
        phone: addHyphensToPhone(user.phone) || '', // 백엔드에서 받은 전화번호에 하이픈 추가
      });

      console.log('초기화된 폼 데이터:', {
        name: user.name || user.username || '',
        email: user.email || '',
        phone: addHyphensToPhone(user.phone) || '',
      });

      // 백엔드 API 호출은 403 에러로 인해 임시 비활성화
      // fetchUserProfile();
    }
  }, [user]);

  // 저장 버튼 클릭 핸들러
  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // 유효성 검사
      if (!formData.name.trim()) {
        setError('이름을 입력해주세요.');
        return;
      }
      if (!formData.email.trim()) {
        setError('이메일을 입력해주세요.');
        return;
      }

      // 이메일 형식 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('올바른 이메일 형식을 입력해주세요.');
        return;
      }

      // 사용자 ID 확인
      if (!user?.userId && !user?.id) {
        setError('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      // 전화번호 처리 - 하이픈 제거하여 숫자만 전송
      const originalPhone = user.phone || formData.phone || '';
      const phoneForApi = originalPhone.replace(/[^\d]/g, '');

      // 전화번호가 없으면 에러 처리
      if (!phoneForApi) {
        setError('전화번호 정보가 없습니다. 관리자에게 문의해주세요.');
        return;
      }

      console.log('=== API 요청 전 디버깅 ===');
      console.log('현재 사용자 정보:', user);
      console.log('폼 데이터:', formData);
      console.log('전송할 전화번호 (원본):', originalPhone);
      console.log('전송할 전화번호 (숫자만):', phoneForApi);

      // UserUpdateRequestDto 구조에 맞춰 데이터 준비
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: phoneForApi, // 숫자만 전송
      };

      console.log('최종 전송 데이터:', updateData);

      // API 호출로 프로필 업데이트 (userId 포함)
      const userId = user.userId || user.id;
      console.log('사용할 userId:', userId);

      await apiService.user.updateProfile(userId, updateData);

      // 성공 시 AuthStore의 사용자 정보도 업데이트
      updateUser({
        ...user,
        name: updateData.name,
        email: updateData.email,
      });

      setSuccess('프로필이 성공적으로 업데이트되었습니다.');

      // 2초 후 성공 메시지 자동 제거
      setTimeout(() => {
        setSuccess('');
      }, 2000);
    } catch (err) {
      console.error('프로필 업데이트 실패:', err);
      console.error('에러 응답 데이터:', err.response?.data);

      // 백엔드 에러 메시지 처리
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 404) {
        setError('사용자를 찾을 수 없습니다.');
      } else if (err.response?.status === 400) {
        setError('입력 정보가 올바르지 않습니다. 다시 확인해주세요.');
      } else {
        setError('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 포인트 내역 페이지 컴포넌트
  const PointsHistoryView = () => (
    <div className="min-h-screen bg-gray-100">
      <div
        className="w-full bg-gray-50 h-screen flex flex-col"
        style={{
          maxWidth: '512px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <Header
          showBackButton={true}
          onBackClick={() => setCurrentView('main')}
        />

        <main
          className="px-6 py-6 flex-1 overflow-y-auto"
          style={{ paddingBottom: '100px', paddingTop: '80px' }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">포인트 내역</h3>
            {/* TODO: 하드코딩된 현재 포인트 값 - API에서 실시간 포인트 조회 필요 */}
            <p className="text-sm text-gray-500 mt-1">
              현재 보유:{' '}
              <span className="font-bold text-orange-600">2,450P</span>
            </p>
          </div>

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

        <Footer current="/manager/mypage" />
      </div>
    </div>
  );

  // 수익 관리 페이지 컴포넌트
  const EarningsView = () => (
    <div className="min-h-screen bg-gray-100">
      <div
        className="w-full bg-gray-50 h-screen flex flex-col"
        style={{
          maxWidth: '512px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <Header
          showBackButton={true}
          onBackClick={() => setCurrentView('main')}
        />

        <main
          className="px-6 py-6 flex-1 overflow-y-auto"
          style={{ paddingBottom: '100px', paddingTop: '80px' }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">주별 정산 관리</h3>
            <p className="text-sm text-gray-500 mt-1">
              수수료 20% 제외한 실수익
            </p>
          </div>

          {/* 이번 달 전체 통계 */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">
              이번 달 전체 수익
            </h4>
            {/* TODO: monthlyStats 객체를 실제 API 데이터로 교체 필요 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">총 수익</p>
                <p className="text-lg font-bold text-blue-600">
                  {monthlyStats.totalEarnings.toLocaleString()}원
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">수수료 (20%)</p>
                <p className="text-lg font-bold text-red-600">
                  -{monthlyStats.totalCommission.toLocaleString()}원
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-sm text-gray-500">실제 수익</p>
                <p className="text-2xl font-bold text-green-600">
                  {monthlyStats.netEarnings.toLocaleString()}원
                </p>
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
            {/* TODO: weeklyStats 객체를 실제 API 데이터로 교체 필요 */}
            {/* 이번 주 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-gray-900">이번 주 정산</h5>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  진행중
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {weeklyStats.thisWeek.period}
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">총 수익</p>
                  <p className="font-bold text-gray-900">
                    {weeklyStats.thisWeek.totalEarnings.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">수수료</p>
                  <p className="font-bold text-red-600">
                    -{weeklyStats.thisWeek.totalCommission.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">실수익</p>
                  <p className="font-bold text-green-600">
                    {weeklyStats.thisWeek.netEarnings.toLocaleString()}원
                  </p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  완료 서비스: {weeklyStats.thisWeek.serviceCount}건
                </p>
              </div>
            </div>

            {/* 지난 주 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-gray-900">지난 주 정산</h5>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  정산완료
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {weeklyStats.lastWeek.period}
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">총 수익</p>
                  <p className="font-bold text-gray-900">
                    {weeklyStats.lastWeek.totalEarnings.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">수수료</p>
                  <p className="font-bold text-red-600">
                    -{weeklyStats.lastWeek.totalCommission.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">실수익</p>
                  <p className="font-bold text-green-600">
                    {weeklyStats.lastWeek.netEarnings.toLocaleString()}원
                  </p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  완료 서비스: {weeklyStats.lastWeek.serviceCount}건
                </p>
              </div>
            </div>

            {/* 2주 전 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-gray-400">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-gray-900">2주 전 정산</h5>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                  정산완료
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {weeklyStats.twoWeeksAgo.period}
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">총 수익</p>
                  <p className="font-bold text-gray-900">
                    {weeklyStats.twoWeeksAgo.totalEarnings.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">수수료</p>
                  <p className="font-bold text-red-600">
                    -{weeklyStats.twoWeeksAgo.totalCommission.toLocaleString()}
                    원
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">실수익</p>
                  <p className="font-bold text-green-600">
                    {weeklyStats.twoWeeksAgo.netEarnings.toLocaleString()}원
                  </p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  완료 서비스: {weeklyStats.twoWeeksAgo.serviceCount}건
                </p>
              </div>
            </div>
          </div>

          {/* 상세 수익 내역 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">상세 수익 내역</h4>
            <div className="space-y-3">
              {/* TODO: earningsData 배열을 실제 API 데이터로 교체 필요 */}
              {earningsData.map((earning) => (
                <div
                  key={earning.id}
                  className="border-b border-gray-100 pb-3 last:border-b-0"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-medium text-gray-900">
                        {earning.service}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">{earning.date}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            earning.week === '이번 주'
                              ? 'bg-green-100 text-green-800'
                              : earning.week === '지난 주'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {earning.week}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {earning.amount.toLocaleString()}원
                      </p>
                      <p className="text-xs text-red-500">
                        수수료: -{earning.commission.toLocaleString()}원 (20%)
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      완료
                    </span>
                    <p className="text-sm font-medium text-green-600">
                      실수익: {earning.net.toLocaleString()}원
                    </p>
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

  const MainView = () => (
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
          {/* 프로필 정보 */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {user?.name || user?.username || '매니저'}님
                </h3>
                {/* TODO: 이메일이나 폰번호 받아오면 수정예정 */}
                {/* <p className="text-sm text-gray-500">
                  ID: {user?.userId || '정보 없음'}
                </p> */}
              </div>
            </div>
          </div>

          {/* 포인트 & 수익 섹션 */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              {/* 포인트 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">💰</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">보유 포인트</p>
                {/* TODO: 하드코딩된 포인트 값 - API에서 실제 포인트 조회 필요 */}
                {/* API: GET /api/manager/points/balance */}
                <p className="text-lg font-bold text-orange-600">2,450P</p>
              </div>

              {/* 이번 달 수익 */}
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">📊</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">이번 달 수익</p>
                {/* TODO: 하드코딩된 수익 값 - API에서 실제 이번 달 수익 조회 필요 */}
                {/* API: GET /api/manager/earnings/monthly-summary */}
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
              onClick={() => navigate('/manager/mypage/address')}
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
              onClick={() => navigate('/manager/mypage/inquiry')}
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

        {/* Footer 추가 */}
        <Footer current="/manager/mypage" />
      </div>
    </div>
  );

  // 조건부 렌더링
  switch (currentView) {
    case 'profile':
      return (
        <ProfileEditView
          formData={formData}
          setFormData={setFormData}
          error={error}
          setError={setError}
          success={success}
          setSuccess={setSuccess}
          loading={loading}
          handleSave={handleSave}
          setCurrentView={setCurrentView}
        />
      );
    case 'points':
      return <PointsHistoryView />;
    case 'earnings':
      return <EarningsView />;
    default:
      return <MainView />;
  }
}
