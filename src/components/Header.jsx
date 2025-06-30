import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useState, useCallback, memo } from 'react';
import AlertCard from '@/features/alert/AlertCard';

function Header({
  showBackButton = true,
  onBackClick,
  isMainPage = false,
}) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [ open, setOpen ] = useState(false);

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const handleLoginClick = () => {
    navigate('/auth/signin');
  };

  const handleSignUpClick = () => {
    navigate('/auth/signup');
  };

  const handleLogoutClick = () => {    
    logout();
    navigate('/');
    window.location.reload(); // 상태 초기화를 위해 페이지 새로고침
  };

  const openAlert = useCallback(() => {
    setOpen(true);
  }, []);

  const closeAlert = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <header
      className="fixed top-0 z-50 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200"
      style={{
        position: 'fixed',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '512px',
        zIndex: 50,
        backgroundColor: 'white',
        borderBottom: '1px solid #e9ecef',
        // boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* 왼쪽: 뒤로가기 버튼 또는 빈 공간 */}
      <div className="flex items-center">
        {!isMainPage && showBackButton && (
          <button
            onClick={handleBackClick}
            style={{
              backgroundColor: 'white',
              border: 'none',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              padding: '0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              // boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
          >
            <ArrowLeft
              size={20}
              style={{
                color: '#1a1a1a',
                strokeWidth: 3,
                width: '20px',
                height: '20px',
                display: 'block',
                pointerEvents: 'none',
              }}
            />
          </button>
        )}
      </div>

      {/* 오른쪽: 메인 페이지일 때 로그인/회원가입 텍스트 */}
      {isMainPage && (
        <div className="flex items-center gap-3">
          <Bell onClick={openAlert}></Bell>
          <AlertCard 
            onClose={closeAlert}
            isVisible={open}
          ></AlertCard>
          {user ? (
            // 로그인된 사용자용 버튼들
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">
                {user.name || user.username}님
              </span>
              <button
                onClick={handleLogoutClick}
                className="px-2 py-1 text-xs bg-white text-black border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200"
              >
                로그아웃
              </button>
            </div>
          ) : (
            // 비로그인 사용자용 버튼들
            <>
              <button
                onClick={handleLoginClick}
                className="px-3 py-1.5 text-sm text-black hover:text-gray-700 transition-colors duration-200"
              >
                로그인
              </button>
              <button
                onClick={handleSignUpClick}
                className="px-3 py-1.5 text-sm text-black hover:text-gray-700 transition-colors duration-200"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default memo(Header);

// import { ArrowLeft } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// export default function Header() {
//   const navigate = useNavigate();

//   const handleBackClick = () => {
//     navigate(-1);
//   };

//   return (
//     <header className="flex items-center h-14 px-4 bg-white border-b border-gray-200 shadow-sm">
//       {/* 왼쪽: 뒤로가기 버튼 */}
//       <div className="flex items-center">
//         <button
//           onClick={handleBackClick}
//           className="flex items-center justify-center hover:scale-110 transition-transform duration-200 ease-in-out active:scale-95"
//         >
//           <ArrowLeft size={20} className="text-black" />
//         </button>
//       </div>
//     </header>
//   );
// }
