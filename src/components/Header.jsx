import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <header className="flex items-center h-14 px-4 bg-white border-b border-gray-200 shadow-sm">
      {/* 왼쪽: 뒤로가기 버튼 */}
      <div className="flex items-center">
        <button
          onClick={handleBackClick}
          // 배경 없음(bg-transparent), 그림자·테두리 없음, 오로지 아이콘만!
          className="flex items-center justify-center w-8 h-8 p-0 bg-transparent border-none shadow-none
                     group focus:outline-none"
          style={{ background: 'transparent' }} // 혹시 스타일 겹칠 때 확실히
        >
          {/* 
            group-hover:scale-125 : 버튼에 마우스 올리면 아이콘만 1.25배 커짐
            transition-transform : 부드럽게
            active:scale-95 : 클릭 시 아이콘만 살짝 작아짐
          */}
          <ArrowLeft
            size={24}
            className="text-black transition-transform duration-150 group-hover:scale-125 active:scale-95"
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
