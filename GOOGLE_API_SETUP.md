# 🔑 Configuración de API Key para Google Sheets

## ⚠️ Importante: Necesitas una API Key, no Client ID/Secret

Los datos que proporcionaste son **Client ID** y **Client Secret**, pero para la API de Google Sheets necesitamos una **API Key**.

## 🚀 Pasos para obtener la API Key correcta:

### 1. Ve a Google Cloud Console
1. Abre [console.cloud.google.com](https://console.cloud.google.com)
2. Selecciona tu proyecto (o crea uno nuevo)

### 2. Habilita la API de Google Sheets
1. En el menú lateral, ve a "APIs y servicios" → "Biblioteca"
2. Busca "Google Sheets API"
3. Haz clic en "Google Sheets API"
4. Haz clic en "Habilitar"

### 3. Crea la API Key
1. Ve a "APIs y servicios" → "Credenciales"
2. Haz clic en "Crear credenciales" → "Clave de API"
3. Copia la API Key generada (será algo como `AIzaSyC...`)

### 4. Configura restricciones (opcional pero recomendado)
1. Haz clic en la API Key que acabas de crear
2. En "Restricciones de aplicación", selecciona "Sitios web"
3. Agrega `localhost:5173` y tu dominio de producción
4. En "Restricciones de API", selecciona "Google Sheets API"

## 📝 Configuración del archivo .env

Una vez que tengas la API Key, crea o actualiza tu archivo `.env` en la raíz del proyecto:

```env
# Google Sheets API
VITE_GOOGLE_API_KEY=AIzaSyCtu_api_key_aqui

# Backend API
VITE_API_URL=http://localhost:4000

# Base de datos
DATABASE_URL="postgresql://neondb_owner:npg_CJU9pI3awQBK@ep-lucky-boat-adhc1kfi-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# JWT Secret
JWT_SECRET="colorland_jwt_secret_key_2024_super_secure"
```

## 🔍 Verificar que funciona

1. Reinicia tu servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Ve a la página de Cotizaciones
3. Deberías ver un indicador verde "Conectado a Google Sheets"
4. Los datos de tu Google Sheet deberían aparecer

## 🚨 Si ves "API Key no configurada"

1. Verifica que el archivo `.env` esté en la raíz del proyecto
2. Asegúrate de que la variable se llame exactamente `VITE_GOOGLE_API_KEY`
3. Reinicia el servidor después de crear/modificar `.env`
4. Verifica que no haya espacios extra en el archivo `.env`

## 📊 Estructura esperada de tu Google Sheet

Tu Google Sheet debe tener esta estructura en la primera fila:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| **Cliente** | **Proyecto** | **Monto** | **Estado** | **Fecha Creación** | **Válida Hasta** |

## 🔧 Datos de tu Google Sheet actual

- **ID**: `1OkUGLzVwwafRQmdIwqE0KRWLdXS8EyWrdKkAaBWijCI`
- **URL**: https://docs.google.com/spreadsheets/d/1OkUGLzVwwafRQmdIwqE0KRWLdXS8EyWrdKkAaBWijCI/edit

## 💡 Tips adicionales

- La API Key es pública y segura de usar en el frontend
- No necesitas el Client ID/Secret para esta implementación
- La API Key tiene límites de uso, pero son generosos para uso normal
- Puedes monitorear el uso en Google Cloud Console
