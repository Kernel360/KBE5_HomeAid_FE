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
  const [currentView, setCurrentView] = useState('main'); // 'main', 'profile'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
              onClick={() => navigate('/board')}
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
    default:
      return <MainView />;
  }
}
