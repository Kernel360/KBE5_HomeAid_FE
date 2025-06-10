import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// npm install react-icons lucide-react --save
import { Eye, EyeOff } from 'lucide-react'; // lucide-react 사용 예시
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import Header from '../../components/Header';

const SignInPage = () => {
  const [phone, setphone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.signIn(phone, password);
      console.log('🔐 로그인 성공! 백엔드 응답:', data);

      // localStorage에서 토큰 꺼내 zustand에도 저장
      const token = localStorage.getItem('accessToken');
      useAuthStore.getState().setAccessToken(token);

      // ⭐️ 백엔드 응답에서 사용자 정보 추출 (더 상세하게)
      const user = {
        userId: data.userId || data.id, // 사용자 ID
        role: data.role, // 역할 (ROLE_CUSTOMER, ROLE_MANAGER, ROLE_ADMIN)
        name:
          data.name ||
          data.username ||
          data.customerName ||
          data.managerName ||
          data.realName ||
          data.fullName ||
          data.displayName, // 백엔드에서 제공하는 실제 이름만 사용
        phone: data.phone || phone, // 전화번호 (로그인에 사용한 번호)
        email: data.email, // 이메일 (있는 경우)
        // 기타 백엔드에서 제공하는 사용자 정보
        ...data, // 나머지 모든 정보도 포함
      };

      // ⭐️ 디버깅: 백엔드 응답에서 이름 관련 필드 확인
      console.log('🔍 백엔드 응답에서 이름 관련 필드들:');
      console.log('  - name:', data.name);
      console.log('  - username:', data.username);
      console.log('  - customerName:', data.customerName);
      console.log('  - managerName:', data.managerName);
      console.log('  - realName:', data.realName);
      console.log('  - fullName:', data.fullName);
      console.log('  - displayName:', data.displayName);

      // ⭐️ 이름이 없는 경우 처리
      if (!user.name) {
        if (user.role === 'ROLE_CUSTOMER') {
          user.name = '고객';
          console.log('🔧 ROLE_CUSTOMER이므로 이름을 "고객"으로 설정');
        } else if (user.role === 'ROLE_MANAGER') {
          user.name = '매니저';
          console.log('🔧 ROLE_MANAGER이므로 이름을 "매니저"로 설정');
        } else if (user.role === 'ROLE_ADMIN') {
          user.name = '관리자';
          console.log('🔧 ROLE_ADMIN이므로 이름을 "관리자"로 설정');
        } else {
          // 임시로 전화번호 기반 이름 생성 (디버깅용)
          user.name = `사용자_${phone.slice(-4)}`;
          console.warn(
            '🔧 임시로 전화번호 기반 이름을 생성했습니다:',
            user.name
          );
          console.warn('🔍 백엔드 개발자에게 다음 정보를 전달하세요:');
          console.warn('   - 사용자 이름을 어떤 필드로 제공해야 하는지');
          console.warn('   - 현재 백엔드 응답:', data);
        }
      }

      useAuthStore.getState().setUser(user);
      console.log('✅ authStore에 저장된 최종 사용자 정보:', user);

      // ⭐️ 사용자 이름이 제대로 없는 경우 별도 사용자 정보 조회 시도
      if (!user.name || user.name.startsWith('사용자_')) {
        console.log('👤 사용자 상세 정보 조회 시도...');

        // 여러 가능한 API 엔드포인트 시도
        const profileEndpoints = [
          '/api/v1/me',
          '/api/v1/user/profile',
          '/api/v1/users/profile',
          `/api/v1/customers/${user.userId}`,
          '/api/v1/auth/me',
          '/api/v1/members/profile',
        ];

        for (const endpoint of profileEndpoints) {
          try {
            console.log(`🔍 API 엔드포인트 시도: ${endpoint}`);
            const profileResponse = await fetch(
              `http://localhost:8080${endpoint}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              console.log(`✅ ${endpoint} 성공! 응답:`, profileData);

              // 프로필에서 실제 이름 추출
              const realName =
                profileData.data?.name ||
                profileData.name ||
                profileData.data?.customerName ||
                profileData.customerName ||
                profileData.data?.realName ||
                profileData.realName ||
                profileData.data?.fullName ||
                profileData.fullName ||
                profileData.data?.memberName ||
                profileData.memberName;

              if (realName && realName !== '고객' && realName !== 'customer') {
                user.name = realName;
                useAuthStore.getState().setUser(user);
                console.log('🎉 실제 사용자 이름을 찾았습니다:', realName);
                break; // 성공하면 반복 중단
              }
            } else {
              console.log(`❌ ${endpoint} 실패: ${profileResponse.status}`);
            }
          } catch (profileError) {
            console.log(`❌ ${endpoint} 에러:`, profileError.message);
          }
        }

        // 모든 API 시도 후에도 이름을 찾지 못한 경우
        if (!user.name || user.name.startsWith('사용자_')) {
          console.warn(
            '⚠️ 모든 프로필 API 시도 실패. 백엔드 개발자에게 문의 필요'
          );
          console.warn('📞 백엔드 개발자에게 전달할 정보:');
          console.warn('   - 사용자 ID:', user.userId);
          console.warn('   - 필요한 기능: 사용자 실제 이름 조회 API');
          console.warn('   - 현재 시도한 엔드포인트들:', profileEndpoints);
        }
      }

      // 역할에 따른 페이지 이동
      if (user.role === 'ROLE_CUSTOMER') {
        navigate('/user/service-option', { replace: true });
      } else if (user.role === 'ROLE_ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'ROLE_MANAGER') {
        navigate('/matching/list', { replace: true }); // 매니저는 직접 매칭 리스트로 이동
      } else {
        console.warn('알 수 없는 사용자 역할:', user.role);
        navigate('/', { replace: true }); // 기본 페이지로 이동
      }
    } catch (err) {
      console.error('로그인 에러:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          '로그인 중 오류가 발생했습니다.'
      );
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
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-lg relative bg-white">
        {/* Header */}
        <Header showBackButton={true} />

        {/* 메인 컨텐츠 */}
        <main
          className="px-6 py-6 min-h-screen flex flex-col"
          style={{ marginTop: '64px' }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              textAlign: 'left',
              margin: '0 auto',
            }}
          >
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1
                style={{ fontSize: '32px', fontWeight: 'bold', color: '#222' }}
              >
                <span style={{ color: '#247cff' }}>ant</span>work
              </h1>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#222',
                marginBottom: '32px',
              }}
            >
              계정에
              <br />
              로그인하세요.
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              {/* Phone Number Input */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="phone"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#333',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  휴대폰 번호
                </label>
                <input
                  id="phone"
                  type="text"
                  placeholder="휴대폰 번호를 입력해 주세요."
                  value={phone}
                  onChange={(e) => setphone(e.target.value)}
                  required
                  style={{
                    width: 'calc(100% - 26px)',
                    padding: '13px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '16px',
                  }}
                />
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#333',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  비밀번호
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 입력해 주세요."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: 'calc(100% - 26px)',
                      padding: '13px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '16px',
                    }}
                  />
                  {/* Password Visibility Toggle Icon */}
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
                    {/* lucide-react 아이콘 사용 예시. 설치 필요.*/}
                    {showPassword ? (
                      <EyeOff size={20} color="#888" />
                    ) : (
                      <Eye size={20} color="#888" />
                    )}
                    {/* 아이콘 라이브러리 미사용 시 임시 텍스트 또는 이모지 사용 */}
                    {/* {showPassword ? '👁️' : ' blind'} */}
                  </button>
                </div>
                {/* Forgot Password Link */}
                <div
                  style={{
                    textAlign: 'right',
                    fontSize: '13px',
                    marginTop: '8px',
                  }}
                >
                  <a
                    href="#"
                    style={{ color: '#247cff', textDecoration: 'none' }}
                  >
                    비밀번호 찾기
                  </a>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    color: '#e74c3c',
                    fontSize: '14px',
                    marginBottom: '16px',
                  }}
                >
                  {error}
                </div>
              )}

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
            <div
              style={{
                textAlign: 'center',
                color: '#aaa',
                fontSize: '14px',
                margin: '24px 0',
              }}
            >
              Or
            </div>

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
                transition:
                  'background-color 0.3s ease, border-color 0.3s ease',
              }}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                style={{ width: '20px', height: '20px' }}
              />
              Continue with Google
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SignInPage;
