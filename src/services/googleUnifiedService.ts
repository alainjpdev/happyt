/**
 * 🔐 Servicio Unificado de Google OAuth 2.0
 * 
 * Este servicio maneja TODAS las integraciones de Google de forma centralizada:
 * - Google Classroom
 * - Google Sheets
 * - Google Drive
 * - Gmail
 * - User Info
 */

import { googleConfig, getGoogleScopesString, isGoogleConfigured } from '../config/googleUnified';

interface GoogleAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  expiresAt: string;
  scope: string;
}

interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export class GoogleUnifiedService {
  private static instance: GoogleUnifiedService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isAuthenticated: boolean = false;
  private loading: boolean = false;
  private error: string | null = null;
  private tokenExpiryTime: number = 0;
  private scope: string = '';
  private listeners: Array<(state: GoogleAuthState) => void> = [];

  private constructor() {
    this.loadTokensFromStorage();
    this.checkAuthStatus();
  }

  public static getInstance(): GoogleUnifiedService {
    if (!GoogleUnifiedService.instance) {
      GoogleUnifiedService.instance = new GoogleUnifiedService();
    }
    return GoogleUnifiedService.instance;
  }

  /**
   * Obtener el estado actual
   */
  public getState(): GoogleAuthState {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      isAuthenticated: this.isAuthenticated,
      loading: this.loading,
      error: this.error,
      expiresAt: new Date(this.tokenExpiryTime).toISOString(),
      scope: this.scope
    };
  }

  /**
   * Suscribirse a cambios de estado
   */
  public subscribe(listener: (state: GoogleAuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notificar a todos los listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  /**
   * Cargar tokens desde localStorage
   */
  private loadTokensFromStorage(): void {
    try {
      const stored = localStorage.getItem('google_auth_tokens');
      if (stored) {
        const tokens = JSON.parse(stored);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        this.tokenExpiryTime = tokens.expiryTime || 0;
        this.scope = tokens.scope || '';
        this.isAuthenticated = !!this.accessToken;
      }
    } catch (error) {
      console.error('❌ Error cargando tokens de Google:', error);
      this.clearTokens();
    }
  }

  /**
   * Guardar tokens en localStorage
   */
  private saveTokensToStorage(tokens: GoogleTokens): void {
    try {
      const tokenData = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryTime: Date.now() + (tokens.expires_in * 1000),
        scope: tokens.scope
      };
      localStorage.setItem('google_auth_tokens', JSON.stringify(tokenData));
    } catch (error) {
      console.error('❌ Error guardando tokens de Google:', error);
    }
  }

  /**
   * Limpiar tokens
   */
  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.isAuthenticated = false;
    this.tokenExpiryTime = 0;
    this.scope = '';
    localStorage.removeItem('google_auth_tokens');
  }

  /**
   * Verificar estado de autenticación
   */
  private checkAuthStatus(): void {
    if (!this.accessToken) {
      this.isAuthenticated = false;
      this.notifyListeners();
      return;
    }

    // Verificar si el token ha expirado
    if (Date.now() >= this.tokenExpiryTime) {
      this.refreshTokenIfNeeded();
    } else {
      this.isAuthenticated = true;
      this.notifyListeners();
    }
  }

  /**
   * Iniciar proceso de autenticación
   */
  public async authenticate(): Promise<boolean> {
    if (!isGoogleConfigured()) {
      this.error = 'Configuración de Google incompleta';
      this.notifyListeners();
      return false;
    }

    this.loading = true;
    this.error = null;
    this.notifyListeners();

    try {
      // Generar state para seguridad
      const state = this.generateState();
      localStorage.setItem('google_oauth_state', state);
      
      // Construir URL de autorización
      const authUrl = this.buildAuthUrl(state);
      
      window.location.href = authUrl;
      
      return true;
    } catch (error) {
      console.error('❌ Error iniciando autenticación:', error);
      this.error = 'Error al iniciar autenticación con Google';
      this.loading = false;
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Construir URL de autorización
   */
  private buildAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: googleConfig.clientId,
      redirect_uri: googleConfig.redirectUri,
      response_type: 'code',
      scope: getGoogleScopesString(),
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state: state
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Generar state para seguridad
   */
  private generateState(): string {
    return 'google_auth_' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Procesar callback de OAuth
   */
  public async handleOAuthCallback(code: string): Promise<boolean> {
    this.loading = true;
    this.error = null;
    this.notifyListeners();

    try {
      // Intercambiar código por tokens
      const tokens = await this.exchangeCodeForTokens(code);
      
      // Guardar tokens
      this.saveTokensToStorage(tokens);
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      this.tokenExpiryTime = Date.now() + (tokens.expires_in * 1000);
      this.scope = tokens.scope;
      this.isAuthenticated = true;
      this.loading = false;
      this.error = null;
      
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
   * Intercambiar código por tokens
   */
  private async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: googleConfig.clientId,
        client_secret: googleConfig.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: googleConfig.redirectUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error obteniendo tokens: ${errorData.error_description || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Renovar token si es necesario
   */
  public async refreshTokenIfNeeded(): Promise<boolean> {
    if (!this.refreshToken) {
      this.logout();
      return false;
    }

    if (Date.now() < this.tokenExpiryTime - 60000) { // 1 minuto de margen
      return true; // Token aún válido
    }

    try {
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: googleConfig.clientId,
          client_secret: googleConfig.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Error renovando token: ${response.statusText}`);
      }

      const tokens: GoogleTokens = await response.json();
      
      // Actualizar tokens
      this.accessToken = tokens.access_token;
      if (tokens.refresh_token) {
        this.refreshToken = tokens.refresh_token;
      }
      this.tokenExpiryTime = Date.now() + (tokens.expires_in * 1000);
      this.scope = tokens.scope;
      
      // Guardar en localStorage
      this.saveTokensToStorage(tokens);
      
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error('❌ Error renovando token:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Obtener token válido
   */
  public async getValidToken(): Promise<string | null> {
    if (!this.isAuthenticated) {
      return null;
    }

    const refreshed = await this.refreshTokenIfNeeded();
    return refreshed ? this.accessToken : null;
  }

  /**
   * Obtener información del usuario
   */
  public async getUserInfo(): Promise<GoogleUserInfo | null> {
    const token = await this.getValidToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error obteniendo información del usuario: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error obteniendo información del usuario:', error);
      return null;
    }
  }

  /**
   * Cerrar sesión
   */
  public logout(): void {
    this.clearTokens();
    this.notifyListeners();
  }

  /**
   * Verificar si tiene un scope específico
   */
  public hasScope(scope: string): boolean {
    return this.scope.includes(scope);
  }

  /**
   * Verificar si tiene scopes de Classroom
   */
  public hasClassroomScopes(): boolean {
    const classroomScopes = [
      'https://www.googleapis.com/auth/classroom.courses',
      'https://www.googleapis.com/auth/classroom.rosters'
    ];
    return classroomScopes.some(scope => this.scope.includes(scope));
  }

  /**
   * Verificar si tiene scopes de Sheets
   */
  public hasSheetsScopes(): boolean {
    return this.scope.includes('https://www.googleapis.com/auth/spreadsheets');
  }

  /**
   * Verificar si tiene scopes de Drive
   */
  public hasDriveScopes(): boolean {
    return this.scope.includes('https://www.googleapis.com/auth/drive');
  }

  /**
   * Verificar si tiene scopes de Gmail
   */
  public hasGmailScopes(): boolean {
    return this.scope.includes('https://www.googleapis.com/auth/gmail.readonly');
  }
}

// Exportar instancia singleton
export const googleUnifiedService = GoogleUnifiedService.getInstance();
