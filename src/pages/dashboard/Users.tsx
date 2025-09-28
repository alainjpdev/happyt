import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../services/api';

const Users: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUsers, setEditUsers] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const { user: currentUser } = useAuthStore();
  
  // Debug: Log del usuario actual
  console.log('🔍 Usuario actual en Users.tsx:', {
    currentUser: currentUser,
    role: currentUser?.role,
    isAdmin: currentUser?.role === 'admin',
    isTeacher: currentUser?.role === 'teacher',
    fullUserObject: JSON.stringify(currentUser, null, 2)
  });
  const [modules, setModules] = useState<any[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userModules, setUserModules] = useState<string[]>([]);
  const [userModulesData, setUserModulesData] = useState<{[userId: string]: any[]}>({});
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkTribe, setBulkTribe] = useState<string>('');
  const [bulkModule, setBulkModule] = useState<string>('');
  const [bulkModuleModalOpen, setBulkModuleModalOpen] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useEffect ejecutándose - Usuario actual:', {
      currentUser: currentUser,
      role: currentUser?.role,
      isAuthenticated: currentUser ? true : false
    });
    
    apiClient.get('/api/users')
      .then(res => {
        console.log('🔍 Respuesta del API /api/users:', res.data);
        console.log('🔍 Tipo de datos:', typeof res.data);
        console.log('🔍 Es array?', Array.isArray(res.data));
        
        // El backend devuelve un objeto con users array
        let usersArray = res.data.users || res.data;
        
        if (Array.isArray(usersArray)) {
          console.log('✅ Usuarios encontrados:', usersArray.length);
          console.log('📋 Todos los usuarios con sus roles:', usersArray.map(u => ({ 
            name: u.firstName + ' ' + u.lastName, 
            role: u.role, 
            email: u.email 
          })));
          
          // Filtrar usuarios según el rol del usuario actual
          console.log('🔍 Usuario actual para filtrado:', {
            currentUser: currentUser,
            role: currentUser?.role,
            totalUsers: usersArray.length
          });
          
          if (currentUser?.role === 'teacher') {
            // Los teachers solo ven estudiantes
            const studentsOnly = usersArray.filter(user => user.role === 'student');
            console.log('👨‍🏫 Vista de teacher - Filtrado:', {
              totalUsers: usersArray.length,
              studentsFound: studentsOnly.length,
              students: studentsOnly.map(s => ({ name: s.firstName + ' ' + s.lastName, role: s.role }))
            });
            usersArray = studentsOnly;
          } else if (currentUser?.role === 'student') {
            // Los estudiantes no deberían ver esta página, pero por seguridad
            usersArray = [];
            console.log('👨‍🎓 Vista de student - Sin acceso');
          } else if (currentUser?.role === 'admin') {
            console.log('👑 Vista de admin - Todos los usuarios:', usersArray.length);
          } else {
            console.log('❓ Rol desconocido:', currentUser?.role);
          }
          
          console.log('📊 Usuarios finales a mostrar:', usersArray.length);
          setUsers(usersArray);
          setLoading(false);
          // Cargar módulos de cada usuario
          loadUserModules(usersArray);
        } else {
          console.error('❌ Error: No se encontró array de usuarios:', res.data);
          setUsers([]);
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('❌ Error obteniendo usuarios:', error);
        
        // Si es teacher y recibe 403, mostrar mensaje específico
        if (currentUser?.role === 'teacher' && error.response?.status === 403) {
          console.log('👨‍🏫 Teacher recibió 403 - No tiene permisos para ver usuarios');
          setUsers([]);
          setLoading(false);
          setSaveMsg('Los profesores no tienen acceso a la lista completa de usuarios. Contacta al administrador para obtener permisos o usar otras funcionalidades del sistema.');
          return;
        }
        
        setUsers([]);
        setLoading(false);
      });
  }, [currentUser?.role, currentUser?.id]); // Agregar más dependencias para asegurar que se ejecute cuando cambie el usuario

  const loadUserModules = async (users: any[]) => {
    // Validar que users sea un array
    if (!Array.isArray(users)) {
      console.error('❌ loadUserModules: users no es un array:', users);
      return;
    }
    
    const modulesData: {[userId: string]: any[]} = {};
    
    for (const user of users) {
      try {
        const res = await apiClient.get(`/api/users/${user.id}/modules`);
        modulesData[user.id] = res.data || [];
      } catch (error) {
        console.error(`Error loading modules for user ${user.id}:`, error);
        modulesData[user.id] = [];
      }
    }
    
    setUserModulesData(modulesData);
  };

  useEffect(() => {
    if (saveMsg && saveMsg.includes('guardados correctamente')) {
      const timer = setTimeout(() => setSaveMsg(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [saveMsg]);

  // Obtener todos los módulos al montar
  useEffect(() => {
    apiClient.get('/api/modules').then(res => setModules(res.data));
  }, []);

  const openAssignModal = async (user: any) => {
    setSelectedUser(user);
    setAssignModalOpen(true);
    // Obtener módulos asignados al usuario
    const res = await apiClient.get(`/api/users/${user.id}/modules`);
    setUserModules(res.data.map((m: any) => m.id));
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedUser(null);
    setUserModules([]);
  };

  const handleToggleModule = (moduleId: string) => {
    setUserModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSaveModules = async () => {
    if (!selectedUser) return;
    await apiClient.put(`/api/users/${selectedUser.id}/modules`, { moduleIds: userModules });
    closeAssignModal();
    // Refrescar los módulos del usuario
    loadUserModules(users);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleBulkTribeAssign = async () => {
    if (selectedUsers.length === 0 || !bulkTribe) return;
    
    setSaving(true);
    setSaveMsg(null);
    
    try {
      const updates: {[userId: string]: any} = {};
      selectedUsers.forEach(userId => {
        updates[userId] = { tribe: bulkTribe };
      });
      
      for (const [userId, changes] of Object.entries(updates)) {
        console.log('🔄 Asignación en lote - Enviando al backend:', {
          userId,
          changes,
          url: `/api/users/${userId}`
        });
        
        const res = await apiClient.put(`/api/users/${userId}`, changes);
        
        console.log('✅ Asignación en lote - Respuesta del backend:', {
          userId,
          status: res.status,
          data: res.data
        });
        
        setUsers(users => users.map(u => u.id === userId ? { ...u, ...changes } : u));
      }
      
      setSelectedUsers([]);
      setBulkTribe('');
      setSaveMsg(`${selectedUsers.length} usuarios asignados a ${bulkTribe}`);
    } catch (err: any) {
      setSaveMsg(err.message || 'Error al asignar tribus');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkModuleAssign = async () => {
    if (!bulkTribe || !bulkModule) return;
    
    setSaving(true);
    setSaveMsg(null);
    
    try {
      // Filtrar usuarios por tribu
      const usersInTribe = users.filter(user => user.tribe === bulkTribe);
      
      if (usersInTribe.length === 0) {
        setSaveMsg(`No se encontraron usuarios en la tribu ${bulkTribe}`);
        return;
      }
      
      console.log(`🔄 Asignando módulo ${bulkModule} a ${usersInTribe.length} usuarios de la tribu ${bulkTribe}`);
      
      // Asignar módulo a cada usuario de la tribu
      for (const user of usersInTribe) {
        try {
          // Obtener módulos actuales del usuario
          const currentModulesRes = await apiClient.get(`/api/users/${user.id}/modules`);
          const currentModuleIds = currentModulesRes.data.map((m: any) => m.id);
          
          // Agregar el nuevo módulo si no está ya asignado
          if (!currentModuleIds.includes(bulkModule)) {
            const newModuleIds = [...currentModuleIds, bulkModule];
            await apiClient.put(`/api/users/${user.id}/modules`, { moduleIds: newModuleIds });
            console.log(`✅ Módulo asignado a ${user.firstName} ${user.lastName}`);
          } else {
            console.log(`⚠️ Módulo ya asignado a ${user.firstName} ${user.lastName}`);
          }
        } catch (error) {
          console.error(`❌ Error asignando módulo a ${user.firstName} ${user.lastName}:`, error);
        }
      }
      
      setBulkTribe('');
      setBulkModule('');
      setBulkModuleModalOpen(false);
      setSaveMsg(`Módulo asignado a ${usersInTribe.length} usuarios de la tribu ${bulkTribe}`);
      
      // Refrescar datos
      loadUserModules(users);
      
    } catch (err: any) {
      setSaveMsg(err.message || 'Error al asignar módulos');
    } finally {
      setSaving(false);
    }
  };

  // Función para cambiar el rol de un usuario
  const changeUserRole = async (userId: string, newRole: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Solo los administradores pueden cambiar roles');
      return;
    }

    try {
      setChangingRole(userId);
      console.log(`🔄 Cambiando rol de usuario ${userId} a ${newRole}`);
      
      // Encontrar el usuario actual para enviar todos sus datos
      const currentUserData = users.find(user => user.id === userId);
      if (!currentUserData) {
        throw new Error('Usuario no encontrado');
      }
      
      // Preparar todos los datos del usuario con el nuevo rol
      const updatedUserData = {
        ...currentUserData,
        role: newRole
      };
      
      console.log('📝 Datos a enviar:', updatedUserData);
      
      // Llamar al endpoint PUT del backend para actualizar usuario
      const response = await apiClient.put(`/api/users/${userId}`, updatedUserData);
      
      console.log('✅ Rol cambiado exitosamente:', response.data);
      
      // Actualizar el estado local
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));
      
      setSaveMsg(`Rol cambiado a ${newRole} exitosamente`);
      
    } catch (error) {
      console.error('❌ Error cambiando rol:', error);
      setSaveMsg('Error al cambiar rol del usuario');
    } finally {
      setChangingRole(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      await apiClient.delete(`/api/users/${userId}`);
      setUsers(users => users.filter(u => u.id !== userId));
      setSaveMsg('Usuario eliminado correctamente');
    } catch (err: any) {
      console.error('Error al eliminar usuario:', err);
      
      // Manejar diferentes tipos de errores
      if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error;
        console.log('🔍 Error 400 detectado:', errorMessage);
        
        // Intentar reasignar TODOS los datos al admin automáticamente
        // Sin importar el mensaje específico del error
        console.log('🚀 Iniciando proceso de reasignación automática...');
        try {
          console.log('🔄 Reasignando todos los datos al admin...');
          setSaveMsg('Reasignando datos al admin...');
          
          // Encontrar el admin (primer usuario con rol admin)
          const adminUser = users.find(u => u.role === 'admin');
          if (!adminUser) {
            console.error('❌ No hay admin disponible para reasignar datos');
            setSaveMsg('No se puede eliminar el usuario porque tiene datos asociados y no hay admin disponible para reasignar.');
            return;
          }
          
          console.log(`👤 Admin encontrado: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.id})`);
          
          let reassignedItems = [];
          
          // 1. Reasignar módulos
          try {
            console.log('📋 Obteniendo módulos del usuario...');
            const userModulesRes = await apiClient.get(`/api/users/${userId}/modules`);
            const userModules = userModulesRes.data || [];
            console.log(`📋 Usuario tiene ${userModules.length} módulos asignados`);
            
            if (userModules.length > 0) {
              console.log('📋 Reasignando módulos al admin...');
              await apiClient.put(`/api/users/${adminUser.id}/modules`, {
                moduleIds: userModules.map((m: any) => m.id)
              });
              reassignedItems.push(`${userModules.length} módulos`);
              console.log(`✅ ${userModules.length} módulos reasignados al admin`);
            }
          } catch (moduleError: any) {
            console.log('⚠️ No se pudieron reasignar módulos:', moduleError.message);
          }
          
          // 2. Reasignar clases (si el usuario es profesor)
          try {
            console.log('🏫 Obteniendo clases del usuario...');
            const userClassesRes = await apiClient.get(`/api/classes`);
            const allClasses = userClassesRes.data || [];
            const userClasses = allClasses.filter((c: any) => c.teacherId === userId);
            console.log(`🏫 Usuario tiene ${userClasses.length} clases asignadas`);
            
            if (userClasses.length > 0) {
              console.log('🏫 Reasignando clases al admin...');
              for (const classItem of userClasses) {
                await apiClient.put(`/api/classes/${classItem.id}`, {
                  teacherId: adminUser.id
                });
              }
              reassignedItems.push(`${userClasses.length} clases`);
              console.log(`✅ ${userClasses.length} clases reasignadas al admin`);
            }
          } catch (classError: any) {
            console.log('⚠️ No se pudieron reasignar clases:', classError.message);
          }
          
          // 3. Reasignar tareas (si el usuario es profesor)
          try {
            console.log('📝 Obteniendo tareas del usuario...');
            const userAssignmentsRes = await apiClient.get(`/api/assignments`);
            const allAssignments = userAssignmentsRes.data || [];
            const userAssignments = allAssignments.filter((a: any) => a.teacherId === userId);
            console.log(`📝 Usuario tiene ${userAssignments.length} tareas asignadas`);
            
            if (userAssignments.length > 0) {
              console.log('📝 Reasignando tareas al admin...');
              for (const assignment of userAssignments) {
                await apiClient.put(`/api/assignments/${assignment.id}`, {
                  teacherId: adminUser.id
                });
              }
              reassignedItems.push(`${userAssignments.length} tareas`);
              console.log(`✅ ${userAssignments.length} tareas reasignadas al admin`);
            }
          } catch (assignmentError: any) {
            console.log('⚠️ No se pudieron reasignar tareas:', assignmentError.message);
          }
          
          // 4. Eliminar módulos creados por el usuario (no se pueden reasignar)
          try {
            console.log('📚 Obteniendo módulos creados por el usuario...');
            const userModulesRes = await apiClient.get(`/api/modules`);
            const allModules = userModulesRes.data || [];
            const userCreatedModules = allModules.filter((m: any) => m.createdById === userId);
            console.log(`📚 Usuario creó ${userCreatedModules.length} módulos`);
            
            if (userCreatedModules.length > 0) {
              console.log('📚 Eliminando módulos creados por el usuario...');
              for (const module of userCreatedModules) {
                await apiClient.delete(`/api/modules/${module.id}`);
              }
              reassignedItems.push(`${userCreatedModules.length} módulos creados eliminados`);
              console.log(`✅ ${userCreatedModules.length} módulos creados eliminados`);
            }
          } catch (moduleError: any) {
            console.log('⚠️ No se pudieron eliminar módulos creados:', moduleError.message);
          }
          
          // 5. Reasignar inscripciones del usuario (StudentClass)
          try {
            console.log('🎓 Obteniendo inscripciones del usuario...');
            const userEnrollmentsRes = await apiClient.get(`/api/studentclasses`);
            const allEnrollments = userEnrollmentsRes.data || [];
            const userEnrollments = allEnrollments.filter((e: any) => e.studentId === userId);
            console.log(`🎓 Usuario tiene ${userEnrollments.length} inscripciones`);
            
            if (userEnrollments.length > 0) {
              console.log('🎓 Eliminando inscripciones del usuario...');
              for (const enrollment of userEnrollments) {
                await apiClient.delete(`/api/studentclasses/${enrollment.id}`);
              }
              reassignedItems.push(`${userEnrollments.length} inscripciones eliminadas`);
              console.log(`✅ ${userEnrollments.length} inscripciones eliminadas`);
            }
          } catch (enrollmentError: any) {
            console.log('⚠️ No se pudieron manejar inscripciones:', enrollmentError.message);
          }
          
          // 6. Reportes - omitir por ahora (endpoint no disponible)
          console.log('📊 Saltando reportes (endpoint no disponible)');
          
          // Intentar eliminar el usuario nuevamente
          console.log('🔄 Intentando eliminar usuario después de reasignación...');
          await apiClient.delete(`/api/users/${userId}`);
          setUsers(users => users.filter(u => u.id !== userId));
          
          if (reassignedItems.length > 0) {
            setSaveMsg(`Usuario eliminado correctamente. ${reassignedItems.join(', ')} reasignados al admin.`);
          } else {
            setSaveMsg('Usuario eliminado correctamente.');
          }
          
        } catch (reassignError: any) {
          console.error('Error al reasignar datos:', reassignError);
          console.log('❌ La reasignación automática falló, mostrando error original');
          setSaveMsg(`No se puede eliminar el usuario: ${errorMessage || 'Error de restricciones de integridad'}`);
        }
      } else if (err.response?.status === 409) {
        setSaveMsg('No se puede eliminar el usuario porque tiene datos asociados. Primero desasigna todos los módulos, clases y tareas del usuario.');
      } else if (err.response?.status === 403) {
        setSaveMsg('No tienes permisos para eliminar este usuario.');
      } else if (err.response?.status === 404) {
        setSaveMsg('El usuario no existe o ya fue eliminado.');
      } else {
        setSaveMsg(`Error al eliminar usuario: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text">
          {currentUser?.role === 'teacher' 
            ? 'Gestión de Usuarios (Restringido)' 
            : currentUser?.role === 'admin'
            ? 'Todos los Usuarios'
            : 'Usuarios'
          }
        </h1>
        {selectedUsers.length > 0 && (
          <div className="text-sm text-primary font-medium">
            {selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''} seleccionado{selectedUsers.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      {/* Mensaje informativo sobre cambio de roles - Solo para admins */}
      {currentUser?.role === 'admin' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Gestión de Roles
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>Como administrador, puedes cambiar el rol de cualquier usuario usando el dropdown en la columna "Rol".</p>
                <p className="mt-1"><strong>Nota:</strong> Todos los usuarios se registran como "Estudiante" por defecto.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje informativo para teachers */}
      {currentUser?.role === 'teacher' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Acceso Restringido
              </h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p><strong>Los profesores no tienen acceso a la gestión de usuarios.</strong></p>
                <p className="mt-1">Para ver y gestionar estudiantes, necesitas permisos de administrador. Contacta al administrador del sistema.</p>
                <p className="mt-1"><strong>Alternativas disponibles:</strong> Puedes usar otras secciones del dashboard como módulos, clases y tareas.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4 flex items-center gap-4">
        <Button size="lg" variant="primary" disabled={saving || Object.keys(editUsers).length === 0} onClick={async () => {
          setSaving(true);
          setSaveMsg(null);
          try {
            const updates = Object.entries(editUsers);
            for (const [userId, changes] of updates) {
              const c = changes as Record<string, any>;
              // Solo permitir status, notes, hours y tribe
              const allowed: any = {};
              if ('status' in c) allowed.status = c.status;
              if ('notes' in c) allowed.notes = c.notes;
              if ('hours' in c) allowed.hours = c.hours;
              if ('tribe' in c) allowed.tribe = c.tribe;
              
              console.log('🔄 Enviando actualización al backend:', {
                userId,
                changes: allowed,
                url: `/api/users/${userId}`
              });
              
              const res = await apiClient.put(`/api/users/${userId}`, allowed);
              const updatedUser = res.data;
              
              console.log('✅ Respuesta del backend:', {
                status: res.status,
                data: updatedUser
              });
              
              setUsers(users => users.map(u => u.id === userId ? { ...u, ...allowed } : u));
            }
            setEditUsers({});
            setSaveMsg('Cambios guardados correctamente');
          } catch (err: any) {
            setSaveMsg(err.message || 'Error al guardar cambios');
          } finally {
            setSaving(false);
          }
        }}>Guardar cambios</Button>
        
        {/* Asignación en lote de tribus */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 border border-border bg-panel text-text rounded focus:outline-none focus:ring-2 focus:ring-primary"
              value={bulkTribe}
              onChange={e => {
                const selectedTribe = e.target.value;
                console.log('📝 Tribu seleccionada para asignación en lote:', {
                  selectedTribe,
                  selectedUsersCount: selectedUsers.length,
                  selectedUserIds: selectedUsers
                });
                setBulkTribe(selectedTribe);
              }}
            >
              <option value="">Seleccionar tribu</option>
              <option value="Tribu 1">Tribu 1</option>
              <option value="Tribu 2">Tribu 2</option>
              <option value="Tribu 3">Tribu 3</option>
              <option value="Tribu 4">Tribu 4</option>
              <option value="Tribu 5">Tribu 5</option>
            </select>
            <Button 
              size="lg" 
              variant="outline" 
              disabled={!bulkTribe || saving}
              onClick={handleBulkTribeAssign}
            >
              Asignar a {selectedUsers.length} usuarios
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setSelectedUsers([])}
            >
              Cancelar
            </Button>
          </div>
        )}
        
        {/* Botón para asignación masiva de módulos por tribu */}
        {/* Los admins y teachers pueden hacer asignación masiva */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => setBulkModuleModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            📚 Asignar Módulo por Tribu
          </Button>
        )}
        
        {saveMsg && (
          <div className={`px-4 py-2 rounded-lg border ${
            saveMsg.includes('Error') || saveMsg.includes('No se puede') 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            <div className="flex items-center space-x-2">
              {saveMsg.includes('Error') || saveMsg.includes('No se puede') ? (
                <span className="text-red-500">⚠️</span>
              ) : (
                <span className="text-green-500">✅</span>
              )}
              <span className="font-medium">{saveMsg}</span>
            </div>
            {saveMsg.includes('módulos asociados') && (
              <div className="mt-2 text-sm text-red-700">
                💡 <strong>Solución:</strong> Ve a la gestión de módulos y desasigna los módulos de este usuario antes de eliminarlo.
              </div>
            )}
            {saveMsg.includes('clases asociadas') && (
              <div className="mt-2 text-sm text-red-700">
                💡 <strong>Solución:</strong> Ve a la gestión de clases y desasigna las clases de este usuario antes de eliminarlo.
              </div>
            )}
            {saveMsg.includes('tareas asociadas') && (
              <div className="mt-2 text-sm text-red-700">
                💡 <strong>Solución:</strong> Ve a la gestión de tareas y desasigna las tareas de este usuario antes de eliminarlo.
              </div>
            )}
          </div>
        )}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {/* <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th> */}
                <th className="text-left py-3 px-4 font-medium text-text-secondary">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Nombre</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Email</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Rol</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Tribu</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Módulos Asignados</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Notas</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Fecha de Registro</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Eliminar</th>
                {/* <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th> */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-6 text-center text-text-secondary">{t('loading', 'Cargando...')}</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={9} className="py-6 text-center text-text-secondary">{t('adminDashboard.noUsers', 'No hay usuarios')}</td></tr>
              ) : (
                users.map(user => {
                  const local = editUsers[user.id] || {};
                  return (
                    <tr key={user.id} className="border-b border-border hover:bg-panel">
                      {/* <td className="py-3 px-4">{user.id}</td> */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="py-3 px-4 cursor-pointer text-primary underline" onClick={() => openAssignModal(user)}>{user.firstName} {user.lastName}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        {(() => {
                          console.log('🔍 Debug rol dropdown:', {
                            currentUser: currentUser,
                            userRole: currentUser?.role,
                            isAdmin: currentUser?.role === 'admin',
                            userId: user.id,
                            userRoleToShow: user.role
                          });
                          
                          return currentUser?.role === 'admin' ? (
                            <select
                              value={user.role}
                              onChange={(e) => changeUserRole(user.id, e.target.value)}
                              disabled={changingRole === user.id}
                              className="px-2 py-1 text-xs font-medium rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                              <option value="student">Estudiante</option>
                              <option value="teacher">Profesor</option>
                              <option value="admin">Administrador</option>
                            </select>
                          ) : (
                            <span className="capitalize">{t('role.' + user.role, { defaultValue: user.role })}</span>
                          );
                        })()}
                        {changingRole === user.id && (
                          <span className="ml-2 text-xs text-blue-600">🔄 Cambiando...</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          className={`px-2 py-1 text-xs font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-primary ${
                            (local.tribe ?? user.tribe) ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                          }`}
                          value={local.tribe ?? user.tribe ?? ''}
                          onChange={e => {
                            const newTribe = e.target.value;
                            console.log('📝 Cambio de tribu detectado:', {
                              userId: user.id,
                              userName: `${user.firstName} ${user.lastName}`,
                              oldTribe: user.tribe,
                              newTribe: newTribe
                            });
                            setEditUsers((edit: any) => ({ ...edit, [user.id]: { ...edit[user.id], tribe: newTribe } }));
                          }}
                        >
                          <option value="">Sin tribu</option>
                          <option value="Tribu 1">Tribu 1</option>
                          <option value="Tribu 2">Tribu 2</option>
                          <option value="Tribu 3">Tribu 3</option>
                          <option value="Tribu 4">Tribu 4</option>
                          <option value="Tribu 5">Tribu 5</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {userModulesData[user.id]?.length > 0 ? (
                            userModulesData[user.id].map((module: any) => (
                              <span 
                                key={module.id} 
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-green-light text-brand-green-dark"
                              >
                                {module.title}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">Sin módulos</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          className={`px-2 py-1 text-xs font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-primary ${
                            (local.status ?? user.status) === 'active' ? 'bg-success/10 text-success' :
                            (local.status ?? user.status) === 'pending' ? 'bg-warning/10 text-warning' :
                            (local.status ?? user.status) === 'suspended' ? 'bg-error/10 text-error' :
                            'bg-border text-text-secondary'
                          }`}
                          value={local.status ?? user.status}
                          onChange={e => {
                            const newStatus = e.target.value;
                            setEditUsers((edit: any) => ({ ...edit, [user.id]: { ...edit[user.id], status: newStatus } }));
                          }}
                        >
                          <option value="active">{t('adminDashboard.active', { defaultValue: 'Activo' })}</option>
                          <option value="pending">{t('adminDashboard.pending', { defaultValue: 'Pendiente' })}</option>
                          <option value="suspended">{t('adminDashboard.suspended', { defaultValue: 'Suspendido' })}</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-xs border border-border bg-panel text-text rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Notas internas"
                          value={local.notes ?? user.notes ?? ''}
                          onChange={e => {
                            const notes = e.target.value;
                            setEditUsers((edit: any) => ({ ...edit, [user.id]: { ...edit[user.id], notes } }));
                          }}
                        />
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary">{user.createdAt ? user.createdAt.split('T')[0] : ''}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col space-y-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(user.id)} 
                            disabled={!!saving || !!(currentUser && currentUser.id === user.id)}
                            className={userModulesData[user.id]?.length > 0 ? 'border-red-300 text-red-600 hover:bg-red-50' : ''}
                          >
                          Eliminar
                        </Button>
                          {userModulesData[user.id]?.length > 0 && (
                            <span className="text-xs text-red-600 font-medium">
                              {userModulesData[user.id].length} módulo{userModulesData[user.id].length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* <td className="py-3 px-4 space-x-2">
                        <Button size="sm" variant="outline">{t('adminDashboard.manage', 'Gestionar')}</Button>
                        <Button size="sm" variant="outline">Resetear Contraseña</Button>
                        <Button size="sm" variant="outline">Cambiar Rol</Button>
                      </td> */}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {assignModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-panel rounded-lg shadow-2xl p-8 w-full max-w-md border border-border relative">
            <button className="absolute top-2 right-2 text-text-secondary hover:text-text" onClick={closeAssignModal}>&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-text">Asignar módulos a {selectedUser.firstName} {selectedUser.lastName}</h2>
            <div className="mb-4 space-y-2 max-h-64 overflow-y-auto">
              {modules.map((mod) => (
                <label key={mod.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userModules.includes(mod.id)}
                    onChange={() => handleToggleModule(mod.id)}
                  />
                  <span className="text-text">{mod.title}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="primary" onClick={handleSaveModules}>Guardar</Button>
              <Button size="sm" variant="outline" onClick={closeAssignModal}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para asignación masiva de módulos por tribu */}
      {bulkModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-panel rounded-lg shadow-2xl p-8 w-full max-w-md border border-border relative">
            <button 
              className="absolute top-2 right-2 text-text-secondary hover:text-text text-2xl" 
              onClick={() => setBulkModuleModalOpen(false)}
            >
              &times;
            </button>
            
            <h2 className="text-2xl font-bold mb-4 text-text">📚 Asignar Módulo por Tribu</h2>
            
            <div className="space-y-4">
              {/* Selección de tribu */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Seleccionar Tribu:
                </label>
                <select
                  className="w-full px-3 py-2 border border-border bg-panel text-text rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  value={bulkTribe}
                  onChange={e => setBulkTribe(e.target.value)}
                >
                  <option value="">Seleccionar tribu</option>
                  <option value="Tribu 1">Tribu 1</option>
                  <option value="Tribu 2">Tribu 2</option>
                  <option value="Tribu 3">Tribu 3</option>
                  <option value="Tribu 4">Tribu 4</option>
                  <option value="Tribu 5">Tribu 5</option>
                </select>
              </div>
              
              {/* Selección de módulo */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Seleccionar Módulo:
                </label>
                <select
                  className="w-full px-3 py-2 border border-border bg-panel text-text rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  value={bulkModule}
                  onChange={e => setBulkModule(e.target.value)}
                >
                  <option value="">Seleccionar módulo</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Información de usuarios en la tribu */}
              {bulkTribe && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Usuarios en {bulkTribe}:</strong> {users.filter(u => u.tribe === bulkTribe).length}
                  </p>
                  {users.filter(u => u.tribe === bulkTribe).length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-blue-600">Usuarios:</p>
                      <ul className="text-xs text-blue-600 list-disc list-inside">
                        {users.filter(u => u.tribe === bulkTribe).slice(0, 3).map(user => (
                          <li key={user.id}>{user.firstName} {user.lastName}</li>
                        ))}
                        {users.filter(u => u.tribe === bulkTribe).length > 3 && (
                          <li>... y {users.filter(u => u.tribe === bulkTribe).length - 3} más</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button 
                size="sm" 
                variant="primary" 
                onClick={handleBulkModuleAssign}
                disabled={!bulkTribe || !bulkModule || saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? 'Asignando...' : `Asignar a ${users.filter(u => u.tribe === bulkTribe).length} usuarios`}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setBulkModuleModalOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users; 