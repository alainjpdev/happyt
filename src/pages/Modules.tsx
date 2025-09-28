import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../services/api';

const Modules: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState<{ title: string; description: string; url: string }>({ title: '', description: '', url: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [creators, setCreators] = useState<{[key: string]: any}>({});
  const { user } = useAuthStore();

  useEffect(() => {
    const loadModules = async () => {
      try {
        const response = await apiClient.get('/api/modules');
        console.log('📚 Módulos cargados:', response.data);
        console.log('📚 Primer módulo (ejemplo):', response.data?.[0]);
        setModules(response.data || []);
        
        // Obtener información de los creadores únicos
        const uniqueCreatorIds = [...new Set(response.data?.map((module: any) => module.createdById).filter(Boolean))];
        console.log('👥 IDs de creadores únicos:', uniqueCreatorIds);
        
        if (uniqueCreatorIds.length > 0) {
          try {
            const usersResponse = await apiClient.get('/api/users');
            console.log('👥 Usuarios cargados:', usersResponse.data);
            
            // El backend devuelve un objeto con users array
            const usersArray = usersResponse.data.users || usersResponse.data;
            console.log('👥 Array de usuarios:', usersArray);
            console.log('👥 Es array?', Array.isArray(usersArray));
            
            const creatorsMap: {[key: string]: any} = {};
            if (Array.isArray(usersArray)) {
              usersArray.forEach((user: any) => {
                if (uniqueCreatorIds.includes(user.id)) {
                  creatorsMap[user.id] = user;
                }
              });
            } else {
              console.error('❌ Error: usersResponse.data no es un array:', usersResponse.data);
            }
            
            console.log('👥 Mapa de creadores:', creatorsMap);
            setCreators(creatorsMap);
          } catch (usersError) {
            console.error('Error loading users for creators:', usersError);
            // Si no podemos cargar usuarios, usar información del usuario actual para módulos propios
            const currentUserMap: {[key: string]: any} = {};
            if (user) {
              currentUserMap[user.id] = user;
            }
            setCreators(currentUserMap);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading modules:', error);
        setLoading(false);
      }
    };

    if (user) {
      loadModules();
    }
  }, [user]);

  const openModal = (module: any) => {
    setSelected(module);
    setEdit({ title: module.title, description: module.description, url: module.url });
    setModalOpen(true);
    setError(null);
    setSuccessMsg(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
    setEdit({ title: '', description: '', url: '' });
    setError(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await apiClient.put(`/api/modules/${selected.id}`, edit);
      const updated = res.data;
      setModules(modules => modules.map(m => m.id === selected.id ? updated : m));
      setSuccessMsg('¡Módulo actualizado correctamente!');
      setTimeout(() => { closeModal(); }, 1200);
    } catch (err: any) {
      console.error('Error updating module:', err);
      if (err.response?.status === 403) {
        setError('No tienes permisos para editar módulos. Solo los administradores pueden editar módulos.');
      } else {
        setError('Error al actualizar el módulo. Inténtalo de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!window.confirm('¿Seguro que quieres eliminar este módulo?')) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await apiClient.delete(`/api/modules/${selected.id}`);
      setModules(modules => modules.filter(m => m.id !== selected.id));
      setSuccessMsg('¡Módulo eliminado correctamente!');
      setTimeout(() => { closeModal(); }, 1200);
    } catch (err: any) {
      console.error('Error deleting module:', err);
      if (err.response?.status === 403) {
        setError('No tienes permisos para eliminar módulos. Solo los administradores pueden eliminar módulos.');
      } else {
        setError('Error al eliminar el módulo. Inténtalo de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    setSelected(null);
    setEdit({ title: '', description: '', url: '' });
    setModalOpen(true);
    setError(null);
    setSuccessMsg(null);
  };

  const handleCreate = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const moduleData = {
        ...edit,
        createdBy: {
          id: user?.id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          role: user?.role
        }
      };
      console.log('📝 Datos del módulo a crear:', moduleData);
      console.log('👤 Usuario actual:', user);
      const res = await apiClient.post('/api/modules', moduleData);
      console.log('✅ Módulo creado exitosamente:', res.data);
      const created = res.data;
      setModules(modules => [...modules, created]);
      setSuccessMsg('¡Módulo creado correctamente!');
      setTimeout(() => { closeModal(); }, 1200);
    } catch (err: any) {
      console.error('Error creating module:', err);
      if (err.response?.status === 403) {
        setError('No tienes permisos para crear módulos. Solo los administradores pueden crear módulos.');
      } else {
        setError('Error al crear el módulo. Inténtalo de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este módulo?')) return;
    try {
      await apiClient.delete(`/api/modules/${id}`);
      setModules(modules => modules.filter(m => m.id !== id));
      setSuccessMsg('¡Módulo eliminado correctamente!');
    } catch (err: any) {
      console.error('Error deleting module:', err);
      if (err.response?.status === 403) {
        alert('No tienes permisos para eliminar módulos. Solo los administradores pueden eliminar módulos.');
      } else {
        alert('Error al eliminar el módulo. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-brand-brown mb-6 flex items-center justify-between">
          Todos los Módulos
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <Button size="sm" variant="primary" onClick={openCreateModal}>
              Crear Módulo
            </Button>
          )}
        </h1>

        {user?.role === 'teacher' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.726-1.36 3.491 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Información de Permisos
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Como profesor, puedes ver todos los módulos disponibles, pero solo los administradores pueden crear, editar o eliminar módulos.</p>
                </div>
              </div>
            </div>
          </div>
        )}
    
        {loading ? (
          <p className="text-center text-gray-500 py-10">Cargando...</p>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Título</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Descripción</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">URL</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Creado por</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        No hay módulos disponibles
                      </td>
                    </tr>
                  ) : (
                    modules.map((module) => {
                      console.log('🔍 Módulo completo:', module);
                      console.log('🔍 createdBy del módulo:', module.createdBy);
                      console.log('🔍 Usuario actual:', user);
                      
                      // Obtener información del creador desde nuestro mapa
                      const creatorInfo = creators[module.createdById];
                      console.log('👤 Información del creador:', creatorInfo);
                      
                      const isCreatedByCurrentUser = module.createdById === user?.id;
                      console.log('🔍 ¿Es creado por usuario actual?', isCreatedByCurrentUser);
                      return (
                      <tr key={module.id} className={`border-b border-gray-200 hover:bg-gray-50 ${isCreatedByCurrentUser ? 'bg-green-50' : ''}`}>
                        <td className="py-3 px-4">{module.title || 'Sin título'}</td>
                        <td className="py-3 px-4">{module.description || 'Sin descripción'}</td>
                        <td className="py-3 px-4">
                          {module.url ? (
                            <a 
                              href={module.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              {module.url}
                            </a>
                          ) : (
                            <span className="text-gray-400">Sin URL</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCreatedByCurrentUser ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              <span className={`font-medium text-sm ${
                                isCreatedByCurrentUser ? 'text-blue-600' : 'text-green-600'
                              }`}>
                                {(() => {
                                  // Usar la información del creador desde nuestro mapa
                                  const firstName = creatorInfo?.firstName || creatorInfo?.name || '';
                                  return firstName.charAt(0) || 'U';
                                })()}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">
                                  {(() => {
                                    console.log('🔍 Datos del creador del módulo:', module.createdBy);
                                    console.log('👤 Información del creador desde mapa:', creatorInfo);
                                    
                                    // Usar la información del creador desde nuestro mapa
                                    const firstName = creatorInfo?.firstName || creatorInfo?.name || '';
                                    const lastName = creatorInfo?.lastName || creatorInfo?.surname || '';
                                    
                                    console.log('📝 firstName:', firstName, 'lastName:', lastName);
                                    
                                    if (firstName && lastName) {
                                      return `${firstName} ${lastName}`;
                                    } else if (firstName) {
                                      return firstName;
                                    } else if (creatorInfo?.email) {
                                      return creatorInfo.email.split('@')[0];
                                    } else {
                                      console.log('⚠️ No se encontró nombre, usando "Usuario"');
                                      return 'Usuario';
                                    }
                                  })()}
                                </p>
                                {isCreatedByCurrentUser && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Tú
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {(() => {
                                  const role = creatorInfo?.role;
                                  if (role === 'teacher') return 'Profesor';
                                  if (role === 'admin') return 'Administrador';
                                  if (role === 'student') return 'Estudiante';
                                  return 'Usuario';
                                })()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          {(user?.role === 'admin' || user?.role === 'teacher') && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => openModal(module)}>
                                Editar
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => handleDeleteModule(module.id)}>
                                Eliminar
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md border border-gray-200 relative">
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" 
              onClick={closeModal}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {selected ? 'Editar Módulo' : 'Crear Módulo'}
            </h2>
            <div className="mb-4 space-y-2">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                placeholder="Título"
                value={edit.title}
                onChange={e => setEdit({ ...edit, title: e.target.value })}
              />
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                placeholder="Descripción"
                value={edit.description}
                onChange={e => setEdit({ ...edit, description: e.target.value })}
              />
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="URL"
                value={edit.url}
                onChange={e => setEdit({ ...edit, url: e.target.value })}
              />
            </div>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {successMsg && <div className="text-green-600 mb-2">{successMsg}</div>}
            <div className="flex gap-2 mt-4">
              <Button 
                size="sm" 
                variant="primary" 
                onClick={selected ? handleSave : handleCreate} 
                disabled={saving}
              >
                {selected ? 'Guardar' : 'Crear'}
              </Button>
              <Button size="sm" variant="outline" onClick={closeModal} disabled={saving}>
                Cancelar
              </Button>
              {selected && (
                <Button size="sm" variant="danger" onClick={handleDelete} disabled={saving}>
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modules;