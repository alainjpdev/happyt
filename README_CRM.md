# CRM - Base de Datos de Contactos

## Descripción

El módulo CRM (Customer Relationship Management) permite gestionar contactos, leads, prospectos y clientes desde el dashboard de administración. Esta funcionalidad está integrada con el sistema existente de Dania Academy y utiliza la misma paleta de colores y componentes UI.

## Características

### 📊 Dashboard Principal
- **Vista general de contactos** con estadísticas en tiempo real
- **Filtros avanzados** por estado, búsqueda por nombre/email/empresa
- **Tabla interactiva** con acciones de ver, editar y eliminar
- **Estadísticas visuales** de leads, prospectos, clientes y total de contactos

### 👥 Gestión de Contactos
- **Información personal**: Nombre, email, teléfono, ubicación
- **Información empresarial**: Empresa, estado del contacto, origen
- **Notas y comentarios**: Campo de texto libre para información adicional
- **Estados del contacto**: Lead, Prospecto, Cliente, Inactivo

### 🔍 Funcionalidades de Búsqueda
- **Búsqueda en tiempo real** por nombre, email o empresa
- **Filtros por estado** del contacto
- **Ordenamiento** por diferentes criterios
- **Vista detallada** de cada contacto

### 📈 Estadísticas
- Total de contactos
- Número de clientes activos
- Prospectos en seguimiento
- Leads nuevos

## Estructura de Archivos

```
src/
├── pages/dashboard/
│   ├── Database.tsx          # Página principal del CRM
│   └── DatabaseForm.tsx      # Formulario de agregar/editar contactos
├── types/
│   └── database.ts           # Tipos TypeScript compartidos
└── layouts/
    └── AdminLayout.tsx       # Layout actualizado con nueva ruta
```

## Rutas

- `/dashboard/database` - Página principal del CRM (solo admin)

## Integración con Notion

### Próximas Funcionalidades
- **Sincronización con Notion**: Los contactos se sincronizarán con una base de datos de Notion
- **API endpoints**: 
  - `GET /api/notion/crm` - Obtener contactos
  - `POST /api/notion/crm` - Crear contacto
  - `PUT /api/notion/crm/:id` - Actualizar contacto
  - `DELETE /api/notion/crm/:id` - Eliminar contacto

### Configuración de Notion
1. Crear una base de datos en Notion con las siguientes columnas:
   - **Name** (Title) - Nombre del contacto
   - **Email** (Email) - Correo electrónico
   - **Phone** (Phone) - Número de teléfono
   - **Company** (Text) - Empresa
   - **Status** (Select) - Lead, Prospecto, Cliente, Inactivo
   - **Source** (Select) - Origen del contacto
   - **Location** (Text) - Ubicación
   - **Notes** (Text) - Notas adicionales
   - **Created At** (Date) - Fecha de creación
   - **Last Contact** (Date) - Último contacto

2. Compartir la base de datos con la integración de Notion
3. Obtener el `database_id` para configurar en el backend

## Componentes

### Database.tsx
Componente principal que incluye:
- Header con acciones (Importar, Exportar, Nuevo Contacto)
- Filtros de búsqueda
- Estadísticas en cards
- Tabla de contactos
- Modal de detalles del contacto

### DatabaseForm.tsx
Formulario modal para agregar/editar contactos:
- Información personal (nombre, email, teléfono, ubicación)
- Información empresarial (empresa, estado, origen)
- Notas y comentarios
- Validación de campos requeridos

## Estados del Contacto

1. **Lead**: Contacto inicial, sin seguimiento activo
2. **Prospecto**: Contacto con interés demostrado
3. **Cliente**: Contacto que ha realizado una compra
4. **Inactivo**: Contacto que no responde o ha perdido interés

## Orígenes del Contacto

- Website
- LinkedIn
- Referral
- Email Marketing
- Evento
- Redes Sociales
- Otro

## Uso

### Para Administradores
1. Acceder al dashboard de administración
2. Navegar a "CRM" en el menú lateral
3. Ver estadísticas generales
4. Usar filtros para encontrar contactos específicos
5. Agregar nuevos contactos con el botón "Nuevo Contacto"
6. Editar contactos existentes con el botón de edición
7. Ver detalles completos con el botón de vista

### Funcionalidades Futuras
- **Importación masiva** desde CSV/Excel
- **Exportación de datos** en diferentes formatos
- **Automatización de seguimiento** con recordatorios
- **Integración con email** para envío de campañas
- **Reportes avanzados** con gráficos y métricas
- **Sincronización bidireccional** con Notion

## Tecnologías Utilizadas

- **React** con TypeScript
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **React Router** para navegación
- **React i18n** para internacionalización

## Contribución

Para agregar nuevas funcionalidades al CRM:

1. Crear nuevos componentes en `src/pages/dashboard/`
2. Actualizar tipos en `src/types/database.ts`
3. Agregar rutas en `src/App.tsx`
4. Actualizar el menú en `src/layouts/AdminLayout.tsx`
5. Documentar cambios en este README 