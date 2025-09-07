# 🚀 Configuración del CRM con Google Sheets para ColorLand

## ⚡ Pasos para conectar tu CRM con Google Sheets:

### 1️⃣ Crear el Google Sheet para CRM
1. Ve a [sheets.google.com](https://sheets.google.com)
2. Crea una nueva hoja
3. **IMPORTANTE**: Nombra la primera hoja como `CRM`

### 2️⃣ Configurar las columnas del CRM
En la **primera fila** (A1:J1), escribe estos encabezados:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| **Empresa** | **Contacto** | **Email** | **Teléfono** | **Dirección** | **Estado** | **Proyectos** | **Ingresos** | **Último Contacto** | **Notas** |

### 3️⃣ Agregar datos de ejemplo
En las filas siguientes, agrega algunos clientes de prueba:

| Empresa | Contacto | Email | Teléfono | Dirección | Estado | Proyectos | Ingresos | Último Contacto | Notas |
|---------|----------|-------|----------|-----------|--------|------------|----------|------------------|-------|
| Constructora ABC | Juan Pérez | juan@abc.com | +57 300 123 4567 | Calle 123, Bogotá | Activo | 5 | 1250000 | 2024-01-15 | Cliente importante |
| Desarrolladora XYZ | María García | maria@xyz.com | +57 310 987 6543 | Carrera 78, Medellín | Prospecto | 2 | 450000 | 2024-01-10 | Interesada en premium |
| Arquitectura Moderna | Carlos López | carlos@moderna.com | +57 315 555 1234 | Av 5, Cali | Inactivo | 8 | 2800000 | 2023-12-20 | Cliente histórico |

### 4️⃣ Obtener el ID del Google Sheet
1. Mira la URL de tu Google Sheet
2. Copia el ID que está entre `/d/` y `/edit`
3. **Ejemplo**: `https://docs.google.com/spreadsheets/d/`**`1ABC123DEF456GHI789JKL`**`/edit`

### 5️⃣ Obtener API Key de Google
1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un proyecto nuevo o selecciona uno existente
3. Busca "Google Sheets API" y habilítala
4. Ve a "Credenciales" → "Crear credenciales" → "Clave de API"
5. Copia la API Key generada

### 6️⃣ Configurar en tu proyecto
1. Crea un archivo `.env` en la raíz del proyecto (si no existe)
2. Agrega estas líneas:
   ```env
   VITE_GOOGLE_API_KEY=tu_api_key_aqui
   VITE_GOOGLE_SHEET_ID=tu_id_del_sheet_aqui
   ```

### 7️⃣ Probar la conexión
1. Reinicia tu servidor de desarrollo (`npm run dev`)
2. Ve a la página del CRM
3. Deberías ver un indicador verde "Conectado a Google Sheets"
4. Los datos de tu Google Sheet deberían aparecer en la tabla

## 🔧 Funcionalidades del CRM integrado

### ✅ Operaciones disponibles:
- **Leer**: Obtiene todos los clientes del Google Sheet
- **Crear**: Agrega nuevos clientes al final del sheet
- **Actualizar**: Modifica clientes existentes en sus filas correspondientes
- **Eliminar**: Limpia la fila del cliente (marca como eliminado)

### 📊 Campos del CRM:
- **Empresa**: Nombre de la empresa o cliente
- **Contacto**: Persona de contacto principal
- **Email**: Correo electrónico de contacto
- **Teléfono**: Número telefónico
- **Dirección**: Dirección física
- **Estado**: Activo, Prospecto, Inactivo
- **Proyectos**: Número total de proyectos
- **Ingresos**: Ingresos totales en pesos colombianos
- **Último Contacto**: Fecha del último contacto
- **Notas**: Información adicional del cliente

## 🚨 Solución de problemas comunes

### ❌ "API Key no configurada"
- Verifica que el archivo `.env` esté en la raíz del proyecto
- Asegúrate de que la variable se llame exactamente `VITE_GOOGLE_API_KEY`
- Reinicia el servidor después de crear/modificar `.env`

### ❌ "Error al obtener datos del Google Sheet"
- Verifica que la API de Google Sheets esté habilitada
- Confirma que el ID del Google Sheet sea correcto
- Asegúrate de que el nombre de la hoja sea exactamente `CRM`

### ❌ "No se encontraron clientes"
- Verifica que los encabezados estén en la **primera fila**
- Confirma que no haya filas vacías antes de los datos
- Asegúrate de que al menos una fila tenga datos

### ❌ Datos no se muestran correctamente
- Abre la consola del navegador (F12)
- Busca los logs que muestran "Headers encontrados" y "Clientes mapeados"
- Verifica que los nombres de las columnas coincidan exactamente

## 📱 Estructura recomendada del Google Sheet

### 🎯 Formato de datos:
- **Fechas**: Usa formato YYYY-MM-DD (ej: 2024-01-15)
- **Moneda**: Solo números, sin símbolos de moneda (ej: 1250000)
- **Estados**: Activo, Prospecto, Inactivo (exactamente así)
- **Números**: Solo dígitos para proyectos e ingresos

### 🔄 Sincronización:
- Los datos se sincronizan automáticamente al cargar la página
- Usa el botón "Actualizar" para refrescar manualmente
- Los cambios se reflejan en tiempo real en Google Sheets

## 💡 Tips adicionales

- **Mantén** los encabezados en la primera fila
- **Usa** nombres de columnas exactos como se muestran arriba
- **Evita** espacios extra o caracteres especiales en los encabezados
- **Formatea** las fechas de manera consistente
- **Usa** solo números para campos numéricos
- **Mantén** el estado del CRM actualizado regularmente

## 🎯 Próximos pasos

Una vez que tengas funcionando la conexión básica:
1. **Personaliza** las columnas según tus necesidades específicas
2. **Agrega más clientes** reales al Google Sheet
3. **Configura filtros** adicionales en la aplicación
4. **Implementa** validaciones de datos
5. **Agrega** campos personalizados según tu negocio
6. **Configura** notificaciones automáticas
7. **Integra** con otras herramientas de tu flujo de trabajo
