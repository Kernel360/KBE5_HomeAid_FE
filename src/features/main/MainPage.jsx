import { Home, CreditCard, Users } from 'lucide-react';
import {useNavigate} from "react-router-dom";


// 메인 페이지 컴포넌트
const MainPage = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/reservation');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* 헤더 - 로고 영역 */}
            

            {/* 메인 컨텐츠 */}
            <main className="px-6 py-6">
                {/* 인사말 */}
                <div className="mb-6">
                    <p className="text-gray-600 text-sm mb-2">윤진동님 반가워요.</p>
                    <h1 className="text-xl font-bold text-gray-900">오늘, 어떤 도움이 필요하신가요?</h1>
                </div>

                {/* 서비스 선택 카드 */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"
                         onClick={handleClick}
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Home className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">기사 청소</h3>
                        <p className="text-xs text-gray-500">대청소, 부분 청소</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">에어컨 청소</h3>
                        <p className="text-xs text-gray-500">미리 준비하세요</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">돌봄 서비스</h3>
                        <p className="text-xs text-gray-500">반려동물도 가능</p>
                    </div>
                </div>

                {/* 광고 배너 */}
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white overflow-hidden mb-6">
                    {/* 배경 장식 */}
                    <div className="absolute top-4 right-4 text-white/20">
                        <div className="text-xs bg-white/20 px-2 py-1 rounded-full">2 / 3</div>
                    </div>

                    {/* 벨 아이콘 */}
                    <div className="absolute top-6 right-12">
                        <div className="w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center transform rotate-12">
                            <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <p className="text-sm font-medium mb-2 opacity-90">공지</p>
                        <h2 className="text-2xl font-bold mb-4 leading-tight">
                            365일 24시간 어디서든<br />
                            앤트워크 서비스 이용가능!
                        </h2>
                    </div>
                </div>

                {/* 공지사항 리스트 */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-medium mr-3">공지</span>
                            <span className="text-gray-600 text-sm">앤트워크 이용안내</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-medium mr-3">이벤트</span>
                            <span className="text-gray-600 text-sm">에어컨 청소 오픈 기념 할인 이벤트</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-medium mr-3">공지</span>
                            <span className="text-gray-600 text-sm">앤트워크 이용안내</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-medium mr-3">공지</span>
                            <span className="text-gray-600 text-sm">앤트워크 이용안내</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-medium mr-3">공지</span>
                            <span className="text-gray-600 text-sm">앤트워크 이용안내</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MainPage;