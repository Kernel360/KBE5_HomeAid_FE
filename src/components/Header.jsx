import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <header className="flex items-center h-14 px-4 bg-white border-b border-gray-200">
      {/* 왼쪽: 뒤로가기 버튼 */}
      <div className="flex items-center">
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
      </div>
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
