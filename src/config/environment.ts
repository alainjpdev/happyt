// Configuración centralizada del entorno
export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  backendURL: string;
  frontendURL: string;
  googleRedirectURI: string;
  googleClientId: string;
  googleClientSecret: string;
  environment: 'development' | 'production' | 'unknown';
}

// Función para detectar el entorno actual
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // Detectar si estamos en desarrollo
  const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  
  // Detectar si estamos en producción (Vercel)
  const isProduction = hostname === 'happytribe.vercel.app';
  
  // Determinar el entorno
  let environment: 'development' | 'production' | 'unknown' = 'unknown';
  if (isDevelopment) environment = 'development';
  else if (isProduction) environment = 'production';
  
  // Configuración del backend
  let backendURL: string;
  if (import.meta.env.VITE_API_URL) {
    // Si hay una variable de entorno específica, usarla
    backendURL = import.meta.env.VITE_API_URL;
  } else if (isProduction) {
    // Producción - usar Heroku
    backendURL = 'https://colorland-app-ff3fdd79ac35.herokuapp.com';
  } else if (isDevelopment) {
    // Desarrollo - usar localhost
    backendURL = 'http://localhost:3000';
  } else {
    // Fallback a producción
    backendURL = 'https://colorland-app-ff3fdd79ac35.herokuapp.com';
  }
  
  // Configuración del frontend
  const frontendURL = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  
  // Configuración de Google OAuth2
  let googleRedirectURI: string;
  if (import.meta.env.VITE_GOOGLE_REDIRECT_URI) {
    // Si hay una variable de entorno específica, usarla
    googleRedirectURI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
  } else if (isProduction) {
    // Producción - usar Vercel
    googleRedirectURI = 'https://happytribe.vercel.app/dashboard/todo';
  } else if (isDevelopment) {
    // Desarrollo - usar localhost (puerto 5174 si 5173 está ocupado)
    googleRedirectURI = 'http://localhost:5174/auth/google/callback';
  } else {
    // Fallback a desarrollo
    googleRedirectURI = 'http://localhost:5174/auth/google/callback';
  }

  // Configuración de Google OAuth2 Credentials
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const googleClientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';
  
  const config: EnvironmentConfig = {
    isDevelopment,
    isProduction,
    backendURL,
    frontendURL,
    googleRedirectURI,
    googleClientId,
    googleClientSecret,
    environment
  };
  
  // Log de la configuración para debugging
  console.log('🔧 Configuración del entorno:', {
    hostname,
    environment,
    backendURL,
    frontendURL,
    googleRedirectURI,
    hasGoogleClientId: !!googleClientId,
    hasGoogleClientSecret: !!googleClientSecret,
    isDevelopment,
    isProduction
  });
  
  return config;
};

// Exportar la configuración actual
export const envConfig = getEnvironmentConfig();

// Funciones de utilidad
export const isDevelopment = () => envConfig.isDevelopment;
export const isProduction = () => envConfig.isProduction;
export const getBackendURL = () => envConfig.backendURL;
export const getFrontendURL = () => envConfig.frontendURL;
export const getGoogleRedirectURI = () => envConfig.googleRedirectURI;
export const getGoogleClientId = () => envConfig.googleClientId;
export const getGoogleClientSecret = () => envConfig.googleClientSecret;
