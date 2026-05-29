import { create } from 'zustand';
import { User } from './types';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('together-token', token);
      localStorage.setItem('together-user', JSON.stringify(user));
    }
    set({ token, user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('together-token');
      localStorage.removeItem('together-user');
    }
    set({ token: null, user: null });
  },
}));

export function hydrateAuth() {
  if (typeof window === 'undefined') return;
  try {
    const token = localStorage.getItem('together-token');
    const user  = localStorage.getItem('together-user');
    if (token && user) {
      useAuthStore.setState({ token, user: JSON.parse(user) });
    }
  } catch {}
}