import { Home, MoreHorizontal, Search, Heart, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FooterItem = ({ icon: Icon, label, isActive, onClick, url }) => {
    const [isPressed, setIsPressed] = useState(false);
    const navigate = useNavigate();

    const handleMouseDown = () => {
        setIsPressed(true);
    };

    const handleMouseUp = () => {
        setIsPressed(false);
    };

    const handleClick = () => {
        onClick(label);
        navigate(url);
    };

    return (
        <div
            className={`
                flex flex-col items-center py-2 px-3 rounded-lg cursor-pointer
                transition-all duration-150 ease-in-out
                ${isPressed ? 'scale-95 bg-gray-100' : 'scale-100'}
                hover:bg-gray-50 active:bg-gray-100
                ${isActive ? 'transform-none' : ''}
            `}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
        >
            <Icon
                className={`
                    w-6 h-6 mb-1 transition-colors duration-150
                    ${isActive ? 'text-gray-900' : 'text-gray-500'}
                `}
            />
            <span
                className={`
                    text-xs transition-colors duration-150
                    ${isActive ? 'text-gray-900 font-medium' : 'text-gray-500'}
                `}
            >
                {label}
            </span>
        </div>
    );
};

const Footer = () => {
    const [activeTab, setActiveTab] = useState('홈');

    const footerItems = [
        { icon: Home, label: '홈', url: '/' },
        { icon: Search, label: '실시간 검색' },
        { icon: Heart, label: '이벤트' },
        { icon: Users, label: '이용 내역', url: '/history' },
        { icon: MoreHorizontal, label: '더보기', url: '/mypage' }
    ];

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        // 여기에 라우팅 로직이나 다른 동작을 추가할 수 있습니다
        console.log(`${tabName} 탭이 클릭되었습니다`);
    };

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="flex justify-around items-center py-1 px-2 max-w-md mx-auto">
                {footerItems.map((item) => (
                    <FooterItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeTab === item.label}
                        onClick={handleTabClick}
                        url={item.url}
                    />
                ))}
            </div>
        </footer>
    );
};

export default Footer;