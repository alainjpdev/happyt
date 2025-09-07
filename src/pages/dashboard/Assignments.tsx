import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api';
import { ClipboardList, Calendar, CheckCircle, Clock } from 'lucide-react';

const Assignments: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/assignments');
        setAssignments(response.data || []);
      } catch (error) {
        console.error('Error loading assignments:', error);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  // Filtrar tareas para estudiantes (solo las que les corresponden)
  const studentAssignments = user?.role === 'student' 
    ? assignments.filter(a => a.studentId === user.id || !a.studentId) // Tareas asignadas al estudiante o generales
    : assignments;

  // Calcular estadísticas
  const completedAssignments = studentAssignments.filter(a => a.status === 'completed').length;
  const pendingAssignments = studentAssignments.filter(a => a.status === 'pending' || !a.status).length;
  const overdueAssignments = studentAssignments.filter(a => {
    if (!a.dueDate) return false;
    return new Date(a.dueDate) < new Date() && a.status !== 'completed';
  }).length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-brand-brown mb-6">
        {user?.role === 'student' ? 'Mis Tareas' : t('adminDashboard.allAssignments', 'Todas las Tareas')}
      </h1>

      {/* Estadísticas para estudiantes */}
      {user?.role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="text-center">
            <CheckCircle className="w-8 h-8 text-brand-green-medium mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-brand-brown">{completedAssignments}</h3>
            <p className="text-gray-600">Completadas</p>
          </Card>
          <Card className="text-center">
            <Clock className="w-8 h-8 text-brand-green-light mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-brand-brown">{pendingAssignments}</h3>
            <p className="text-gray-600">Pendientes</p>
          </Card>
          <Card className="text-center">
            <Calendar className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-brand-brown">{overdueAssignments}</h3>
            <p className="text-gray-600">Vencidas</p>
          </Card>
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-text">Título</th>
                <th className="text-left py-3 px-4 font-medium text-text">Descripción</th>
                <th className="text-left py-3 px-4 font-medium text-text">Clase</th>
                <th className="text-left py-3 px-4 font-medium text-text">Fecha Entrega</th>
                {user?.role === 'student' && (
                  <th className="text-left py-3 px-4 font-medium text-text">Estado</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={user?.role === 'student' ? 5 : 4} className="py-6 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : studentAssignments.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'student' ? 5 : 4} className="py-6 text-center text-gray-500">
                    {user?.role === 'student' ? 'No tienes tareas asignadas' : 'No hay tareas'}
                  </td>
                </tr>
              ) : (
                studentAssignments.map(a => {
                  const isOverdue = a.dueDate && new Date(a.dueDate) < new Date() && a.status !== 'completed';
                  const isCompleted = a.status === 'completed';
                  
                  return (
                    <tr key={a.id} className={`border-b border-gray-100 hover:bg-gray-50 ${
                      isOverdue ? 'bg-red-50' : isCompleted ? 'bg-green-50' : ''
                    }`}>
                      <td className="py-3 px-4 font-medium">{a.title}</td>
                      <td className="py-3 px-4">{a.description}</td>
                      <td className="py-3 px-4">{a.class?.title || a.classId || '-'}</td>
                      <td className={`py-3 px-4 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                        {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'Sin fecha'}
                      </td>
                      {user?.role === 'student' && (
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isCompleted 
                              ? 'bg-green-100 text-green-800' 
                              : isOverdue 
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isCompleted ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completada
                              </>
                            ) : isOverdue ? (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Vencida
                              </>
                            ) : (
                              <>
                                <ClipboardList className="w-3 h-3 mr-1" />
                                Pendiente
                              </>
                            )}
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Assignments; 