/**
 * 🔧 Configuración Unificada de Google
 * 
 * Esta configuración centraliza TODAS las integraciones de Google en la aplicación:
 * - Google Classroom
 * - Google Sheets
 * - Google Drive
 * - Google Auth
 * - Gmail
 */

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  apiKey: string;
  redirectUri: string;
  scopes: string[];
  environment: 'development' | 'production';
}

// Scopes unificados para todos los servicios de Google
export const GOOGLE_SCOPES = {
  // Google Classroom
  CLASSROOM: [
    'https://www.googleapis.com/auth/classroom.courses',
    'https://www.googleapis.com/auth/classroom.rosters',
    'https://www.googleapis.com/auth/classroom.coursework.students',
    'https://www.googleapis.com/auth/classroom.coursework.me',
    'https://www.googleapis.com/auth/classroom.profile.emails',
    'https://www.googleapis.com/auth/classroom.guardianlinks.students',
    'https://www.googleapis.com/auth/classroom.topics'
  ],
  
  // Google Sheets
  SHEETS: [
    'https://www.googleapis.com/auth/spreadsheets'
  ],
  
  // Google Drive
  DRIVE: [
    'https://www.googleapis.com/auth/drive'
  ],
  
  // Gmail
  GMAIL: [
    'https://www.googleapis.com/auth/gmail.readonly'
  ],
  
  // User Info
  USER_INFO: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  
  // OpenID Connect
  OPENID: [
    'openid'
  ]
};

// Obtener todos los scopes como un array unificado
export const getAllGoogleScopes = (): string[] => {
  return [
    ...GOOGLE_SCOPES.CLASSROOM,
    ...GOOGLE_SCOPES.SHEETS,
    ...GOOGLE_SCOPES.DRIVE,
    ...GOOGLE_SCOPES.GMAIL,
    ...GOOGLE_SCOPES.USER_INFO,
    ...GOOGLE_SCOPES.OPENID
  ];
};

// Obtener scopes como string para OAuth
export const getGoogleScopesString = (): string => {
  return getAllGoogleScopes().join(' ');
};

// Configuración unificada de Google
export const getGoogleConfig = (): GoogleConfig => {
  const hostname = window.location.hostname;
  const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  const isProduction = hostname === 'happytribe.vercel.app' || hostname.includes('vercel.app');
  
  // Determinar el entorno
  const environment = isDevelopment ? 'development' : 'production';
  
  // Configuración del redirect URI
  let redirectUri: string;
  if (import.meta.env.VITE_GOOGLE_REDIRECT_URI) {
    // Si hay una variable de entorno específica, usarla
    redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
  } else if (isProduction) {
    // Producción - usar Heroku backend callback
    redirectUri = 'https://happytribe-backend-08a2fb6f96ac.herokuapp.com/api/google/callback';
  } else {
    // Desarrollo - usar localhost
    redirectUri = 'http://localhost:3000/api/google/callback';
  }
  
  const config: GoogleConfig = {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
    redirectUri,
    scopes: getAllGoogleScopes(),
    environment
  };
  
  // Log solo si hay problemas de configuración
  if (!config.clientId || !config.clientSecret || !config.apiKey) {
    console.warn('⚠️ Configuración de Google incompleta:', {
      hasClientId: !!config.clientId,
      hasClientSecret: !!config.clientSecret,
      hasApiKey: !!config.apiKey
    });
  }
  
  return config;
};

// Exportar la configuración actual
export const googleConfig = getGoogleConfig();

// Funciones de utilidad
export const isGoogleConfigured = (): boolean => {
  return !!(
    googleConfig.clientId &&
    googleConfig.clientSecret &&
    googleConfig.apiKey &&
    googleConfig.redirectUri
  );
};

export const getGoogleClientId = (): string => googleConfig.clientId;
export const getGoogleClientSecret = (): string => googleConfig.clientSecret;
export const getGoogleApiKey = (): string => googleConfig.apiKey;
export const getGoogleRedirectUri = (): string => googleConfig.redirectUri;
export const getGoogleScopes = (): string[] => googleConfig.scopes;
export const getGoogleScopesString = (): string => googleConfig.scopes.join(' ');

// Configuraciones específicas para diferentes servicios
export const getGoogleClassroomConfig = () => ({
  clientId: googleConfig.clientId,
  apiKey: googleConfig.apiKey,
  redirectUri: googleConfig.redirectUri,
  scopes: GOOGLE_SCOPES.CLASSROOM
});

export const getGoogleSheetsConfig = () => ({
  clientId: googleConfig.clientId,
  apiKey: googleConfig.apiKey,
  redirectUri: googleConfig.redirectUri,
  scopes: GOOGLE_SCOPES.SHEETS
});

export const getGoogleAuthConfig = () => ({
  clientId: googleConfig.clientId,
  clientSecret: googleConfig.clientSecret,
  redirectUri: googleConfig.redirectUri,
  scopes: googleConfig.scopes
});

// Sheet IDs específicos
export const GOOGLE_SHEET_IDS = {
  TODO: import.meta.env.VITE_TODO_SHEET_ID || '',
  CRM: import.meta.env.VITE_CRM_SHEET_ID || ''
};

// Verificar si las configuraciones específicas están completas
export const isGoogleClassroomConfigured = (): boolean => {
  const config = getGoogleClassroomConfig();
  return !!(config.clientId && config.apiKey && config.redirectUri);
};

export const isGoogleSheetsConfigured = (): boolean => {
  const config = getGoogleSheetsConfig();
  return !!(config.clientId && config.apiKey && config.redirectUri);
};

export const isGoogleAuthConfigured = (): boolean => {
  const config = getGoogleAuthConfig();
  return !!(config.clientId && config.clientSecret && config.redirectUri);
};
