# Guía de llamadas al backend en AlgorithmicsAI

## Forma correcta de hacer llamadas a la API

**Siempre usa el cliente Axios centralizado (`apiClient`) definido en `src/services/api.ts`.**

- El `apiClient` agrega automáticamente el token JWT a la cabecera `Authorization` si existe.
- El `baseURL` se define por la variable de entorno `VITE_API_URL` (por ejemplo, `https://mi-backend.com`).
- **Todas las rutas deben ser absolutas y comenzar con `/api/`** (ejemplo: `/api/users`, `/api/modules`, `/api/classes`).
- El manejo de errores y expiración de sesión está centralizado en los interceptores de `apiClient`.

---

## Patrón para páginas principales (admin)

- Todas las páginas principales (clases, materiales, tareas, usuarios, módulos, etc.) deben permitir a los administradores agregar y editar recursos.
- El botón "Agregar" y los botones "Editar" deben ser visibles **solo para usuarios con rol admin**.
- El flujo de creación/edición debe usar un modal y apiClient con rutas absolutas `/api/...`.

### Ejemplo de lógica de visibilidad en React

```tsx
const { user } = useAuthStore();

{user?.role === 'admin' && (
  <Button onClick={openCreateModal}>Agregar</Button>
)}

// En cada fila:
{user?.role === 'admin' && (
  <Button onClick={() => openEditModal(item)}>Editar</Button>
)}
```

---

## Ejemplo de uso correcto

```ts
import { apiClient } from '../services/api';

// GET (listar)
const res = await apiClient.get('/api/modules');
const modules = res.data;

// POST (crear)
const res = await apiClient.post('/api/modules', { title, description, url });
const newModule = res.data;

// PUT (editar)
const res = await apiClient.put(`/api/modules/${id}`, { title, description, url });
const updated = res.data;

// DELETE (eliminar)
await apiClient.delete(`/api/modules/${id}`);

// Ejemplo para clases
const res = await apiClient.get('/api/classes');
const classes = res.data;

// Ejemplo para materiales
const res = await apiClient.get('/api/materials');
const materials = res.data;
```

> **Nota:** Si tu `VITE_API_URL` ya incluye `/api` (no recomendado), puedes omitir `/api` en las rutas. Por convención, usa siempre rutas absolutas.

---

## Ejemplo de uso incorrecto (NO HACER)

```ts
// ❌ No uses fetch directo, no agrega el token automáticamente
fetch(`${import.meta.env.VITE_API_URL}/api/modules`, { ... })

// ❌ No construyas manualmente la cabecera Authorization
fetch(url, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } })
```

---

## Recomendaciones

- **Siempre revisa este archivo antes de implementar nuevas llamadas a la API o flujos de admin.**
- Usa rutas absolutas (`/api/...`) en TODAS las llamadas.
- Si necesitas agregar nuevos servicios, hazlo en `src/services/api.ts` para mantener la lógica centralizada.
- Si ves errores 401 inesperados, asegúrate de estar usando `apiClient` y que el usuario esté logueado.
- Los botones de agregar/editar deben ser visibles solo para admin.

---

## Resumen
- Usa `apiClient` para TODAS las llamadas al backend.
- No uses `fetch` directo.
- Las rutas deben ser absolutas y comenzar con `/api/`.
- El token JWT y el manejo de errores ya están centralizados.
- El flujo de agregar/editar recursos debe estar protegido y visible solo para admin. 