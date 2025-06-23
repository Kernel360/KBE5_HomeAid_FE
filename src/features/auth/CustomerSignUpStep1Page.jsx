import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// lucide-react 아이콘 사용 시 설치 필요: npm install react-icons lucide-react --save
import { Calendar, Eye, EyeOff } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import { format, isValid, isPast } from 'date-fns'; // 날짜 형식을 변환하기 위해 임포트
import './styles/datepicker.css'; // 새로 생성한 CSS 파일 임포트
import useSignUpStore from '../../stores/signUpStore'; // Zustand 스토어 임포트
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// 전화번호 자동 하이픈 함수 (가장 위로 이동)
const formatPhoneNumber = (value) => {
  if (!value) return '';
  const digitsOnly = value.replace(/[^0-9]/g, '');
  // Max 11 digits for '010-XXXX-XXXX'
  const limitedDigits = digitsOnly.slice(0, 11);
  let formatted = '';
  if (limitedDigits.length <= 3) {
    formatted = limitedDigits;
  } else if (limitedDigits.length <= 7) {
    formatted = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
  } else { // 8 to 11 digits
    formatted = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 7)}-${limitedDigits.slice(7)}`;
  }
  return formatted;
};

// Step 1 유효성 검사 헬퍼 함수
const validateCustomerStep1Data = ({
  name,
  phoneNumber,
  email,
  dateOfBirth,
  gender,
  password,
  confirmPassword,
}) => {
  const errors = {};

  // 이름 유효성 검사
  if (!name || name.trim() === '') {
    errors.name = '이름은 필수 입력값입니다.';
  } else if (name.length < 2 || name.length > 20) {
    errors.name = '이름은 2자 이상 20자 이하여야 합니다.';
  }

  // 이메일 유효성 검사
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || email.trim() === '') {
    errors.email = '이메일은 필수 입력값입니다.';
  } else if (!emailRegex.test(email.trim())) {
    errors.email = '유효한 이메일 주소를 입력해주세요.';
  }

  // 휴대폰 번호 유효성 검사
  const phoneRegex = /^01[016789]-(?:[0-9]{3}|[0-9]{4})-[0-9]{4}$/;
  if (!phoneNumber || phoneNumber.trim() === '') {
    errors.phoneNumber = '휴대폰 번호는 필수 입력값입니다.';
  } else if (!phoneRegex.test(phoneNumber.trim())) {
    errors.phoneNumber = '유효한 휴대폰 번호를 입력해주세요. (예: 010-1234-5678 또는 010-123-4567)';
  }

  // 생년월일 유효성 검사
  if (!dateOfBirth || !isValid(dateOfBirth)) {
    errors.dateOfBirth = '유효한 생년월일을 입력해주세요.';
  } else if (!isPast(dateOfBirth)) {
    errors.dateOfBirth = '생년월일은 과거 날짜여야 합니다.';
  }

  // 성별 유효성 검사
  if (!gender || gender.trim() === '') {
    errors.gender = '성별을 선택해주세요.';
  }

  // 비밀번호 유효성 검사
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[@$!%*#?&])[A-Za-z0-9@$!%*#?&]{8,}$/;
  if (!password || password.trim() === '') {
    errors.password = '비밀번호는 필수 입력값입니다.';
  } else if (!passwordRegex.test(password.trim())) {
    errors.password = '비밀번호는 8자 이상, 영문자, 숫자, 특수문자를 포함해야 합니다.';
  }

  // 비밀번호 확인 유효성 검사
  if (!confirmPassword || confirmPassword.trim() === '') {
    errors.confirmPassword = '비밀번호 확인은 필수 입력값입니다.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
  }

  return errors;
};

const CustomerSignUpStep1Page = () => {
  const navigate = useNavigate();
  const datePickerRef = useRef(null); // DatePicker ref 생성

  // Zustand 스토어에서 데이터 가져오기 및 업데이트 함수 가져오기
  const { customerSignUpData, setCustomerSignUpData } = useSignUpStore();

  // 필드 상태 및 에러 상태 초기화
  const [name, setName] = useState(customerSignUpData.name || '');
  const [phoneNumber, setPhoneNumber] = useState(customerSignUpData.phone ? formatPhoneNumber(customerSignUpData.phone) : '');
  const [gender, setGender] = useState(customerSignUpData.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(customerSignUpData.birth ? new Date(customerSignUpData.birth) : null);
  const [email, setEmail] = useState(customerSignUpData.email || '');
  const [password, setPassword] = useState(customerSignUpData.password || '');
  const [confirmPassword, setConfirmPassword] = useState(customerSignUpData.password || ''); // 비밀번호 확인도 초기화
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({}); // 필드별 에러 상태 추가

  // 입력 필드 변경 핸들러
  const handleInputChange = (fieldName, value) => {
    if (fieldName === 'phoneNumber') {
      const formattedValue = formatPhoneNumber(value);
      setPhoneNumber(formattedValue);
    } else if (fieldName === 'name') setName(value);
    else if (fieldName === 'email') setEmail(value);
    else if (fieldName === 'gender') setGender(value);
    else if (fieldName === 'password') setPassword(value);
    else if (fieldName === 'confirmPassword') setConfirmPassword(value);

    // 에러 초기화 (입력 중에는 에러 메시지 숨김)
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: '',
    }));
  };

  // 입력 필드 포커스 아웃(blur) 핸들러
  const handleBlur = (fieldName) => {
    const currentValues = {
      name,
      phoneNumber,
      email,
      dateOfBirth,
      gender,
      password,
      confirmPassword,
    };
    const errors = validateCustomerStep1Data(currentValues);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: errors[fieldName] || '',
    }));
  };

  const handleDateChange = (date) => {
    setDateOfBirth(date);
    let error = '';
    if (!isValid(date)) {
      error = '유효한 생년월일을 입력해주세요.';
    } else if (!isPast(date)) {
      error = '생년월일은 과거 날짜여야 합니다.';
    }
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      dateOfBirth: error,
    }));
  };

  const handleNext = () => {
    const currentValues = {
      name,
      phoneNumber,
      email,
      dateOfBirth,
      gender,
      password,
      confirmPassword,
    };
    const errors = validateCustomerStep1Data(currentValues);
    setFieldErrors(errors); // 모든 에러 업데이트

    if (Object.keys(errors).length > 0) {
      // 에러가 있으면 스크롤을 최상단으로 이동 (첫 번째 에러가 보이는 곳으로)
      window.scrollTo(0, 0);
      return;
    }

    // 유효성 검사 통과 후 데이터 포맷 및 스토어 저장
    const formattedDateOfBirth = format(dateOfBirth, 'yyyy-MM-dd');

    setCustomerSignUpData({
      name,
      phone: phoneNumber, // 하이픈 제거 없이 그대로 저장
      gender,
      birth: formattedDateOfBirth,
      email: email,
      password: password,
    });

    console.log('고객 회원가입 1단계 데이터 스토어에 저장됨');
    // 다음 단계로 이동
    navigate('/auth/signup/customer/step2');
  };

  const handlePrevious = () => {
    navigate(-1); // 브라우저 히스토리 기준 이전 화면으로 이동
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'x-hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Header showBackButton={true} />

      <div
        style={{
          width: '100%',
          maxWidth: '512px',
          marginTop: '20px', // Header 높이만큼
          marginBottom: '64px', // Footer 높이만큼
          minHeight: 'calc(100vh - 128px)', // Header + Footer 높이 제외
          padding: '40px 20px',
          boxSizing: 'border-box',
          background: '#fff',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#222',
              marginBottom: '8px',
            }}
          >
            회원 정보 등록
          </h2>
          <div style={{ fontSize: '15px', color: '#888' }}>
          Antwork 회원으로 활동하기 위한 정보를 입력해주세요
          </div>
        </div>

        {/* Step Indicator - Step 1 of 3 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            padding: '0 2px',
          }}
        >
          <div
            style={{
              width: 'calc(33.33% - 2px)',
              height: '4px',
              background: '#247cff',
              borderRadius: '2px',
            }}
          ></div>
          <div
            style={{
              width: 'calc(33.33% - 2px)',
              height: '4px',
              background: '#247cff',
              borderRadius: '2px',
              marginRight: '2px',
            }}
          ></div>
          <div
            style={{
              width: 'calc(33.33% - 2px)',
              height: '4px',
              background: '#ddd',
              borderRadius: '2px',
            }}
          ></div>
        </div>

        {/* Section Title */}
        <div
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#222',
            marginBottom: '24px',
          }}
        >
          기본 정보
        </div>

        {/* Form Fields */}
        <form onSubmit={(e) => e.preventDefault()} style={{ width: '100%', padding: '0 20px' }}>
          {/* 이름 Input */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="name"
              style={{
                display: 'block',
                fontSize: '14px',
                color: '#4B5563',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              이름
            </label>
            <div style={{ width: '100%' }}>
              <input
                id="name"
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                required
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '8px',
                  border: fieldErrors.name ? '1px solid #e74c3c' : '1px solid #E5E7EB',
                  fontSize: '16px',
                  color: '#333',
                  boxSizing: 'border-box',
                }}
              />
              {fieldErrors.name && (
                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.name}
                </div>
              )}
            </div>
          </div>

          {/* 이메일 Input - 새로 추가 */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '14px',
                color: '#4B5563',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              이메일
            </label>
            <div style={{ width: '100%' }}>
              <input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                required
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '8px',
                  border: fieldErrors.email ? '1px solid #e74c3c' : '1px solid #E5E7EB',
                  fontSize: '16px',
                  color: '#333',
                  boxSizing: 'border-box',
                }}
              />
              {fieldErrors.email && (
                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.email}
                </div>
              )}
            </div>
          </div>

          {/* 휴대폰 번호 Input */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="phoneNumber"
              style={{
                display: 'block',
                fontSize: '14px',
                color: '#4B5563',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              휴대폰 번호
            </label>
            <div style={{ width: '100%' }}>
              <input
                id="phoneNumber"
                type="text"
                placeholder="010-1234-5678"
                value={phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                onBlur={() => handleBlur('phoneNumber')}
                required
                maxLength={13}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '8px',
                  border: fieldErrors.phoneNumber ? '1px solid #e74c3c' : '1px solid #E5E7EB',
                  fontSize: '16px',
                  color: '#333',
                  boxSizing: 'border-box',
                }}
              />
              {fieldErrors.phoneNumber && (
                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.phoneNumber}
                </div>
              )}
            </div>
          </div>

          {/* 생년월일 Input 및 성별 Select (가로 배치) */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', width: '100%' }}>
            {/* 생년월일 Input */}
            <div style={{ flex: 1 }}>
              {' '}
              {/* 너비를 반으로 */}
              <label
                htmlFor="dateOfBirth"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#4B5563',
                  fontWeight: '500',
                  marginBottom: '8px',
                }}
              >
                생년월일
              </label>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  border: fieldErrors.dateOfBirth ? '1px solid #e74c3c' : '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '0 13px', // 왼쪽 오른쪽 패딩 유지
                  boxSizing: 'border-box',
                }}
              >
                {/* 실제 Date Picker 구현 */}
                <DatePicker
                  id="dateOfBirth"
                  selected={dateOfBirth}
                  onChange={handleDateChange}
                  onChangeRaw={(e) => e.preventDefault()}
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
                      style={{
                        flexGrow: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: '16px',
                        color: '#333',
                        padding: '13px 0',
                        caretColor: 'transparent',
                        boxSizing: 'border-box',
                      }}
                      required
                      readOnly
                      value={dateOfBirth && isValid(dateOfBirth) ? format(dateOfBirth, 'yyyy-MM-dd') : ''}
                      onBlur={() => handleBlur('dateOfBirth')}
                      tabIndex="-1"
                      autoComplete="off"
                      onKeyDown={e => e.preventDefault()}
                      onPaste={e => e.preventDefault()}
                      onDrop={e => e.preventDefault()}
                      onCompositionStart={e => e.preventDefault()}
                      onCompositionUpdate={e => e.preventDefault()}
                      onCompositionEnd={e => e.preventDefault()}
                    />
                  }
                  ref={datePickerRef}
                />
                {/* Calendar Icon */}
                <Calendar
                  size={20}
                  color="#6B7280"
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={() => datePickerRef.current.setOpen(true)} // 아이콘 클릭 시 DatePicker 열기
                />
              </div>
              {fieldErrors.dateOfBirth && (
                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.dateOfBirth}
                </div>
              )}
            </div>

            {/* 성별 Select */}
            <div style={{ flex: 1 }}>
              {' '}
              {/* 너비를 반으로 */}
              <label
                htmlFor="gender"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#4B5563',
                  fontWeight: '500',
                  marginBottom: '8px',
                }}
              >
                성별
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                onBlur={() => handleBlur('gender')}
                required
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '8px',
                  border: fieldErrors.gender ? '1px solid #e74c3c' : '1px solid #E5E7EB',
                  fontSize: '16px',
                  color: '#333',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage:
                    "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M5%207l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '12px 12px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">선택</option>
                <option value="male">남</option>
                <option value="female">여</option>
              </select>
              {fieldErrors.gender && (
                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.gender}
                </div>
              )}
            </div>
          </div>

          {/* 비밀번호 Input */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '14px',
                color: '#4B5563',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              비밀번호
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력해 주세요."
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                required
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '8px',
                  border: fieldErrors.password ? '1px solid #e74c3c' : '1px solid #E5E7EB',
                  fontSize: '16px',
                  color: '#333',
                  boxSizing: 'border-box',
                }}
              />
              {/* Password Visibility Toggle */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#888" />
                ) : (
                  <Eye size={20} color="#888" />
                )}{' '}
                {/* lucide-react 아이콘 사용 예시 */}
              </button>
              {fieldErrors.password && (
                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.password}
                </div>
              )}
            </div>
          </div>

          {/* 비밀번호 확인 Input */}
          <div style={{ marginBottom: '32px' }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block',
                fontSize: '14px',
                color: '#4B5563',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              비밀번호 확인
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="비밀번호를 다시 입력해 주세요."
                value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                required
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '8px',
                  border: fieldErrors.confirmPassword ? '1px solid #e74c3c' : '1px solid #E5E7EB',
                  fontSize: '16px',
                  color: '#333',
                  boxSizing: 'border-box',
                }}
              />
              {/* Password Visibility Toggle */}
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#888" />
                ) : (
                  <Eye size={20} color="#888" />
                )}{' '}
                {/* lucide-react 아이콘 사용 예시 */}
              </button>
              {fieldErrors.confirmPassword && (
                <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.confirmPassword}
                </div>
              )}
            </div>
          </div>

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
                transition:
                  'background-color 0.3s ease, border-color 0.3s ease',
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

      <Footer />
    </div>
  );
};

export default CustomerSignUpStep1Page;
