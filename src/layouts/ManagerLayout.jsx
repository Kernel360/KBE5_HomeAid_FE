import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

function ManagerLayout() {
  return (
    <div>
      {/* <ManagerHeader /> 매니저용 헤더 컴포넌트 렌더링 */}
      <main>
        <Outlet /> {/* 자식 라우트가 여기서 렌더링됨 */}
      </main>
      {/* {!hideFooter && <Footer />} */}
    </div>
  );
}

export default ManagerLayout;
