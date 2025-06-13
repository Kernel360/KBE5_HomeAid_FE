import { ArrowLeft, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { apiService } from '../../../../store/api';
import Header from '../../../../components/Header.jsx';
import Footer from '../../../../components/Footer.jsx';

// 내 정보 수정 페이지
const MyProfile = ({ onBack }) => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  // 입력 필드 변경 핸들러
  const handleInputChange = (field, value) => {
    let formattedValue = value;

    // 전화번호 필드인 경우 자동 포맷팅
    if (field === 'phone') {
      formattedValue = formatPhoneNumber(value);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
    // 에러/성공 메시지 초기화
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
      // 전화번호 수정 기능 비활성화로 인한 주석처리
      /*
      if (!formData.phone.trim()) {
        setError('전화번호를 입력해주세요.');
        return;
      }
      */

      // 이메일 형식 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('올바른 이메일 형식을 입력해주세요.');
        return;
      }

      // 전화번호 수정 기능 비활성화로 인한 주석처리
      /*
      // 전화번호 형식 검사 (하이픈 포함된 한국 전화번호)
      const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/; // 하이픈 포함된 한국 휴대폰 번호 형식
      if (!phoneRegex.test(formData.phone)) {
        setError(
          '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)'
        );
        return;
      }
      */

      // 사용자 ID 확인
      if (!user?.userId && !user?.id) {
        setError('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      // UserUpdateRequestDto 구조에 맞춰 데이터 준비 (전화번호 제외)
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        // phone: formData.phone, // 전화번호 수정 기능 비활성화로 인한 주석처리
      };

      // API 호출로 프로필 업데이트 (userId 포함)
      const userId = user.userId || user.id;
      await apiService.user.updateProfile(userId, updateData);

      // 성공 시 AuthStore의 사용자 정보도 업데이트 (전화번호 제외)
      updateUser({
        ...user,
        name: updateData.name,
        email: updateData.email,
        // phone: formData.phone, // 전화번호는 수정하지 않으므로 기존 값 유지
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

  // 회원탈퇴 버튼 클릭 핸들러
  const handleWithdrawal = () => {
    alert('관리자에게 문의 바랍니다.');
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        paddingBottom: '80px',
        maxWidth: '512px',
        margin: '0 auto',
      }}
    >
      <Header showBackButton={true} onBackClick={onBack} />

      <main className="px-6 py-6" style={{ paddingTop: '80px' }}>
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

        {/* 안내 메시지 */}
        {/* <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm">
          <p className="font-medium mb-1">📝 프로필 정보 수정</p>
          <p>
            이름과 이메일을 수정할 수 있습니다. 전화번호는 보안상의 이유로
            수정이 제한됩니다.
          </p>
        </div> */}

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
              readOnly
              disabled
              placeholder="010-1234-5678"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              전화번호는 보안상의 이유로 수정할 수 없습니다. 관리자에게
              문의바랍니다.
            </p>
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onBack}
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
          {/* <button className="text-blue-600 text-sm mb-4 block">
            비밀번호 변경
          </button> */}
          <button
            onClick={handleWithdrawal}
            className="text-red-500 text-sm block"
          >
            회원 탈퇴
          </button>
        </div>
      </main>

      <Footer current="/customer/mypage" />
    </div>
  );
};

export default MyProfile;
