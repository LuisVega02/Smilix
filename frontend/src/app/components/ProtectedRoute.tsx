/**
 * Auth Guard Component (src/app/components/ProtectedRoute.tsx)
 *
 * PARA ENTENDER ESTE COMPONENTE:
 * 1. Es un "wrapper" que protege rutas que necesitan autenticación
 * 2. Al montar, valida el token guardado contra el backend
 *    (POST /api/auth/verify, endpoint público que no exige Bearer token)
 * 3. Si NO hay token o el backend lo rechaza → limpia la sesión y redirige a login
 * 4. Si el token es válido → muestra el componente deseado
 * 5. Mientras se valida muestra un estado de carga
 *
 * CÓMO USAR:
 * // En cualquier página que necesite protección:
 * import ProtectedRoute from '@/app/components/ProtectedRoute';
 *
 * export default function MyPage() {
 *   return (
 *     <ProtectedRoute>
 *       <h1>Contenido protegido</h1>
 *     </ProtectedRoute>
 *   );
 * }
 *
 * VENTAJAS:
 * - No necesitas repetir lógica en cada página
 * - Garantiza que solo usuarios autenticados vean cierto contenido
 * - La validación real la hace el backend, no solo la presencia del token
 * - Fácil de mantener y actualizar
 */

'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/app/utils/api';

interface ProtectedRouteProps {
  children: ReactNode;
}

interface VerifyTokenResponse {
  valid: boolean;
  payload?: unknown;
  error?: string;
}

function clearStoredSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  // 'checking' | 'authorized' | 'unauthorized'
  const [status, setStatus] = useState<'checking' | 'authorized' | 'unauthorized'>('checking');
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    const redirectToLogin = () => {
      // Evita redirecciones repetidas (incluye re-ejecuciones de efectos).
      if (isRedirectingRef.current) return;
      isRedirectingRef.current = true;
      router.replace('/login');
    };

    const denyAccess = () => {
      if (isCancelled) return;
      clearStoredSession();
      setStatus('unauthorized');
      redirectToLogin();
    };

    const verifySession = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        denyAccess();
        return;
      }

      try {
        // /api/auth/verify es público: funciona aunque no haya header Authorization.
        const result = await apiClient.post<VerifyTokenResponse>('/api/auth/verify', { token });

        if (isCancelled) return;

        if (!result || result.valid !== true) {
          denyAccess();
          return;
        }

        setStatus('authorized');
      } catch {
        // Error de red, token inválido o cualquier fallo del backend: no autorizar.
        denyAccess();
      }
    };

    void verifySession();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  if (status === 'checking') {
    return (
      <div
        className="app-shell"
        style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}
      >
        <p role="status">Verificando sesión...</p>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return null;
  }

  return <>{children}</>;
}
