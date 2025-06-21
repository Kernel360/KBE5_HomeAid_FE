import { ArrowLeft, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { apiService } from '@/api';
import Header from '../../../../components/Header.jsx';
import Footer from '../../../../components/Footer.jsx';

const isImage = (url) => !!url;

// 중앙 정사각형 crop 함수
function cropToSquare(imageFile) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = function () {
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
      canvas.toBlob((blob) => {
        resolve(blob);
      }, imageFile.type);
    };
    img.src = URL.createObjectURL(imageFile);
  });
}

// 내 정보 수정 페이지
const MyProfile = ({ onBack }) => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImageUrl: '',
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

  // 마운트 시 최신 회원정보 API 호출
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiService.user.getMyProfile();
        const data = res.data?.data || res.data;
        console.log('프로필 응답:', data); // profileImageUrl 값 콘솔 출력
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: addHyphensToPhone(data.phone) || '',
          profileImageUrl: data.profileImageUrl || '',
        });
      } catch (e) {
        setFormData({
          name: user?.name || user?.username || '',
          email: user?.email || '',
          phone: addHyphensToPhone(user?.phone) || '',
          profileImageUrl: user?.profileImageUrl || '',
        });
      }
    }
    fetchProfile();
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

  // 프로필 이미지 업로드/삭제 핸들러 (headers 옵션 없이 순수 FormData만 전달)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      setError('');
      // 중앙 정사각형 crop
      const croppedBlob = await cropToSquare(file);
      const formData = new FormData();
      formData.append('file', croppedBlob, file.name); // 파일명 유지
      await apiService.user.uploadProfileImage(formData);
      setSuccess('프로필 이미지가 업로드되었습니다.');
      setTimeout(() => setSuccess(''), 2000);
      // 업로드 후 프로필 정보 새로고침
      const res = await apiService.user.getMyProfile();
      const data = res.data?.data || res.data;
      setFormData((prev) => ({ ...prev, profileImageUrl: data.profileImageUrl || '' }));
    } catch (err) {
      setError('프로필 이미지 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageDelete = async () => {
    try {
      setLoading(true);
      setError('');
      await apiService.user.deleteProfileImage();
      setSuccess('프로필 이미지가 삭제되었습니다.');
      setTimeout(() => setSuccess(''), 2000);
      // 삭제 후 프로필 정보 새로고침
      const res = await apiService.user.getMyProfile();
      const data = res.data?.data || res.data;
      setFormData((prev) => ({ ...prev, profileImageUrl: data.profileImageUrl || '' }));
    } catch (err) {
      setError('프로필 이미지 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      if (!formData.name.trim()) {
        setError('이름을 입력해주세요.');
        return;
      }
      if (!formData.email.trim()) {
        setError('이메일을 입력해주세요.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('올바른 이메일 형식을 입력해주세요.');
        return;
      }
      // updateMyProfile로 변경
      await apiService.user.updateMyProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });
      updateUser({
        ...user,
        name: formData.name.trim(),
        email: formData.email.trim(),
      });
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
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
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
            {isImage(formData.profileImageUrl) ? (
              <img
                src={formData.profileImageUrl}
                alt="프로필 이미지"
                className="w-24 h-24 object-cover object-center rounded-full"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            <label htmlFor="profile-image-upload" className="text-blue-600 text-sm cursor-pointer">사진 업데이트</label>
            <input id="profile-image-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={loading} />
            {formData.profileImageUrl && (
              <button type="button" className="text-red-500 text-xs" onClick={handleImageDelete} disabled={loading}>사진 삭제</button>
            )}
          </div>
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
