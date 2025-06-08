import { ArrowLeft, Search, MessageCircle } from "lucide-react";

// 문의 게시판 페이지
const InquiryBoard = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-4">
                        <ArrowLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">문의 게시판</h1>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                    문의하기
                </button>
            </header>

            <main className="px-6 py-6">
                {/* 검색 */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="질문을 입력해 보세요"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* FAQ 리스트 */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <h3 className="font-medium text-gray-900 mb-2">청소 서비스 지원 범위</h3>
                        <p className="text-gray-600 text-sm">청소 서비스 지원 범위에 대해 궁금한 점이 있으시면 언제든지 문의해주세요.</p>
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-500">2023.06.10</span>
                            <MessageCircle className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <h3 className="font-medium text-gray-900 mb-2">서비스 시간 조정 관련</h3>
                        <p className="text-gray-600 text-sm">고객 서비스 요청 시간을 수정하고 싶을 때는 어떻게 해야 하나요?</p>
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-500">2023.04.15</span>
                            <MessageCircle className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InquiryBoard;