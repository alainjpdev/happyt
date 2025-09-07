import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = ''
}) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {/* Home */}
        <li className="inline-flex items-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm font-medium text-brand-brown hover:text-brand-green-medium"
          >
            <Home className="w-4 h-4 mr-2" />
            Inicio
          </Link>
        </li>

        {/* Breadcrumb items */}
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              {item.href && !item.current ? (
                <Link
                  to={item.href}
                  className="ml-1 text-sm font-medium text-brand-brown hover:text-brand-green-medium md:ml-2"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`ml-1 text-sm font-medium ${
                    item.current
                      ? 'text-brand-green-medium'
                      : 'text-gray-500'
                  } md:ml-2`}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Hook para generar breadcrumbs automáticamente
export const useBreadcrumbs = (pathname: string) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs: BreadcrumbItem[] = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;
    
    // Mapear segmentos a labels legibles
    const labelMap: { [key: string]: string } = {
      'dashboard': 'Panel de Control',
      'users': 'Usuarios',
      'classes': 'Clases',
      'modules': 'Módulos',
      'materials': 'Materiales',
      'assignments': 'Tareas',
      'students': 'Estudiantes',
      'reports': 'Reportes',
      'settings': 'Configuración',
      'profile': 'Perfil',
      'studentclasses': 'Inscripciones'
    };

    return {
      label: labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: isLast ? undefined : href,
      current: isLast
    };
  });

  return breadcrumbs;
};
