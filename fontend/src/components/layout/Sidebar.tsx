
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const { user } = useAuth();

  // Danh sách menu cho Admin
  const adminLinks = [
    { name: 'Tổng quan', path: '/admin/dashboard', icon: <HomeIcon /> },
    { name: 'Quản lý Phòng', path: '/admin/rooms', icon: <BuildingIcon /> },
    { name: 'Hóa đơn', path: '/admin/bills', icon: <BillIcon /> },
    { name: 'Cư dân', path: '/admin/users', icon: <UserGroupIcon /> },
  ];

  // Danh sách menu cho Người thuê
  const tenantLinks = [
    { name: 'Hóa đơn của tôi', path: '/tenant/my-bill', icon: <BillIcon /> },
    { name: 'Thông tin cá nhân', path: '/tenant/profile', icon: <UserIcon /> },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : tenantLinks;

  return (
    <>
      {/* Mobile Backdrop (Lớp phủ mờ khi mở menu trên mobile) */}
      <div 
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar Main */}
      <aside className={`fixed top-0 left-0 z-30 h-screen w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Area */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-slate-700">
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            Quản Lý Phòng Trọ
          </span>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => { if(window.innerWidth < 1024) toggleSidebar() }} // Đóng menu khi click trên mobile
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors group 
                ${isActive 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`
              }
            >
              <span className="mr-3">{link.icon}</span>
              {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

// --- SVG Icons (Để code gọn, bạn có thể tách ra file riêng) ---
const HomeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const BuildingIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const BillIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const UserGroupIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

export default Sidebar;