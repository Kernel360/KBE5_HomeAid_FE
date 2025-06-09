import { Outlet } from 'react-router-dom';
import Header from '../layouts/components/Header';
import Footer from '../layouts/components/Footer';
import { useLocation } from 'react-router-dom';

function ManagerLayout() {
    const location = useLocation();

     const hideFooter = location.pathname.includes('/additional-info');

    return (
        <div>
            <Header /> {/* 헤더 컴포넌트 렌더링 */}
            <main>
                <Outlet /> {/* 자식 라우트가 여기서 렌더링됨 */}
            </main>
            {!hideFooter && <Footer />}
        </div>
    );
}

export default ManagerLayout;