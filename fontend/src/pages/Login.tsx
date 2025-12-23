import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useDarkMode from '../hooks/useDarkMode';
import { useNavigate } from 'react-router-dom';

// --- ICONS (Giữ nguyên như cũ) ---
const SunIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const MoonIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);
const UserIcon = () => (<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const LockIcon = () => (<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>);
const EyeIcon = () => (<svg className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
const EyeOffIcon = () => (<svg className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>);

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuth();
  const [colorTheme, setTheme] = useDarkMode();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
        setError('Vui lòng nhập đầy đủ thông tin');
        return;
    }

    // Gọi hàm login và nhận lại User Object (hoặc null)
    const loggedInUser = await login(username, password);
    
    if (loggedInUser) {
      // --- XỬ LÝ RBAC (Role-Based Access Control) ---
      // Dựa vào role trả về từ server để điều hướng
      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (loggedInUser.role === 'TENANT') {
        navigate('/tenant/my-bill');
      } else {
        // Trường hợp role lạ hoặc chưa định nghĩa
        setError('Tài khoản không có quyền truy cập hợp lệ');
      }
    } else {
      setError('Tài khoản hoặc mật khẩu không chính xác');
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* --- Cột bên Trái: Image / Banner --- */}
      <div className="hidden lg:flex w-1/2 bg-cover bg-center relative" 
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent flex flex-col justify-end p-12">
          <h2 className="text-4xl font-bold text-white mb-4">Quản Lý Nhà Trọ 4.0</h2>
          <p className="text-gray-200 text-lg max-w-md">
            Hệ thống quản lý phòng, hóa đơn và cư dân thông minh, tiện lợi và minh bạch.
          </p>
        </div>
      </div>

      {/* --- Cột bên Phải: Form Đăng nhập --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative">
        
        <button 
          onClick={() => setTheme(colorTheme)}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-slate-700 transition-all shadow-sm"
        >
          {colorTheme === 'light' ? <SunIcon /> : <MoonIcon />}
        </button>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Chào mừng trở lại!
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Vui lòng đăng nhập để truy cập vào hệ thống
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              
              {/* Username Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                {error && <span className="font-medium text-red-600 dark:text-red-400 animate-pulse">{error}</span>}
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-500 dark:hover:text-primary-400">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white 
                  ${isLoading 
                    ? 'bg-primary-400 cursor-wait' 
                    : 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  } transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang đăng nhập...
                  </span>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </div>
            
            <div className="mt-6 text-center text-xs text-gray-400 dark:text-slate-600">
               <span className="inline-block bg-gray-100 dark:bg-slate-800 rounded px-2 py-1 mx-1">Admin: admin / 123456</span>
               <span className="inline-block bg-gray-100 dark:bg-slate-800 rounded px-2 py-1 mx-1">User: nguyenvana / 123456</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;