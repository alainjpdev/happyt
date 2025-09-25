import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Guardar error en localStorage para persistencia
    try {
      const errorData = {
        id: errorId,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      localStorage.setItem('lastError', JSON.stringify(errorData));
    } catch (e) {
      console.error('No se pudo guardar error en localStorage:', e);
    }
    
    return { hasError: true, error, errorId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error capturado por ErrorBoundary:', error);
    console.error('🚨 Error Info:', errorInfo);
    
    // Log detallado del error
    const errorDetails = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.error('🚨 Error details:', errorDetails);
    
    // Mostrar alert inmediato para debugging
    alert(`🚨 ERROR CAPTURADO POR ERRORBOUNDARY:\n\n${error.message}\n\nRevisa la consola para más detalles.`);
    
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-2xl">
            <h1 className="text-4xl font-bold text-red-600 mb-4">🚨 Error Crítico Detectado</h1>
            <p className="text-gray-600 mb-4">La aplicación encontró un error que no pudo manejar automáticamente.</p>
            <p className="text-sm text-gray-500 mb-8">Error ID: {this.state.errorId}</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors mr-4"
              >
                🔄 Recargar Página
              </button>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('lastError');
                  this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔧 Intentar Continuar
              </button>
            </div>
            
            {this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  📋 Ver Detalles del Error
                </summary>
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Error:</h4>
                  <pre className="text-xs text-gray-600 mb-4 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                  
                  <h4 className="font-semibold text-gray-800 mb-2">Stack Trace:</h4>
                  <pre className="text-xs text-gray-600 mb-4 overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <h4 className="font-semibold text-gray-800 mb-2">Component Stack:</h4>
                      <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
