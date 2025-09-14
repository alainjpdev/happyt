import React from 'react';
import { GoogleClassroomIntegration } from '../../components/GoogleClassroomIntegration';
import { Card } from '../../components/ui/Card';
import { BookOpen, Users, FileText, RefreshCw } from 'lucide-react';

export const GoogleClassroom: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">
            Google Classroom Integration 🎓
          </h1>
          <p className="text-text-secondary mt-1">
            Sincroniza tus clases, estudiantes y tareas de Google Classroom con Happy Tribe
          </p>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center p-6">
          <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sincronizar Clases</h3>
          <p className="text-gray-600 text-sm">
            Importa todas tus clases de Google Classroom automáticamente
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestionar Estudiantes</h3>
          <p className="text-gray-600 text-sm">
            Sincroniza listas de estudiantes y sus datos de contacto
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Importar Tareas</h3>
          <p className="text-gray-600 text-sm">
            Trae todas las tareas y asignaciones de Google Classroom
          </p>
        </Card>
      </div>

      {/* Integration Component */}
      <GoogleClassroomIntegration 
        onSyncComplete={(data) => {
          console.log('Sincronización completada:', data);
          // Aquí podrías mostrar una notificación de éxito
        }}
      />

      {/* Instructions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cómo usar la integración
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Conectar con Google Classroom</h4>
                <p className="text-sm text-gray-600">
                  Haz clic en "Conectar con Google Classroom" y autoriza el acceso a tu cuenta
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-blue-600">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Seleccionar una clase</h4>
                <p className="text-sm text-gray-600">
                  Elige la clase que quieres sincronizar desde la lista de clases disponibles
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-blue-600">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Sincronizar datos</h4>
                <p className="text-sm text-gray-600">
                  Usa los botones de sincronización para importar clases, estudiantes y tareas
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-blue-600">4</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Gestionar en Happy Tribe</h4>
                <p className="text-sm text-gray-600">
                  Una vez sincronizados, podrás gestionar todos los datos desde Happy Tribe
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Benefits */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Beneficios de la integración
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-700">Sincronización automática</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-700">Gestión centralizada de estudiantes</span>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-700">Importación de tareas existentes</span>
            </div>
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-700">Estructura de clases organizada</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
