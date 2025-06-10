import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({
  showBackButton = true,
  onBackClick,
  isMainPage = false,
}) {
  const navigate = useNavigate();

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

  return (
    <header className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 w-full max-w-lg">
      {/* 왼쪽: 뒤로가기 버튼 또는 빈 공간 */}
      <div className="flex items-center">
        {!isMainPage && showBackButton && (
          <button
            onClick={handleBackClick}
            className="flex items-center justify-center w-10 h-10 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <ArrowLeft
              size={24}
              className="text-black"
              style={{
                color: '#000000',
                strokeWidth: 2,
                display: 'block',
              }}
            />
          </button>
        )}
      </div>

      {/* 오른쪽: 메인 페이지일 때 로그인/회원가입 텍스트 */}
      {isMainPage && (
        <div className="flex items-center gap-3">
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
        </div>
      )}
    </header>
  );
}

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
