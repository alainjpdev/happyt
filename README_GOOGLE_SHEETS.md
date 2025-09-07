# Integración con Google Sheets - Cotizaciones

## Configuración

### 1. Crear un Google Sheet
1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja llamada "Cotizaciones"
3. Configura las columnas con los siguientes encabezados:
   ```
   Cliente | Proyecto | Monto | Estado | Fecha Creación | Válida Hasta
   ```

### 2. Obtener el ID del Google Sheet
1. Abre tu Google Sheet
2. El ID está en la URL: `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`**`/edit`
3. Copia el ID (la parte en negrita)

### 3. Configurar la API de Google
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Sheets
4. Crea credenciales (API Key)
5. Copia la API Key

### 4. Configurar variables de entorno
Crea o actualiza tu archivo `.env` en la raíz del proyecto:

```env
# Google Sheets API
VITE_GOOGLE_API_KEY=tu_api_key_aqui

# Backend API
VITE_API_URL=http://localhost:4000
```

### 5. Actualizar la configuración en el código
En `src/pages/dashboard/Quotations.tsx`, actualiza estas líneas:

```typescript
const GOOGLE_SHEET_ID = 'TU_ID_DEL_GOOGLE_SHEET_AQUI';
const GOOGLE_SHEET_NAME = 'Cotizaciones'; // O el nombre de tu hoja
```

## Estructura del Google Sheet

### Encabezados recomendados:
- **Cliente**: Nombre de la empresa o cliente
- **Proyecto**: Descripción del proyecto
- **Monto**: Valor de la cotización (puede incluir símbolo de moneda)
- **Estado**: Pendiente, Aprobada, Rechazada
- **Fecha Creación**: Fecha cuando se creó la cotización
- **Válida Hasta**: Fecha de expiración de la cotización

### Ejemplo de datos:
```
Cliente              | Proyecto           | Monto      | Estado    | Fecha Creación | Válida Hasta
Constructora ABC     | Edificio Residencial| $45,000   | Pendiente | 2024-01-15     | 2024-02-15
Desarrolladora XYZ   | Centro Comercial   | $125,000  | Aprobada  | 2024-01-10     | 2024-02-10
```

## Funcionalidades

### ✅ Implementadas:
- **Carga automática** de datos desde Google Sheets
- **Búsqueda** por cliente o proyecto
- **Filtros** por estado
- **Estadísticas** en tiempo real
- **Actualización manual** con botón de refresh
- **Manejo de errores** con reintento automático
- **Datos de respaldo** si falla la conexión

### 🔧 Características técnicas:
- **API de Google Sheets v4**
- **Mapeo automático** de columnas
- **Búsqueda flexible** por diferentes nombres de columna
- **Formateo automático** de moneda (COP)
- **Estados dinámicos** con colores
- **Responsive design**

## Solución de problemas

### Error: "Error al obtener datos del Google Sheet"
1. Verifica que la API Key sea correcta
2. Asegúrate de que la API de Google Sheets esté habilitada
3. Verifica que el ID del Google Sheet sea correcto
4. Confirma que el nombre de la hoja coincida

### Error: "No se encontraron cotizaciones"
1. Verifica que el Google Sheet tenga datos
2. Confirma que los encabezados estén en la primera fila
3. Asegúrate de que no haya filas vacías al inicio

### Error: "Quota exceeded"
1. La API de Google tiene límites de uso
2. Considera implementar caché local
3. Reduce la frecuencia de actualizaciones

## Seguridad

### ⚠️ Importante:
- **Nunca** compartas tu API Key públicamente
- **No** subas el archivo `.env` al repositorio
- **Configura** restricciones de dominio en Google Cloud Console
- **Usa** variables de entorno para configuraciones sensibles

## Próximas mejoras

### 🚀 Funcionalidades planificadas:
- **Sincronización en tiempo real**
- **Edición directa** desde la aplicación
- **Historial de cambios**
- **Notificaciones** por email
- **Exportación** a PDF/Excel
- **Dashboard** con gráficos
- **Integración** con CRM
