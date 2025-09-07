import React from 'react';

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  name
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-brand-brown mb-2">
          {label} {required && <span className="text-brand-red">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green-medium focus:border-transparent transition-colors ${
          error 
            ? 'border-brand-red focus:ring-brand-red' 
            : 'border-gray-200 bg-white text-brand-brown'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
      />
      {error && (
        <p className="mt-1 text-sm text-brand-red">{error}</p>
      )}
    </div>
  );
};