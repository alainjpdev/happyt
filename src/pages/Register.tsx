import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BookOpen, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import logohappy from '../assets/logohappy.png';
export const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register: registerUser } = useAuthStore();

    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const password = watch('password');
    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError('');
        try {
            const { confirmPassword, ...userData } = data;
            console.log('🔄 Intentando registrar usuario:', { ...userData, role: 'student' });
            await registerUser({ ...userData, role: 'student' }); // Enviar rol student
            console.log('✅ Usuario registrado exitosamente');
            navigate('/dashboard');
        }
        catch (err: any) {
            console.error('❌ Error en registro:', err);
            let errorMessage = 'Error al registrar estudiante';
            
            if (err.response?.status === 500) {
                errorMessage = 'El servidor está experimentando problemas. Por favor, contacta al administrador o intenta más tarde.';
            } else if (err.response?.status === 400) {
                errorMessage = 'Datos inválidos. Verifica que todos los campos estén correctos.';
            } else if (err.response?.status === 409) {
                errorMessage = 'El correo electrónico ya está registrado.';
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="min-h-screen bg-brand-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logohappy} alt="Happy Tribe Logo" className="h-12 w-auto" />
          </div>
          <p className="text-brand-brown mt-2">Regístrate como Estudiante</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error al registrar estudiante
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  {error.includes('servidor está experimentando problemas') && (
                    <div className="mt-3">
                      <a 
                        href="mailto:admin@happytribe.com?subject=Error de Registro&body=Hola, estoy experimentando un error al intentar registrarme en Happy Tribe. ¿Podrían ayudarme?"
                        className="text-sm font-medium text-red-600 hover:text-red-500 underline"
                      >
                        📧 Contactar al Administrador
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-brown mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-green-medium"/>
                  <input type="text" {...register('firstName', {
        required: 'Nombre es requerido',
        minLength: {
            value: 2,
            message: 'El nombre debe tener al menos 2 caracteres'
        }
    })} className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-white text-brand-brown rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green-medium focus:border-transparent" placeholder="Nombre"/>
                </div>
                {typeof errors.firstName?.message === 'string' && (<p className="mt-1 text-sm text-error">{errors.firstName.message}</p>)}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown mb-2">
                  Apellido
                </label>
                <input type="text" {...register('lastName', {
        required: 'Apellido es requerido',
        minLength: {
            value: 2,
            message: 'El apellido debe tener al menos 2 caracteres'
        }
    })} className="w-full px-3 py-2 border border-gray-200 bg-white text-brand-brown rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green-medium focus:border-transparent" placeholder="Apellido"/>
                {typeof errors.lastName?.message === 'string' && (<p className="mt-1 text-sm text-error">{errors.lastName.message}</p>)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-brown mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-green-medium"/>
                <input type="email" {...register('email', {
        required: 'Correo Electrónico es requerido',
        pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Correo inválido'
        }
    })} className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-white text-brand-brown rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green-medium focus:border-transparent" placeholder="Correo Electrónico"/>
              </div>
              {typeof errors.email?.message === 'string' && (<p className="mt-1 text-sm text-error">{errors.email.message}</p>)}
            </div>

            {/* Campo de selección de rol eliminado */}

            <div>
              <label className="block text-sm font-medium text-brand-brown mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-green-medium"/>
                <input type={showPassword ? 'text' : 'password'} {...register('password', {
        required: 'Contraseña es requerida',
        minLength: {
            value: 6,
            message: 'La contraseña debe tener al menos 6 caracteres'
        }
    })} className="w-full pl-10 pr-10 py-2 border border-gray-200 bg-white text-brand-brown rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green-medium focus:border-transparent" placeholder="Contraseña"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-green-medium hover:text-brand-brown">
                  {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
              {typeof errors.password?.message === 'string' && (<p className="mt-1 text-sm text-error">{errors.password.message}</p>)}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-brown mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-green-medium"/>
                <input type={showPassword ? 'text' : 'password'} {...register('confirmPassword', {
        required: 'Confirmar Contraseña es requerido',
        validate: (value) => value === password || 'Las contraseñas no coinciden'
    })} className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-white text-brand-brown rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green-medium focus:border-transparent" placeholder="Confirmar Contraseña"/>
              </div>
              {typeof errors.confirmPassword?.message === 'string' && (<p className="mt-1 text-sm text-error">{errors.confirmPassword.message}</p>)}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>
            
            {/* Botón temporal para crear usuario de prueba */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700 mb-2">
                <strong>⚠️ Problema temporal:</strong> El servidor de registro está experimentando problemas.
              </p>
              <p className="text-sm text-yellow-600 mb-3">
                Mientras tanto, puedes usar estas credenciales de prueba:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Admin:</span>
                  <span>admin@happytribe.com / [Contraseña oculta por seguridad]</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Estudiante:</span>
                  <span>student@algorithmics.com / [Contraseña oculta]</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Profesor:</span>
                  <span>teacher@algorithmics.com / [Contraseña oculta]</span>
                </div>
              </div>
              <div className="mt-3">
                <Link 
                  to="/login" 
                  className="text-sm font-medium text-yellow-600 hover:text-yellow-500 underline"
                >
                  🔑 Ir al Login
                </Link>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-brand-green-medium">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-brand-green-medium hover:text-brand-green-medium font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-brand-green-medium hover:text-brand-brown">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>);
};
