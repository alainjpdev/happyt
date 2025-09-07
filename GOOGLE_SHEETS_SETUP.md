# 🚀 Configuración Rápida de Google Sheets para ColorLand

## ⚡ Pasos para conectar tu Google Sheet real:

### 1️⃣ Crear el Google Sheet
1. Ve a [sheets.google.com](https://sheets.google.com)
2. Crea una nueva hoja
3. **IMPORTANTE**: Nombra la primera hoja como `Cotizaciones` (o el nombre que prefieras)

### 2️⃣ Configurar las columnas
En la **primera fila** (A1:F1), escribe estos encabezados:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| **Cliente** | **Proyecto** | **Monto** | **Estado** | **Fecha Creación** | **Válida Hasta** |

### 3️⃣ Agregar datos de ejemplo
En las filas siguientes, agrega algunos datos de prueba:

| Cliente | Proyecto | Monto | Estado | Fecha Creación | Válida Hasta |
|---------|----------|-------|--------|----------------|--------------|
| Constructora ABC | Edificio Residencial | $45,000 | Pendiente | 2024-01-15 | 2024-02-15 |
| Desarrolladora XYZ | Centro Comercial | $125,000 | Aprobada | 2024-01-10 | 2024-02-10 |
| Arquitectura Moderna | Villa de Lujo | $78,000 | Rechazada | 2024-01-08 | 2024-02-08 |

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
2. Agrega esta línea:
   ```env
   VITE_GOOGLE_API_KEY=tu_api_key_aqui
   ```
3. En `src/pages/dashboard/Quotations.tsx`, cambia estas líneas:
   ```typescript
   const GOOGLE_SHEET_ID = 'TU_ID_REAL_AQUI';
   const GOOGLE_SHEET_NAME = 'Cotizaciones'; // O el nombre de tu hoja
   ```

### 7️⃣ Probar la conexión
1. Reinicia tu servidor de desarrollo (`npm run dev`)
2. Ve a la página de Cotizaciones
3. Deberías ver un indicador verde "Conectado a Google Sheets"
4. Los datos de tu Google Sheet deberían aparecer en la tabla

## 🔧 Estructura flexible del Google Sheet

### ✅ Nombres de columnas que funcionan automáticamente:

**Para Cliente:**
- `Cliente`
- `Nombre Cliente`
- `Empresa`
- `Cliente`

**Para Proyecto:**
- `Proyecto`
- `Nombre Proyecto`
- `Descripción`
- `Obra`

**Para Monto:**
- `Monto`
- `Valor`
- `Precio`
- `Cotización`
- `Total`

**Para Estado:**
- `Estado`
- `Situación`
- `Status`
- `Condición`

**Para Fechas:**
- `Fecha Creación`
- `Fecha`
- `Creado`
- `Válida Hasta`
- `Expiración`
- `Vence`

## 🚨 Solución de problemas comunes

### ❌ "API Key no configurada"
- Verifica que el archivo `.env` esté en la raíz del proyecto
- Asegúrate de que la variable se llame exactamente `VITE_GOOGLE_API_KEY`
- Reinicia el servidor después de crear/modificar `.env`

### ❌ "Error al obtener datos del Google Sheet"
- Verifica que la API de Google Sheets esté habilitada
- Confirma que el ID del Google Sheet sea correcto
- Asegúrate de que el nombre de la hoja coincida exactamente

### ❌ "No se encontraron cotizaciones"
- Verifica que los encabezados estén en la **primera fila**
- Confirma que no haya filas vacías antes de los datos
- Asegúrate de que al menos una fila tenga datos

### ❌ Datos no se muestran correctamente
- Abre la consola del navegador (F12)
- Busca los logs que muestran "Headers encontrados" y "Cotizaciones mapeadas"
- Verifica que los nombres de las columnas coincidan

## 📱 Ejemplo de Google Sheet completo

[Ver ejemplo en Google Sheets](https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing)

## 🎯 Próximos pasos

Una vez que tengas funcionando la conexión básica:
1. **Personaliza** las columnas según tus necesidades
2. **Agrega más datos** de cotizaciones reales
3. **Configura filtros** adicionales
4. **Implementa** edición directa desde la app
5. **Agrega** validaciones y formatos

## 💡 Tips adicionales

- **Mantén** los encabezados en la primera fila
- **Usa** nombres de columnas descriptivos
- **Evita** espacios extra o caracteres especiales
- **Formatea** las fechas de manera consistente
- **Usa** el mismo formato de moneda en toda la columna
