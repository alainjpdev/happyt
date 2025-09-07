import React, { useEffect, useState } from 'react';
import { BookOpen, Calendar, ClipboardList, Trophy, Clock, CheckCircle, Star, Target, TrendingUp, Award } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
// import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import useAutoTranslate from '../../hooks/useAutoTranslate';
import { Loading, SkeletonCard } from '../../components/ui/Loading';
import { useToastNotifications } from '../../components/ui/Toast';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  // const { t, i18n } = useTranslation();
  const { showSuccess, showError } = useToastNotifications();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [allModules, setAllModules] = useState<any[]>([]);
  const [accessedModuleIds, setAccessedModuleIds] = useState<string[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    const loadStudentData = async () => {
      try {
        setLoading(true);
        
        // Cargar datos en paralelo
        const [modulesRes, assignmentsRes, classesRes] = await Promise.all([
          apiClient.get(`/api/users/${user.id}/modules`),
          apiClient.get('/api/assignments'),
          apiClient.get('/api/classes')
        ]);
        
        setModules(modulesRes.data || []);
        setAssignments(assignmentsRes.data || []);
        setUpcomingClasses(classesRes.data?.slice(0, 3) || []);
        
        // Cargar actividad reciente (simulado)
        setRecentActivity([
          { id: 1, type: 'module_completed', title: 'Módulo de Matemáticas', date: new Date(), icon: CheckCircle },
          { id: 2, type: 'assignment_submitted', title: 'Tarea de Lectura', date: new Date(), icon: ClipboardList },
          { id: 3, type: 'class_attended', title: 'Clase de Ciencias', date: new Date(), icon: Calendar }
        ]);
        
        // Cargar logros (simulado)
        setAchievements([
          { id: 1, title: 'Primer Módulo', description: 'Completaste tu primer módulo', icon: Star, earned: true },
          { id: 2, title: 'Estudiante Dedicado', description: '5 días consecutivos de estudio', icon: Trophy, earned: true },
          { id: 3, title: 'Explorador', description: 'Accediste a 3 módulos diferentes', icon: Target, earned: false }
        ]);
        
        // Obtener módulos accedidos
        const accessed = JSON.parse(localStorage.getItem(`accessedModules_${user?.id}`) || '[]');
        setAccessedModuleIds(accessed);
        
      } catch (error: any) {
        console.error('Error loading student data:', error);
        
        // Si es error 403, redirigir a página de no autorizado
        if (error.response?.status === 403) {
          navigate('/unauthorized');
          return;
        }
        
        showError('Error al cargar datos', 'No se pudieron cargar los datos del estudiante');
      } finally {
        setLoading(false);
      }
    };
    
    loadStudentData();
  }, [user, showError, navigate]);

  // Calcular estadísticas educativas
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const totalAssignments = assignments.length;
  const assignmentProgress = totalAssignments === 0 ? 0 : Math.round((completedAssignments / totalAssignments) * 100);
  
  const completedModules = modules.filter(m => m.status === 'completed').length;
  const totalModules = modules.length;
  const moduleProgress = totalModules === 0 ? 0 : Math.round((completedModules / totalModules) * 100);
  
  const earnedAchievements = achievements.filter(a => a.earned).length;
  const totalAchievements = achievements.length;
  const achievementProgress = totalAchievements === 0 ? 0 : Math.round((earnedAchievements / totalAchievements) * 100);
  
  // Calcular nivel del estudiante basado en progreso
  const studentLevel = Math.floor((moduleProgress + assignmentProgress + achievementProgress) / 30) + 1;

  const TranslatedModuleCard: React.FC<{ module: any }> = ({ module }) => {
    const translatedTitle = module.title; // useAutoTranslate(module.title, 'es', 'es');
    const translatedDescription = module.description; // useAutoTranslate(module.description, 'es', 'es');
    const isCompleted = module.status === 'completed';
    const isAccessed = accessedModuleIds.includes(module.id);
    
    const handleModuleAccess = () => {
      if (!isAccessed) {
        const newAccessed = [...accessedModuleIds, module.id];
        setAccessedModuleIds(newAccessed);
        localStorage.setItem(`accessedModules_${user?.id}`, JSON.stringify(newAccessed));
        showSuccess('¡Módulo accedido!', `Has comenzado el módulo: ${translatedTitle}`);
      }
    };
    
    return (
      <div className={`p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 bg-white ${
        isCompleted ? 'border-brand-green-medium bg-green-50' : ''
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-brand-brown">{translatedTitle}</h3>
          {isCompleted && <CheckCircle className="w-5 h-5 text-brand-green-medium" />}
        </div>
        <p className="text-gray-600 text-sm mb-3">{translatedDescription}</p>
        
        {/* Barra de progreso */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progreso</span>
            <span>{module.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-brand-green-medium h-2 rounded-full transition-all duration-300"
              style={{ width: `${module.progress || 0}%` }}
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            onClick={handleModuleAccess}
            className="bg-brand-green-medium hover:bg-brand-green-dark"
          >
            {isAccessed ? 'Continuar' : 'Comenzar'}
          </Button>
          {module.url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(module.url, '_blank')}
            >
              Ver Material
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-brown">
            ¡Hola, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Continúa tu viaje de aprendizaje
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-gradient-to-r from-brand-green-light to-brand-green-medium p-4 rounded-lg">
          <Trophy className="w-8 h-8 text-white" />
          <div>
            <div className="text-white font-bold text-lg">Nivel {studentLevel}</div>
            <div className="text-white text-sm opacity-90">Estudiante Happy Tribe</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center hover:shadow-lg transition-shadow">
          <BookOpen className="w-8 h-8 text-brand-green-medium mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-brand-brown">{totalModules}</h3>
          <p className="text-gray-600">Módulos Activos</p>
          <div className="mt-2 text-sm text-brand-green-medium">
            {moduleProgress}% completado
          </div>
        </Card>
        
        <Card className="text-center hover:shadow-lg transition-shadow">
          <ClipboardList className="w-8 h-8 text-brand-green-medium mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-brand-brown">{totalAssignments}</h3>
          <p className="text-gray-600">Tareas Asignadas</p>
          <div className="mt-2 text-sm text-brand-green-medium">
            {completedAssignments} completadas
          </div>
        </Card>
        
        <Card className="text-center hover:shadow-lg transition-shadow">
          <Award className="w-8 h-8 text-brand-green-medium mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-brand-brown">{earnedAchievements}</h3>
          <p className="text-gray-600">Logros Obtenidos</p>
          <div className="mt-2 text-sm text-brand-green-medium">
            {achievementProgress}% del total
          </div>
        </Card>
        
        <Card className="text-center hover:shadow-lg transition-shadow">
          <TrendingUp className="w-8 h-8 text-brand-green-medium mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-brand-brown">{user?.hours ?? 0}</h3>
          <p className="text-gray-600">Horas de Estudio</p>
          <div className="mt-2 text-sm text-brand-green-medium">
            Este mes
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Módulos */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-brand-brown">Mis Módulos</h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/modules')}>
                Ver Todos
              </Button>
            </div>
            <div className="space-y-4">
              {modules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No tienes módulos asignados aún</p>
                  <p className="text-sm">Contacta a tu profesor para obtener acceso</p>
                </div>
              ) : (
                modules.map((module) => (
                  <TranslatedModuleCard key={module.id} module={module} />
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actividad Reciente */}
          <Card>
            <h2 className="text-xl font-bold text-brand-brown mb-4">Actividad Reciente</h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <IconComponent className="w-5 h-5 text-brand-green-medium" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-brand-brown">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Logros */}
          <Card>
            <h2 className="text-xl font-bold text-brand-brown mb-4">Logros</h2>
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <div key={achievement.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                    achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      achievement.earned ? 'text-brand-green-medium' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        achievement.earned ? 'text-brand-brown' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </p>
                      <p className="text-xs text-gray-500">{achievement.description}</p>
                    </div>
                    {achievement.earned && <CheckCircle className="w-4 h-4 text-brand-green-medium" />}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Próximas Clases */}
          <Card>
            <h2 className="text-xl font-bold text-brand-brown mb-4">Próximas Clases</h2>
            <div className="space-y-3">
              {upcomingClasses.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No hay clases programadas</p>
                </div>
              ) : (
                upcomingClasses.map((classItem) => (
                  <div key={classItem.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-brand-brown">{classItem.title}</p>
                      <p className="text-xs text-gray-500">{classItem.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};