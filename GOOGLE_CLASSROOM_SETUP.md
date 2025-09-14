# Google Classroom Integration Setup

Esta guía te ayudará a configurar la integración de Google Classroom con Happy Tribe.

## 📋 Prerrequisitos

1. Una cuenta de Google con acceso a Google Classroom
2. Acceso a Google Cloud Console
3. Permisos de administrador en Happy Tribe

## 🔧 Configuración en Google Cloud Console

### Paso 1: Crear un proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el ID del proyecto

### Paso 2: Habilitar Google Classroom API

1. En el menú de navegación, ve a "APIs y servicios" > "Biblioteca"
2. Busca "Google Classroom API"
3. Haz clic en "Habilitar"

### Paso 3: Crear credenciales OAuth 2.0

1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "ID de cliente OAuth 2.0"
3. Selecciona "Aplicación web"
4. Configura las URIs de redirección autorizadas:
   - Para desarrollo: `http://localhost:5173/auth/google/callback`
   - Para producción: `https://tu-dominio.com/auth/google/callback`

### Paso 4: Configurar la pantalla de consentimiento

1. Ve a "APIs y servicios" > "Pantalla de consentimiento OAuth"
2. Selecciona "Externo" (a menos que tengas una cuenta de Google Workspace)
3. Completa la información requerida:
   - Nombre de la aplicación: "Happy Tribe"
   - Email de soporte: tu email
   - Dominio autorizado: tu dominio (opcional)
4. Agrega los siguientes scopes:
   - `https://www.googleapis.com/auth/classroom.courses.readonly`
   - `https://www.googleapis.com/auth/classroom.rosters.readonly`
   - `https://www.googleapis.com/auth/classroom.coursework.readonly`
   - `https://www.googleapis.com/auth/classroom.coursework.me.readonly`
   - `https://www.googleapis.com/auth/classroom.coursework.students.readonly`

## 🔑 Configuración en Happy Tribe

### Paso 1: Obtener las credenciales

Después de crear las credenciales OAuth 2.0, obtendrás:
- Client ID
- Client Secret

### Paso 2: Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Google Classroom Integration
VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui
VITE_GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

### Paso 3: Para producción (Vercel)

Agrega las variables de entorno en Vercel:

```bash
vercel env add VITE_GOOGLE_CLIENT_ID
vercel env add VITE_GOOGLE_CLIENT_SECRET
vercel env add VITE_GOOGLE_REDIRECT_URI
```

## 🚀 Uso de la integración

### Para administradores:

1. Ve al dashboard de administración
2. Navega a "Google Classroom" en el menú lateral
3. Haz clic en "Conectar con Google Classroom"
4. Autoriza el acceso en la ventana emergente
5. Selecciona las clases que quieres sincronizar
6. Usa los botones de sincronización para importar datos

### Funcionalidades disponibles:

- **Sincronizar clases**: Importa todas las clases de Google Classroom
- **Sincronizar estudiantes**: Importa listas de estudiantes con sus datos
- **Sincronizar tareas**: Importa tareas y asignaciones
- **Sincronización completa**: Importa todo de una vez

## 🔒 Permisos requeridos

La integración requiere los siguientes permisos de Google Classroom:

- **Ver clases**: Para listar las clases disponibles
- **Ver estudiantes**: Para obtener listas de estudiantes
- **Ver tareas**: Para importar tareas y asignaciones
- **Acceso de solo lectura**: No modifica datos en Google Classroom

## 🛠️ Desarrollo

### Estructura de archivos:

```
src/
├── services/google/
│   └── classroomService.ts      # Servicio principal de Google Classroom
├── hooks/
│   └── useGoogleClassroom.ts    # Hook personalizado para la integración
├── components/
│   └── GoogleClassroomIntegration.tsx  # Componente de interfaz
├── pages/dashboard/
│   └── GoogleClassroom.tsx      # Página dedicada
└── config/
    └── google.ts                # Configuración de Google
```

### API Endpoints utilizados:

- `GET /courses` - Listar clases
- `GET /courses/{courseId}/students` - Obtener estudiantes
- `GET /courses/{courseId}/courseWork` - Obtener tareas

## 🐛 Solución de problemas

### Error: "OAuth2 client not initialized"
- Verifica que las variables de entorno estén configuradas correctamente
- Reinicia el servidor de desarrollo

### Error: "Access denied"
- Verifica que los scopes estén configurados correctamente en Google Cloud Console
- Asegúrate de que la pantalla de consentimiento esté configurada

### Error: "Invalid redirect URI"
- Verifica que la URI de redirección coincida exactamente con la configurada en Google Cloud Console
- Incluye el protocolo (http/https) y el puerto si es necesario

### Las clases no aparecen
- Verifica que el usuario tenga acceso a Google Classroom
- Asegúrate de que las clases estén en estado "ACTIVE" o "ARCHIVED"

## 📞 Soporte

Si tienes problemas con la integración:

1. Verifica los logs de la consola del navegador
2. Revisa la configuración en Google Cloud Console
3. Asegúrate de que todas las variables de entorno estén configuradas
4. Contacta al equipo de desarrollo si el problema persiste

## 🔄 Actualizaciones futuras

Funcionalidades planificadas:

- Sincronización bidireccional (Happy Tribe → Google Classroom)
- Sincronización automática programada
- Filtros avanzados para la sincronización
- Notificaciones de sincronización
- Historial de sincronizaciones
