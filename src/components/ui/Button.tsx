import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  className = ''
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    // Paleta del logo Happy Tribe
    primary: 'bg-brand-green-medium text-white hover:bg-brand-green-dark focus:ring-brand-green-medium', // Verde medio
    secondary: 'bg-brand-brown text-white hover:bg-secondary-dark focus:ring-brand-brown', // Marrón
    outline: 'border-2 border-brand-green-medium text-brand-green-medium hover:bg-brand-green-light hover:text-white focus:ring-brand-green-medium', // Outline verde
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600' // Rojo estándar
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};