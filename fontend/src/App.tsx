
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UserManager from './pages/admin/UserManager';
import RoomManager from './pages/admin/RoomManager';
import BillManager from './pages/admin/BillManager';
// Pages
import AdminDashboard from './pages/admin/Dashboard';
import MyBill from './pages/tenant/MyBill';
import Profile from './pages/tenant/Profile';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Main Layout bao bọc tất cả các trang cần login */}
          <Route element={<MainLayout />}>
            
            {/* 1. KHU VỰC ADMIN (Chỉ role 'admin' mới vào được) */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/rooms" element={<RoomManager />} />
              <Route path="/admin/bills" element={<BillManager />} />
              <Route path="/admin/users" element={<UserManager />} />
            </Route>

            {/* 2. KHU VỰC TENANT (Chỉ role 'tenant' mới vào được) */}
            <Route element={<ProtectedRoute allowedRoles={['TENANT']} />}>
              <Route path="/tenant/my-bill" element={<MyBill />} />
              <Route path="/tenant/profile" element={<Profile />} />
            </Route>

          </Route>

          {/* Mặc định chuyển về login nếu không khớp route nào */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;