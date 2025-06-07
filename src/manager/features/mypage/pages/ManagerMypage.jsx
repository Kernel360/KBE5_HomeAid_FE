import { User, ChevronRight } from "lucide-react";
import { useState } from 'react';
import ServiceRegistration from "../../additionalInfoForm/pages/ServiceRegistration";
import { useNavigate } from "react-router-dom";

export default function ManagerMypage() {
    const [currentView, setCurrentView] = useState('main'); // 'step1', 'step2', 'step3'
    const navigate = useNavigate();

    const MainView = () => (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white px-6 py-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>
            </header>

            <main className="px-6 py-6">
                {/* 프로필 정보 */}
                <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">홍길동님</h3>
                            <p className="text-sm text-gray-500">hong@example.com</p>
                        </div>
                    </div>
                </div>

                {/* 메뉴 리스트 */}
                <div className="bg-white rounded-2xl shadow-sm">

                    <button
                        onClick={() => 
                            confirm('서비스 등록을 위해 추가 정보를 입력하시겠습니까?') &&
                            navigate('/manager/additional-info')
                        }
                        className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-gray-900">내 정보 수정</span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button
                        onClick={() => setCurrentView('address')}
                        className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-gray-900">주소 관리</span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button
                        onClick={() => setCurrentView('review')}
                        className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-gray-900">리뷰 관리</span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button
                        onClick={() => setCurrentView('inquiry')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-gray-900">문의 게시판</span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* 로그아웃 */}
                <div className="mt-6">
                    <button className="text-red-500 text-sm">로그아웃</button>
                </div>
            </main>
        </div>
    );

    // //조건부 렌더링
    // switch (currentView) {
    //     case 'board':
    //         return <></>;
    //     case '정산':
    //         return <></>;
    //     case 'additionalInfo':
    //         return <ServiceRegistration />;
    //     default:
    //         return <MainView />;
    // }
    return <MainView />; // 기본적으로 MainView를 렌더링
};