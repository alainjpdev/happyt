import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, RegisterData } from '../types';
import { authAPI } from '../services/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const { user, token } = await authAPI.login(email, password);
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          throw new Error('Error al iniciar sesión');
        }
      },

      register: async (userData: RegisterData) => {
        try {
          const { user, token } = await authAPI.register(userData);
          set({ user, token, isAuthenticated: true });
        } catch (error: any) {
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      checkAuth: () => {
        const { token, user } = get();
        if (token && user) {
          set({ isAuthenticated: true });
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false
          });
        }
      },

      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);