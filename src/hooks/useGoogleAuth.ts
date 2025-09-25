/**
 * 🔐 Hook personalizado para autenticación Google
 * 
 * Proporciona una interfaz reactiva y fácil de usar para la autenticación
 * con Google en cualquier componente de React.
 */

import { useState, useEffect, useCallback } from 'react';
import { googleAuthService, GoogleAuthService } from '../services/googleAuthService';

interface GoogleAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const useGoogleAuth = () => {
  const [state, setState] = useState<GoogleAuthState>(() => googleAuthService.getState());

  // Suscribirse a cambios de estado
  useEffect(() => {
    const unsubscribe = googleAuthService.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  // Métodos del servicio
  const authenticate = useCallback(async (): Promise<boolean> => {
    return await googleAuthService.authenticate();
  }, []);

  const logout = useCallback((): void => {
    googleAuthService.logout();
  }, []);

  const getValidToken = useCallback(async (): Promise<string | null> => {
    return await googleAuthService.getValidToken();
  }, []);

  const checkAuthStatus = useCallback((): void => {
    googleAuthService.checkAuthStatus();
  }, []);

  const handleOAuthCallback = useCallback(async (code: string): Promise<boolean> => {
    return await googleAuthService.handleOAuthCallback(code);
  }, []);

  return {
    // Estado
    ...state,
    
    // Métodos
    authenticate,
    logout,
    getValidToken,
    checkAuthStatus,
    handleOAuthCallback,
  };
};

/**
 * Hook para manejar callbacks de OAuth en la URL
 */
export const useGoogleAuthCallback = () => {
  const { handleOAuthCallback, loading, error } = useGoogleAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        console.error('❌ Error en callback OAuth:', error);
        return;
      }

      if (code && state === 'google_auth') {
        console.log('🔄 Procesando callback OAuth...');
        await handleOAuthCallback(code);
        
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleCallback();
  }, [handleOAuthCallback]);

  return { loading, error };
};
