// client/src/types/auth.ts

export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'TENANT'; // Phân quyền quan trọng
  fullName: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}