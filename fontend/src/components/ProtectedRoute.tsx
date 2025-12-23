import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 1. Sửa Interface thành IN HOA để khớp với data từ Backend
interface ProtectedRouteProps {
  allowedRoles: ('ADMIN' | 'TENANT')[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Thêm trạng thái Loading để tránh F5 bị đá ra login oan
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

  // 2. Chưa đăng nhập -> Đá về Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Logic kiểm tra Role
  // Lúc này user.role là 'ADMIN' và allowedRoles cũng là ['ADMIN'] nên includes sẽ trả về True
  if (!allowedRoles.includes(user.role)) {
    // Nếu sai quyền thì đá về trang Dashboard tương ứng của họ
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'TENANT') return <Navigate to="/tenant/my-bill" replace />;
    
    // Trường hợp role lạ thì về login
    return <Navigate to="/login" replace />;
  }

  // 4. Đúng Role -> Cho phép đi tiếp
  return <Outlet />;
};

export default ProtectedRoute;