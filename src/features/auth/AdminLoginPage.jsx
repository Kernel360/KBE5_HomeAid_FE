import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { authService } from './services/authService';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setAccessToken, logout } = useAuthStore();

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const prev = phone;

    // 숫자와 하이픈만 허용
    const onlyNums = value.replace(/[^\d]/g, '');
    if (onlyNums.length > 11) return;

    // 하이픈 자동완성
    let formatted = '';
    if (onlyNums.length < 4) {
      formatted = onlyNums;
    } else if (onlyNums.length < 7) {
      formatted = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
    } else if (onlyNums.length < 11) {
      formatted = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7)}`;
    } else {
      formatted = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;
    }

    // 하이픈 앞에서 백스페이스로 지울 때 하이픈도 같이 지우기
    if (
      prev.length > value.length && // 입력값이 줄었고
      prev[prev.length - 1] === '-' // 이전 마지막이 하이픈
    ) {
      // 하이픈 앞 숫자도 같이 지움
      setPhone(formatted.slice(0, -1));
    } else {
      setPhone(formatted);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 🔥 먼저 모든 상태 완전 초기화
      logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('auth-storage');

      const data = await authService.signIn(phone, password);

      // localStorage에서 토큰 꺼내 zustand에도 저장
      const token = localStorage.getItem('accessToken');

      // Zustand store에 사용자 정보와 토큰 저장
      setUser(data);
      setAccessToken(token);

      // ADMIN 역할 체크
      if (data.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        setError('관리자 계정으로 승인된 사용자만 접근 가능합니다.');
        // 다른 역할로 로그인된 경우 로그아웃 처리
        await logout();
      }
    } catch (err) {
      console.error('로그인 에러:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          '관리자 계정으로 승인된 사용자만 접근 가능합니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 왼쪽 파란색 영역 */}
      <div className="w-1/2 bg-[#4285f4] p-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4">
          <Shield className="w-12 h-12 text-[#4285f4]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">HomeAid</h1>
        <p className="text-white/80 mb-8">전문 가사도우미 매칭 플랫폼</p>
        <div className="space-y-2">
          <p className="text-sm text-white/90 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            안전한 관리자 인증
          </p>
          <p className="text-sm text-white/90 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            데이터 보안 보장
          </p>
          <p className="text-sm text-white/90 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            통합 사용자 관리
          </p>
        </div>
      </div>

      {/* 오른쪽 로그인 영역 */}
      <div className="w-1/2 bg-white p-12 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            관리자 로그인
          </h2>
          <p className="text-gray-600 mb-8">시스템 관리를 위해 로그인하세요</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                휴대폰 번호
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="010-0000-0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ background: 'none' }}
                >
                  {showPassword ? (
                    <EyeOff
                      className="w-5 h-5 text-gray-600"
                      style={{ background: 'none' }}
                    />
                  ) : (
                    <Eye
                      className="w-5 h-5 text-gray-600"
                      style={{ background: 'none' }}
                    />
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">⚠️</div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      보안 알림
                    </h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors mt-4"
            >
              {loading ? '로그인 중...' : '관리자 로그인'}
            </button>
          </form>

          {/* Footer */}

          <p className="mt-4 text-sm text-gray-400 text-center">
            © 2025 HomeAid Admin Panel. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
