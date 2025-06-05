// 내 정보 수정 페이지
const ProfileEditPage = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
                <button onClick={onBack} className="mr-4">
                    <ArrowLeft className="w-6 h-6 text-gray-900" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">내 정보 수정</h1>
            </header>

            <main className="px-6 py-6">
                {/* 프로필 사진 */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <button className="text-blue-600 text-sm">사진 업데이트</button>
                </div>

                {/* 폼 입력 */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                        <input
                            type="text"
                            placeholder="홍길동"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                        <input
                            type="email"
                            placeholder="hong@example.com"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                        <input
                            type="tel"
                            placeholder="010-1234-5678"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* 버튼 그룹 */}
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onBack}
                        className="flex-1 py-3 px-6 border border-gray-300 rounded-xl text-gray-700 font-medium"
                    >
                        취소
                    </button>
                    <button className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-medium">
                        저장
                    </button>
                </div>

                {/* 추가 옵션 */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <button className="text-blue-600 text-sm mb-4 block">비밀번호 변경</button>
                    <button className="text-red-500 text-sm block">회원 탈퇴</button>
                </div>
            </main>
        </div>
    );
};