# 📚 API Endpoints - HappyTribe Backend

## 🔐 **Autenticación** (`/api`)

### **POST** `/login`
- **Descripción**: Iniciar sesión
- **Permisos**: Público
- **Body**: `{ email, password }`
- **Respuesta**: `{ user, token }`

### **POST** `/register`
- **Descripción**: Registrar nuevo usuario
- **Permisos**: Público
- **Body**: `{ email, password, firstName, lastName, role }`
- **Respuesta**: `{ user, token }`

---

## 👥 **Usuarios** (`/api/users`)

### **GET** `/`
- **Descripción**: Listar todos los usuarios
- **Permisos**: Admin, Teacher
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: `{ success: true, count: number, users: User[] }`

### **GET** `/:id`
- **Descripción**: Obtener usuario específico
- **Permisos**: Autenticado (solo su perfil o admin)
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: `{ user: User }`

### **PUT** `/:id`
- **Descripción**: Actualizar usuario
- **Permisos**: Autenticado (solo su perfil o admin)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ firstName, lastName, email, avatar, status, notes, hours, tribe, role }`
- **Respuesta**: `{ success: true, user: User }`

### **DELETE** `/:id`
- **Descripción**: Eliminar usuario
- **Permisos**: Admin
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: `{ success: true, message: string }`

### **POST** `/:id/change-role`
- **Descripción**: Cambiar rol de usuario
- **Permisos**: Admin
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ newRole }`
- **Respuesta**: `{ success: true, user: User }`

### **GET** `/:id/modules`
- **Descripción**: Obtener módulos del usuario
- **Permisos**: Autenticado
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: `{ modules: Module[] }`

### **PUT** `/:id/modules`
- **Descripción**: Actualizar módulos del usuario
- **Permisos**: Admin
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ moduleIds: string[] }`
- **Respuesta**: `{ success: true, user: User }`

---

## 📚 **Módulos** (`/api/modules`)

### **GET** `/`
- **Descripción**: Listar todos los módulos
- **Permisos**: Público
- **Respuesta**: `{ modules: Module[] }`

### **POST** `/`
- **Descripción**: Crear módulo
- **Permisos**: Admin, Teacher
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ title, description, url, order }`
- **Respuesta**: `{ module: Module }`

### **PUT** `/:id`
- **Descripción**: Actualizar módulo
- **Permisos**: Admin, Teacher
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ title, description, url, order }`
- **Respuesta**: `{ module: Module }`

### **PUT** `/reorder`
- **Descripción**: Reordenar módulos
- **Permisos**: Admin, Teacher
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ modules: { id, order }[] }`
- **Respuesta**: `{ success: true }`

### **DELETE** `/:id`
- **Descripción**: Eliminar módulo
- **Permisos**: Admin, Teacher
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: `{ success: true }`

---

## 🏫 **Clases** (`/api/classes`)

### **GET** `/`
- **Descripción**: Listar todas las clases
- **Permisos**: Público
- **Respuesta**: `{ classes: Class[] }`

### **PUT** `/:id`
- **Descripción**: Actualizar clase
- **Permisos**: Público
- **Body**: `{ title, description, moduleId, teacherId }`
- **Respuesta**: `{ class: Class }`

---

## 📝 **Asignaciones** (`/api/assignments`)

### **GET** `/`
- **Descripción**: Listar todas las asignaciones
- **Permisos**: Público
- **Respuesta**: `{ assignments: Assignment[] }`

---

## 🎓 **Google Classroom** (`/api/google-classroom`)

### **GET** `/auth-url`
- **Descripción**: Obtener URL de autorización OAuth
- **Permisos**: Autenticado
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: `{ authUrl: string }`

### **GET** `/callback`
- **Descripción**: Callback OAuth (usado por Google)
- **Permisos**: Público
- **Query**: `?code=<auth_code>&state=<user_id>`
- **Respuesta**: `{ success: true, message: string }`

### **GET** `/status`
- **Descripción**: Verificar estado de conexión
- **Permisos**: Autenticado
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: `{ connected: boolean, isExpired: boolean, expiresAt: string, scope: string }`

### **GET** `/courses`
- **Descripción**: Obtener cursos de Google Classroom
- **Permisos**: Admin, Teacher
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta**: `{ courses: GoogleCourse[] }`

### **POST** `/sync-class/:id`
- **Descripción**: Sincronizar clase con Google Classroom
- **Permisos**: Admin, Teacher
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ courseId }`
- **Respuesta**: `{ success: true, googleCourse: GoogleCourse }`

### **POST** `/sync-students/:classId`
- **Descripción**: Importar estudiantes desde Google Classroom
- **Permisos**: Admin, Teacher
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ courseId }`
- **Respuesta**: `{ success: true, syncedCount: number }`

### **POST** `/create-assignment/:classId`
- **Descripción**: Crear asignación en Google Classroom
- **Permisos**: Admin, Teacher
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ courseId, title, description, dueDate, maxPoints }`
- **Respuesta**: `{ success: true, assignment: Assignment, googleCourseWork: CourseWork }`

---

## 📋 **Notion Tasks** (`/api/notion-tasks`)

### **GET** `/`
- **Descripción**: Listar tareas de Notion
- **Permisos**: Público
- **Respuesta**: `{ tasks: NotionTask[] }`

### **GET** `/properties`
- **Descripción**: Obtener propiedades de la base de datos
- **Permisos**: Público
- **Respuesta**: `{ properties: object }`

### **GET** `/:id`
- **Descripción**: Obtener tarea específica
- **Permisos**: Público
- **Respuesta**: `{ task: NotionTask }`

### **POST** `/`
- **Descripción**: Crear tarea en Notion
- **Permisos**: Público
- **Body**: `{ title, description, status, priority }`
- **Respuesta**: `{ success: true, task: NotionTask }`

### **DELETE** `/:id`
- **Descripción**: Eliminar tarea de Notion
- **Permisos**: Público
- **Respuesta**: `{ success: true }`

---

## 📚 **Materiales** (`/api/materials`)

### **GET** `/`
- **Descripción**: Listar materiales
- **Permisos**: Público
- **Respuesta**: `{ materials: Material[] }`

---

## 👨‍🎓 **Estudiantes-Clases** (`/api/studentclasses`)

### **GET** `/`
- **Descripción**: Listar relaciones estudiante-clase
- **Permisos**: Público
- **Respuesta**: `{ studentClasses: StudentClass[] }`

---

## 📊 **Módulos de Asignación** (`/api/assignment-modules`)

### **GET** `/`
- **Descripción**: Listar módulos de asignación
- **Permisos**: Público
- **Query**: `?userId=<id>&moduleId=<id>`
- **Respuesta**: `{ assignmentModules: AssignmentModule[] }`

### **POST** `/`
- **Descripción**: Crear módulo de asignación
- **Permisos**: Público
- **Body**: `{ userId, moduleId, content }`
- **Respuesta**: `{ success: true, assignmentModule: AssignmentModule }`

---

## 🔒 **Permisos de Escritura**

### **✅ Endpoints con Permisos de Escritura:**

1. **Usuarios**:
   - `PUT /api/users/:id` - Actualizar perfil
   - `DELETE /api/users/:id` - Eliminar usuario (Admin)
   - `POST /api/users/:id/change-role` - Cambiar rol (Admin)
   - `PUT /api/users/:id/modules` - Actualizar módulos (Admin)

2. **Módulos**:
   - `POST /api/modules` - Crear módulo (Admin, Teacher)
   - `PUT /api/modules/:id` - Actualizar módulo (Admin, Teacher)
   - `PUT /api/modules/reorder` - Reordenar módulos (Admin, Teacher)
   - `DELETE /api/modules/:id` - Eliminar módulo (Admin, Teacher)

3. **Clases**:
   - `PUT /api/classes/:id` - Actualizar clase

4. **Google Classroom**:
   - `POST /api/google-classroom/sync-class/:id` - Sincronizar clase (Admin, Teacher)
   - `POST /api/google-classroom/sync-students/:classId` - Importar estudiantes (Admin, Teacher)
   - `POST /api/google-classroom/create-assignment/:classId` - Crear asignación (Admin, Teacher)

5. **Notion Tasks**:
   - `POST /api/notion-tasks` - Crear tarea
   - `DELETE /api/notion-tasks/:id` - Eliminar tarea

6. **Módulos de Asignación**:
   - `POST /api/assignment-modules` - Crear módulo de asignación

### **🔐 Niveles de Permisos:**

- **Público**: Sin autenticación requerida
- **Autenticado**: Requiere token JWT válido
- **Admin**: Solo administradores
- **Teacher**: Profesores y administradores
- **Admin, Teacher**: Profesores y administradores

### **📝 Notas Importantes:**

1. **Google Classroom** requiere conexión OAuth previa
2. **Notion** requiere configuración de `NOTION_TOKEN` y `NOTION_DATABASE_ID`
3. **Todos los endpoints** devuelven respuestas JSON
4. **Autenticación** se realiza mediante JWT en el header `Authorization: Bearer <token>`
5. **Validación** de datos en todos los endpoints de escritura
