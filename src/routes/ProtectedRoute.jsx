import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

//React 컴포넌트 - "문지기" 역할
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // 로그인하지 않은 경우
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 권한이 필요한 경우
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes(user.role);

    if (!hasRequiredRole) {
      // 권한이 없는 경우 해당 역할의 기본 페이지로 리다이렉트
      switch (user.role) {
        case 'ROLE_CUSTOMER':
          return <Navigate to="/customer/mypage" replace />;
        case 'ROLE_MANAGER':
          return <Navigate to="/manager/mypage" replace />;
        case 'ROLE_ADMIN':
          return <Navigate to="/admin/dashboard" replace />;
        default:
          return <Navigate to="/403" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
