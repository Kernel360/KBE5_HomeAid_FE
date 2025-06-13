import { User, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { apiService } from '../../../store/api';
import Footer from '../../../components/Footer.jsx';

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

  // 디버깅: 사용자 객체 구조 확인
  console.log('Manager user object:', user);

  // 컴포넌트 마운트 시 사용자 정보로 폼 초기화
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.username || '',
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
      });
    }
  }, [user]);

  // 입력 필드 변경 핸들러
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError('');
    setSuccess('');
  };

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
      if (!formData.phone.trim()) {
        setError('전화번호를 입력해주세요.');
        return;
      }

      // 이메일 형식 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('올바른 이메일 형식을 입력해주세요.');
        return;
      }

      // 전화번호 형식 검사 (국제 형식 지원)
      const phoneRegex = /^\+?\d{7,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/-/g, ''))) {
        setError(
          '올바른 전화번호 형식을 입력해주세요. (예: +821012345678 또는 01012345678)'
        );
        return;
      }

      // 사용자 ID 확인
      if (!user?.userId && !user?.id) {
        setError('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      // UserUpdateRequestDto 구조에 맞춰 데이터 준비
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/-/g, ''), // 하이픈 제거
      };

      // API 호출로 프로필 업데이트 (userId 포함)
      const userId = user.userId || user.id;
      await apiService.user.updateProfile(userId, updateData);

      // 성공 시 AuthStore의 사용자 정보도 업데이트
      updateUser({
        ...user,
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone,
      });

      setSuccess('프로필이 성공적으로 업데이트되었습니다.');

      // 2초 후 성공 메시지 자동 제거
      setTimeout(() => {
        setSuccess('');
      }, 2000);
    } catch (err) {
      console.error('프로필 업데이트 실패:', err);

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

  // 프로필 수정 페이지
  const ProfileEditView = () => (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-lg bg-gray-50 h-screen flex flex-col">
        <header className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
          <button onClick={() => setCurrentView('main')} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">내 정보 수정</h1>
        </header>

        <main
          className="px-6 py-6 flex-1 overflow-y-auto"
          style={{ paddingBottom: '100px' }}
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
                onChange={(e) => handleInputChange('name', e.target.value)}
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
                onChange={(e) => handleInputChange('email', e.target.value)}
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
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+821012345678 또는 01012345678"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
            <button className="text-blue-600 text-sm mb-4 block">
              비밀번호 변경
            </button>
            <button className="text-red-500 text-sm block">회원 탈퇴</button>
          </div>
        </main>

        <Footer current="/manager/mypage" />
      </div>
    </div>
  );

  const MainView = () => (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-lg bg-gray-50 h-screen flex flex-col">
        <header className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>
        </header>

        <main
          className="px-6 py-6 flex-1 overflow-y-auto"
          style={{ paddingBottom: '100px' }}
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
              onClick={() => navigate('/manager/additional-info')}
              className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-900">매칭 정보 입력</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/manager/address')}
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
      return <ProfileEditView />;
    default:
      return <MainView />;
  }
}
