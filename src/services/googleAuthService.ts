/**
 * 🔐 Servicio Centralizado de Autenticación Google OAuth 2.0
 * 
 * Este servicio maneja toda la autenticación con Google de forma centralizada,
 * eliminando la necesidad de re-autorizar constantemente y manejando automáticamente
 * la expiración de tokens.
 */

interface GoogleAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isAuthenticated: boolean = false;
  private loading: boolean = false;
  private error: string | null = null;
  private tokenExpiryTime: number = 0;
  private listeners: Array<(state: GoogleAuthState) => void> = [];

  // Configuración OAuth
  private readonly clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  private readonly clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
  private readonly redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin + '/auth/google/callback';
  private readonly scopes = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ');

  private constructor() {
    this.loadTokensFromStorage();
    this.checkAuthStatus();
  }

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  /**
   * Suscribirse a cambios de estado
   */
  public subscribe(listener: (state: GoogleAuthState) => void): () => void {
    this.listeners.push(listener);
    // Ejecutar inmediatamente con el estado actual
    listener(this.getState());
    
    // Retornar función de desuscripción
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notificar a todos los listeners sobre cambios de estado
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  /**
   * Obtener estado actual
   */
  public getState(): GoogleAuthState {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      isAuthenticated: this.isAuthenticated,
      loading: this.loading,
      error: this.error
    };
  }

  /**
   * Cargar tokens desde localStorage
   */
  private loadTokensFromStorage(): void {
    try {
      this.accessToken = localStorage.getItem('google_access_token');
      this.refreshToken = localStorage.getItem('google_refresh_token');
      const timestamp = localStorage.getItem('google_auth_timestamp');
      const expiresIn = localStorage.getItem('google_token_expires_in');
      
      if (timestamp && expiresIn) {
        this.tokenExpiryTime = parseInt(timestamp) + (parseInt(expiresIn) * 1000);
      }
      
      console.log('🔑 Tokens cargados desde localStorage:', {
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken,
        expiresAt: new Date(this.tokenExpiryTime).toISOString()
      });
    } catch (error) {
      console.error('❌ Error cargando tokens desde localStorage:', error);
    }
  }

  /**
   * Guardar tokens en localStorage
   */
  private saveTokensToStorage(tokens: GoogleTokens): void {
    try {
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      this.tokenExpiryTime = Date.now() + (tokens.expires_in * 1000);
      
      localStorage.setItem('google_access_token', tokens.access_token);
      localStorage.setItem('google_refresh_token', tokens.refresh_token);
      localStorage.setItem('google_auth_timestamp', Date.now().toString());
      localStorage.setItem('google_token_expires_in', tokens.expires_in.toString());
      
      console.log('💾 Tokens guardados en localStorage:', {
        expiresAt: new Date(this.tokenExpiryTime).toISOString()
      });
    } catch (error) {
      console.error('❌ Error guardando tokens en localStorage:', error);
    }
  }

  /**
   * Verificar si el token está expirado
   */
  private isTokenExpired(): boolean {
    if (!this.accessToken) return true;
    
    // Margen de 5 minutos antes de la expiración real
    const margin = 5 * 60 * 1000; // 5 minutos en ms
    return Date.now() >= (this.tokenExpiryTime - margin);
  }

  /**
   * Verificar estado de autenticación
   */
  public checkAuthStatus(): void {
    if (this.accessToken && !this.isTokenExpired()) {
      this.isAuthenticated = true;
      this.error = null;
      console.log('✅ Usuario autenticado con Google');
    } else if (this.accessToken && this.isTokenExpired()) {
      console.log('⚠️ Token expirado, intentando renovar...');
      this.refreshTokenIfNeeded();
    } else {
      this.isAuthenticated = false;
      console.log('❌ Usuario no autenticado con Google');
    }
    
    this.notifyListeners();
  }

  /**
   * Iniciar proceso de autenticación
   */
  public async authenticate(): Promise<boolean> {
    if (this.loading) return false;
    
    this.loading = true;
    this.error = null;
    this.notifyListeners();

    try {
      console.log('🔄 Iniciando autenticación con Google...');
      
      // Construir URL de autorización
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', this.clientId);
      authUrl.searchParams.set('redirect_uri', this.redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', this.scopes);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', 'google_auth');

      console.log('🔗 Redirigiendo a Google OAuth:', authUrl.toString());
      
      // Redirigir a Google OAuth
      window.location.href = authUrl.toString();
      
      return true;
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      this.error = 'Error al iniciar autenticación con Google';
      this.loading = false;
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Procesar callback de OAuth
   */
  public async handleOAuthCallback(code: string): Promise<boolean> {
    this.loading = true;
    this.error = null;
    this.notifyListeners();

    try {
      console.log('🔄 Procesando callback de OAuth...');
      
      // Intercambiar código por tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Error obteniendo tokens: ${tokenResponse.statusText}`);
      }

      const tokens: GoogleTokens = await tokenResponse.json();
      
      // Guardar tokens
      this.saveTokensToStorage(tokens);
      this.isAuthenticated = true;
      this.loading = false;
      this.error = null;
      
      console.log('✅ Autenticación exitosa con Google');
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error('❌ Error procesando callback OAuth:', error);
      this.error = 'Error al procesar autenticación con Google';
      this.loading = false;
      this.isAuthenticated = false;
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Renovar token si es necesario
   */
  public async refreshTokenIfNeeded(): Promise<boolean> {
    if (!this.refreshToken || !this.isTokenExpired()) {
      return this.isAuthenticated;
    }

    this.loading = true;
    this.error = null;
    this.notifyListeners();

    try {
      console.log('🔄 Renovando token de Google...');
      
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error(`Error renovando token: ${refreshResponse.statusText}`);
      }

      const tokens: GoogleTokens = await refreshResponse.json();
      
      // Actualizar access token
      this.accessToken = tokens.access_token;
      this.tokenExpiryTime = Date.now() + (tokens.expires_in * 1000);
      
      localStorage.setItem('google_access_token', tokens.access_token);
      localStorage.setItem('google_auth_timestamp', Date.now().toString());
      localStorage.setItem('google_token_expires_in', tokens.expires_in.toString());
      
      this.isAuthenticated = true;
      this.loading = false;
      this.error = null;
      
      console.log('✅ Token renovado exitosamente');
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error('❌ Error renovando token:', error);
      this.error = 'Error renovando token de Google';
      this.loading = false;
      this.isAuthenticated = false;
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Obtener token válido (renueva automáticamente si es necesario)
   */
  public async getValidToken(): Promise<string | null> {
    if (!this.accessToken) {
      return null;
    }

    if (this.isTokenExpired()) {
      console.log('🔄 Token expirado, renovando...');
      const refreshed = await this.refreshTokenIfNeeded();
      if (!refreshed) {
        console.log('❌ No se pudo renovar token');
        return null;
      }
    }

    return this.accessToken;
  }

  /**
   * Cerrar sesión
   */
  public logout(): void {
    console.log('🚪 Cerrando sesión de Google...');
    
    this.accessToken = null;
    this.refreshToken = null;
    this.isAuthenticated = false;
    this.loading = false;
    this.error = null;
    this.tokenExpiryTime = 0;
    
    // Limpiar localStorage
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_auth_timestamp');
    localStorage.removeItem('google_token_expires_in');
    
    this.notifyListeners();
    console.log('✅ Sesión de Google cerrada');
  }

  /**
   * Manejar expiración de token
   */
  private handleTokenExpiration(): void {
    console.log('⚠️ Token expirado, redirigiendo a re-autenticación...');
    this.logout();
    // Opcional: redirigir a página de login
    // window.location.href = '/login';
  }
}

// Exportar instancia singleton
export const googleAuthService = GoogleAuthService.getInstance();
