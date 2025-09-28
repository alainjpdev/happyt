import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Loading } from './ui/Loading';
import { getBackendURL } from '../config/environment';
import { useGoogleClassroom } from '../hooks/useGoogleUnified';
import '../styles/GoogleClassroom.css';
import { 
  GraduationCap, 
  ExternalLink, 
  Users, 
  BookOpen, 
  Plus, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Star
} from 'lucide-react';

interface GoogleStatus {
  connected: boolean;
  isExpired: boolean;
  expiresAt: string;
  scope: string;
}

interface Course {
  id: string;
  name: string;
  section: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode: string;
  courseState: string;
  alternateLink: string;
  teacherGroupEmail: string;
  courseGroupEmail: string;
}

interface AssignmentData {
  courseId: string;
  title: string;
  description: string;
  dueDate?: string;
  maxPoints?: number;
}

const GoogleClassroomIntegration: React.FC = () => {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<GoogleStatus | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Función para refrescar el token
  const refreshToken = async () => {
    try {
      console.log('🔄 Refrescando token...');
      const response = await fetch(`${getBackendURL()}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'admin123'
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        console.log('✅ Token refrescado exitosamente');
        return data.token;
      } else {
        console.error('❌ Error refrescando token');
        return null;
      }
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      return null;
    }
  };

  // Formulario para crear tarea
  const [assignmentForm, setAssignmentForm] = useState<AssignmentData>({
    courseId: '',
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100
  });
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

  useEffect(() => {
    // Verificar si hay parámetros de callback de Google Classroom
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const service = urlParams.get('service');
    const error = urlParams.get('error');

    if (success === 'true' && service === 'classroom') {
      // Si hay éxito en el callback, limpiar la URL y verificar estado
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        checkStatus();
      }, 1000);
    } else if (error === 'true') {
      // Si hay error en el callback, mostrarlo
      console.error('❌ Error en callback OAuth:', error);
      setError('Error de autorización con Google Classroom');
      setInitialLoading(false);
    } else {
      // Solo verificar el estado si hay un token
      const token = localStorage.getItem('token');
      if (token) {
        checkStatus();
      } else {
        setInitialLoading(false);
        setError('No hay token de autenticación. Por favor inicia sesión nuevamente.');
      }
    }
  }, []);

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setInitialLoading(false);
        return;
      }

      // Verificar estado de Google Classroom
      const response = await fetch(`${getBackendURL()}/api/google-classroom/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        
        // Si el token es inválido, intentar refrescarlo
        if (errorData.error === 'Token inválido' || response.status === 403) {
          const newToken = await refreshToken();
          if (newToken) {
            // Reintentar la llamada con el nuevo token
            const retryResponse = await fetch(`${getBackendURL()}/api/google-classroom/status`, {
              headers: {
                'Authorization': `Bearer ${newToken}`
              }
            });
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              setStatus(retryData);
              setError(null);
              return;
            }
          }
        }
        
        setError(`Error al verificar el estado: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('❌ Error checking status:', error);
      setError('Error de conexión al verificar el estado');
    } finally {
      setInitialLoading(false);
    }
  };

  const connectGoogle = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No hay token de autenticación. Por favor inicia sesión nuevamente.');
        return;
      }

      const response = await fetch(`${getBackendURL()}/api/google-classroom/auth-url`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        
        // Si el token es inválido, intentar refrescarlo
        if (errorData.error === 'Token inválido' || response.status === 403) {
          const newToken = await refreshToken();
          if (newToken) {
            // Reintentar la llamada con el nuevo token
            const retryResponse = await fetch(`${getBackendURL()}/api/google-classroom/auth-url`, {
              headers: {
                'Authorization': `Bearer ${newToken}`
              }
            });
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              window.location.href = retryData.authUrl;
              return;
            }
          }
        }
        
        setError(`Error al obtener URL de autorización: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('❌ Error getting auth URL:', error);
      setError('Error de conexión al obtener URL de autorización');
    }
  };

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${getBackendURL()}/api/google-classroom/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
        setSuccess('Cursos cargados exitosamente');
      } else {
        setError('Error al cargar los cursos');
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setError('Error de conexión al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async () => {
    if (!assignmentForm.courseId || !assignmentForm.title || !assignmentForm.description) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Necesitamos obtener el classId de HappyTribe que corresponde al curso
      // Por ahora usaremos un ID de ejemplo, pero esto debería venir de la sincronización
      const classId = 'example-class-id'; // Esto debería ser dinámico

      const response = await fetch(`${getBackendURL()}/api/google-classroom/create-assignment/${classId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess('Tarea creada exitosamente en Google Classroom');
        setShowAssignmentForm(false);
        setAssignmentForm({
          courseId: '',
          title: '',
          description: '',
          dueDate: '',
          maxPoints: 100
        });
      } else {
        setError('Error al crear la tarea');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      setError('Error de conexión al crear tarea');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <Loading />
          <p className="mt-4 text-brand-brown-light">Verificando conexión con Google Classroom...</p>
        </Card>
      </div>
    );
  }

  console.log('🔍 Estado del componente:', { status, connected: status?.connected, loading: initialLoading });
  
  if (!status?.connected) {
    const token = localStorage.getItem('token');
    console.log('🔍 Mostrando vista de conexión. Token:', token ? 'SÍ' : 'NO');
    
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <GraduationCap className="w-16 h-16 text-brand-green-medium mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-brand-brown mb-2">
              Conectar con Google Classroom
            </h2>
            <p className="text-brand-brown-light">
              Necesitas conectar tu cuenta de Google Classroom para sincronizar datos y gestionar cursos.
            </p>
          </div>
          
          {!token ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">
                No estás autenticado. Por favor inicia sesión primero.
              </p>
            </div>
          ) : (
            <Button 
              onClick={connectGoogle}
              className="bg-brand-green-medium hover:bg-brand-green-dark text-white px-6 py-3 rounded-lg font-medium"
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Conectar con Google Classroom
            </Button>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-brown flex items-center">
            <GraduationCap className="w-8 h-8 mr-3 text-brand-green-medium" />
            Google Classroom
          </h1>
          <p className="text-brand-brown-light mt-1">
            Gestiona tus cursos y tareas de Google Classroom
          </p>
        </div>
        <Button 
          onClick={checkStatus}
          className="bg-brand-green-light hover:bg-brand-green-medium text-brand-green-dark"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar Estado
        </Button>
      </div>

      {/* Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
            <div>
              <h3 className="font-semibold text-brand-brown">Conectado a Google Classroom</h3>
              <p className="text-sm text-brand-brown-light">
                Expira: {formatDate(status.expiresAt)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Activo
            </span>
          </div>
        </div>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={loadCourses}
          disabled={loading}
          className="bg-brand-green-medium hover:bg-brand-green-dark text-white"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          {loading ? 'Cargando...' : 'Cargar Cursos'}
        </Button>
        
        <Button 
          onClick={() => setShowAssignmentForm(!showAssignmentForm)}
          className="bg-brand-blue-medium hover:bg-brand-blue-dark text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Tarea
        </Button>
      </div>

      {/* Assignment Form */}
      {showAssignmentForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-brand-brown mb-4">Crear Nueva Tarea</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-brown mb-2">
                Curso
              </label>
              <select
                value={assignmentForm.courseId}
                onChange={(e) => setAssignmentForm({...assignmentForm, courseId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-medium focus:border-transparent"
              >
                <option value="">Selecciona un curso</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} - {course.section}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-brown mb-2">
                Título de la Tarea
              </label>
              <input
                type="text"
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-medium focus:border-transparent"
                placeholder="Ingresa el título de la tarea"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-brown mb-2">
                Descripción
              </label>
              <textarea
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-medium focus:border-transparent"
                placeholder="Describe la tarea..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-brown mb-2">
                  Fecha de Vencimiento
                </label>
                <input
                  type="datetime-local"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({...assignmentForm, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-medium focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-brand-brown mb-2">
                  Puntos Máximos
                </label>
                <input
                  type="number"
                  value={assignmentForm.maxPoints}
                  onChange={(e) => setAssignmentForm({...assignmentForm, maxPoints: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-medium focus:border-transparent"
                  min="1"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                onClick={() => setShowAssignmentForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancelar
              </Button>
              <Button 
                onClick={createAssignment}
                disabled={loading}
                className="bg-brand-green-medium hover:bg-brand-green-dark text-white"
              >
                {loading ? 'Creando...' : 'Crear Tarea'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Courses List */}
      {courses.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-brand-brown mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Cursos Disponibles ({courses.length})
          </h3>
          <div className="grid gap-4">
            {courses.map(course => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-brand-brown text-lg">{course.name}</h4>
                    <p className="text-brand-brown-light text-sm mb-2">{course.section}</p>
                    <div className="flex items-center space-x-4 text-sm text-brand-brown-light">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Creado: {formatDate(course.creationTime)}
                      </span>
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Estado: {course.courseState}
                      </span>
                    </div>
                    <p className="text-xs text-brand-brown-light mt-2">
                      Código de inscripción: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{course.enrollmentCode}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={course.alternateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-brand-green-light text-brand-green-dark rounded-lg hover:bg-brand-green-medium hover:text-white transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Abrir
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {loading && <Loading />}
    </div>
  );
};

export default GoogleClassroomIntegration;
