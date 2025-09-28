/**
 * 🎣 Hook Unificado de Google
 * 
 * Este hook proporciona acceso a todas las funcionalidades de Google
 * de forma unificada y reactiva.
 */

import { useState, useEffect, useCallback } from 'react';
import { googleUnifiedService } from '../services/googleUnifiedService';
import { GoogleAuthState, GoogleUserInfo } from '../services/googleUnifiedService';

export const useGoogleUnified = () => {
  const [state, setState] = useState<GoogleAuthState>(() => googleUnifiedService.getState());

  // Suscribirse a cambios de estado
  useEffect(() => {
    const unsubscribe = googleUnifiedService.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  // Métodos del servicio
  const authenticate = useCallback(async (): Promise<boolean> => {
    return await googleUnifiedService.authenticate();
  }, []);

  const logout = useCallback((): void => {
    googleUnifiedService.logout();
  }, []);

  const getValidToken = useCallback(async (): Promise<string | null> => {
    return await googleUnifiedService.getValidToken();
  }, []);

  const getUserInfo = useCallback(async (): Promise<GoogleUserInfo | null> => {
    return await googleUnifiedService.getUserInfo();
  }, []);

  const refreshTokenIfNeeded = useCallback(async (): Promise<boolean> => {
    return await googleUnifiedService.refreshTokenIfNeeded();
  }, []);

  const hasScope = useCallback((scope: string): boolean => {
    return googleUnifiedService.hasScope(scope);
  }, []);

  const hasClassroomScopes = useCallback((): boolean => {
    return googleUnifiedService.hasClassroomScopes();
  }, []);

  const hasSheetsScopes = useCallback((): boolean => {
    return googleUnifiedService.hasSheetsScopes();
  }, []);

  const hasDriveScopes = useCallback((): boolean => {
    return googleUnifiedService.hasDriveScopes();
  }, []);

  const hasGmailScopes = useCallback((): boolean => {
    return googleUnifiedService.hasGmailScopes();
  }, []);

  return {
    // Estado
    ...state,
    
    // Métodos
    authenticate,
    logout,
    getValidToken,
    getUserInfo,
    refreshTokenIfNeeded,
    hasScope,
    hasClassroomScopes,
    hasSheetsScopes,
    hasDriveScopes,
    hasGmailScopes
  };
};

/**
 * Hook para manejar callbacks de OAuth en la URL
 */
export const useGoogleUnifiedCallback = () => {
  const { handleOAuthCallback, loading, error } = useGoogleUnified();

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

      if (code && state && state.startsWith('google_auth_')) {
        await handleOAuthCallback(code);
        
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleCallback();
  }, [handleOAuthCallback]);

  return { loading, error };
};

/**
 * Hook específico para Google Classroom
 */
export const useGoogleClassroom = () => {
  const googleAuth = useGoogleUnified();
  
  return {
    ...googleAuth,
    isClassroomReady: googleAuth.isAuthenticated && googleAuth.hasClassroomScopes()
  };
};

/**
 * Hook específico para Google Sheets
 */
export const useGoogleSheets = () => {
  const googleAuth = useGoogleUnified();
  
  return {
    ...googleAuth,
    isSheetsReady: googleAuth.isAuthenticated && googleAuth.hasSheetsScopes()
  };
};

/**
 * Hook específico para Google Drive
 */
export const useGoogleDrive = () => {
  const googleAuth = useGoogleUnified();
  
  return {
    ...googleAuth,
    isDriveReady: googleAuth.isAuthenticated && googleAuth.hasDriveScopes()
  };
};

/**
 * Hook específico para Gmail
 */
export const useGmail = () => {
  const googleAuth = useGoogleUnified();
  
  return {
    ...googleAuth,
    isGmailReady: googleAuth.isAuthenticated && googleAuth.hasGmailScopes()
  };
};
