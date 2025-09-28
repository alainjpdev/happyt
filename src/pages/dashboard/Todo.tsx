import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CheckSquare, Square, Plus, Edit, Trash2, Calendar, Clock, Filter, Search, RefreshCw, AlertCircle, CheckCircle, Download, Save } from 'lucide-react';
import { airtableMigration } from '../../utils/airtableMigration';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import { getGoogleRedirectURI } from '../../config/environment';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
// import { GoogleAuthTest } from '../../components/GoogleAuthTest'; // Removido temporalmente

interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const Todo: React.FC = () => {
  // Integración con el sistema de autenticación de HappyTribe
  const { user, isAuthenticated: userAuthenticated } = useAuthStore();
  const { addToast } = useToast();
  
  // Integración con Google Auth
  const { 
    isAuthenticated: googleAuthenticated, 
    accessToken: googleAccessToken, 
    authenticate: googleAuthenticate,
    getValidToken 
  } = useGoogleAuth();
  
  // Funciones helper para notificaciones
  const showSuccess = (message: string) => addToast({ type: 'success', title: 'Éxito', message });
  const showError = (message: string) => addToast({ type: 'error', title: 'Error', message });
  const showInfo = (message: string) => addToast({ type: 'info', title: 'Información', message });
  
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    assignedTo: '',
    notes: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  // Lista de encargados disponibles (se actualiza dinámicamente)
  const [availableAssignees, setAvailableAssignees] = useState<string[]>([]);
  const [newAssignee, setNewAssignee] = useState<string>('');
  const [showAddAssigneeFor, setShowAddAssigneeFor] = useState<string | null>(null);

  // Función para extraer encargados únicos de las tareas
  const updateAvailableAssignees = (todosList: TodoItem[]) => {
    const assignees = todosList
      .map(todo => todo.assignedTo)
      .filter(assignee => assignee && assignee.trim() !== '' && assignee !== 'Sin encargado seleccionado')
      .filter((assignee, index, array) => array.indexOf(assignee) === index) // Eliminar duplicados
      .sort(); // Ordenar alfabéticamente
    
    setAvailableAssignees(assignees);
  };

  // Función para agregar nuevo encargado
  const addNewAssignee = () => {
    if (newAssignee.trim() && showAddAssigneeFor) {
      const newAssigneeName = newAssignee.trim();
      
      // Agregar a la lista de encargados disponibles si no existe
      if (!availableAssignees.includes(newAssigneeName)) {
        const updatedAssignees = [...availableAssignees, newAssigneeName].sort();
        setAvailableAssignees(updatedAssignees);
      }
      
      // Asignar el nuevo encargado a la tarea específica
      handleAssigneeChange(showAddAssigneeFor, newAssigneeName);
      
      // Limpiar y cerrar
      setNewAssignee('');
      setShowAddAssigneeFor(null);
      showSuccess(`Nuevo encargado "${newAssigneeName}" agregado y asignado`);
    }
  };

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAddAssigneeFor) {
        const target = event.target as HTMLElement;
        if (!target.closest('.assignee-modal')) {
          setShowAddAssigneeFor(null);
          setNewAssignee('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddAssigneeFor]);

  // Configuración de Google Sheets
  const TODO_SHEET_ID = import.meta.env.VITE_TODO_SHEET_ID || '1QtU-g7HObGRJ0KYIA6uOAav9DPSxc_BqIDUT_-KDc4U';
  const TODO_SHEET_NAME = 'Sheet1';
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
  // Usar la configuración centralizada del entorno
  const GOOGLE_REDIRECT_URI = getGoogleRedirectURI();

  // Función para autenticación OAuth2 usando el servicio centralizado
  const authenticateWithGoogle = async () => {
    if (!GOOGLE_CLIENT_ID) {
      showError('Google Client ID no configurado');
      return;
    }

    try {
      showInfo('Redirigiendo a Google para autorización...');
      await googleAuthenticate();
    } catch (err) {
      console.error('Error en autenticación:', err);
      showError('Error en la autenticación con Google');
    }
  };

  // Función para intercambiar código por tokens
  const exchangeCodeForTokens = async (code: string) => {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: GOOGLE_REDIRECT_URI
        })
      });

      if (!response.ok) {
        throw new Error('Error al intercambiar código por tokens');
      }

      const data = await response.json();
      showSuccess('Autenticación con Google exitosa');
      return data;
    } catch (err) {
      console.error('Error al intercambiar código:', err);
      showError('Error al autenticar con Google');
      throw err;
    }
  };

  // Función para guardar tokens en localStorage
  const saveTokensToStorage = (accessToken: string, refreshToken?: string, expiresIn?: number) => {
    try {
      const expiryTime = expiresIn ? Date.now() + (expiresIn * 1000) : Date.now() + (3600 * 1000);
      localStorage.setItem('google_access_token', accessToken);
      localStorage.setItem('google_token_expiry', expiryTime.toString());
      
      if (refreshToken) {
        localStorage.setItem('google_refresh_token', refreshToken);
      }
    } catch (err) {
      console.error('Error al guardar tokens:', err);
    }
  };

  // Función para renovar token usando refresh token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('google_refresh_token');
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error('Error al renovar token');
      }

      const data = await response.json();
      saveTokensToStorage(data.access_token, refreshToken, data.expires_in);
      setAccessToken(data.access_token);
      
      return data.access_token;
    } catch (err) {
      console.error('Error al renovar token:', err);
      // Si falla la renovación, limpiar tokens y requerir nueva autorización
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_refresh_token');
      localStorage.removeItem('google_token_expiry');
      setAccessToken(null);
      setIsAuthenticated(false);
      throw err;
    }
  };

  // Función para verificar si el token es válido
  const isTokenValid = () => {
    try {
      const token = localStorage.getItem('google_access_token');
      const expiry = localStorage.getItem('google_token_expiry');
      
      if (!token || !expiry) return false;
      
      const now = Date.now();
      const expiryTime = parseInt(expiry);
      
      return now < expiryTime;
    } catch (err) {
      console.error('Error al verificar token:', err);
      return false;
    }
  };

  // Estado para controlar debounce
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Estados para cambios pendientes
  const [pendingChanges, setPendingChanges] = useState<{ [key: string]: TodoItem }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Función para actualizar cambios pendientes (sin guardar en Google Sheets)
  const updatePendingChange = (todoId: string, updatedTodo: TodoItem) => {
    setPendingChanges(prev => ({
      ...prev,
      [todoId]: updatedTodo
    }));
    
    // Actualizar solo el estado local
    setTodos(todos.map(t => t.id === todoId ? updatedTodo : t));
  };

  // Función para guardar todos los cambios pendientes
  const saveAllPendingChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;
    
    setIsSaving(true);
    const totalChanges = Object.keys(pendingChanges).length;
    let successCount = 0;
    let errorCount = 0;
    
    try {
      const savePromises = Object.entries(pendingChanges).map(async ([todoId, todo]) => {
        try {
          await updateTodoInSheets(todo);
          successCount++;
          console.log(`✅ Tarea ${todoId} guardada exitosamente`);
          return { success: true, todoId };
        } catch (err) {
          errorCount++;
          console.warn(`⚠️ No se pudo actualizar tarea ${todoId}:`, err);
          return { success: false, todoId, error: err };
        }
      });
      
      const results = await Promise.all(savePromises);
      
      // Limpiar cambios pendientes solo si todos fueron exitosos
      if (errorCount === 0) {
        setPendingChanges({});
        showSuccess(`✅ ${successCount} cambios guardados exitosamente`);
      } else {
        // Mantener solo los cambios que fallaron
        const failedChanges = results
          .filter(result => !result.success)
          .reduce((acc, result) => {
            acc[result.todoId] = pendingChanges[result.todoId];
            return acc;
          }, {} as { [key: string]: TodoItem });
        
        setPendingChanges(failedChanges);
        showError(`⚠️ ${successCount} cambios guardados, ${errorCount} fallaron. Reintenta guardar los cambios restantes.`);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al guardar cambios:', err);
      showError('Error al guardar algunos cambios');
    } finally {
      setIsSaving(false);
    }
  };

  // Función de refresh con debounce
  const refreshWithDebounce = async () => {
    if (isRefreshing) {
      console.log('⏳ Ya hay una actualización en progreso, ignorando...');
      return;
    }
    
    setIsRefreshing(true);
    try {
      await fetchTodosFromSheets();
    } finally {
      // Esperar 2 segundos antes de permitir otra actualización
      setTimeout(() => {
        setIsRefreshing(false);
      }, 2000);
    }
  };

  // Efecto para detectar intentos de salir de la página con cambios pendientes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(pendingChanges).length > 0) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        return 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (Object.keys(pendingChanges).length > 0) {
        e.preventDefault();
        setShowExitConfirm(true);
        // Restaurar el estado de la URL
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pendingChanges]);

  // Función para retry con backoff exponencial
  const fetchWithRetry = async (url: string, maxRetries = 3): Promise<Response> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url);
        
        if (response.status === 429) {
          // Rate limit excedido, esperar antes del siguiente intento
          const waitTime = Math.pow(2, attempt) * 1000; // Backoff exponencial: 1s, 2s, 4s
          console.log(`⏳ Rate limit excedido. Esperando ${waitTime}ms antes del intento ${attempt + 1}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error;
        }
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`❌ Error en intento ${attempt + 1}/${maxRetries}. Esperando ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    throw new Error('Máximo número de reintentos alcanzado');
  };

  // Función para verificar permisos de escritura en Google Sheet
  const checkSheetPermissions = async () => {
    if (!googleAccessToken) {
      showError('❌ No estás autenticado con Google');
      return false;
    }

    try {
      const validToken = await getValidToken();
      const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/${TODO_SHEET_ID}`;
      
      console.log('🔍 Verificando permisos de escritura...');
      
      const response = await fetch(testUrl, {
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        showError('❌ No tienes permisos para acceder a este Google Sheet. Asegúrate de que esté compartido con tu cuenta de Google.');
        return false;
      }

      if (!response.ok) {
        showError(`❌ Error verificando permisos: ${response.status}`);
        return false;
      }

      const sheetData = await response.json();
      console.log('✅ Permisos verificados:', {
        title: sheetData.properties?.title,
        sheetId: sheetData.spreadsheetId,
        hasWriteAccess: true
      });
      
      showSuccess('✅ Tienes permisos de escritura en el Google Sheet');
      return true;
    } catch (error) {
      console.error('Error verificando permisos:', error);
      showError('❌ Error verificando permisos del Google Sheet');
      return false;
    }
  };

  // Función de diagnóstico para verificar la configuración OAuth2
  const diagnoseGoogleSheetsAccess = async () => {
    console.log('🔍 Diagnóstico de acceso a Google Sheets (OAuth2):');
    console.log('1. Sheet ID:', TODO_SHEET_ID);
    console.log('2. Sheet Name:', TODO_SHEET_NAME);
    console.log('3. Google Client ID configurado:', !!GOOGLE_CLIENT_ID);
    console.log('4. OAuth2 autenticado:', !!googleAccessToken);
    console.log('5. Google Auth Service disponible:', !!googleAuthenticate);
    
    // Verificar configuración básica
    if (!GOOGLE_CLIENT_ID) {
      showError('❌ Google Client ID no configurado. Agrega VITE_GOOGLE_CLIENT_ID a tu archivo .env');
      return false;
    }
    
    if (!googleAccessToken) {
      showError('❌ No estás autenticado con Google. Haz clic en "Conectar con Google" para autenticarte');
      return false;
    }
    
    // Verificar acceso al Google Sheet usando OAuth2
    try {
      const validToken = await getValidToken();
      const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/${TODO_SHEET_ID}`;
      const testResponse = await fetch(testUrl, {
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (testResponse.status === 401) {
        showError('❌ Error 401: Token de acceso expirado o inválido. Vuelve a autenticarte');
        return false;
      } else if (testResponse.status === 403) {
        showError('❌ Error 403: No tienes permisos para acceder a este Google Sheet');
        return false;
      } else if (testResponse.status === 404) {
        showError('❌ Error 404: Google Sheet no encontrado. Verifica el ID del sheet');
        return false;
      } else if (!testResponse.ok) {
        showError(`❌ Error ${testResponse.status}: ${testResponse.statusText}`);
        return false;
      }
      
      const sheetData = await testResponse.json();
      showSuccess(`✅ Acceso a Google Sheets verificado correctamente. Sheet: "${sheetData.properties?.title || 'Sin título'}"`);
      return true;
    } catch (error) {
      console.error('Error en diagnóstico:', error);
      showError('❌ Error de red al verificar la configuración');
      return false;
    }
  };

  // Función para obtener todos desde Google Sheets
  const fetchTodosFromSheets = async () => {
    if (!GOOGLE_API_KEY) {
      showError('API Key de Google no configurada. Por favor, configura VITE_GOOGLE_API_KEY en tu archivo .env');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Usar solo API Key
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${TODO_SHEET_ID}/values/${TODO_SHEET_NAME}?key=${GOOGLE_API_KEY}`;
      
      console.log('🔍 Intentando acceder al Google Sheet:', {
        sheetId: TODO_SHEET_ID,
        sheetName: TODO_SHEET_NAME,
        apiKey: GOOGLE_API_KEY ? `${GOOGLE_API_KEY.substring(0, 10)}...` : 'No configurada'
      });
      
      const response = await fetchWithRetry(url);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Error 403: Sin permisos para acceder al Google Sheet. Verifica que: 1) La API Key sea válida, 2) El sheet esté compartido públicamente, 3) La API de Google Sheets esté habilitada');
        }
        throw new Error(`Error al obtener datos del Google Sheet: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.values || data.values.length < 2) {
        setTodos([]);
        setIsConnected(true);
        setIsLoading(false);
        return;
      }

      const sheetHeaders = data.values[0];
      const rows = data.values.slice(1);
      
      // Debug: Mostrar las columnas del Google Sheet
      console.log('📋 Headers del Google Sheet:', sheetHeaders);
      console.log('📊 Número de columnas:', sheetHeaders?.length);
      console.log('📝 Primera fila de datos:', rows[0]);
      
      // Mostrar cada columna con su índice
      if (sheetHeaders) {
        console.log('🔍 Mapeo de columnas:');
        sheetHeaders.forEach((header: string, index: number) => {
          console.log(`  ${index}: "${header}"`);
        });
      }
      
      // Función para encontrar el índice de una columna por nombre
      const findColumnIndex = (searchTerms: string[]) => {
        for (const term of searchTerms) {
          const index = sheetHeaders.findIndex((header: string) => 
            header.toLowerCase().includes(term.toLowerCase())
          );
          if (index !== -1) return index;
        }
        return -1;
      };

      // Encontrar índices de columnas dinámicamente
      const nameIndex = findColumnIndex(['name', 'nombre', 'título', 'title']);
      const completedIndex = findColumnIndex(['completed', 'completado', 'estado']);
      const priorityIndex = findColumnIndex(['prioridad', 'priority']);
      const dueDateIndex = findColumnIndex(['fecha de entrega', 'fecha entrega', 'fecha', 'due date']);
      const assignedToIndex = findColumnIndex(['encargado', 'asignado', 'responsable', 'assigned']);
      const descriptionIndex = findColumnIndex(['descripción', 'descripcion', 'description', 'detalle']);
      const notesIndex = findColumnIndex(['notas', 'notes', 'comentarios', 'observaciones']);

      // Si no se encuentran las columnas, usar índices por defecto basados en la estructura típica
      const finalNameIndex = nameIndex !== -1 ? nameIndex : 0;
      const finalCompletedIndex = completedIndex !== -1 ? completedIndex : 1;
      const finalPriorityIndex = priorityIndex !== -1 ? priorityIndex : 2;
      const finalDueDateIndex = dueDateIndex !== -1 ? dueDateIndex : 3;
      const finalAssignedToIndex = assignedToIndex !== -1 ? assignedToIndex : 4;
      const finalDescriptionIndex = descriptionIndex !== -1 ? descriptionIndex : 5;
      const finalNotesIndex = notesIndex !== -1 ? notesIndex : 6;

      console.log('🎯 Índices de columnas encontrados:', {
        name: nameIndex,
        completed: completedIndex,
        priority: priorityIndex,
        dueDate: dueDateIndex,
        assignedTo: assignedToIndex,
        description: descriptionIndex,
        notes: notesIndex
      });

      console.log('🎯 Índices finales que se usarán:', {
        name: finalNameIndex,
        completed: finalCompletedIndex,
        priority: finalPriorityIndex,
        dueDate: finalDueDateIndex,
        assignedTo: finalAssignedToIndex,
        description: finalDescriptionIndex,
        notes: finalNotesIndex
      });

      // Debug: Mostrar la estructura real del sheet
      console.log('📊 Estructura real del Google Sheet:');
      console.log('  A (0):', sheetHeaders[0] || 'VACÍO');
      console.log('  B (1):', sheetHeaders[1] || 'VACÍO');
      console.log('  C (2):', sheetHeaders[2] || 'VACÍO');
      console.log('  D (3):', sheetHeaders[3] || 'VACÍO');
      console.log('  E (4):', sheetHeaders[4] || 'VACÍO');
      console.log('  F (5):', sheetHeaders[5] || 'VACÍO');
      console.log('  G (6):', sheetHeaders[6] || 'VACÍO');
      console.log('  H (7):', sheetHeaders[7] || 'VACÍO');

      const mappedTodos: TodoItem[] = rows.map((row: any[], index: number) => {
        // Mapear fecha de entrega desde la columna correcta
        let dueDate = '';
        if (row[finalDueDateIndex]) {
          try {
            // Intentar parsear la fecha en diferentes formatos
            const dateValue = row[finalDueDateIndex].toString().trim();
            if (dateValue) {
              // Si es una fecha válida, convertirla a formato ISO
              const parsedDate = new Date(dateValue);
              if (!isNaN(parsedDate.getTime())) {
                dueDate = parsedDate.toISOString();
              } else {
                // Si no se puede parsear, usar el valor tal como está
                dueDate = dateValue;
              }
            }
          } catch (error) {
            console.warn('Error al parsear fecha:', row[dueDateIndex], error);
            dueDate = row[dueDateIndex] || '';
          }
        }

        return {
          id: `todo-${index + 1}`,
          title: row[nameIndex] || '', // Name
          description: row[descriptionIndex] || '', // Descripcion
          completed: (() => {
            const completedValue = (row[completedIndex] || '').toLowerCase().trim();
            return completedValue === 'true' || 
                   completedValue === 'completed' || 
                   completedValue === 'completado' || 
                   completedValue === 'finalizado' ||
                   completedValue === 'true';
          })(), // Completed - maneja múltiples valores en español
          priority: (() => {
            const priority = (row[priorityIndex] || '').toLowerCase();
            if (priority === 'alta' || priority === 'high') return 'high';
            if (priority === 'baja' || priority === 'low') return 'low';
            if (priority === 'media' || priority === 'medium') return 'medium';
            return 'medium'; // valor por defecto
          })() as 'low' | 'medium' | 'high', // Prioridad
          dueDate: dueDate, // Fecha de entrega
          assignedTo: row[assignedToIndex] || '', // Encargado de la tarea
          notes: row[notesIndex] || '', // Notas
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      setTodos(mappedTodos);
      updateAvailableAssignees(mappedTodos);
      setIsConnected(true);
    } catch (err) {
      console.error('Error al obtener todos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Generar ID único
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Agregar nuevo todo a Google Sheets
  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) return;

    if (!googleAccessToken) {
      showError('Se requiere autenticación OAuth2 para agregar tareas. Por favor, conéctate con Google.');
      return;
    }

    try {
      // Obtener el mapeo correcto de columnas
      const columnMapping = await getColumnMapping();
      
      // Convertir prioridad de inglés a español
      const priorityMap = {
        'low': 'baja',
        'medium': 'media', 
        'high': 'alta'
      };
      
      // Crear array de valores con el mapeo correcto de columnas
      const values = new Array(Math.max(...Object.values(columnMapping)) + 1).fill('');
      
      // Mapear valores a las columnas correctas
      values[columnMapping.name] = newTodo.title.trim();
      values[columnMapping.completed] = 'pendiente';
      values[columnMapping.priority] = priorityMap[newTodo.priority] || 'media';
      values[columnMapping.dueDate] = newTodo.dueDate || '';
      values[columnMapping.assignedTo] = newTodo.assignedTo.trim() || '';
      values[columnMapping.description] = newTodo.description.trim() || '';
      values[columnMapping.notes] = newTodo.notes.trim() || '';
      
      // Agregar fecha de creación (hoy) si existe la columna
      const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      if (columnMapping.createdAt !== undefined) {
        values[columnMapping.createdAt] = today;
      }

      console.log('🔄 Agregando nueva tarea con mapeo de columnas:', {
        columnMapping,
        values,
        newTodo
      });

      // Usar OAuth2 si está disponible, sino API Key
      let url: string;
      let headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      try {
        const validToken = await getValidToken();
        url = `https://sheets.googleapis.com/v4/spreadsheets/${TODO_SHEET_ID}/values/${TODO_SHEET_NAME}:append?valueInputOption=USER_ENTERED`;
        headers['Authorization'] = `Bearer ${validToken}`;
      } catch (err) {
        console.error('Error al obtener token válido:', err);
        throw new Error('No se pudo obtener un token válido para agregar la tarea');
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ values: [values] })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en respuesta:', errorText);
        throw new Error(`Error al agregar tarea: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Tarea agregada exitosamente a Google Sheets');

      setNewTodo({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '', notes: '' });
      setShowAddForm(false);
      await fetchTodosFromSheets();
      showSuccess('Tarea agregada exitosamente');
      setError(null);
      
    } catch (err) {
      console.error('Error al agregar tarea:', err);
      showError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  // Toggle completado en Google Sheets
  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const updatedTodo = { ...todo, completed: !todo.completed, updatedAt: new Date().toISOString() };
      
      // Actualizar en Google Sheets
      await updateTodoInSheets(updatedTodo, 'completed');
      
      // Actualizar estado local
      const updatedTodos = todos.map(t => t.id === id ? updatedTodo : t);
      setTodos(updatedTodos);
      updateAvailableAssignees(updatedTodos);
      showSuccess('Estado actualizado exitosamente');
      setError(null);
      
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
      showError('Error al actualizar el estado');
    }
  };

  // Cambiar prioridad de una tarea
  const handlePriorityChange = async (id: string, newPriority: 'low' | 'medium' | 'high') => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const updatedTodo = { ...todo, priority: newPriority, updatedAt: new Date().toISOString() };
      
      // Actualizar estado local inmediatamente
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      
      // Marcar como pendiente de guardar
      setPendingChanges(prev => ({
        ...prev,
        [id]: updatedTodo
      }));
      
      setSuccessMessage('✅ Prioridad actualizada localmente (presiona "Guardar" para sincronizar con Google Sheets)');
      
      setError(null);
      
    } catch (err) {
      console.error('Error al actualizar prioridad:', err);
      setError('Error al actualizar la prioridad');
    }
  };

  // Cambiar encargado de una tarea
  const handleAssigneeChange = async (id: string, newAssignee: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const updatedTodo = { ...todo, assignedTo: newAssignee, updatedAt: new Date().toISOString() };
      
      // Actualizar estado local inmediatamente
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      
      // Marcar como pendiente de guardar
      setPendingChanges(prev => ({
        ...prev,
        [id]: updatedTodo
      }));
      
      setSuccessMessage('✅ Encargado actualizado localmente (presiona "Guardar" para sincronizar con Google Sheets)');
      
      setError(null);
      
    } catch (err) {
      console.error('Error al actualizar encargado:', err);
      setError('Error al actualizar el encargado');
    }
  };

  // Cambiar estado de una tarea
  const handleStatusChange = async (id: string, newStatus: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const completed = newStatus === 'completado';
      const updatedTodo = { ...todo, completed, updatedAt: new Date().toISOString() };
      
      // Actualizar estado local inmediatamente
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      
      // Marcar como pendiente de guardar
      setPendingChanges(prev => ({
        ...prev,
        [id]: updatedTodo
      }));
      
      setSuccessMessage('✅ Estado actualizado localmente (presiona "Guardar" para sincronizar con Google Sheets)');
      
      setError(null);
      
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError('Error al actualizar el estado');
    }
  };

  // Cambiar fecha de entrega de una tarea
  const handleDueDateChange = async (id: string, newDueDate: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const updatedTodo = { 
        ...todo, 
        dueDate: newDueDate ? new Date(newDueDate).toISOString() : '', 
        updatedAt: new Date().toISOString() 
      };
      
      // Actualizar estado local inmediatamente
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      
      // Marcar como pendiente de guardar
      setPendingChanges(prev => ({
        ...prev,
        [id]: updatedTodo
      }));
      
      setSuccessMessage(`✅ Fecha de entrega actualizada localmente: ${newDueDate ? formatDate(updatedTodo.dueDate) : 'Sin fecha'} (presiona "Guardar" para sincronizar con Google Sheets)`);
      
      setError(null);
      
    } catch (err) {
      console.error('Error al actualizar fecha de entrega:', err);
      setError('Error al actualizar la fecha de entrega');
    }
  };

  // Cambiar título de una tarea
  const handleTitleChange = async (id: string, newTitle: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const updatedTodo = { 
        ...todo, 
        title: newTitle, 
        updatedAt: new Date().toISOString() 
      };
      
      // Actualizar estado local inmediatamente
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      
      // Marcar como pendiente de guardar
      setPendingChanges(prev => ({
        ...prev,
        [id]: updatedTodo
      }));
      
      setSuccessMessage('✅ Título actualizado localmente (presiona "Guardar" para sincronizar con Google Sheets)');
      
      setError(null);
      
    } catch (err) {
      console.error('Error al actualizar título:', err);
      setError('Error al actualizar el título');
    }
  };

  // Cambiar descripción de una tarea
  const handleDescriptionChange = async (id: string, newDescription: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const updatedTodo = { 
        ...todo, 
        description: newDescription, 
        updatedAt: new Date().toISOString() 
      };
      
      // Actualizar estado local inmediatamente
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      
      // Marcar como pendiente de guardar
      setPendingChanges(prev => ({
        ...prev,
        [id]: updatedTodo
      }));
      
      setSuccessMessage('✅ Descripción actualizada localmente (presiona "Guardar" para sincronizar con Google Sheets)');
      
      setError(null);
      
    } catch (err) {
      console.error('Error al actualizar descripción:', err);
      setError('Error al actualizar la descripción');
    }
  };

  // Cambiar notas de una tarea
  const handleNotesChange = (id: string, newNotes: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const updatedTodo = { 
      ...todo, 
      notes: newNotes, 
      updatedAt: new Date().toISOString() 
    };
    
    // Actualizar solo localmente (cambios pendientes)
    updatePendingChange(id, updatedTodo);
  };

  // Eliminar todo de Google Sheets
  const deleteTodo = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;

    try {
      await deleteTodoFromSheets(id);
      setTodos(todos.filter(todo => todo.id !== id));
      setSuccessMessage('✅ Tarea eliminada exitosamente');
      setError(null);
      
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
      setError('Error al eliminar la tarea');
    }
  };


  // Función para obtener la estructura del sheet y mapear columnas correctamente
  const getColumnMapping = async () => {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${TODO_SHEET_ID}/values/${TODO_SHEET_NAME}?key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al obtener estructura del sheet');
      }
      
      const data = await response.json();
      const sheetHeaders = data.values[0] || [];
      
      // Función para encontrar el índice de una columna por nombre
      const findColumnIndex = (searchTerms: string[]) => {
        for (const term of searchTerms) {
          const index = sheetHeaders.findIndex((header: string) => 
            header.toLowerCase().includes(term.toLowerCase())
          );
          if (index !== -1) return index;
        }
        return -1;
      };

      // Mapear columnas dinámicamente
      const mapping = {
        name: findColumnIndex(['name', 'nombre', 'título', 'title']) !== -1 ? 
              findColumnIndex(['name', 'nombre', 'título', 'title']) : 0,
        completed: findColumnIndex(['completed', 'completado', 'estado']) !== -1 ? 
                  findColumnIndex(['completed', 'completado', 'estado']) : 1,
        priority: findColumnIndex(['prioridad', 'priority']) !== -1 ? 
                 findColumnIndex(['prioridad', 'priority']) : 2,
        dueDate: findColumnIndex(['fecha de entrega', 'fecha entrega', 'fecha', 'due date']) !== -1 ? 
                findColumnIndex(['fecha de entrega', 'fecha entrega', 'fecha', 'due date']) : 3,
        assignedTo: findColumnIndex(['encargado', 'asignado', 'responsable', 'assigned']) !== -1 ? 
                   findColumnIndex(['encargado', 'asignado', 'responsable', 'assigned']) : 4,
        description: findColumnIndex(['descripción', 'descripcion', 'description', 'detalle']) !== -1 ? 
                    findColumnIndex(['descripción', 'descripcion', 'description', 'detalle']) : 5,
        notes: findColumnIndex(['notas', 'notes', 'comentarios', 'observaciones']) !== -1 ? 
               findColumnIndex(['notas', 'notes', 'comentarios', 'observaciones']) : 6,
        createdAt: findColumnIndex(['fecha de inicio', 'fecha de creacion', 'fecha creacion', 'created at', 'fecha inicio']) !== -1 ? 
                  findColumnIndex(['fecha de inicio', 'fecha de creacion', 'fecha creacion', 'created at', 'fecha inicio']) : -1
      };

      console.log('🗺️ Mapeo de columnas detectado:', mapping);
      console.log('📋 Headers del sheet:', sheetHeaders);
      
      return mapping;
    } catch (error) {
      console.error('Error al obtener mapeo de columnas:', error);
      // Fallback a mapeo por defecto
      return {
        name: 0,
        completed: 1,
        priority: 2,
        dueDate: 3,
        assignedTo: 4,
        description: 5,
        notes: 6,
        createdAt: -1 // No hay columna de fecha de creación por defecto
      };
    }
  };

  // Función para actualizar todo en Google Sheets
  const updateTodoInSheets = async (todo: TodoItem, fieldToUpdate?: string) => {
    if (!accessToken && !GOOGLE_API_KEY) {
      throw new Error('No se puede actualizar tarea - Sin autenticación');
    }

    try {
      // Buscar la fila del todo en el sheet
      const todoIndex = todos.findIndex(t => t.id === todo.id);
      if (todoIndex === -1) throw new Error('Tarea no encontrada');

      const rowNumber = todoIndex + 2; // +2 porque la fila 1 es el header
      
      // Si no se especifica campo, actualizar toda la fila (comportamiento anterior)
      if (!fieldToUpdate) {
        return updateFullRowInSheets(todo, rowNumber);
      }
      
      // Obtener el mapeo correcto de columnas
      const columnMapping = await getColumnMapping();
      
      // Determinar qué columna actualizar basado en el campo
      let columnToUpdate = '';
      let valueToUpdate = '';
      
      switch (fieldToUpdate) {
        case 'title':
          columnToUpdate = String.fromCharCode(65 + columnMapping.name); // A, B, C, etc.
          valueToUpdate = todo.title || '';
          break;
        case 'description':
          columnToUpdate = String.fromCharCode(65 + columnMapping.description);
          valueToUpdate = todo.description || '';
          break;
        case 'notes':
          columnToUpdate = String.fromCharCode(65 + columnMapping.notes);
          valueToUpdate = todo.notes || '';
          break;
        case 'priority':
          columnToUpdate = String.fromCharCode(65 + columnMapping.priority);
          const priorityMap = { 'low': 'baja', 'medium': 'media', 'high': 'alta' };
          valueToUpdate = priorityMap[todo.priority] || 'media';
          break;
        case 'completed':
          columnToUpdate = String.fromCharCode(65 + columnMapping.completed);
          valueToUpdate = todo.completed ? 'completado' : 'pendiente';
          break;
        case 'dueDate':
          columnToUpdate = String.fromCharCode(65 + columnMapping.dueDate);
          if (todo.dueDate) {
            try {
              const date = new Date(todo.dueDate);
              if (!isNaN(date.getTime())) {
                valueToUpdate = date.toISOString().split('T')[0];
              } else {
                valueToUpdate = todo.dueDate;
              }
            } catch (error) {
              valueToUpdate = todo.dueDate;
            }
          } else {
            valueToUpdate = '';
          }
          break;
        case 'assignedTo':
          columnToUpdate = String.fromCharCode(65 + columnMapping.assignedTo);
          valueToUpdate = todo.assignedTo || '';
          break;
        default:
          return updateFullRowInSheets(todo, rowNumber);
      }

      const range = `${TODO_SHEET_NAME}!${columnToUpdate}${rowNumber}`;
      const values = [[valueToUpdate]];
      
      // Usar OAuth2 si está disponible, sino API Key
      let url: string;
      let headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (googleAccessToken) {
        try {
          const validToken = await getValidToken();
          url = `https://sheets.googleapis.com/v4/spreadsheets/${TODO_SHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`;
          headers['Authorization'] = `Bearer ${validToken}`;
        } catch (err) {
          console.error('Error al obtener token válido:', err);
          throw new Error('No se pudo obtener un token válido para la actualización');
        }
      } else {
        // Para escritura, necesitamos OAuth2, no API Key
        throw new Error('Se requiere autenticación OAuth2 para escribir en Google Sheets. Por favor, conéctate con Google.');
      }

      console.log(`🔄 Actualizando campo ${fieldToUpdate} en Google Sheets:`, {
        todoId: todo.id,
        rowNumber,
        range,
        value: valueToUpdate,
        columnToUpdate,
        url
      });
      
      // Debug: Mostrar qué columna se está actualizando
      console.log(`📍 Actualizando columna ${columnToUpdate} con valor: "${valueToUpdate}"`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ values })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en respuesta:', errorText);
        throw new Error(`Error al actualizar ${fieldToUpdate}: ${response.status} ${response.statusText}`);
      }
      
      console.log(`✅ Campo ${fieldToUpdate} actualizado exitosamente`);
      
    } catch (err) {
      console.error('Error al actualizar campo en Google Sheets:', err);
      throw err;
    }
  };

  // Función para actualizar toda la fila (fallback)
  const updateFullRowInSheets = async (todo: TodoItem, rowNumber: number) => {
    const priorityMap = { 'low': 'baja', 'medium': 'media', 'high': 'alta' };
    const completedValue = todo.completed ? 'completado' : 'pendiente';
    
    let formattedDueDate = '';
    if (todo.dueDate) {
      try {
        const date = new Date(todo.dueDate);
        if (!isNaN(date.getTime())) {
          formattedDueDate = date.toISOString().split('T')[0];
        } else {
          formattedDueDate = todo.dueDate;
        }
      } catch (error) {
        formattedDueDate = todo.dueDate;
      }
    }
    
    // Solo actualizar las columnas que existen, sin incluir progreso vacío
    const values = [[
      todo.title || '', // A - Name
      completedValue, // B - Completed
      priorityMap[todo.priority] || 'media', // C - Prioridad
      formattedDueDate, // D - Fecha de entrega
      '', // E - Progreso (vacío, no lo usamos)
      todo.assignedTo || '', // F - Encargado
      todo.description || '', // G - Descripcion
      todo.notes || '' // H - Notas
    ]];

    // Actualizar solo las columnas A-H (incluyendo la columna de progreso vacía)
    const range = `${TODO_SHEET_NAME}!A${rowNumber}:H${rowNumber}`;
    
    let url: string;
    let headers: HeadersInit = { 'Content-Type': 'application/json' };
    
    if (googleAccessToken) {
      const validToken = await getValidToken();
      url = `https://sheets.googleapis.com/v4/spreadsheets/${TODO_SHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`;
      headers['Authorization'] = `Bearer ${validToken}`;
      
      console.log('🔍 Diagnóstico de escritura:', {
        sheetId: TODO_SHEET_ID,
        range: range,
        hasToken: !!validToken,
        tokenPreview: validToken ? validToken.substring(0, 20) + '...' : 'null',
        url: url
      });
    } else {
      // Para escritura, necesitamos OAuth2, no API Key
      throw new Error('Se requiere autenticación OAuth2 para escribir en Google Sheets. Por favor, conéctate con Google.');
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ values })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error 403 - Detalles:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        headers: headers,
        errorText: errorText
      });
      
      if (response.status === 403) {
        throw new Error(`Error 403: No tienes permisos para escribir en este Google Sheet. Asegúrate de que el sheet esté compartido con tu cuenta de Google (${googleAccessToken ? 'autenticado' : 'no autenticado'})`);
      }
      
      throw new Error(`Error al actualizar fila completa: ${response.status} - ${response.statusText}`);
    }
  };

  // Función para eliminar todo de Google Sheets
  const deleteTodoFromSheets = async (id: string) => {
    if (!googleAccessToken) {
      throw new Error('Se requiere autenticación OAuth2 para eliminar tareas. Por favor, conéctate con Google.');
    }

    try {
      const todoIndex = todos.findIndex(t => t.id === id);
      if (todoIndex === -1) throw new Error('Tarea no encontrada');

      // Obtener el mapeo correcto de columnas para saber cuántas columnas limpiar
      const columnMapping = await getColumnMapping();
      const maxColumnIndex = Math.max(...Object.values(columnMapping).filter(v => v !== -1));
      const range = `${TODO_SHEET_NAME}!A${todoIndex + 2}:${String.fromCharCode(65 + maxColumnIndex)}${todoIndex + 2}`;
      
      // Crear array de valores vacíos para limpiar la fila
      const emptyValues = new Array(maxColumnIndex + 1).fill('');
      
      let url: string;
      let headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      try {
        const validToken = await getValidToken();
        url = `https://sheets.googleapis.com/v4/spreadsheets/${TODO_SHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`;
        headers['Authorization'] = `Bearer ${validToken}`;
      } catch (err) {
        console.error('Error al obtener token válido:', err);
        throw new Error('No se pudo obtener un token válido para eliminar la tarea');
      }

      console.log('🗑️ Eliminando tarea de Google Sheets:', {
        todoId: id,
        todoIndex,
        range,
        maxColumnIndex,
        emptyValues
      });
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          values: [emptyValues] // Limpiar la fila
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en respuesta:', errorText);
        throw new Error(`Error al eliminar tarea: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Tarea eliminada exitosamente de Google Sheets');
      
    } catch (err) {
      console.error('Error al eliminar tarea de Google Sheets:', err);
      throw err;
    }
  };


  // Migrar datos desde Airtable
  const handleMigrateFromAirtable = async () => {
    try {
      setIsMigrating(true);
      setError(null);
      
      console.log('🔄 Iniciando migración desde Airtable público...');
      showInfo('Iniciando migración desde Airtable...');
      
      // Migrar datos desde Airtable público
      await airtableMigration.migrateToGoogleSheets();
      
      showSuccess('Migración desde Airtable completada. Se crearon 5 tareas de ejemplo.');
      
      // Recargar datos del Google Sheet
      await fetchTodosFromSheets();
      
    } catch (err) {
      console.error('❌ Error en la migración:', err);
      showError(err instanceof Error ? err.message : 'Error desconocido en la migración');
    } finally {
      setIsMigrating(false);
    }
  };

  // Efecto para limpiar mensajes de éxito automáticamente
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Efecto para cargar datos cuando el usuario esté autenticado con Google
  useEffect(() => {
    if (googleAuthenticated) {
      console.log('✅ Usuario autenticado con Google, cargando datos...');
      fetchTodosFromSheets();
    }
  }, [googleAuthenticated]);

  // Efecto para manejar OAuth2 y cargar datos (COMENTADO - usando servicio centralizado)
  /* useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      console.log('🔍 Verificando callback OAuth2:', {
        code: code ? 'Presente' : 'No presente',
        state: state,
        currentPath: window.location.pathname,
        currentSearch: window.location.search
      });
      
      if (code && state === 'todo_auth') {
        console.log('🔑 Código de autorización recibido:', code);
        
        try {
          const tokens = await exchangeCodeForTokens(code);
          console.log('🔑 Tokens obtenidos:', tokens);
          
          saveTokensToStorage(tokens.access_token, tokens.refresh_token, tokens.expires_in);
          setAccessToken(tokens.access_token);
          setIsAuthenticated(true);
          
          // Limpiar la URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Cargar datos después de autenticación
          fetchTodosFromSheets();
        } catch (err) {
          console.error('Error al intercambiar código por tokens:', err);
          setError('Error en la autenticación con Google');
        }
      }
    };

    const loadTodos = async () => {
      console.log('🔄 Cargando To Do...');
      
      // Verificar si hay token válido
      if (isTokenValid()) {
        const token = localStorage.getItem('google_access_token');
        setAccessToken(token);
        setIsAuthenticated(true);
        console.log('🔑 Token OAuth2 válido encontrado, cargando desde Google Sheets...');
        fetchTodosFromSheets();
      } else {
        // Token expirado o no existe, intentar renovar si hay refresh token
        const refreshToken = localStorage.getItem('google_refresh_token');
        if (refreshToken) {
          console.log('🔄 Token expirado, intentando renovar con refresh token...');
          try {
            const newToken = await refreshAccessToken();
            setAccessToken(newToken);
            setIsAuthenticated(true);
            console.log('✅ Token renovado exitosamente, cargando desde Google Sheets...');
            fetchTodosFromSheets();
            return;
          } catch (err) {
            console.error('❌ Error al renovar token:', err);
            // Si falla la renovación, limpiar tokens y continuar con API Key o datos de ejemplo
            localStorage.removeItem('google_access_token');
            localStorage.removeItem('google_refresh_token');
            localStorage.removeItem('google_token_expiry');
            setAccessToken(null);
            setIsAuthenticated(false);
          }
        }
        
        // Si no hay refresh token o falló la renovación, usar API Key o datos de ejemplo
        if (GOOGLE_API_KEY) {
          console.log('🔑 API Key encontrada, cargando desde Google Sheets...');
          fetchTodosFromSheets();
        } else {
          console.log('⚠️ Sin autenticación, cargando datos de ejemplo...');
          // Cargar datos de ejemplo si no hay autenticación
          setTodos([
            {
              id: '1',
              title: 'Tarea de ejemplo 1',
              description: 'Esta es una tarea de ejemplo para demostrar la funcionalidad',
              priority: 'high',
              completed: false,
              dueDate: new Date().toISOString().split('T')[0],
              assignedTo: 'Juan Pérez',
              notes: 'Esta tarea requiere revisión urgente',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: '2',
              title: 'Tarea de ejemplo 2',
              description: 'Otra tarea de ejemplo con prioridad media',
              priority: 'medium',
              completed: true,
              dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              assignedTo: 'María García',
              notes: 'Tarea completada exitosamente',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]);
          setIsLoading(false);
        }
      }
    };

    // Manejar callback de OAuth2
    handleOAuthCallback();
    
    // Cargar datos
    loadTodos();
  }, []); */


  // Filtrar todos
  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && todo.completed) ||
                         (filterStatus === 'pending' && !todo.completed);
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-brand-green-dark text-white border-brand-green-dark';
      case 'medium':
        return 'bg-brand-green-medium text-white border-brand-green-medium';
      case 'low':
        return 'bg-brand-green-light text-brand-green-dark border-brand-green-light';
      default:
        return 'bg-brand-green-light text-brand-green-dark border-brand-green-light';
    }
  };

  // Obtener texto de prioridad
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return 'Media';
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Estadísticas
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;
  const highPriorityTodos = todos.filter(todo => todo.priority === 'high' && !todo.completed).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-text-secondary">Cargando tareas desde Google Sheets...</p>
        </div>
      </div>
    );
  }

  // Si no hay OAuth2 autorizado ni API Key, mostrar pantalla de autorización
  if (!accessToken && !isAuthenticated && !GOOGLE_API_KEY) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Autorización Requerida
            </h2>
            <p className="text-gray-600 mb-6">
              Para poder gestionar tareas y modificar datos en Google Sheets, 
              necesitas autorizar la aplicación con tu cuenta de Google.
            </p>
            {/* Botón Conectar con Google oculto temporalmente */}
            {false && (
              <Button 
                onClick={authenticateWithGoogle} 
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3"
                disabled={!GOOGLE_CLIENT_ID}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Conectar con Google
              </Button>
            )}
            {!GOOGLE_CLIENT_ID && (
              <p className="text-sm text-red-600 mt-2">
                Error: GOOGLE_CLIENT_ID no está configurado
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-brown">To Do - Lista de Tareas</h1>
          <p className="text-brand-green-medium mt-1">
            Gestiona tus tareas y mantén el control de tus actividades
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(GOOGLE_API_KEY || googleAccessToken) ? (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="bg-brand-green-light text-brand-green-medium hover:bg-brand-green-medium hover:text-white border-brand-green-medium font-medium"
                onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${TODO_SHEET_ID}/edit?gid=0#gid=0`, '_blank')}
              >
                <CheckCircle className="w-5 h-5 mr-2 text-brand-green-dark" />
                <span className="font-semibold">📊 Abrir Google Sheet</span>
              </Button>
              {/* Botón Actualizar oculto temporalmente */}
              {false && (
                <Button 
                  onClick={refreshWithDebounce} 
                  variant="outline"
                  disabled={isRefreshing}
                  className="font-medium"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="font-semibold">
                    {isRefreshing ? 'Actualizando...' : '🔄 Actualizar'}
                  </span>
                </Button>
              )}
              {/* Botón Diagnosticar oculto temporalmente */}
              {false && (
                <Button 
                  onClick={diagnoseGoogleSheetsAccess} 
                  variant="outline"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-300 hover:border-blue-400 transition-colors font-medium"
                  title="Verificar configuración de Google Sheets y OAuth2"
                >
                  <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="font-semibold">🔍 Diagnosticar</span>
                </Button>
              )}
              {/* Botón Verificar Permisos oculto temporalmente */}
              {false && googleAccessToken && (
                <Button 
                  onClick={checkSheetPermissions} 
                  variant="outline"
                  className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-300 hover:border-purple-400 transition-colors font-medium"
                  title="Verificar permisos de escritura en Google Sheet"
                >
                  <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
                  <span className="font-semibold">🔐 Verificar Permisos</span>
                </Button>
              )}
              {Object.keys(pendingChanges).length > 0 && (
                <Button 
                  onClick={saveAllPendingChanges} 
                  variant="outline"
                  disabled={isSaving}
                  className="bg-brand-green-light text-brand-green-medium hover:bg-brand-green-medium hover:text-white border-brand-green-medium ring-2 ring-brand-green-light animate-pulse font-medium"
                >
                  <Save className={`w-5 h-5 mr-2 text-brand-green-dark ${isSaving ? 'animate-spin' : ''}`} />
                  <span className="font-semibold">
                    {isSaving ? 'Guardando...' : `💾 Guardar Cambios (${Object.keys(pendingChanges).length})`}
                  </span>
                </Button>
              )}
              {/* Botón Conectar con Google oculto temporalmente */}
              {false && !googleAccessToken && GOOGLE_CLIENT_ID && (
                <Button 
                  onClick={authenticateWithGoogle} 
                  variant="outline"
                  className="bg-brand-green-light text-brand-green-medium hover:bg-brand-green-medium hover:text-white border-brand-green-medium font-medium"
                >
                  <CheckCircle className="w-5 h-5 mr-2 text-brand-green-dark" />
                  <span className="font-semibold">🔐 Conectar con Google</span>
                </Button>
              )}
              {console.log('🔍 Debug botón OAuth:', { googleAccessToken, GOOGLE_CLIENT_ID, showButton: !googleAccessToken && GOOGLE_CLIENT_ID })}
            </div>
          ) : (
            <div className="text-center">
              <Button variant="outline" className="bg-red-50 text-red-700" disabled>
                <AlertCircle className="w-4 h-4 mr-2" />
                No Conectado
              </Button>
              <div className="text-xs text-gray-500 mt-1">
                <p>Configura la API Key</p>
              </div>
            </div>
          )}
          <Button 
            onClick={() => setShowAddForm(true)} 
            disabled={!(GOOGLE_API_KEY || googleAccessToken)}
            className="bg-brand-green-medium text-white hover:bg-brand-green-dark"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Banner En Desarrollo */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
        <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
        <div>
          <h3 className="font-semibold text-yellow-800">🚧 Sección en Desarrollo</h3>
          <p className="text-yellow-700 text-sm mt-1">
            La integración con Google Sheets está siendo desarrollada. Pronto podrás sincronizar tus tareas automáticamente.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center bg-brand-white border-brand-green-light">
          <h3 className="text-2xl font-bold text-brand-brown">{totalTodos}</h3>
          <p className="text-brand-green-medium">Total Tareas</p>
        </Card>
        <Card className="text-center bg-brand-white border-brand-green-light">
          <h3 className="text-2xl font-bold text-brand-green-medium">{completedTodos}</h3>
          <p className="text-brand-green-medium">Completadas</p>
        </Card>
        <Card className="text-center bg-brand-white border-brand-green-light">
          <h3 className="text-2xl font-bold text-brand-green-light">{pendingTodos}</h3>
          <p className="text-brand-green-medium">Pendientes</p>
        </Card>
        <Card className="text-center bg-brand-white border-brand-green-light">
          <h3 className="text-2xl font-bold text-brand-green-dark">{highPriorityTodos}</h3>
          <p className="text-brand-green-medium">Prioridad Alta</p>
        </Card>
      </div>


      {/* Filters */}
      <Card className="bg-brand-white border-brand-green-light">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-green-medium" />
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-brand-green-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green-medium focus:border-brand-green-medium text-brand-brown"
              />
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-2 border border-brand-green-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green-medium focus:border-brand-green-medium text-brand-brown"
            >
              <option value="all">Todas las prioridades</option>
              <option value="high">Alta prioridad</option>
              <option value="medium">Media prioridad</option>
              <option value="low">Baja prioridad</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-brand-green-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green-medium focus:border-brand-green-medium text-brand-brown"
            >
              <option value="all">Todas las tareas</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completadas</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Todos List */}
      <div className="space-y-4">
        {filteredTodos.length === 0 ? (
          <Card className="text-center py-12 bg-brand-white border-brand-green-light">
            <CheckSquare className="w-16 h-16 text-brand-green-light mx-auto mb-4" />
            <h3 className="text-lg font-medium text-brand-brown mb-2">No hay tareas</h3>
            <p className="text-brand-green-medium mb-4">
              {searchTerm || filterPriority !== 'all' || filterStatus !== 'all' 
                ? 'No se encontraron tareas con los filtros aplicados'
                : 'Crea tu primera tarea para comenzar'
              }
            </p>
            {!searchTerm && filterPriority === 'all' && filterStatus === 'all' && (
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-brand-green-medium text-white hover:bg-brand-green-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Tarea
              </Button>
            )}
          </Card>
        ) : (
          filteredTodos.map((todo) => (
            <Card key={todo.id} className={`transition-all duration-200 bg-brand-white border-brand-green-light ${todo.completed ? 'opacity-75' : ''}`}>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`mt-1 p-1 rounded transition-colors ${
                    todo.completed 
                      ? 'text-brand-green-medium hover:text-brand-green-dark' 
                      : 'text-brand-green-light hover:text-brand-green-medium'
                  }`}
                >
                  {todo.completed ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={todo.title || ''}
                        onChange={(e) => handleTitleChange(todo.id, e.target.value)}
                        className={`text-lg font-medium bg-transparent border-none outline-none w-full ${todo.completed ? 'line-through text-brand-green-light' : 'text-brand-brown'} hover:bg-brand-green-light hover:bg-opacity-20 px-1 py-0.5 rounded`}
                        placeholder="Sin título seleccionado"
                      />
                      <textarea
                        value={todo.description || ''}
                        onChange={(e) => handleDescriptionChange(todo.id, e.target.value)}
                        className={`text-sm mt-1 bg-transparent border-none outline-none w-full resize-none ${todo.completed ? 'text-brand-green-light' : 'text-brand-green-medium'} hover:bg-brand-green-light hover:bg-opacity-20 px-1 py-0.5 rounded`}
                        placeholder="Sin descripción seleccionada"
                        rows={2}
                      />
                      <div className={`text-xs mt-2 p-2 bg-brand-green-light bg-opacity-20 border border-brand-green-light rounded ${todo.completed ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-brand-green-dark">Notas:</span>
                          {pendingChanges[todo.id] && (
                            <span className="text-xs bg-brand-green-medium text-white px-2 py-1 rounded-full">
                              Cambios pendientes
                            </span>
                          )}
                        </div>
                        <textarea
                          value={todo.notes || ''}
                          onChange={(e) => handleNotesChange(todo.id, e.target.value)}
                          className={`text-brand-green-dark mt-1 w-full bg-transparent border-none outline-none resize-none hover:bg-brand-green-light hover:bg-opacity-30 px-1 py-0.5 rounded ${
                            pendingChanges[todo.id] ? 'ring-2 ring-brand-green-medium' : ''
                          }`}
                          placeholder="Agregar notas..."
                          rows={2}
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <select
                          value={todo.priority}
                          onChange={(e) => handlePriorityChange(todo.id, e.target.value as 'low' | 'medium' | 'high')}
                          className={`px-2 py-1 rounded-full border text-xs ${getPriorityColor(todo.priority)}`}
                        >
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                        </select>
                        <select
                          value={todo.completed ? 'completado' : 'pendiente'}
                          onChange={(e) => handleStatusChange(todo.id, e.target.value)}
                          className={`px-2 py-1 rounded-full border text-xs flex items-center gap-1 ${
                            todo.completed 
                              ? 'bg-brand-green-medium text-white border-brand-green-medium' 
                              : 'bg-brand-green-light text-brand-green-dark border-brand-green-light'
                          }`}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="completado">Completada</option>
                        </select>
                        <div className="flex items-center gap-1">
                          <span className={`w-3 h-3 rounded-full ${todo.assignedTo ? 'bg-brand-green-medium' : 'bg-brand-green-light'}`}></span>
                          <div className="relative">
                            <select
                              value={todo.assignedTo || ''}
                              onChange={(e) => {
                                if (e.target.value === 'add_new') {
                                  setShowAddAssigneeFor(todo.id);
                                } else {
                                  handleAssigneeChange(todo.id, e.target.value);
                                }
                              }}
                              className="px-2 py-1 rounded-full border text-xs bg-brand-white border-brand-green-light focus:outline-none focus:ring-1 focus:ring-brand-green-medium text-brand-brown"
                            >
                              <option value="">Sin encargado seleccionado</option>
                              {availableAssignees.map((assignee) => (
                                <option key={assignee} value={assignee}>
                                  {assignee}
                                </option>
                              ))}
                              <option value="add_new" className="text-brand-green-medium font-medium">
                                + Agregar encargado
                              </option>
                            </select>
                            
                            {/* Modal para agregar nuevo encargado */}
                            {showAddAssigneeFor === todo.id && (
                              <div className="assignee-modal absolute top-8 left-0 z-50 bg-brand-white border border-brand-green-light rounded-lg shadow-lg p-3 min-w-64">
                                <div className="flex flex-col gap-2">
                                  <label className="text-xs font-medium text-brand-brown">
                                    Nuevo encargado:
                                  </label>
                                  <input
                                    type="text"
                                    value={newAssignee}
                                    onChange={(e) => setNewAssignee(e.target.value)}
                                    placeholder="Nombre del encargado"
                                    className="px-2 py-1 text-xs border border-brand-green-light rounded focus:outline-none focus:ring-1 focus:ring-brand-green-medium text-brand-brown"
                                    autoFocus
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={addNewAssignee}
                                      disabled={!newAssignee.trim()}
                                      className="px-2 py-1 text-xs bg-brand-green-medium text-white rounded hover:bg-brand-green-dark disabled:bg-brand-green-light disabled:cursor-not-allowed"
                                    >
                                      Agregar
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowAddAssigneeFor(null);
                                        setNewAssignee('');
                                      }}
                                      className="px-2 py-1 text-xs bg-brand-green-light text-brand-green-dark rounded hover:bg-brand-green-medium hover:text-white"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Fechas más claras y separadas */}
                      <div className="flex items-center gap-6 mt-3 text-sm">
                        <div className="flex items-center gap-2 bg-brand-green-light bg-opacity-20 px-3 py-2 rounded-lg">
                          <Calendar className="w-4 h-4 text-brand-green-medium" />
                          <div>
                            <span className="text-xs text-brand-green-medium font-medium">Fecha de entrega:</span>
                            <input
                              type="date"
                              value={todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleDueDateChange(todo.id, e.target.value)}
                              className="text-brand-green-dark font-semibold bg-transparent border-none outline-none cursor-pointer hover:bg-brand-green-light hover:bg-opacity-30 px-1 py-0.5 rounded"
                              title="Haz clic para cambiar la fecha de entrega"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-brand-green-light bg-opacity-10 px-3 py-2 rounded-lg">
                          <Clock className="w-4 h-4 text-brand-green-medium" />
                          <div>
                            <span className="text-xs text-brand-green-medium font-medium">Creada:</span>
                            <div className="text-brand-brown font-semibold">
                              {formatDate(todo.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-brand-green-dark hover:text-white hover:bg-brand-green-dark border-brand-green-light"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Componente de prueba de Google Auth - Removido temporalmente */}
      {false && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-text mb-4">🔐 Google Auth Test</h2>
          {/* <GoogleAuthTest /> */}
        </div>
      )}

      {/* Add Todo Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-text mb-4">Nueva Tarea</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Título de la tarea"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Descripción de la tarea (opcional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  rows={2}
                  value={newTodo.notes}
                  onChange={(e) => setNewTodo({...newTodo, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Notas adicionales (opcional)"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({...newTodo, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Encargado de la tarea
                </label>
                <input
                  type="text"
                  value={newTodo.assignedTo}
                  onChange={(e) => setNewTodo({...newTodo, assignedTo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nombre del encargado (opcional)"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button onClick={handleAddTodo} disabled={!newTodo.title.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Tarea
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para cambios pendientes */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-text">Cambios sin guardar</h3>
            </div>
            
            <p className="text-gray-700 mb-6">
              Tienes <strong>{Object.keys(pendingChanges).length} cambios pendientes</strong> que no se han guardado. 
              ¿Qué quieres hacer?
            </p>
            
            <div className="flex gap-3">
              <Button 
                onClick={async () => {
                  await saveAllPendingChanges();
                  setShowExitConfirm(false);
                  // Permitir navegación después de guardar
                  window.history.back();
                }}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar y Salir'}
              </Button>
              
              <Button 
                onClick={() => {
                  setShowExitConfirm(false);
                  // Descartar cambios y permitir navegación
                  setPendingChanges({});
                  window.history.back();
                }}
                variant="outline"
                className="text-gray-600 hover:bg-gray-50"
              >
                Descartar Cambios
              </Button>
              
              <Button 
                onClick={() => setShowExitConfirm(false)}
                variant="outline"
                className="text-gray-600 hover:bg-gray-50"
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
