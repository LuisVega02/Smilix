/**
 * API Client Utils (src/app/utils/api.ts)
 *
 * PARA ENTENDER ESTE ARCHIVO:
 * 1. Centraliza TODAS las llamadas al backend
 * 2. Automáticamente adiciona el token JWT a cada petición
 * 3. Maneja errores de forma consistente
 * 4. Facilita cambiar la URL del API en un solo lugar
 *
 * VENTAJAS:
 * - No repetimos código de fetch en cada componente
 * - Si cambia la URL del backend, actualizamos aquí
 * - Si cambia la forma de autenticarse, actualizamos aquí
 * - Código más limpio y mantenible
 *
 * CÓMO USAR:
 * const data = await apiClient.post('/auth/login', { email, password });
 * const users = await apiClient.get('/users');
 * const updated = await apiClient.put('/users/1', { name: 'New Name' });
 */

// URL base del API (se inyecta en build-time vía NEXT_PUBLIC_API_URL)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================================
// TIPOS
// ============================================================

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

/**
 * Obtener el token JWT del localStorage
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

/**
 * Preparar headers con autenticación
 */
function getHeaders(options?: ApiOptions): Record<string, string> {
  const headers: Record<string, string> = {
    ...options?.headers,
  };

  if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Si existe token, agregarlo a los headers
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Si el backend respondió 401, la sesión ya no es válida:
 * limpia las credenciales guardadas y manda al login (solo en cliente).
 */
function handleUnauthorized(response: Response): void {
  if (response.status !== 401) return;
  if (typeof window === 'undefined') return;

  localStorage.removeItem('access_token');
  localStorage.removeItem('user');

  // Evita recargar en bucle si ya estamos en el login (p. ej. credenciales incorrectas).
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
}

/**
 * Manejar errores de forma consistente
 */
function handleError(error: any): never {
  if (error instanceof Error) {
    throw new Error(error.message);
  }
  throw new Error('Error desconocido en la petición');
}

// ============================================================
// API CLIENT - MÉTODOS PRINCIPALES
// ============================================================

/**
 * Realizar petición GET
 */
async function get<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    handleUnauthorized(response);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en GET');
    }

    return data;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Realizar petición POST
 */
async function post<T>(endpoint: string, body: any): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    handleUnauthorized(response);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en POST');
    }

    return data;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Realizar petición PUT (actualizar recurso completo)
 */
async function put<T>(endpoint: string, body: any): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    handleUnauthorized(response);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en PUT');
    }

    return data;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Realizar petición PATCH (actualizar recurso parcial)
 */
async function patch<T>(endpoint: string, body: any): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    handleUnauthorized(response);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en PATCH');
    }

    return data;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Realizar petición DELETE
 */
async function del<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    handleUnauthorized(response);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en DELETE');
    }

    return data;
  } catch (error) {
    handleError(error);
  }
}

async function postFormData<T>(endpoint: string, body: FormData): Promise<T> {
  try {
    const headers = getHeaders();
    delete headers['Content-Type'];

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body,
    });

    handleUnauthorized(response);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en POST multipart');
    }

    return data;
  } catch (error) {
    handleError(error);
  }
}

function resolveAssetUrl(path: string): string {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

// ============================================================
// EXPORTAR CLIENTE API
// ============================================================

export const apiClient = {
  get,
  post,
  postFormData,
  put,
  patch,
  delete: del,
  resolveAssetUrl,
};

export default apiClient;
