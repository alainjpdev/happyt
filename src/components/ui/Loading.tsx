import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = 'Cargando...',
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-brand-green-medium ${sizeClasses[size]} ${className}`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
        <div className="flex flex-col items-center space-y-4">
          {spinner}
          {text && (
            <p className="text-brand-brown font-medium">{text}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {spinner}
      {text && (
        <p className="text-brand-brown text-sm">{text}</p>
      )}
    </div>
  );
};

// Skeleton Loader para contenido
interface SkeletonProps {
  lines?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gray-200 rounded"
          style={{
            width: `${Math.random() * 40 + 60}%` // Ancho aleatorio entre 60-100%
          }}
        />
      ))}
    </div>
  );
};

// Skeleton Card
export const SkeletonCard: React.FC<{ className?: string }> = ({
  className = ''
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};

// Loading Button
interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  className = '',
  disabled = false,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative px-4 py-2 rounded-lg font-medium transition-colors ${
        loading
          ? 'bg-brand-green-medium text-white cursor-not-allowed'
          : 'bg-brand-green-medium text-white hover:bg-brand-green-dark'
      } ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

// Loading Overlay para tablas o listas
interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
  text = 'Cargando datos...'
}) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <Loading text={text} />
        </div>
      )}
    </div>
  );
};
