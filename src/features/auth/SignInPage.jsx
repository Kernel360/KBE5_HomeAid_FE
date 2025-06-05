import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// npm install react-icons lucide-react --save
import { Eye, EyeOff } from 'lucide-react'; // lucide-react 사용 예시

const SignInPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // 실제 API 호출 로직은 여기에 구현 (휴대폰 번호와 비밀번호 전송)
    try {
      const res = await fetch('/api/v1/user/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }), // 휴대폰 번호와 비밀번호 전송
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '로그인 실패');
      // 성공 시 처리 (예: 토큰 저장, 페이지 이동 등)
      console.log('로그인 성공!', data);
      alert('로그인 성공!'); // 임시 알림
      // navigate('/dashboard'); // 로그인 후 이동할 경로
    } catch (err) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // 실제 구글 로그인 연동 필요 (OAuth 등)
    alert('Google 로그인은 아직 구현되지 않았습니다.');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', background: '#fff', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '360px', textAlign: 'left' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#222' }}>
            <span style={{ color: '#247cff' }}>ant</span>work
          </h1>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#222', marginBottom: '32px' }}>
          계정에<br />로그인하세요.
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Phone Number Input */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="phoneNumber" style={{ display: 'block', fontSize: '14px', color: '#333', fontWeight: 'bold', marginBottom: '8px' }}>
              휴대폰 번호
            </label>
            <input
              id="phoneNumber"
              type="text"
              placeholder="휴대폰 번호를 입력해 주세요."
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              required
              style={{ width: 'calc(100% - 26px)', padding: '13px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '14px', color: '#333', fontWeight: 'bold', marginBottom: '8px' }}>
              비밀번호
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력해 주세요."
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: 'calc(100% - 26px)', padding: '13px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
              />
              {/* Password Visibility Toggle Icon */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {/* lucide-react 아이콘 사용 예시. 설치 필요.*/}
                {showPassword ? <EyeOff size={20} color="#888" /> : <Eye size={20} color="#888" />} 
                {/* 아이콘 라이브러리 미사용 시 임시 텍스트 또는 이모지 사용 */}
                {/* {showPassword ? '👁️' : ' blind'} */}
              </button>
            </div>
            {/* Forgot Password Link */}
            <div style={{ textAlign: 'right', fontSize: '13px', marginTop: '8px' }}>
              <a href="#" style={{ color: '#247cff', textDecoration: 'none' }}>
                비밀번호 찾기
              </a>
            </div>
          </div>

          {error && <div style={{ color: '#e74c3c', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}

          {/* Login Button (Black)*/}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#000',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '18px',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              marginBottom: '24px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease, opacity 0.3s ease',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* Or Separator */}
        <div style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', margin: '24px 0' }}>Or</div>

        {/* Sign Up Button (Light Grey)*/}
        <button
          onClick={() => navigate('/auth/signup')}
          style={{
            width: '100%',
            background: '#f0f0f0', // 라이트그레이 톤 배경색
            color: '#333', // 글자색
            fontWeight: 'bold',
            fontSize: '18px',
            padding: '14px',
            border: 'none',
            borderRadius: '8px', // 로그인 버튼과 동일한 모양
            marginBottom: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
        >
          회원가입
        </button>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            background: '#fff',
            color: '#222',
            fontWeight: '500',
            fontSize: '16px',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
          Continue with Google
        </button>

      </div>
    </div>
  );
};

export default SignInPage; 