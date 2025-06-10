import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

function CustomerLayout() {
  return (
    <div>
      {/* <Header /> 헤더 컴포넌트 렌더링 */}
      <main>
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default CustomerLayout;
