import { Clock, MapPin, User, Calendar, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";

// 매니저 메인 페이지 컴포넌트
const ManagerMainPage = () => {
    const navigate = useNavigate();

    // 임시 데이터 - 실제로는 API에서 가져와야 함
    const currentJobs = [
        {
            id: 1,
            customerName: "김민수",
            serviceType: "기사 청소",
            address: "서울시 강남구 역삼동 123-45",
            scheduledTime: "2025-06-09 14:00",
            status: "진행중",
            estimatedDuration: "2시간"
        },
        {
            id: 2,
            customerName: "이영희",
            serviceType: "에어컨 청소",
            address: "서울시 서초구 서초동 678-90",
            scheduledTime: "2025-06-09 16:30",
            status: "대기중",
            estimatedDuration: "1.5시간"
        },
        {
            id: 3,
            customerName: "박철수",
            serviceType: "돌봄 서비스",
            address: "서울시 송파구 잠실동 111-22",
            scheduledTime: "2025-06-10 10:00",
            status: "예정",
            estimatedDuration: "3시간"
        }
    ];

    const handleJobClick = (jobId) => {
        // 상세 페이지로 이동
        navigate(`/manager/job/${jobId}`);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case '진행중':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case '대기중':
                return <AlertCircle className="w-4 h-4 text-orange-600" />;
            case '예정':
                return <Clock className="w-4 h-4 text-blue-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case '진행중':
                return 'bg-green-100 text-green-600';
            case '대기중':
                return 'bg-orange-100 text-orange-600';
            case '예정':
                return 'bg-blue-100 text-blue-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* 메인 컨텐츠 */}
            <main className="px-6 py-6">
                {/* 인사말 */}
                <div className="mb-6">
                    <p className="text-gray-600 text-sm mb-2">김기사님 안녕하세요.</p>
                    <h1 className="text-xl font-bold text-gray-900">오늘 예정된 작업을 확인해보세요</h1>
                </div>

                {/* 작업 통계 카드 */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">진행중</h3>
                        <p className="text-xs text-gray-500">1건</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">대기중</h3>
                        <p className="text-xs text-gray-500">1건</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">오늘 예정</h3>
                        <p className="text-xs text-gray-500">3건</p>
                    </div>
                </div>

                {/* 현재 매칭된 작업 리스트 */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">현재 매칭된 작업</h2>
                        <button className="text-blue-600 text-sm font-medium">
                            전체보기
                        </button>
                    </div>

                    <div className="space-y-3">
                        {currentJobs.map((job) => (
                            <div 
                                key={job.id}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleJobClick(job.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <span className={`text-xs px-2 py-1 rounded font-medium mr-3 ${getStatusColor(job.status)}`}>
                                                {job.status}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900">{job.serviceType}</span>
                                        </div>
                                        
                                        <div className="space-y-1 mb-3">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <User className="w-4 h-4 mr-2" />
                                                {job.customerName}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                {job.address}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="w-4 h-4 mr-2" />
                                                {job.scheduledTime} ({job.estimatedDuration})
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        {getStatusIcon(job.status)}
                                        <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 공지사항 */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">매니저 공지사항</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-medium mr-3">중요</span>
                                <span className="text-gray-600 text-sm">작업 완료 후 체크인 필수</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded font-medium mr-3">공지</span>
                                <span className="text-gray-600 text-sm">6월 매니저 교육 일정 안내</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded font-medium mr-3">혜택</span>
                                <span className="text-gray-600 text-sm">우수 매니저 인센티브 지급</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ManagerMainPage;