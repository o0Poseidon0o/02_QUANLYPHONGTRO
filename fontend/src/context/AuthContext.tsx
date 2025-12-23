import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import axios from 'axios'; // 1. Import AxiosError
import type { User } from '../types/auth';
import axiosClient from '../utils/axiosConfig';
interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => Promise<User | null>; 
  logout: () => void;
  isLoading: boolean;
}

// Định nghĩa kiểu dữ liệu cho lỗi trả về từ Backend (dựa theo controller bạn viết)
interface ApiErrorResponse {
  message: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, pass: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const { data } = await axiosClient.post('/auth/login', {
        username,
        password: pass
      });

      const userData: User = {
        id: data._id,
        username: data.username,
        role: data.role,
        fullName: data.fullName
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user_info', JSON.stringify(userData));
      setUser(userData);
      
      return userData;

    } catch (error: unknown) { // 2. Dùng 'unknown' thay vì 'any'
      let errorMessage = "Đã có lỗi xảy ra";

      // 3. Kiểm tra xem có phải lỗi từ Axios không
      if (axios.isAxiosError(error)) {
        // Lúc này TypeScript biết 'error' là AxiosError
        // Ép kiểu data trả về thành Interface đã định nghĩa ở trên
        const errorData = error.response?.data as ApiErrorResponse | undefined;
        
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        // Lỗi JS thông thường
        errorMessage = error.message;
      }

      console.error("Login failed:", errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_info');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};