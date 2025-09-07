import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Users, FileText, Calendar, User, LogOut, Home, ClipboardList, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { Moon, Sun } from 'lucide-react';
import logohappy from '../assets/logohappy.png';

export const TeacherLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dark, setDark] = useDarkMode();
  const [collapsed, setCollapsed] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    { to: '/dashboard', icon: Home, label: 'Panel de Control' },
    { to: '/dashboard/classes', icon: Calendar, label: 'Mis Clases' },
    { to: '/dashboard/students', icon: Users, label: 'Mis Estudiantes' },
    { to: '/dashboard/materials', icon: FileText, label: 'Materiales' },
    { to: '/dashboard/assignments', icon: ClipboardList, label: 'Tareas' },
    { to: '/dashboard/reports', icon: BarChart3, label: 'Reportes' },
    { to: '/dashboard/profile', icon: User, label: 'Mi Perfil' }
  ];

  return (
    <div className="min-h-screen bg-brand-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 ${collapsed ? 'w-16' : 'w-64'} bg-white shadow-lg border-r border-gray-200 transition-all duration-200`}>
        <div className="flex flex-col h-full">
          {/* Logo + Toggle Button */}
          <div className={`flex items-center border-b border-gray-200 bg-white transition-all duration-200 ${
            collapsed ? 'flex-col py-4' : 'py-6'
          }`}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                collapsed ? 'mb-2' : 'mr-4'
              }`}
              aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              {collapsed ? <ChevronRight className="w-5 h-5 text-brand-brown" /> : <ChevronLeft className="w-5 h-5 text-brand-brown" />}
            </button>
            <div className="flex items-center justify-center">
              <img 
                src={logohappy} 
                alt="Happy Tribe Logo" 
                className={`transition-all duration-200 ${
                  collapsed 
                    ? 'h-8 w-8' 
                    : 'h-16 w-auto'
                }`} 
              />
            </div>
          </div>

          {/* User Info */}
          <div className={`${collapsed ? 'px-2 py-4' : 'px-6 py-4'} border-b border-border`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
              <div className={`${collapsed ? 'w-12 h-12' : 'w-10 h-10'} ${collapsed ? 'bg-gray-200' : 'bg-success/20'} rounded-full flex items-center justify-center flex-shrink-0`}>
                <User className={`${collapsed ? 'w-8 h-8' : 'w-6 h-6 text-success'}`} />
              </div>
              {!collapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-text">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-text-secondary capitalize">
                    {user?.role === 'user' ? 'Usuario' : 
                     user?.role === 'coordinator' ? 'Coordinador' : 
                     user?.role === 'admin' ? 'Administrador' : user?.role}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? 'justify-center px-2 py-4' : 'px-3 py-2'} rounded-lg text-sm font-medium transition-colors group relative ${
                    isActive
                      ? 'bg-brand-green-light text-brand-green-medium'
                      : collapsed 
                        ? 'text-gray-800 hover:bg-gray-100'
                        : 'text-brand-brown hover:bg-gray-50 hover:text-brand-green-dark'
                  }`
                }
                title={collapsed ? item.label : ''}
              >
                <item.icon className={`${collapsed ? 'w-10 h-10 mr-0' : 'w-5 h-5 mr-3'}`} />
                {!collapsed && <span className="ml-3">{item.label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className={`px-4 py-4 border-t border-border ${collapsed ? 'px-2 py-4' : 'px-4 py-4'}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full ${collapsed ? 'justify-center px-2 py-4' : 'px-3 py-2'} text-sm font-medium ${collapsed ? 'text-gray-800 hover:bg-gray-100' : 'text-text-secondary hover:bg-border hover:text-text'} rounded-lg transition-colors group relative`}
              title={collapsed ? 'Cerrar Sesión' : ''}
            >
              <LogOut className={`${collapsed ? 'w-10 h-10 mr-0' : 'w-5 h-5 mr-3'}`} />
              {!collapsed && <span className="ml-3">Cerrar Sesión</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Cerrar Sesión
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${collapsed ? 'ml-16' : 'ml-64'} bg-brand-white min-h-screen transition-all duration-200`}>
        <main className="p-6">
          {/* Fondo y textos actualizados a la nueva paleta */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};