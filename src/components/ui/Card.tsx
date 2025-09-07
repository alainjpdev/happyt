import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`bg-white border border-gray-200 text-brand-brown rounded-lg shadow-sm hover:shadow-md transition-shadow ${paddingClasses[padding]} ${className}`}>
      {/* Card con colores del logo Happy Tribe */}
      {children}
    </div>
  );
};