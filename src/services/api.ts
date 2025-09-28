import axios from 'axios';
import { getBackendURL } from '../config/environment';
import { useAuthStore } from '../store/authStore';

// Configuración base de Axios
export const apiClient = axios.create({
  baseURL: getBackendURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    // Intentar obtener el token desde múltiples fuentes
    let token = null;
    
    try {
      // 1. Primero intentar desde el store de Zustand directamente
      const authState = useAuthStore.getState();
      token = authState.token;
      
      // 2. Si no existe, intentar desde localStorage directo
      if (!token) {
        token = localStorage.getItem('token');
      }
      
      // 3. Si no existe, intentar desde el estado persist de Zustand
      if (!token) {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed?.state?.token || parsed?.token;
        }
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ Error en respuesta API:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.warn('⚠️ Token expirado o inválido - 401 Unauthorized');
      // Limpiar el estado de autenticación
      const authState = useAuthStore.getState();
      authState.logout();
    }
    
    if (error.response?.status === 403) {
      console.warn('⚠️ Acceso denegado - 403 Forbidden');
      console.warn('⚠️ Verificando estado de autenticación...');
      const authState = useAuthStore.getState();
      console.warn('⚠️ Estado actual:', {
        isAuthenticated: authState.isAuthenticated,
        hasToken: !!authState.token,
        userRole: authState.user?.role,
        userStatus: authState.user?.status
      });
    }
    
    return Promise.reject(error);
  }
);

// Función de utilidad para verificar y refrescar el token
export const checkAndRefreshToken = async () => {
  const authState = useAuthStore.getState();
  
  if (!authState.token) {
    console.warn('⚠️ No hay token disponible');
    return false;
  }
  
  try {
    // Verificar si el token está expirado
    const tokenPayload = JSON.parse(atob(authState.token.split('.')[1]));
    const now = Date.now() / 1000;
    
    if (tokenPayload.exp && tokenPayload.exp < now) {
      console.warn('⚠️ Token expirado, intentando refrescar...');
      // Aquí podrías implementar la lógica de refresh token
      // Por ahora, simplemente retornamos false
      return false;
    }
    
    console.log('✅ Token válido');
    return true;
  } catch (error) {
    console.error('❌ Error verificando token:', error);
    return false;
  }
};

// Servicios de API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/login', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await apiClient.post('/api/register', userData);
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await apiClient.post('/api/refresh');
    return response.data;
  }
};

export const userAPI = {
  getProfile: async () => {
    const response = await apiClient.get('/api/users/profile');
    return response.data;
  },
  
  updateProfile: async (userData: any) => {
    const response = await apiClient.put('/api/users/profile', userData);
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await apiClient.get('/api/users');
    return response.data;
  }
};

export const classAPI = {
  getClasses: async () => {
    const response = await apiClient.get('/api/classes');
    return response.data;
  },
  
  createClass: async (classData: any) => {
    const response = await apiClient.post('/api/classes', classData);
    return response.data;
  },
  
  updateClass: async (id: string, classData: any) => {
    const response = await apiClient.put(`/api/classes/${id}`, classData);
    return response.data;
  },
  
  deleteClass: async (id: string) => {
    const response = await apiClient.delete(`/api/classes/${id}`);
    return response.data;
  }
};

export const dashboardAPI = {
  getStudentData: async () => {
    const response = await apiClient.get('/api/dashboard/student');
    return response.data;
  },
  
  getTeacherData: async () => {
    const response = await apiClient.get('/api/dashboard/teacher');
    return response.data;
  },
  
  getAdminData: async () => {
    const response = await apiClient.get('/api/dashboard/admin');
    return response.data;
  }
};

// Servicios de salud y información del sistema
export const systemAPI = {
  health: async () => {
    const response = await apiClient.get('/api/health');
    return response.data;
  },
  
  info: async () => {
    const response = await apiClient.get('/api/info');
    return response.data;
  }
};