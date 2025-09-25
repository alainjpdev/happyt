/**
 * 🔄 Componente para manejar el callback de Google OAuth
 * 
 * Este componente se ejecuta cuando Google redirige de vuelta
 * después de la autorización OAuth.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback, loading, error } = useGoogleAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isProcessing = false;
    
    const processCallback = async () => {
      if (isProcessing) {
        console.log('⏳ Callback ya en procesamiento, ignorando...');
        return;
      }
      
      isProcessing = true;
      
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        console.log('🔄 Procesando callback OAuth:', { code: !!code, state, error });

        if (error) {
          console.error('❌ Error en callback OAuth:', error);
          setStatus('error');
          setMessage(`Error de autorización: ${error}`);
          return;
        }

        if (!code || (state !== 'google_auth' && state !== 'todo_auth')) {
          console.error('❌ Parámetros inválidos en callback:', { code: !!code, state });
          setStatus('error');
          setMessage(`Parámetros de autorización inválidos. State: ${state}`);
          return;
        }

        console.log('🔄 Procesando código de autorización...');
        const success = await handleOAuthCallback(code);

        if (success) {
          console.log('✅ Autenticación exitosa');
          setStatus('success');
          setMessage('¡Autenticación con Google exitosa!');
          
          // Redirigir al dashboard después de 2 segundos
          setTimeout(() => {
            navigate('/dashboard/todo');
          }, 2000);
        } else {
          console.error('❌ Error en autenticación');
          setStatus('error');
          setMessage('Error al procesar la autenticación');
        }
      } catch (err) {
        console.error('❌ Error procesando callback:', err);
        setStatus('error');
        setMessage('Error inesperado durante la autenticación');
      }
    };

    processCallback();
  }, [handleOAuthCallback, navigate]);

  const handleRetry = () => {
    navigate('/dashboard/todo');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard/todo');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 max-w-md mx-auto text-center">
        <div className="mb-6">
          {status === 'processing' && (
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          )}
          {status === 'error' && (
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-text mb-4">
          {status === 'processing' && '🔄 Procesando autenticación...'}
          {status === 'success' && '✅ ¡Autenticación exitosa!'}
          {status === 'error' && '❌ Error de autenticación'}
        </h1>

        <p className="text-text-secondary mb-6">
          {status === 'processing' && 'Por favor espera mientras procesamos tu autorización con Google...'}
          {status === 'success' && 'Te redirigiremos al dashboard en unos segundos...'}
          {status === 'error' && message}
        </p>

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              ✅ Tu cuenta de Google ha sido conectada exitosamente. 
              Ahora puedes usar todas las funcionalidades de Google Sheets, Drive y Gmail.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              {message}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {status === 'success' && (
            <Button
              onClick={handleGoToDashboard}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Ir al Dashboard
            </Button>
          )}

          {status === 'error' && (
            <Button
              onClick={handleRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Intentar de nuevo
            </Button>
          )}

          {status === 'processing' && (
            <Button
              onClick={handleGoToDashboard}
              variant="outline"
              className="w-full"
            >
              Ir al Dashboard
            </Button>
          )}
        </div>

        {loading && (
          <div className="mt-4 text-sm text-text-secondary">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
            Procesando...
          </div>
        )}
      </Card>
    </div>
  );
};
