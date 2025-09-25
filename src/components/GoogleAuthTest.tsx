/**
 * 🧪 Componente de prueba para Google Auth
 * 
 * Este componente permite probar la funcionalidad de autenticación Google
 * de forma aislada y ver el estado en tiempo real.
 */

import React from 'react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export const GoogleAuthTest: React.FC = () => {
  const {
    isAuthenticated,
    accessToken,
    loading,
    error,
    authenticate,
    logout,
    getValidToken
  } = useGoogleAuth();

  const handleTestApiCall = async () => {
    try {
      const token = await getValidToken();
      if (!token) {
        console.log('❌ No se pudo obtener token válido');
        return;
      }

      console.log('🔑 Token obtenido:', token.substring(0, 50) + '...');
      
      // Probar una llamada a la API de Google
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userInfo = await response.json();
        console.log('✅ Información del usuario:', userInfo);
        alert(`¡Hola ${userInfo.name}! (${userInfo.email})`);
      } else {
        console.error('❌ Error en API call:', response.statusText);
        alert('Error al obtener información del usuario');
      }
    } catch (error) {
      console.error('❌ Error en test API call:', error);
      alert('Error en la llamada a la API');
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-text">🧪 Google Auth Test</h2>
      
      {/* Estado actual */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Estado:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            isAuthenticated 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isAuthenticated ? '✅ Autenticado' : '❌ No autenticado'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">Cargando:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            loading 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {loading ? '🔄 Sí' : '⏸️ No'}
          </span>
        </div>
        
        {error && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Error:</span>
            <span className="px-2 py-1 rounded text-sm bg-red-100 text-red-800">
              {error}
            </span>
          </div>
        )}
        
        {accessToken && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Token:</span>
            <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800 font-mono text-xs">
              {accessToken.substring(0, 20)}...
            </span>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="space-y-2">
        {!isAuthenticated ? (
          <Button
            onClick={authenticate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? '🔄 Autenticando...' : '🔐 Conectar con Google'}
          </Button>
        ) : (
          <>
            <Button
              onClick={handleTestApiCall}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              🧪 Probar API Call
            </Button>
            
            <Button
              onClick={logout}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              🚪 Cerrar Sesión
            </Button>
          </>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        <p><strong>Funcionalidades:</strong></p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Autenticación OAuth 2.0</li>
          <li>Renovación automática de tokens</li>
          <li>Persistencia en localStorage</li>
          <li>Manejo automático de errores 401</li>
        </ul>
      </div>
    </Card>
  );
};
