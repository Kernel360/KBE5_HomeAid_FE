import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

const ManagerHeader = () => {
    const navigate = useNavigate();
    
    const handleLogoClick = () => {
        navigate('/manager');
    };

    const handleNotificationClick = () => {
        // 알림 페이지로 이동하거나 알림 모달 띄우기
        console.log('알림 클릭됨');
    };

    return (
        <header className="bg-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
                {/* 로고 */}
                <div 
                    className="flex items-center cursor-pointer"
                    onClick={handleLogoClick}
                > 
                    <span className="text-2xl font-bold text-blue-600">ant</span>
                    <span className="text-2xl font-bold text-gray-800">work</span>
                </div>

                {/* 알림 아이콘 */}
                <div className="relative">
                    <button 
                        onClick={handleNotificationClick}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                    >
                        <Bell className="w-6 h-6 text-gray-600" />
                        {/* 알림 뱃지 - 새 알림이 있을 때만 표시 */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default ManagerHeader;