import React, { useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  FileText, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  LogOut,
  Plus
} from 'lucide-react';
import { useGoogleClassroom } from '../hooks/useGoogleClassroom';

interface GoogleClassroomIntegrationProps {
  onSyncComplete?: (data: any) => void;
}

export const GoogleClassroomIntegration: React.FC<GoogleClassroomIntegrationProps> = ({ 
  onSyncComplete 
}) => {
  const {
    isAuthenticated,
    isLoading,
    classes,
    selectedClass,
    students,
    assignments,
    error,
    authenticate,
    loadClasses,
    selectClass,
    syncClass,
    syncStudents,
    syncAssignments,
    syncAll,
    logout,
    clearError
  } = useGoogleClassroom();

  // Cargar clases cuando se autentica
  useEffect(() => {
    if (isAuthenticated && classes.length === 0) {
      loadClasses();
    }
  }, [isAuthenticated, classes.length, loadClasses]);

  // Manejar callback de autenticación desde URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state === 'google_classroom') {
      handleAuthCallback(code);
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleAuthCallback = async (code: string) => {
    // Esta función se implementaría para manejar el callback
    console.log('Auth callback received:', code);
  };

  const handleSyncAll = async () => {
    if (!selectedClass) return;
    
    const result = await syncAll(selectedClass.id);
    if (result && onSyncComplete) {
      onSyncComplete({
        class: selectedClass,
        students: students.length,
        assignments: assignments.length
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Conectar con Google Classroom
          </h3>
          <p className="text-gray-600 mb-6">
            Sincroniza tus clases, estudiantes y tareas de Google Classroom con Happy Tribe
          </p>
          <button
            onClick={authenticate}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Conectar con Google Classroom
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Google Classroom Conectado
              </h3>
              <p className="text-sm text-gray-600">
                {classes.length} clases disponibles
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Desconectar
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Classes List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Clases de Google Classroom</h4>
          <p className="text-sm text-gray-600">Selecciona una clase para sincronizar</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedClass?.id === classItem.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => selectClass(classItem.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{classItem.name}</h5>
                  {classItem.description && (
                    <p className="text-sm text-gray-600 mt-1">{classItem.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {classItem.section || 'Sin sección'}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {classItem.courseState}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={`https://classroom.google.com/c/${classItem.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {selectedClass?.id === classItem.id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Class Details */}
      {selectedClass && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">
              {selectedClass.name}
            </h4>
            <p className="text-sm text-gray-600">
              {students.length} estudiantes • {assignments.length} tareas
            </p>
          </div>

          <div className="p-6">
            {/* Sync Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => syncClass(selectedClass.id)}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Sincronizar Clase
              </button>
              
              <button
                onClick={() => syncStudents(selectedClass.id)}
                disabled={isLoading || students.length === 0}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Sincronizar Estudiantes ({students.length})
              </button>
              
              <button
                onClick={() => syncAssignments(selectedClass.id)}
                disabled={isLoading || assignments.length === 0}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                Sincronizar Tareas ({assignments.length})
              </button>
              
              <button
                onClick={handleSyncAll}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar Todo
              </button>
            </div>

            {/* Students Preview */}
            {students.length > 0 && (
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 mb-3">Estudiantes</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {students.slice(0, 6).map((student) => (
                    <div key={student.userId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {student.profile.name.givenName[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {student.profile.name.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {student.profile.emailAddress}
                        </p>
                      </div>
                    </div>
                  ))}
                  {students.length > 6 && (
                    <div className="flex items-center justify-center p-3 bg-gray-100 rounded-lg">
                      <span className="text-sm text-gray-500">
                        +{students.length - 6} más
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assignments Preview */}
            {assignments.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Tareas</h5>
                <div className="space-y-2">
                  {assignments.slice(0, 5).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {assignment.title}
                        </p>
                        {assignment.dueDate && (
                          <p className="text-xs text-gray-500">
                            Vence: {new Date(
                              assignment.dueDate.year,
                              assignment.dueDate.month - 1,
                              assignment.dueDate.day
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          assignment.state === 'PUBLISHED' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {assignment.state}
                        </span>
                        {assignment.alternateLink && (
                          <a
                            href={assignment.alternateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {assignments.length > 5 && (
                    <div className="text-center py-2">
                      <span className="text-sm text-gray-500">
                        +{assignments.length - 5} tareas más
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
