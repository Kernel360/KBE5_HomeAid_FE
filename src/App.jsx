import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerBoardList from './features/customer/board/BoardList';
import CustomerBoardWrite from './features/customer/board/BoardWrite';
import CustomerBoardDetail from './features/customer/board/BoardDetail';
import ManagerBoardList from './features/manager/board/BoardList';
import ManagerBoardWrite from './features/manager/board/BoardWrite';
import ManagerBoardDetail from './features/manager/board/BoardDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/customer/board" element={<CustomerBoardList />} />
        <Route path="/customer/board/write" element={<CustomerBoardWrite />} />
        <Route path="/customer/board/:id" element={<CustomerBoardDetail />} />
        <Route
          path="/customer/board/:id/edit"
          element={<CustomerBoardWrite />}
        />
        <Route path="/manager/board" element={<ManagerBoardList />} />
        <Route path="/manager/board/write" element={<ManagerBoardWrite />} />
        <Route path="/manager/board/:id" element={<ManagerBoardDetail />} />
        <Route path="/manager/board/:id/edit" element={<ManagerBoardWrite />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
