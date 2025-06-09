import { Outlet } from 'react-router-dom';
import ManagerHeader from '../features/manager/components/ManagerHeader';
import Footer from '../layouts/components/Footer';
import { useLocation } from 'react-router-dom';

function ManagerLayout() {
    const location = useLocation();

     const hideFooter = location.pathname.includes('/additional-info');

    return (
        <div style={{ maxWidth: '475px', margin: '0 auto' }}>
            <ManagerHeader /> {/* 매니저용 헤더 컴포넌트 렌더링 */}
            <main>
                <Outlet /> {/* 자식 라우트가 여기서 렌더링됨 */}
            </main>
            {!hideFooter && <Footer />}
        </div>
    );
}

export default ManagerLayout;