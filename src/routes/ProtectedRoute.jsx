import { useAuthStore } from '../stores/authStore';
import { Navigate, useLocation } from 'react-router-dom';

//React 컴포넌트 - "문지기" 역할
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    // 로그인 안 했으면 로그인 페이지로
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // 권한 체크
  if (!allowedRoles.includes(user.role)) {
    // 권한 없으면 접근 불가 페이지로
    return <Navigate to="/auth/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
