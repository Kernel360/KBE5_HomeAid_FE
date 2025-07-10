import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authService } from './services/authService.js';

const AdditionalProfilePage = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const oauthCode = params.get('oauthCode');
  const email = params.get('email');
  const profileComplete = params.get('profileComplete');
  const { setAccessToken, setUser, setRefreshToken } = useAuthStore();

  // 폼 상태
  const [role, setRole] = useState('CUSTOMER');
  const [phone, setPhone] = useState('');
  const [birth, setBirth] = useState('');
  const [gender, setGender] = useState('MALE');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // 무조건 PATCH 요청
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/oauth-additional-profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role,
          phone,
          birth,
          gender,
        }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('추가 정보 입력 실패');
      // 성공 시 토큰 발급
      await fetchTokenAndLogin(oauthCode, navigate, setAccessToken, setUser, setRefreshToken);
    } catch (err) {
      setError('추가 정보 입력에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} readOnly />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="CUSTOMER">고객</option>
        <option value="MANAGER">매니저</option>
      </select>
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="전화번호 (010-1234-5678)" />
      <input value={birth} onChange={e => setBirth(e.target.value)} placeholder="생년월일 (YYYY-MM-DD)" />
      <select value={gender} onChange={e => setGender(e.target.value)}>
        <option value="MALE">남성</option>
        <option value="FEMALE">여성</option>
      </select>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit">제출</button>
    </form>
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
