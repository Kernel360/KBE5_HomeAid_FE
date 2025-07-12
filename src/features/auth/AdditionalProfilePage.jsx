import React, { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import { isValid, isPast } from 'date-fns';
import './styles/datepicker.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authService } from './services/authService.js';

// 전화번호 자동 하이픈 함수
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
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/signup/oauth/additional-profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role,
          phone,
          birth: birth ? birth.toISOString().slice(0, 10) : '',
          gender,
        }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('추가 정보 입력 실패');
      await fetchTokenAndLogin(oauthCode, navigate, setAccessToken, setUser, setRefreshToken);
    } catch (err) {
      setError('추가 정보 입력에 실패했습니다.');
    }
  };

  // DatePicker 스타일 동적 추가 (복사)
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .react-datepicker__year-dropdown { width: 50% !important; min-width: 120px !important; left: 25% !important; font-size: 1rem !important; }
      .react-datepicker__year-dropdown-container { font-size: 1rem !important; }
      .react-datepicker__year-read-view { font-size: 1rem !important; }
      .react-datepicker__year-option { font-size: 1rem !important; padding: 8px 0 !important; }
      .react-datepicker__year-option::after { content: "년" !important; margin-left: 2px !important; }
      .react-datepicker__year-read-view--selected-year::after { content: "년" !important; margin-left: 2px !important; }
      .react-datepicker__year-read-view--down-arrow { margin-left: 10px !important; }
      .react-datepicker__month-dropdown { width: 50% !important; min-width: 120px !important; left: 25% !important; font-size: 1rem !important; }
      .react-datepicker__month-dropdown-container { font-size: 1rem !important; }
      .react-datepicker__month-read-view { font-size: 1rem !important; }
      .react-datepicker__month-option { font-size: 1rem !important; padding: 8px 0 !important; }
      .react-datepicker__navigation { top: 15px !important; }
      .react-datepicker__current-month { font-size: 1rem !important; padding: 8px 0 !important; }
      .react-datepicker__day { font-size: 0.9rem !important; padding: 6px !important; }
      .react-datepicker__day--disabled { color: #ccc !important; cursor: not-allowed !important; }
      .react-datepicker__day--disabled:hover { background-color: transparent !important; }
    `;
    document.head.appendChild(styleElement);
    return () => { document.head.removeChild(styleElement); };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'x-hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#f5faff',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          marginTop: '40px',
          marginBottom: '40px',
          minHeight: '420px',
          padding: '32px 24px',
          boxSizing: 'border-box',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 16px 0 rgba(36,124,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#222', marginBottom: '8px' }}>
          추가 정보 입력
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 이메일 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>이메일</label>
            <input value={email} readOnly style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: '#f9f9f9', fontSize: '16px' }} />
          </div>
          {/* 회원 유형 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>회원 유형</label>
            <select value={role} onChange={handleRoleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}>
              <option value="CUSTOMER">고객</option>
              <option value="MANAGER">매니저</option>
            </select>
            {fieldErrors.role && <div style={{ color: '#dc2626', fontSize: '13px' }}>{fieldErrors.role}</div>}
          </div>
          {/* 전화번호 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>전화번호</label>
            <input value={phone} onChange={handlePhoneChange} placeholder="전화번호 (010-1234-5678)" maxLength={13} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }} />
            {fieldErrors.phone && <div style={{ color: '#dc2626', fontSize: '13px' }}>{fieldErrors.phone}</div>}
          </div>
          {/* 생년월일 + 성별 */}
          <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
            {/* 생년월일 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>생년월일</label>
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
                className="mt-1 block w-full"
                customInput={
                  <input
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
                      color: '#333',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      outline: 'none',
                      background: '#f9f9f9',
                      cursor: 'pointer',
                    }}
                  />
                }
              />
              {fieldErrors.birth && <div style={{ color: '#dc2626', fontSize: '13px' }}>{fieldErrors.birth}</div>}
            </div>
            {/* 성별 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>성별</label>
              <select value={gender} onChange={handleGenderChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}>
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
              </select>
              {fieldErrors.gender && <div style={{ color: '#dc2626', fontSize: '13px' }}>{fieldErrors.gender}</div>}
            </div>
          </div>
          {error && <div style={{ color: '#dc2626', fontSize: '15px', marginTop: '4px' }}>{error}</div>}
          <button type="submit" style={{ width: '100%', background: '#247cff', color: '#fff', fontWeight: 'bold', fontSize: '18px', padding: '14px', border: 'none', borderRadius: '8px', marginTop: '8px', cursor: 'pointer', transition: 'background-color 0.3s ease' }}>
            제출
          </button>
        </form>
      </div>
    </div>
  );
};

async function fetchTokenAndLogin(oauthCode, navigate, setAccessToken, setUser, setRefreshToken) {
  try {
    const user = await authService.socialSignIn(oauthCode);
    // 역할에 따라 라우팅
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
