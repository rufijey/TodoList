import { create } from 'zustand';
import * as api from '../api';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setError: (err: string | null) => void;
  initialize: () => void;
}

const getInitialUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (storedUser && token) {
      return JSON.parse(storedUser);
    }
  } catch (error) {}
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  loading: false,
  error: null,
  setError: (err) => set({ error: err }),
  initialize: () => {
    const handleLogoutEvent = () => {
      set({ user: null });
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
  },
  signup: async (email, password) => {
    set({ error: null });
    try {
      await api.signup(email, password);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: Array.isArray(msg) ? msg[0] : msg });
      throw err;
    }
  },
  signin: async (email, password) => {
    set({ error: null });
    try {
      const res = await api.signin(email, password);
      const { user: userData, accessToken, refreshToken } = res.data;
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user: userData });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: Array.isArray(msg) ? msg[0] : msg });
      throw err;
    }
  },
  logout: async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error on server', err);
    } finally {
      set({ user: null });
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
}));

