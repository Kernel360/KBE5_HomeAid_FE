import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

function CustomerLayout() {
  return (
    <div style={{ maxWidth: '475px', margin: '0 auto' }}>
      <Header /> {/* 헤더 컴포넌트 렌더링 */}
      <main>
        <Outlet /> {/* 자식 라우트가 여기서 렌더링됨 */}
      </main>
      <Footer />
    </div>
  );
}

export default CustomerLayout;
