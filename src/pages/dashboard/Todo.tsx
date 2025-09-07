import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CheckSquare, Square, Plus, Edit, Trash2, Calendar, Clock, Filter, Search, RefreshCw, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { airtableMigration } from '../../utils/airtableMigration';

interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export const Todo: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  // Configuración de Google Sheets
  const TODO_SHEET_ID = import.meta.env.VITE_TODO_SHEET_ID || '1D4XNNt_GJ0WFXB64FFphwYP4jPlhtw_D1cbqKa1obus';
  const TODO_SHEET_NAME = 'Sheet1';
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  // Estados simplificados - solo API Key
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para autenticación OAuth2
  const authenticateWithGoogle = async () => {
    try {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/dashboard/todo')}&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/spreadsheets')}&` +
        `response_type=token&` +
        `state=${encodeURIComponent('todo_auth')}&` +
        `prompt=consent`;

      window.location.href = googleAuthUrl;
    } catch (err) {
      console.error('Error en autenticación:', err);
      setError('Error en la autenticación con Google');
    }
  };

  // Función para guardar token en localStorage
  const saveTokenToStorage = (token: string) => {
    try {
      const expiryTime = Date.now() + (3600 * 1000);
      localStorage.setItem('google_access_token', token);
      localStorage.setItem('google_token_expiry', expiryTime.toString());
    } catch (err) {
      console.error('Error al guardar token:', err);
    }
  };

  // Función para obtener todos desde Google Sheets
  const fetchTodosFromSheets = async () => {
    if (!GOOGLE_API_KEY) {
      setError('API Key de Google no configurada');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Usar solo API Key
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${TODO_SHEET_ID}/values/${TODO_SHEET_NAME}?key=${GOOGLE_API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al obtener datos del Google Sheet');
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
      
      const mappedTodos: TodoItem[] = rows.map((row: any[], index: number) => ({
        id: row[0] || `todo-${index + 1}`,
        title: row[1] || '',
        description: row[2] || '',
        completed: row[4] === 'true' || row[4] === 'completed',
        priority: (row[3] || 'medium') as 'low' | 'medium' | 'high',
        dueDate: row[5] || '',
        createdAt: row[6] || new Date().toISOString(),
        updatedAt: row[7] || new Date().toISOString()
      }));

      setTodos(mappedTodos);
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

    if (!GOOGLE_API_KEY) {
      setError('No se puede agregar tarea - API Key no configurada');
      return;
    }

    try {
      const values = [
        [
          generateId(),
          newTodo.title.trim(),
          newTodo.description.trim(),
          newTodo.priority,
          'false',
          newTodo.dueDate,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      ];

      // Usar solo API Key
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${TODO_SHEET_ID}/values/${TODO_SHEET_NAME}:append?valueInputOption=USER_ENTERED&key=${GOOGLE_API_KEY}`;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ values })
      });

      if (!response.ok) {
        throw new Error(`Error al agregar tarea: ${response.status} ${response.statusText}`);
      }

      setNewTodo({ title: '', description: '', priority: 'medium', dueDate: '' });
      setShowAddForm(false);
      await fetchTodosFromSheets();
      setSuccessMessage('✅ Tarea agregada exitosamente');
      setError(null);
      
    } catch (err) {
      console.error('Error al agregar tarea:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  // Toggle completado en Google Sheets
  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const updatedTodo = { ...todo, completed: !todo.completed, updatedAt: new Date().toISOString() };
      
      // Actualizar en Google Sheets
      await updateTodoInSheets(updatedTodo);
      
      // Actualizar estado local
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      setSuccessMessage('✅ Estado actualizado exitosamente');
      setError(null);
      
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
      setError('Error al actualizar el estado');
    }
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

  // Función para actualizar todo en Google Sheets
  const updateTodoInSheets = async (todo: TodoItem) => {
    if (!GOOGLE_API_KEY) {
      throw new Error('No se puede actualizar tarea - API Key no configurada');
    }

    try {
      const values = [
        [
          todo.id,
          todo.title,
          todo.description,
          todo.priority,
          todo.completed.toString(),
          todo.dueDate,
          todo.createdAt,
          todo.updatedAt
        ]
      ];

      // Buscar la fila del todo en el sheet
      const todoIndex = todos.findIndex(t => t.id === todo.id);
      if (todoIndex === -1) throw new Error('Tarea no encontrada');

      const range = `${TODO_SHEET_NAME}!A${todoIndex + 2}:H${todoIndex + 2}`;
      // Usar solo API Key
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${TODO_SHEET_ID}/values/${range}?valueInputOption=USER_ENTERED&key=${GOOGLE_API_KEY}`;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ values })
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar tarea: ${response.status} ${response.statusText}`);
      }
      
    } catch (err) {
      console.error('Error al actualizar tarea en Google Sheets:', err);
      throw err;
    }
  };

  // Función para eliminar todo de Google Sheets
  const deleteTodoFromSheets = async (id: string) => {
    if (!GOOGLE_API_KEY) {
      throw new Error('No se puede eliminar tarea - API Key no configurada');
    }

    try {
      const todoIndex = todos.findIndex(t => t.id === id);
      if (todoIndex === -1) throw new Error('Tarea no encontrada');

      const range = `${TODO_SHEET_NAME}!A${todoIndex + 2}:H${todoIndex + 2}`;
      // Usar solo API Key
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${TODO_SHEET_ID}/values/${range}?key=${GOOGLE_API_KEY}`;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          values: [['', '', '', '', '', '', '', '']] // Limpiar la fila
        })
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar tarea: ${response.status} ${response.statusText}`);
      }
      
    } catch (err) {
      console.error('Error al eliminar tarea de Google Sheets:', err);
      throw err;
    }
  };

  // Editar todo
  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
  };

  // Guardar edición
  const handleSaveEdit = async () => {
    if (!editingTodo?.title.trim()) return;

    try {
      const updatedTodo = { ...editingTodo, updatedAt: new Date().toISOString() };
      await updateTodoInSheets(updatedTodo);
      
      setTodos(todos.map(todo => 
        todo.id === editingTodo.id ? updatedTodo : todo
      ));
      setEditingTodo(null);
      setSuccessMessage('✅ Tarea actualizada exitosamente');
      setError(null);
      
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
      setError('Error al actualizar la tarea');
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  // Migrar datos desde Airtable
  const handleMigrateFromAirtable = async () => {
    try {
      setIsMigrating(true);
      setError(null);
      
      console.log('🔄 Iniciando migración desde Airtable público...');
      
      // Migrar datos desde Airtable público
      await airtableMigration.migrateToGoogleSheets();
      
      setSuccessMessage('✅ Migración desde Airtable completada. Se crearon 5 tareas de ejemplo. Revisa la consola para más detalles.');
      
      // Recargar datos del Google Sheet
      await fetchTodosFromSheets();
      
    } catch (err) {
      console.error('❌ Error en la migración:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido en la migración');
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

  // Efecto para cargar datos automáticamente
  useEffect(() => {
    if (GOOGLE_API_KEY) {
      console.log('🔑 API Key encontrada, cargando To Do automáticamente...');
      setIsAuthenticated(true);
      fetchTodosFromSheets();
    } else {
      setError('API Key de Google no configurada');
      setIsLoading(false);
    }
  }, []);


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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
    return new Date(dateString).toLocaleDateString('es-CO');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">To Do - Lista de Tareas</h1>
          <p className="text-text-secondary mt-1">
            Gestiona tus tareas y mantén el control de tus actividades
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" className="bg-green-50 text-green-700" disabled>
                <CheckCircle className="w-4 h-4 mr-2" />
                {TODO_SHEET_NAME}
              </Button>
              <div className="text-xs text-gray-500">
                <p>API Key • Conectado</p>
              </div>
              <Button onClick={() => fetchTodosFromSheets()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
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
            onClick={handleMigrateFromAirtable} 
            disabled={isMigrating}
            variant="outline" 
            className="bg-purple-50 text-purple-700 hover:bg-purple-100"
          >
            <Download className="w-4 h-4 mr-2" />
            {isMigrating ? 'Migrando...' : 'Migrar desde Airtable'}
          </Button>
          <Button onClick={() => setShowAddForm(true)} disabled={!isAuthenticated}>
            <Plus className="w-5 h-5 mr-2" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex flex-col">
                <span className="text-green-600 font-medium">
                  Conectado al Sheet: <span className="font-semibold">{TODO_SHEET_NAME}</span>
                </span>
                <span className="text-sm text-gray-500">
                  API Key • ID: {TODO_SHEET_ID.slice(0, 8)}...{TODO_SHEET_ID.slice(-8)}
                </span>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div className="flex flex-col">
                <span className="text-red-600 font-medium">No conectado a Google Sheets</span>
                <span className="text-sm text-gray-500">
                  Configura la API Key en las variables de entorno
                </span>
              </div>
            </>
          )}
          {error && (
            <span className="text-red-600 text-sm ml-4 flex items-center">
              {error}
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-red-800 hover:text-red-900"
              >
                ×
              </button>
            </span>
          )}
          {successMessage && (
            <span className="text-green-600 text-sm ml-4 flex items-center">
              {successMessage}
              <button 
                onClick={() => setSuccessMessage(null)}
                className="ml-2 text-green-800 hover:text-green-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <h3 className="text-2xl font-bold text-text">{totalTodos}</h3>
          <p className="text-gray-600">Total Tareas</p>
        </Card>
        <Card className="text-center">
          <h3 className="text-2xl font-bold text-green-600">{completedTodos}</h3>
          <p className="text-gray-600">Completadas</p>
        </Card>
        <Card className="text-center">
          <h3 className="text-2xl font-bold text-yellow-600">{pendingTodos}</h3>
          <p className="text-gray-600">Pendientes</p>
        </Card>
        <Card className="text-center">
          <h3 className="text-2xl font-bold text-red-600">{highPriorityTodos}</h3>
          <p className="text-gray-600">Prioridad Alta</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todas las prioridades</option>
              <option value="high">Alta prioridad</option>
              <option value="medium">Media prioridad</option>
              <option value="low">Baja prioridad</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
          <Card className="text-center py-12">
            <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No hay tareas</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterPriority !== 'all' || filterStatus !== 'all' 
                ? 'No se encontraron tareas con los filtros aplicados'
                : 'Crea tu primera tarea para comenzar'
              }
            </p>
            {!searchTerm && filterPriority === 'all' && filterStatus === 'all' && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Tarea
              </Button>
            )}
          </Card>
        ) : (
          filteredTodos.map((todo) => (
            <Card key={todo.id} className={`transition-all duration-200 ${todo.completed ? 'opacity-75' : ''}`}>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`mt-1 p-1 rounded transition-colors ${
                    todo.completed 
                      ? 'text-green-600 hover:text-green-700' 
                      : 'text-gray-400 hover:text-gray-600'
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
                      <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-text'}`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-400' : 'text-text-secondary'}`}>
                          {todo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded-full border ${getPriorityColor(todo.priority)}`}>
                          {getPriorityText(todo.priority)}
                        </span>
                        {todo.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(todo.dueDate)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(todo.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTodo(todo)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
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

      {/* Edit Todo Modal */}
      {editingTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-text mb-4">Editar Tarea</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo({...editingTodo, title: e.target.value})}
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
                  value={editingTodo.description}
                  onChange={(e) => setEditingTodo({...editingTodo, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Descripción de la tarea (opcional)"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={editingTodo.priority}
                    onChange={(e) => setEditingTodo({...editingTodo, priority: e.target.value as any})}
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
                    value={editingTodo.dueDate}
                    onChange={(e) => setEditingTodo({...editingTodo, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button onClick={handleSaveEdit} disabled={!editingTodo.title.trim()}>
                <Edit className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
