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
        console.log('🔐 Intentando login en el store', { email, password: '***' });
        try {
          const { user, token } = await authAPI.login(email, password);
          console.log('✅ Login exitoso:', { user: user?.email, role: user?.role, tokenLength: token?.length });
          
          console.log('💾 Guardando en el store...');
          set({ user, token, isAuthenticated: true });
          console.log('✅ Estado actualizado en el store');
        } catch (error) {
          console.error('❌ Error en login:', error);
          throw new Error('Error al iniciar sesión');
        }
      },

      register: async (userData: RegisterData) => {
        try {
          console.log('🔄 Registrando usuario en el store:', { email: userData.email, role: userData.role });
          const { user, token } = await authAPI.register(userData);
          console.log('✅ Registro exitoso:', { user: user?.email, role: user?.role, tokenLength: token?.length });
          set({ user, token, isAuthenticated: true });
        } catch (error: any) {
          console.error('❌ Error en registro del store:', error);
          console.error('❌ Detalles del error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
          });
          throw error; // Re-lanzar el error original para que el componente pueda manejarlo
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