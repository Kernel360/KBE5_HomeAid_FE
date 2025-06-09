import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    // TODO: 로고 클릭시 홈으로 이동하는 함수 만들어야함
    // 고객 매니저별 헤더를 만들거나 하나의 헤더로 클릭시 권한으로 각 권한에 맞는 메인페이지로 이동하게 해야함
    return (
        <header className="bg-white px-6 py-4">
            <div className="flex items-center"
                onClick={() => navigate('/')}> 
                <span className="text-2xl font-bold text-blue-600">ant</span>
                <span className="text-2xl font-bold text-gray-800">work</span>
            </div>
        </header>
    );
}
export default Header;