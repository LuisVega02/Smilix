/**
 * Auth Guard Component (src/app/components/ProtectedRoute.tsx)
 *
 * PARA ENTENDER ESTE COMPONENTE:
 * 1. Es un "wrapper" que protege rutas que necesitan autenticación
 * 2. Verifica si el usuario tiene token
 * 3. Si NO tiene token → redirige a login
 * 4. Si tiene token → muestra el componente deseado
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
 * - Fácil de mantener y actualizar
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setIsAuthorized(false);
      setIsCheckingAuth(false);
      router.replace('/login');
      return;
    }

    setIsAuthorized(true);
    setIsCheckingAuth(false);
  }, [router]);

  if (isCheckingAuth) {
    return null;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
