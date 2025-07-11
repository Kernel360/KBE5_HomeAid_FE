import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authService } from './services/authService';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { setAccessToken, setUser, setRefreshToken } = useAuthStore();

  console.log('OAuthCallbackPage');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthCode = params.get('oauthCode');
    const profileComplete = params.get('profileComplete');
    const email = params.get('email');

    console.log('[OAuthCallbackPage] useEffect 실행');
    console.log('[OAuthCallbackPage] params:', { oauthCode, profileComplete, email });

    if (!oauthCode) {
      console.log('[OAuthCallbackPage] 인증 코드 없음, /auth/signin으로 이동');
      alert('인증 코드가 없습니다.');
      navigate('/auth/signin');
      return;
    }

    // profileComplete가 'true'일 때만 토큰 발급
    if (String(profileComplete).toLowerCase() === 'true') {
      fetchTokenAndLogin(oauthCode, navigate, setAccessToken, setUser, setRefreshToken);
      return;
    }
    console.log('profileComplete', profileComplete);
    // 그 외에는 무조건 추가 프로필 입력 페이지로 이동
    navigate(`/auth/additional-profile?oauthCode=${oauthCode}&email=${email}`);
  }, []);

  return <div>로그인 처리 중...</div>;
};

export default OAuthCallbackPage;

// 토큰 발급 함수
async function fetchTokenAndLogin(oauthCode, navigate, setAccessToken, setUser, setRefreshToken) {
  try {
    // 소셜 로그인 처리
    const user = await authService.socialSignIn(oauthCode);
    const token = localStorage.getItem('accessToken');
    setUser(user);           // user: { userId, username, role }
    setAccessToken(token);   // accessToken

    // role 값 콘솔 출력
    console.log('[OAuthCallbackPage] 소셜 로그인 user:', user);
    console.log('[OAuthCallbackPage] user.role:', user.role);

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
