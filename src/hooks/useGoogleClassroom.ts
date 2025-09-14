import { useState, useEffect, useCallback } from 'react';
import { googleClassroomService, GoogleClassroomClass, GoogleClassroomStudent, GoogleClassroomAssignment } from '../services/google/classroomService';
import { useToastNotifications } from './useToastNotifications';

export interface GoogleClassroomState {
  isAuthenticated: boolean;
  isLoading: boolean;
  classes: GoogleClassroomClass[];
  selectedClass: GoogleClassroomClass | null;
  students: GoogleClassroomStudent[];
  assignments: GoogleClassroomAssignment[];
  error: string | null;
}

export const useGoogleClassroom = () => {
  const [state, setState] = useState<GoogleClassroomState>({
    isAuthenticated: false,
    isLoading: false,
    classes: [],
    selectedClass: null,
    students: [],
    assignments: [],
    error: null
  });

  const { showToast } = useToastNotifications();

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const isAuth = await googleClassroomService.restoreTokens();
        setState(prev => ({ 
          ...prev, 
          isAuthenticated: isAuth,
          isLoading: false 
        }));
      } catch (error) {
        console.error('Error checking authentication:', error);
        setState(prev => ({ 
          ...prev, 
          isAuthenticated: false,
          isLoading: false,
          error: 'Error verificando autenticación'
        }));
      }
    };

    checkAuth();
  }, []);

  // Iniciar proceso de autenticación
  const authenticate = useCallback(() => {
    try {
      const authUrl = googleClassroomService.getAuthUrl();
      window.open(authUrl, '_blank', 'width=500,height=600');
    } catch (error) {
      console.error('Error starting authentication:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Error iniciando autenticación con Google Classroom'
      }));
      showToast('Error iniciando autenticación', 'error');
    }
  }, [showToast]);

  // Procesar código de autorización
  const handleAuthCallback = useCallback(async (code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await googleClassroomService.exchangeCodeForTokens(code);
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: true,
        isLoading: false 
      }));
      showToast('Conectado exitosamente con Google Classroom', 'success');
    } catch (error) {
      console.error('Error handling auth callback:', error);
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: false,
        isLoading: false,
        error: 'Error procesando autorización'
      }));
      showToast('Error conectando con Google Classroom', 'error');
    }
  }, [showToast]);

  // Cargar clases
  const loadClasses = useCallback(async () => {
    if (!state.isAuthenticated) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const classes = await googleClassroomService.getClasses();
      setState(prev => ({ 
        ...prev, 
        classes,
        isLoading: false 
      }));
    } catch (error) {
      console.error('Error loading classes:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Error cargando clases de Google Classroom'
      }));
      showToast('Error cargando clases', 'error');
    }
  }, [state.isAuthenticated, showToast]);

  // Seleccionar clase
  const selectClass = useCallback(async (classId: string) => {
    const selectedClass = state.classes.find(c => c.id === classId);
    if (!selectedClass) return;

    setState(prev => ({ 
      ...prev, 
      selectedClass,
      students: [],
      assignments: [],
      isLoading: true,
      error: null 
    }));

    try {
      const [students, assignments] = await Promise.all([
        googleClassroomService.getClassStudents(classId),
        googleClassroomService.getClassAssignments(classId)
      ]);

      setState(prev => ({ 
        ...prev, 
        students,
        assignments,
        isLoading: false 
      }));
    } catch (error) {
      console.error('Error loading class details:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Error cargando detalles de la clase'
      }));
      showToast('Error cargando detalles de la clase', 'error');
    }
  }, [state.classes, showToast]);

  // Sincronizar clase con Happy Tribe
  const syncClass = useCallback(async (classId: string) => {
    const classToSync = state.classes.find(c => c.id === classId);
    if (!classToSync) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const syncedClass = await googleClassroomService.syncClassToHappyTribe(classToSync);
      setState(prev => ({ 
        ...prev, 
        isLoading: false 
      }));
      showToast('Clase sincronizada exitosamente', 'success');
      return syncedClass;
    } catch (error) {
      console.error('Error syncing class:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Error sincronizando clase'
      }));
      showToast('Error sincronizando clase', 'error');
    }
  }, [state.classes, showToast]);

  // Sincronizar estudiantes
  const syncStudents = useCallback(async (classId: string) => {
    if (!state.students.length) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const syncedStudents = await googleClassroomService.syncStudentsToHappyTribe(state.students, classId);
      setState(prev => ({ 
        ...prev, 
        isLoading: false 
      }));
      showToast(`${syncedStudents.length} estudiantes sincronizados`, 'success');
      return syncedStudents;
    } catch (error) {
      console.error('Error syncing students:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Error sincronizando estudiantes'
      }));
      showToast('Error sincronizando estudiantes', 'error');
    }
  }, [state.students, showToast]);

  // Sincronizar tareas
  const syncAssignments = useCallback(async (classId: string) => {
    if (!state.assignments.length) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const syncedAssignments = await googleClassroomService.syncAssignmentsToHappyTribe(state.assignments, classId);
      setState(prev => ({ 
        ...prev, 
        isLoading: false 
      }));
      showToast(`${syncedAssignments.length} tareas sincronizadas`, 'success');
      return syncedAssignments;
    } catch (error) {
      console.error('Error syncing assignments:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Error sincronizando tareas'
      }));
      showToast('Error sincronizando tareas', 'error');
    }
  }, [state.assignments, showToast]);

  // Sincronizar todo
  const syncAll = useCallback(async (classId: string) => {
    if (!state.selectedClass) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await Promise.all([
        syncClass(classId),
        syncStudents(classId),
        syncAssignments(classId)
      ]);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false 
      }));
      showToast('Sincronización completa exitosa', 'success');
    } catch (error) {
      console.error('Error syncing all:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Error en sincronización completa'
      }));
      showToast('Error en sincronización completa', 'error');
    }
  }, [state.selectedClass, syncClass, syncStudents, syncAssignments, showToast]);

  // Cerrar sesión
  const logout = useCallback(() => {
    googleClassroomService.logout();
    setState({
      isAuthenticated: false,
      isLoading: false,
      classes: [],
      selectedClass: null,
      students: [],
      assignments: [],
      error: null
    });
    showToast('Desconectado de Google Classroom', 'info');
  }, [showToast]);

  // Limpiar error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    authenticate,
    handleAuthCallback,
    loadClasses,
    selectClass,
    syncClass,
    syncStudents,
    syncAssignments,
    syncAll,
    logout,
    clearError
  };
};
