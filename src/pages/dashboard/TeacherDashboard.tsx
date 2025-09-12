import React, { useEffect, useState } from 'react';
import { Users, Calendar, FileText, Plus, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api';
import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  // const { t } = useTranslation();

  // Estados para datos reales
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  // Elimina el array dummy de recentStudents y usa estado
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [myStudentClasses, setMyStudentClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const loadTeacherData = async () => {
      try {
        setLoading(true);
        
        // Cargar datos en paralelo
        const [classesRes, assignmentsRes, studentClassesRes] = await Promise.all([
          apiClient.get('/api/classes'),
          apiClient.get('/api/assignments'),
          apiClient.get('/api/studentclasses')
        ]);
        
        // Filtrar clases del profesor
        const allClasses = classesRes.data || [];
        const teacherClasses = allClasses.filter((cls: any) => cls.teacherId === user.id);
        setMyClasses(teacherClasses);
        
        // Filtrar tareas del profesor
        const allAssignments = assignmentsRes.data || [];
        const teacherAssignments = allAssignments.filter((a: any) => a.teacherId === user.id);
        setPendingAssignments(teacherAssignments);
        
        console.log('All assignments:', allAssignments);
        console.log('Teacher assignments:', teacherAssignments);
        
        // Obtener estudiantes del profesor
        const allStudentClasses = studentClassesRes.data || [];
        const myClassIds = teacherClasses.map((cls: any) => cls.id);
        const filteredStudentClasses = allStudentClasses.filter((sc: any) =>
                myClassIds.includes(sc.classId)
              );
        setMyStudentClasses(filteredStudentClasses);
        
        console.log('Teacher classes:', teacherClasses);
        console.log('All student classes:', allStudentClasses);
        console.log('My student classes:', filteredStudentClasses);
        
              // Mapear a estudiantes únicos
              const studentsMap: { [id: string]: any } = {};
        filteredStudentClasses.forEach((sc: any) => {
          if (sc.student && !studentsMap[sc.student.id]) {
                  studentsMap[sc.student.id] = {
                    id: sc.student.id,
              name: `${sc.student.firstName} ${sc.student.lastName}`,
                    email: sc.student.email,
                    joinDate: sc.joinedAt,
              progress: Math.floor(Math.random() * 100), // Simulado por ahora
              classId: sc.classId
                  };
                }
              });
        
        console.log('Students map:', studentsMap);
        
              // Tomar los más recientes (por fecha de inscripción)
              const recent = Object.values(studentsMap)
                .sort((a: any, b: any) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
          .slice(0, 5);
        
        console.log('Recent students:', recent);
              setRecentStudents(recent);
        
      } catch (error: any) {
        console.error('Error loading teacher data:', error);
        
        // Si es error 403, redirigir a página de no autorizado
        if (error.response?.status === 403) {
          navigate('/unauthorized');
          return;
        }
        
        // En caso de otros errores, mostrar arrays vacíos
        setMyClasses([]);
        setPendingAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadTeacherData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">
            ¡Hola, {user?.firstName}! 👋
          </h1>
          <p className="text-text-secondary mt-1">
            Gestiona tus clases y estudiantes
          </p>
        </div>
        <Button className="flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Clase
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <Calendar className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-text">{myClasses.length}</h3>
          <p className="text-gray-600">Clases Activas</p>
        </Card>
        <Card className="text-center">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-text">
            {myClasses.reduce((total, cls) => total + (cls.students || 0), 0)}
          </h3>
          <p className="text-gray-600">Total Estudiantes</p>
        </Card>
        <Card className="text-center">
          <FileText className="w-8 h-8 text-orange-600 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-text">{pendingAssignments.length}</h3>
          <p className="text-gray-600">Tareas Pendientes</p>
        </Card>
        <Card className="text-center">
          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-text">87%</h3>
          <p className="text-gray-600">Satisfacción Promedio</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mis Clases */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-brand-brown">Mis Clases</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/dashboard/classes'}
                className="border-brand-green-medium text-brand-green-medium hover:bg-brand-green-light"
              >
                Ver Todas
              </Button>
            </div>
            <div className="space-y-4">
              {myClasses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No tienes clases asignadas aún</p>
                  <p className="text-sm">Contacta al administrador para obtener clases</p>
                </div>
              ) : (
                myClasses.map((cls) => {
                  const occupancyPercentage = cls.maxStudents ? Math.round(((cls.students || 0) / cls.maxStudents) * 100) : 0;
                  const isFull = occupancyPercentage >= 100;
                  const isAlmostFull = occupancyPercentage >= 80;
                  
                  return (
                    <div key={cls.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 bg-white">
                  <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-brand-brown text-lg">{cls.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isFull ? 'bg-red-100 text-red-800' : 
                            isAlmostFull ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {isFull ? 'Llena' : isAlmostFull ? 'Casi llena' : 'Disponible'}
                          </span>
                    <span className="text-sm text-gray-500">
                            {cls.students || 0} / {cls.maxStudents || '∞'} estudiantes
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-brand-green-medium" />
                          <span className="text-sm text-gray-600">
                            Horario: {cls.schedule || 'No definido'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-brand-green-medium" />
                          <span className="text-sm text-gray-600">
                            Próxima: {cls.nextClass || 'No programada'}
                    </span>
                  </div>
                  </div>

                      {/* Barra de ocupación mejorada */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 font-medium">Ocupación de la clase</span>
                          <span className="font-bold text-brand-brown">
                            {occupancyPercentage}%
                      </span>
                    </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              isFull ? 'bg-red-500' : 
                              isAlmostFull ? 'bg-yellow-500' : 
                              'bg-brand-green-medium'
                            }`}
                            style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                      {/* Información adicional */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-brand-green-medium" />
                          <span className="text-gray-600">
                            {cls.students || 0} estudiantes inscritos
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-brand-green-medium" />
                          <span className="text-gray-600">
                            Módulo: {cls.module?.title || 'Sin módulo'}
                          </span>
                        </div>
                      </div>

                      {/* Botones de acción */}
                  <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-brand-green-medium hover:bg-brand-green-dark text-white"
                          onClick={() => window.location.href = `/dashboard/classes/${cls.id}`}
                        >
                          Ver Detalle
                    </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-brand-green-medium text-brand-green-medium hover:bg-brand-green-light"
                          onClick={() => window.location.href = `/dashboard/students?class=${cls.id}`}
                        >
                          Gestionar Estudiantes
                    </Button>
                  </div>
                </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Tareas por Revisar */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-brand-brown">Mis Tareas</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/dashboard/assignments'}
                className="border-brand-green-medium text-brand-green-medium hover:bg-brand-green-light"
              >
                Ver Todas
              </Button>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-6 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green-medium mx-auto mb-2"></div>
                  <p className="text-sm">Cargando tareas...</p>
                </div>
              ) : pendingAssignments.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No tienes tareas asignadas aún</p>
                  <p className="text-xs">Las tareas aparecerán cuando las crees o te las asignen</p>
                </div>
              ) : (
                pendingAssignments.map((assignment) => {
                  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
                  const submissionRate = assignment.totalStudents > 0 ? 
                    Math.round((assignment.submissions || 0) / assignment.totalStudents * 100) : 0;
                  
                  return (
                    <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-brand-brown text-lg">{assignment.title || 'Tarea sin título'}</h3>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-brand-green-medium" />
                              <span className="text-sm text-gray-600">
                                Clase: {assignment.class?.title || assignment.className || 'Sin clase'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-brand-green-medium" />
                              <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                Vence: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No definido'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isOverdue && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Vencida
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            submissionRate >= 80 ? 'bg-green-100 text-green-800' :
                            submissionRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {submissionRate}% entregadas
                          </span>
                        </div>
                      </div>
                      
                      {/* Barra de progreso de entregas */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 font-medium">Entregas de estudiantes</span>
                          <span className="font-bold text-brand-brown">
                            {assignment.submissions || 0} / {assignment.totalStudents || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              submissionRate >= 80 ? 'bg-green-500' : 
                              submissionRate >= 50 ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(submissionRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Información adicional */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-brand-green-medium" />
                          <span className="text-gray-600">
                            {assignment.submissions || 0} entregas recibidas
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-brand-green-medium" />
                          <span className="text-gray-600">
                            {assignment.totalStudents || 0} estudiantes totales
                          </span>
                        </div>
                  </div>

                      {/* Botones de acción */}
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-brand-green-medium hover:bg-brand-green-dark text-white"
                          onClick={() => window.location.href = `/dashboard/assignments/${assignment.id}`}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Revisar Entregas
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-brand-green-medium text-brand-green-medium hover:bg-brand-green-light"
                          onClick={() => window.location.href = `/dashboard/assignments/${assignment.id}/edit`}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Editar
                    </Button>
                  </div>
                </div>
                  );
                })
              )}
            </div>
            {pendingAssignments.length > 0 && (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-4 border-brand-green-medium text-brand-green-medium hover:bg-brand-green-light"
                onClick={() => window.location.href = '/dashboard/assignments'}
              >
                Ver Todas las Tareas
              </Button>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mis Estudiantes */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-brown">Mis Estudiantes</h2>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.href = '/dashboard/students'}
                className="border-brand-green-medium text-brand-green-medium hover:bg-brand-green-light"
              >
                Ver Todos
              </Button>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-6 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green-medium mx-auto mb-2"></div>
                  <p className="text-sm">Cargando estudiantes...</p>
                </div>
              ) : recentStudents.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No tienes estudiantes asignados aún</p>
                  <p className="text-xs">Los estudiantes aparecerán cuando se inscriban a tus clases</p>
                  <div className="mt-3 text-xs text-gray-400">
                    <p>Clases del profesor: {myClasses.length}</p>
                    <p>Total de inscripciones: {myStudentClasses?.length || 0}</p>
                  </div>
                </div>
              ) : (
                recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-brand-green-light rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-brand-green-dark">
                          {student.name ? student.name.split(' ').map((n: string) => n[0]).join('') : '??'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-brand-brown text-sm">
                          {student.name || 'Estudiante sin nombre'}
                        </h3>
                        <p className="text-xs text-gray-600">{student.email || 'Sin email'}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-brand-green-medium h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${student.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{student.progress || 0}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {student.joinDate ? new Date(student.joinDate).toLocaleDateString() : 'N/A'}
                      </p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activo
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentStudents.length > 0 && (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-4 border-brand-green-medium text-brand-green-medium hover:bg-brand-green-light"
                onClick={() => window.location.href = '/dashboard/students'}
              >
                Ver Todos los Estudiantes
            </Button>
            )}
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <h2 className="text-xl font-bold text-brand-brown mb-4">Acciones Rápidas</h2>
            <div className="space-y-3">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start border-brand-green-medium text-brand-green-medium hover:bg-brand-green-light"
                onClick={() => window.location.href = '/dashboard/assignments/new'}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Tarea
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start border-brand-green-medium text-brand-green-medium hover:bg-brand-green-light"
                onClick={() => window.location.href = '/dashboard/materials'}
              >
                <FileText className="w-4 h-4 mr-2" />
                Subir Material
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start border-brand-green-medium text-brand-green-medium hover:bg-brand-green-light"
                onClick={() => window.location.href = '/dashboard/students'}
              >
                <Users className="w-4 h-4 mr-2" />
                Gestionar Estudiantes
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start border-brand-green-medium text-brand-green-medium hover:bg-brand-green-light"
                onClick={() => window.location.href = '/dashboard/modules/new'}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Crear Módulo
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start border-brand-green-medium text-brand-green-medium hover:bg-brand-green-light"
                onClick={() => window.location.href = '/dashboard/assignments/pending'}
              >
                <Clock className="w-4 h-4 mr-2" />
                Autorizar Entregas
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};