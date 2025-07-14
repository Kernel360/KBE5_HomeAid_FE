import React, { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import { isValid, isPast } from 'date-fns';
import './styles/datepicker.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authService } from './services/authService.js';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const datePickerStyles = `
  .react-datepicker__year-dropdown {
    width: 50% !important;
    min-width: 120px !important;
    left: 25% !important;
    font-size: 1rem !important;
  }
  .react-datepicker__year-dropdown-container {
    font-size: 1rem !important;
  }
  .react-datepicker__year-read-view {
    font-size: 1rem !important;
  }
  .react-datepicker__year-option {
    font-size: 1rem !important;
    padding: 8px 0 !important;
  }
  .react-datepicker__year-option::after {
    content: "년" !important;
    margin-left: 2px !important;
  }
  .react-datepicker__year-read-view--selected-year::after {
    content: "년" !important;
    margin-left: 2px !important;
  }
  .react-datepicker__year-read-view--down-arrow {
    margin-left: 10px !important;
  }
  .react-datepicker__month-dropdown {
    width: 50% !important;
    min-width: 120px !important;
    left: 25% !important;
    font-size: 1rem !important;
  }
  .react-datepicker__month-dropdown-container {
    font-size: 1rem !important;
  }
  .react-datepicker__month-read-view {
    font-size: 1rem !important;
  }
  .react-datepicker__month-option {
    font-size: 1rem !important;
    padding: 8px 0 !important;
  }
  .react-datepicker__navigation {
    top: 15px !important;
  }
  .react-datepicker__current-month {
    font-size: 1rem !important;
    padding: 8px 0 !important;
  }
  .react-datepicker__day {
    font-size: 0.9rem !important;
    padding: 6px !important;
  }
  .react-datepicker__day--disabled {
    color: #ccc !important;
    cursor: not-allowed !important;
  }
  .react-datepicker__day--disabled:hover {
    background-color: transparent !important;
  }
`;

const formatPhoneNumber = (value) => {
  if (!value) return '';
  const digitsOnly = value.replace(/[^0-9]/g, '');
  const limitedDigits = digitsOnly.slice(0, 11);
  let formatted = '';
  if (limitedDigits.length <= 3) {
    formatted = limitedDigits;
  } else if (limitedDigits.length <= 7) {
    formatted = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
  } else {
    formatted = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 7)}-${limitedDigits.slice(7)}`;
  }
  return formatted;
};

const AdditionalProfilePage = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const oauthCode = params.get('oauthCode');
  const email = params.get('email');
  const username = params.get('name') || email?.split('@')[0] || '';
  const profileComplete = params.get('profileComplete');
  const { setAccessToken, setUser, setRefreshToken } = useAuthStore();
  const datePickerRef = useRef(null);

  // 폼 상태
  const [role, setRole] = useState('CUSTOMER');
  const [phone, setPhone] = useState('');
  const [birth, setBirth] = useState(null); // Date 객체로 관리
  const [gender, setGender] = useState('MALE');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [career, setCareer] = useState(''); // 매니저 전용
  const [experience, setExperience] = useState(''); // 매니저 전용

  // 전화번호 입력 핸들러
  const handlePhoneChange = (e) => {
    setPhone(formatPhoneNumber(e.target.value));
    setFieldErrors((prev) => ({ ...prev, phone: '' }));
  };

  // 생년월일 변경 핸들러
  const handleBirthChange = (date) => {
    setBirth(date);
    let error = '';
    if (!isValid(date)) {
      error = '유효한 생년월일을 입력해주세요.';
    } else if (!isPast(date)) {
      error = '생년월일은 과거 날짜여야 합니다.';
    }
    setFieldErrors((prev) => ({ ...prev, birth: error }));
  };

  // 성별 변경 핸들러
  const handleGenderChange = (e) => {
    setGender(e.target.value);
    setFieldErrors((prev) => ({ ...prev, gender: '' }));
  };

  // 회원 유형 변경 핸들러
  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setFieldErrors((prev) => ({ ...prev, role: '' }));
  };

  // 제출 핸들러 (기존 로직 유지)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // 간단한 유효성 검사
    const errors = {};
    if (!phone || phone.length < 12) errors.phone = '유효한 전화번호를 입력하세요.';
    if (!birth || !isValid(birth) || !isPast(birth)) errors.birth = '유효한 생년월일을 입력하세요.';
    if (!gender) errors.gender = '성별을 선택하세요.';
    if (!role) errors.role = '회원 유형을 선택하세요.';
    if (role === 'MANAGER') {
      if (!career) errors.career = '경력을 입력하세요.';
      if (!experience) errors.experience = '경험을 입력하세요.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const payload = {
        oauthCode, // 쿼리스트링에서 받아온 값
        role,
        phone,
        birth: birth ? birth.toISOString().slice(0, 10) : '',
        gender,
      };
      if (role === 'MANAGER') {
        payload.career = career;
        payload.experience = experience;
      }
      // 1. 추가 프로필 제출
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/signup/oauth/additional-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('추가 정보 입력 실패');
      // 2. 새 oauthCode를 응답에서 추출
      const result = await res.json();
      const newOauthCode = result.data; // 실제 응답 구조에 따라 조정 필요
      // 3. 새 oauthCode로 토큰 발급 요청
      await fetchTokenAndLogin(newOauthCode, navigate, setAccessToken, setUser, setRefreshToken);
    } catch (err) {
      setError('추가 정보 입력에 실패했습니다.');
    }
  };

  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = datePickerStyles;
    document.head.appendChild(styleElement);
    return () => { document.head.removeChild(styleElement); };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5faff] to-[#eaf0fa] flex flex-col items-center">
      <section className="w-full max-w-[512px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[80vh] relative py-10 px-5">
        {/* Header (카드의 가장 바깥, radius/width 일치) */}
        <div className="w-full rounded-t-2xl">
          <Header showBackButton={true} className="w-full max-w-[512px] mx-auto rounded-t-2xl" />
        </div>
        {/* 폼 영역: padding 제거, py만 유지 */}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">회원 정보 등록</h2>
            <div className="text-base text-gray-500">Antwork 회원으로 활동하기 위한 정보를 입력해주세요</div>
          </div>
          <div className="text-lg font-bold text-gray-900 mb-6">기본 정보</div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full flex-1 px-5">
            {/* 이메일 */}
            <div className="mb-5">
              <label className="block text-sm text-gray-700 font-medium mb-2">이메일</label>
              <input value={email} readOnly className="w-full p-3 rounded-lg border border-gray-200 bg-gray-100 text-base" />
            </div>
            {/* username */}
            <div className="mb-5">
              <label className="block text-sm text-gray-700 font-medium mb-2">사용자명</label>
              <input value={username} readOnly className="w-full p-3 rounded-lg border border-gray-200 bg-gray-100 text-base" />
            </div>
            {/* 회원 유형 */}
            <div className="mb-5">
              <label className="block text-sm text-gray-700 font-medium mb-2">회원 유형</label>
              <select value={role} onChange={handleRoleChange} className="w-full p-3 rounded-lg border border-gray-200 text-base">
                <option value="CUSTOMER">고객</option>
                <option value="MANAGER">매니저</option>
              </select>
              {fieldErrors.role && <div className="text-red-600 text-xs mt-1">{fieldErrors.role}</div>}
            </div>
            {/* 전화번호 */}
            <div className="mb-5">
              <label className="block text-sm text-gray-700 font-medium mb-2">전화번호</label>
              <input value={phone} onChange={handlePhoneChange} placeholder="전화번호 (010-1234-5678)" maxLength={13} className="w-full p-3 rounded-lg border border-gray-200 text-base" />
              {fieldErrors.phone && <div className="text-red-600 text-xs mt-1">{fieldErrors.phone}</div>}
            </div>
            {/* 생년월일 + 성별 */}
            <div className="flex gap-4 mb-5 w-full">
              {/* 생년월일 */}
              <div className="flex-1">
                <label className="block text-sm text-gray-700 font-medium mb-2">생년월일</label>
                <div className={`relative flex items-center rounded-lg border ${fieldErrors.birth ? 'border-red-300' : 'border-gray-200'} box-border`}>
                  <DatePicker
                    ref={datePickerRef}
                    selected={birth}
                    onChange={handleBirthChange}
                    dateFormat="yyyy년 MM월 dd일"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    minDate={new Date('1950-01-01')}
                    maxDate={new Date()}
                    placeholderText="생년월일을 선택하세요"
                    locale={ko}
                    className="w-full"
                    customInput={
                      <input
                        style={{
                          width: '100%',
                          padding: '13px',
                          fontSize: '16px',
                          color: '#333',
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
                      />
                    }
                  />
                </div>
                {fieldErrors.birth && <div className="text-red-600 text-xs mt-1">{fieldErrors.birth}</div>}
              </div>
              {/* 성별 */}
              <div className="flex-1">
                <label className="block text-sm text-gray-700 font-medium mb-2">성별</label>
                <select value={gender} onChange={handleGenderChange} className="w-full p-3 rounded-lg border border-gray-200 text-base">
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </select>
                {fieldErrors.gender && <div className="text-red-600 text-xs mt-1">{fieldErrors.gender}</div>}
              </div>
            </div>
            {/* 매니저 전용 필드 */}
            {role === 'MANAGER' && (
              <>
                <div className="mb-5">
                  <label className="block text-sm text-gray-700 font-medium mb-2">경력</label>
                  <input value={career} onChange={e => setCareer(e.target.value)} placeholder="경력" className="w-full p-3 rounded-lg border border-gray-200 text-base" />
                  {fieldErrors.career && <div className="text-red-600 text-xs mt-1">{fieldErrors.career}</div>}
                </div>
                <div className="mb-5">
                  <label className="block text-sm text-gray-700 font-medium mb-2">경험</label>
                  <input value={experience} onChange={e => setExperience(e.target.value)} placeholder="경험" className="w-full p-3 rounded-lg border border-gray-200 text-base" />
                  {fieldErrors.experience && <div className="text-red-600 text-xs mt-1">{fieldErrors.experience}</div>}
                </div>
              </>
            )}
            {error && <div className="text-red-600 text-base mt-1">{error}</div>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 rounded-lg mt-2 mb-8 transition-colors">제출</button>
          </form>
        </div>
        {/* Footer (카드의 가장 바깥, radius/width 일치) */}
        <div className="w-full rounded-b-2xl">
          <Footer className="w-full max-w-[512px] mx-auto rounded-b-2xl" />
        </div>
      </section>
    </div>
  );
};

async function fetchTokenAndLogin(oauthCode, navigate, setAccessToken, setUser, setRefreshToken) {
  try {
    const user = await authService.socialSignIn(oauthCode);
    if (user.role === 'ROLE_CUSTOMER') {
      navigate('/customer/service-option', { replace: true });
    } else if (user.role === 'ROLE_ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (user.role === 'ROLE_MANAGER') {
      navigate('/matching/list', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  } catch (err) {
    alert('로그인 실패');
    navigate('/auth/signin');
  }
}

export default AdditionalProfilePage;
