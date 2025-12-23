import { useAuth } from '../../context/AuthContext';
import useDarkMode from '../../hooks/useDarkMode';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [colorTheme, setTheme] = useDarkMode();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
      
      {/* Nút Hamburger cho Mobile */}
      <button 
        onClick={toggleSidebar} 
        className="p-2 -ml-2 rounded-md lg:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      {/* Tiêu đề trang (Để trống hoặc hiển thị Breadcrumb) */}
      <div className="hidden md:block">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Xin chào, {user?.fullName} 👋
        </h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        
        {/* Dark Mode Toggle */}
        <button 
          onClick={() => setTheme(colorTheme)}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 transition"
        >
           {colorTheme === 'light' ? (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
           ) : (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
           )}
        </button>

        {/* User Dropdown / Logout */}
        <div className="flex items-center space-x-3 border-l pl-4 border-gray-200 dark:border-slate-600">
           <div className="flex-col text-right hidden sm:block">
             <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</span>
             <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</span>
           </div>
           
           <button 
             onClick={logout}
             className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
           >
             Đăng xuất
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;