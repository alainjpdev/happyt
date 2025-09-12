import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Loading } from '../../components/ui/Loading';
import { useToastNotifications } from '../../components/ui/Toast';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen,
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  BarChart3
} from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  moduleTitle: string;
  duration: number; // en minutos
  totalQuestions: number;
  passingScore: number;
  isActive: boolean;
  attempts: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
}

export const Quiz: React.FC = () => {
  const { user } = useAuthStore();
  const { showToast } = useToastNotifications();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>('');
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moduleId: '',
    duration: 30,
    totalQuestions: 5,
    passingScore: 60,
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizzesRes, modulesRes] = await Promise.all([
        apiClient.get('/api/quiz'),
        apiClient.get('/api/modules')
      ]);
      
      setQuizzes(quizzesRes.data || []);
      setModules(modulesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.moduleId) {
      showToast('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    try {
      setSaving(true);
      
      if (editingQuiz) {
        await apiClient.put(`/api/quiz/${editingQuiz.id}`, formData);
        showToast('Cuestionario actualizado correctamente', 'success');
      } else {
        await apiClient.post('/api/quiz', formData);
        showToast('Cuestionario creado correctamente', 'success');
      }
      
      setShowModal(false);
      setEditingQuiz(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      showToast(error.response?.data?.message || 'Error al guardar el cuestionario', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      moduleId: quiz.moduleId,
      duration: quiz.duration,
      totalQuestions: quiz.totalQuestions,
      passingScore: quiz.passingScore,
      isActive: quiz.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (quizId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cuestionario?')) return;

    try {
      setSaving(true);
      await apiClient.delete(`/api/quiz/${quizId}`);
      showToast('Cuestionario eliminado correctamente', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error deleting quiz:', error);
      showToast(error.response?.data?.message || 'Error al eliminar el cuestionario', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      moduleId: '',
      duration: 30,
      totalQuestions: 5,
      passingScore: 60,
      isActive: true
    });
  };

  const openModal = () => {
    setEditingQuiz(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQuiz(null);
    resetForm();
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.moduleTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (quiz: Quiz) => {
    if (!quiz.isActive) return <XCircle className="w-5 h-5 text-red-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusText = (quiz: Quiz) => {
    return quiz.isActive ? 'Activo' : 'Inactivo';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <Loading type="skeleton" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand-brown">Gestión de Cuestionarios</h1>
          <p className="text-brand-green-medium mt-2">Administra los cuestionarios interactivos del sistema</p>
        </div>
        <Button onClick={openModal} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Cuestionario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cuestionarios</p>
              <p className="text-2xl font-bold text-brand-brown">{quizzes.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-brand-brown">
                {quizzes.filter(q => q.isActive).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Play className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Intentos</p>
              <p className="text-2xl font-bold text-brand-brown">
                {quizzes.reduce((acc, quiz) => acc + quiz.attempts, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio General</p>
              <p className="text-2xl font-bold text-brand-brown">
                {quizzes.length > 0 ? Math.round(quizzes.reduce((acc, quiz) => acc + quiz.averageScore, 0) / quizzes.length) : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar cuestionarios por título o módulo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-medium focus:border-transparent"
            >
              <option value="">Todos los módulos</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Quizzes Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Título</th>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Módulo</th>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Duración</th>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Preguntas</th>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Intentos</th>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Promedio</th>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes
                .filter(quiz => !selectedModule || quiz.moduleId === selectedModule)
                .map((quiz) => (
                <tr key={quiz.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-brand-brown">{quiz.title}</p>
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {quiz.description}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-green-light text-brand-green-dark">
                      {quiz.moduleTitle}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {quiz.duration} min
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {quiz.totalQuestions}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {quiz.attempts}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${getScoreColor(quiz.averageScore)}`}>
                      {quiz.averageScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {getStatusIcon(quiz)}
                      <span className="ml-2 text-sm text-gray-600">
                        {getStatusText(quiz)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(quiz)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(quiz.id)}
                        className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay cuestionarios disponibles</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer cuestionario'}
            </p>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingQuiz ? 'Editar Cuestionario' : 'Nuevo Cuestionario'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Título del Cuestionario *"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ej: Quiz de Repaso de Historia"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-brown mb-2">
                Módulo *
              </label>
              <select
                value={formData.moduleId}
                onChange={(e) => setFormData({...formData, moduleId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-medium focus:border-transparent"
                required
              >
                <option value="">Selecciona un módulo</option>
                {modules.map(module => (
                  <option key={module.id} value={module.id}>
                    {module.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Input
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descripción del cuestionario..."
              multiline
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="Duración (minutos)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 30})}
                min="1"
                max="120"
              />
            </div>
            <div>
              <Input
                label="Total de Preguntas"
                type="number"
                value={formData.totalQuestions}
                onChange={(e) => setFormData({...formData, totalQuestions: parseInt(e.target.value) || 5})}
                min="1"
                max="50"
              />
            </div>
            <div>
              <Input
                label="Puntaje Mínimo (%)"
                type="number"
                value={formData.passingScore}
                onChange={(e) => setFormData({...formData, passingScore: parseInt(e.target.value) || 60})}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-brand-green-medium focus:ring-brand-green-medium border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Cuestionario activo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving && <Loading type="spinner" size="sm" />}
              {editingQuiz ? 'Actualizar' : 'Crear'} Cuestionario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
