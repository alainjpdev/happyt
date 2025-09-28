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
  FileCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  ExternalLink
} from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  moduleTitle: string;
  duration: number; // en minutos
  totalQuestions: number;
  passingScore: number;
  isActive: boolean;
  youtubeVideoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
}

export const Exams: React.FC = () => {
  const { user } = useAuthStore();
  const { showToast } = useToastNotifications();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>('');
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moduleId: '',
    duration: 60,
    totalQuestions: 10,
    passingScore: 70,
    isActive: true,
    youtubeVideoUrl: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Solo cargar módulos ya que no existe endpoint de exámenes
      const modulesRes = await apiClient.get('/api/modules');
      setModules(modulesRes.data || []);
      
      // Los exámenes se manejan localmente por ahora
      setExams([]);
      
      console.log('📚 Módulos cargados para exámenes:', modulesRes.data?.length || 0);
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
      
      if (editingExam) {
        await apiClient.put(`/api/exams/${editingExam.id}`, formData);
        showToast('Examen actualizado correctamente', 'success');
      } else {
        await apiClient.post('/api/exams', formData);
        showToast('Examen creado correctamente', 'success');
      }
      
      setShowModal(false);
      setEditingExam(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving exam:', error);
      showToast(error.response?.data?.message || 'Error al guardar el examen', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      description: exam.description,
      moduleId: exam.moduleId,
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      passingScore: exam.passingScore,
      isActive: exam.isActive,
      youtubeVideoUrl: exam.youtubeVideoUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (examId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este examen?')) return;

    try {
      setSaving(true);
      await apiClient.delete(`/api/exams/${examId}`);
      showToast('Examen eliminado correctamente', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error deleting exam:', error);
      showToast(error.response?.data?.message || 'Error al eliminar el examen', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      moduleId: '',
      duration: 60,
      totalQuestions: 10,
      passingScore: 70,
      isActive: true,
      youtubeVideoUrl: ''
    });
  };

  const openModal = () => {
    setEditingExam(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExam(null);
    resetForm();
  };

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.moduleTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (exam: Exam) => {
    if (!exam.isActive) return <XCircle className="w-5 h-5 text-red-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusText = (exam: Exam) => {
    return exam.isActive ? 'Activo' : 'Inactivo';
  };

  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  if (loading) {
    return <Loading type="skeleton" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand-brown">Gestión de Exámenes</h1>
          <p className="text-brand-green-medium mt-2">Administra los exámenes del sistema educativo</p>
        </div>
        <Button onClick={openModal} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Examen
        </Button>
      </div>

      {/* En Desarrollo Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
        <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
        <div>
          <h3 className="font-semibold text-yellow-800">🚧 Funcionalidad en Desarrollo</h3>
          <p className="text-yellow-700 text-sm mt-1">
            La gestión de exámenes está siendo desarrollada. Pronto podrás crear, editar y administrar exámenes del sistema.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Exámenes</p>
              <p className="text-2xl font-bold text-brand-brown">{exams.length}</p>
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
                {exams.filter(e => e.isActive).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Módulos</p>
              <p className="text-2xl font-bold text-brand-brown">{modules.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio Preguntas</p>
              <p className="text-2xl font-bold text-brand-brown">
                {exams.length > 0 ? Math.round(exams.reduce((acc, exam) => acc + exam.totalQuestions, 0) / exams.length) : 0}
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
                placeholder="Buscar exámenes por título o módulo..."
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

      {/* Exams Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Título</th>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Módulo</th>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Video</th>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Duración</th>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Preguntas</th>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Puntaje Mínimo</th>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-brand-brown">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams
                .filter(exam => !selectedModule || exam.moduleId === selectedModule)
                .map((exam) => (
                <tr key={exam.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-brand-brown">{exam.title}</p>
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {exam.description}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-green-light text-brand-green-dark">
                      {exam.moduleTitle}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {exam.youtubeVideoUrl ? (
                      <div className="flex items-center space-x-2">
                        <div className="relative group">
                          <img 
                            src={getYouTubeThumbnail(exam.youtubeVideoUrl)} 
                            alt="Video thumbnail"
                            className="w-16 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(exam.youtubeVideoUrl, '_blank')}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(exam.youtubeVideoUrl, '_blank')}
                          className="flex items-center text-xs text-brand-green-medium hover:text-brand-green-dark transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Ver
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin video</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {exam.duration} min
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {exam.totalQuestions}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {exam.passingScore}%
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {getStatusIcon(exam)}
                      <span className="ml-2 text-sm text-gray-600">
                        {getStatusText(exam)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(exam)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(exam.id)}
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
        
        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay exámenes disponibles</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer examen'}
            </p>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingExam ? 'Editar Examen' : 'Nuevo Examen'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Título del Examen *"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ej: Examen Final de Matemáticas"
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
              placeholder="Descripción del examen..."
              multiline
              rows={3}
            />
          </div>

          <div>
            <Input
              label="Video de YouTube (opcional)"
              value={formData.youtubeVideoUrl}
              onChange={(e) => setFormData({...formData, youtubeVideoUrl: e.target.value})}
              placeholder="https://www.youtube.com/watch?v=..."
              type="url"
            />
            {formData.youtubeVideoUrl && getYouTubeVideoId(formData.youtubeVideoUrl) && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Vista previa del video:</p>
                <div className="relative group">
                  <img 
                    src={getYouTubeThumbnail(formData.youtubeVideoUrl)} 
                    alt="Video thumbnail"
                    className="w-32 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(formData.youtubeVideoUrl, '_blank')}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="Duración (minutos)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 60})}
                min="1"
                max="300"
              />
            </div>
            <div>
              <Input
                label="Total de Preguntas"
                type="number"
                value={formData.totalQuestions}
                onChange={(e) => setFormData({...formData, totalQuestions: parseInt(e.target.value) || 10})}
                min="1"
                max="100"
              />
            </div>
            <div>
              <Input
                label="Puntaje Mínimo (%)"
                type="number"
                value={formData.passingScore}
                onChange={(e) => setFormData({...formData, passingScore: parseInt(e.target.value) || 70})}
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
              Examen activo
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
              {editingExam ? 'Actualizar' : 'Crear'} Examen
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
