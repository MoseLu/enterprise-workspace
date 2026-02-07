import { create } from 'zustand';

/**
 * 认证状态管理
 */
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  roles: string[];
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: (token: string, user: User) => {
    localStorage.setItem('token', token);
    set({ isAuthenticated: true, user, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ isAuthenticated: false, user: null });
  },
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
