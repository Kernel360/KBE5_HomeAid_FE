import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// lucide-react 아이콘 사용 시 설치 필요: npm install react-icons lucide-react --save
import { Calendar, Eye, EyeOff } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ko } from 'date-fns/locale';
import { format, isPast, parseISO } from 'date-fns'; // isPast, parseISO 임포트 추가
import './styles/datepicker.css'; // 새로 생성한 CSS 파일 임포트
import useSignUpStore from '../../stores/signUpStore'; // Zustand 스토어 임포트

// Step 1 유효성 검사 헬퍼 함수 (매니저)
const validateManagerStep1Data = ({ name, phoneNumber, email, dateOfBirth, gender, password, confirmPassword }) => {
  // 1. NotBlank/NotNull 검사
  if (!name || name.trim() === '') {
    return '이름은 필수 입력값입니다.';
  }
  // 전화번호에도 trim() 적용
  const trimmedPhoneNumber = phoneNumber ? phoneNumber.trim() : '';
  if (!trimmedPhoneNumber) {
    return '전화번호는 필수 입력값입니다.';
  }
  if (!email || email.trim() === '') {
    return '이메일은 필수 입력값입니다.';
  }
  // 이메일에도 trim() 적용
  const trimmedEmail = email ? email.trim() : '';
  if (!trimmedEmail) {
    return '이메일은 필수 입력값입니다.';
  }
  if (!dateOfBirth) {
    return '생년월일은 필수 입력값입니다.';
  }
  if (!gender || gender.trim() === '') {
    return '성별은 필수 입력값입니다.';
  }
  if (!password || password.trim() === '') {
    return '비밀번호는 필수 입력값입니다.';
  }
  if (!confirmPassword || confirmPassword.trim() === '') {
    return '비밀번호 확인은 필수 입력값입니다.';
  }

  // 2. 비밀번호 일치 검사
  if (password !== confirmPassword) {
    return '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
  }

  // 3. 이메일 형식 검사 (@Email)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return '올바른 이메일 형식이 아닙니다.';
  }

  // 4. 이름 길이 검사 (@Size)
  if (name.length < 2 || name.length > 20) {
    return '이름은 2자 이상 20자 이하여야 합니다.';
  }

  // 5. 전화번호 형식 검사 (@Pattern)
  const phoneRegex = /^01[016789]-\d{3,4}-\d{4}$/;
  if (!phoneRegex.test(trimmedPhoneNumber)) {
    return '전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678';
  }

  // 6. 생년월일 과거 날짜 검사 (@Past)
  if (dateOfBirth && !isPast(dateOfBirth)) {
    return '생년월일은 과거 날짜여야 합니다.';
  }

  // 7. 비밀번호 형식 검사 (@Pattern)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return '비밀번호는 8자 이상, 영문자, 숫자, 특수문자를 포함해야 합니다.';
  }

  return null; // 모든 유효성 검사 통과
};

const ManagerSignUpStep1Page = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState(''); // 'male' 또는 'female'
  const [dateOfBirth, setDateOfBirth] = useState(null); // null로 초기화
  const [email, setEmail] = useState(''); // 이메일 상태 추가
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(''); // 에러 메시지 상태 추가
  const navigate = useNavigate();
  const datePickerRef = useRef(null); // DatePicker ref 생성

  // Zustand 스토어에서 데이터 업데이트 함수 가져오기
  const { setManagerSignUpData } = useSignUpStore();

  const handleNext = () => {
    setError(''); // 이전 에러 초기화

    // 헬퍼 함수를 사용하여 유효성 검사
    const validationError = validateManagerStep1Data({
      name,
      phoneNumber: phoneNumber.trim(), // 유효성 검사 시 전화번호 trim 적용
      email: email.trim(), // 유효성 검사 시 이메일 trim 적용
      dateOfBirth,
      gender,
      password,
      confirmPassword,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    // 유효성 검사 통과 후 데이터 포맷 및 스토어 저장
    const formattedDateOfBirth = format(dateOfBirth, 'yyyy-MM-dd'); // dateOfBirth는 null이 아님이 보장됨

    setManagerSignUpData({
      name,
      phone: phoneNumber.trim(), // 스토어 저장 시 전화번호 trim 적용
      gender: gender.toUpperCase(), // 백엔드 GenderType enum에 맞게 대문자로 변환
      birth: formattedDateOfBirth,
      email: email.trim(), // 스토어 저장 시 이메일 trim 적용
      password: password,
    });

    console.log('매니저 회원가입 1단계 데이터 스토어에 저장됨');
    // 다음 단계로 이동 (예: '/auth/signup/manager/step2')
    navigate('/auth/signup/manager/step2');
  };

  const handlePrevious = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', background: '#f4f5f7', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '360px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'left' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#222', marginBottom: '8px' }}>매니저 정보 등록</h2>
          <div style={{ fontSize: '15px', color: '#888' }}>HomeAid 매니저로 활동하기 위한 정보를 입력해주세요</div>
        </div>

        {/* Step Indicator - Step 1 of 3 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '0 2px' }}>
          <div style={{ width: 'calc(33.33% - 2px)', height: '4px', background: '#247cff', borderRadius: '2px' }}></div>
          <div style={{ width: 'calc(33.33% - 2px)', height: '4px', background: '#247cff', borderRadius: '2px', marginRight: '2px' }}></div>
          <div style={{ width: 'calc(33.33% - 2px)', height: '4px', background: '#ddd', borderRadius: '2px' }}></div>
        </div>

        {/* Section Title */}
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#222', marginBottom: '24px' }}>기본 정보</div>

        {/* Form Fields */}
        <form onSubmit={e => e.preventDefault()} style={{ width: '100%' }}>

          {/* 이름 Input */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="name" style={{ display: 'block', fontSize: '14px', color: '#4B5563', fontWeight: '500', marginBottom: '8px' }}>이름</label>
            <input
              id="name"
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{ width: 'calc(100% - 26px)', padding: '13px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#333' }}
            />
          </div>

          {/* 이메일 Input - 새로 추가 */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: '14px', color: '#4B5563', fontWeight: '500', marginBottom: '8px' }}>이메일</label>
            <input
              id="email"
              type="email" // 이메일 형식 유효성 검사를 위해 type="email" 사용
              placeholder="email@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: 'calc(100% - 26px)', padding: '13px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#333' }}
            />
          </div>

          {/* 휴대폰 번호 Input */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="phoneNumber" style={{ display: 'block', fontSize: '14px', color: '#4B5563', fontWeight: '500', marginBottom: '8px' }}>휴대폰 번호</label>
            <input
              id="phoneNumber"
              type="text"
              placeholder="010-1234-5678"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              required
              style={{ width: 'calc(100% - 26px)', padding: '13px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#333' }}
            />
          </div>

          {/* 생년월일 Input 및 성별 Select (가로 배치) */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            {/* 생년월일 Input */}
            <div style={{ flex: 1 }}> {/* 너비를 반으로 */}
              <label htmlFor="dateOfBirth" style={{ display: 'block', fontSize: '14px', color: '#4B5563', fontWeight: '500', marginBottom: '8px' }}>생년월일</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0 13px' }}>
                {/* 실제 Date Picker 구현 */}
                <DatePicker
                  id="dateOfBirth"
                  selected={dateOfBirth}
                  onChange={(date) => setDateOfBirth(date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="YYYY-MM-DD"
                  peekMonthYearDropdown
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  locale={ko}
                  wrapperClassName="date-picker-wrapper"
                  customInput={
                    <input
                      style={{ flexGrow: 1, border: 'none', outline: 'none', fontSize: '16px', color: '#333', padding: '13px 0' }}
                      required
                    />
                  }
                  ref={datePickerRef}
                />
                {/* Calendar Icon */}
                <Calendar
                  size={20}
                  color="#6B7280"
                  style={{ cursor: 'pointer' }}
                  onClick={() => datePickerRef.current.setOpen(true)}
                />
              </div>
            </div>

            {/* 성별 Select */}
            <div style={{ flex: 1 }}> {/* 너비를 반으로 */}
               <label htmlFor="gender" style={{ display: 'block', fontSize: '14px', color: '#4B5563', fontWeight: '500', marginBottom: '8px' }}>성별</label>
               <select
                 id="gender"
                 value={gender}
                 onChange={e => setGender(e.target.value)}
                 required
                 style={{ width: '100%', padding: '13px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#333', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'url(\'data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M5%207l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E\')', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '12px 12px', cursor: 'pointer' }}
               >
                 <option value="">선택</option>
                 <option value="male">남</option>
                 <option value="female">여</option>
               </select>
            </div>
          </div>

          {/* 비밀번호 Input */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '14px', color: '#4B5563', fontWeight: '500', marginBottom: '8px' }}>비밀번호</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력해 주세요."
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: 'calc(100% - 40px)', padding: '13px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#333' }}
              />
              {/* Password Visibility Toggle */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={20} color="#888" /> : <Eye size={20} color="#888" />} {/* lucide-react 아이콘 사용 예시 */}
              </button>
            </div>
          </div>

          {/* 비밀번호 확인 Input */}
          <div style={{ marginBottom: '32px' }}>
            <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '14px', color: '#4B5563', fontWeight: '500', marginBottom: '8px' }}>비밀번호 확인</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="비밀번호를 다시 입력해 주세요."
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={{ width: 'calc(100% - 40px)', padding: '13px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#333' }}
              />
               {/* Password Visibility Toggle */}
               <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showConfirmPassword ? <EyeOff size={20} color="#888" /> : <Eye size={20} color="#888" />} {/* lucide-react 아이콘 사용 예시 */}
              </button>
            </div>
          </div>

          {/* 에러 메시지 표시 */}
          {error && <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>{error}</div>}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrevious}
              style={{
                flexGrow: 1,
                background: '#fff',
                color: '#4B5563',
                fontWeight: '900',
                fontSize: '16px',
                padding: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease, border-color 0.3s ease',
              }}
            >
              이전
            </button>
            <button
              type="button"
              onClick={handleNext}
              style={{
                flexGrow: 1,
                background: '#247cff',
                color: '#fff',
                fontWeight: '900',
                fontSize: '16px',
                padding: '14px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
              }}
            >
              다음
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ManagerSignUpStep1Page;
