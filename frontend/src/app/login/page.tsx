/**
 * Página de Login del Frontend (src/app/login/page.tsx)
 * 
 * PARA ENTENDER ESTA PÁGINA:
 * 1. Es un componente React Server Component (por defecto en Next.js 14)
 * 2. El 'use client' la convierte en Client Component (necesario para interactividad)
 * 3. Usa hooks: useState (estado), useRouter (navegación), useTransition (async)
 * 4. Se comunica con el backend vía fetch (se reemplaza por axios después)
 * 
 * FLUJO DEL LOGIN:
 * 1. Usuario ingresa email y contraseña
 * 2. Click en "Ingresar"
 * 3. Frontend valida formulario
 * 4. Frontend envía POST a http://localhost:3001/api/auth/login
 * 5. Backend verifica credenciales con BD
 * 6. Backend devuelve token + datos usuario
 * 7. Frontend guarda token en localStorage
 * 8. Frontend redirige a dashboard
 */

'use client'; // ← Convierte en Client Component (necesario para interactividad)

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/app/utils/api';

export default function LoginPage() {
  // ============================================================
  // ESTADO DEL FORMULARIO
  // ============================================================

  // Estado para el email
  const [email, setEmail] = useState('');

  // Estado para la contraseña
  const [password, setPassword] = useState('');

  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Mensaje de error (si el login falla)
  const [error, setError] = useState('');

  // Indicador de que se está enviando la petición
  const [isLoading, setIsLoading] = useState(false);

  // Hook para navegar entre páginas
  const router = useRouter();

  // ============================================================
  // FUNCIONES
  // ============================================================

  /**
   * handleLogin - Maneja el envío del formulario
   *
   * PASOS:
   * 1. Verificar que email y password no estén vacíos
   * 2. Enviar petición POST al backend con las credenciales
   * 3. Si backend devuelve token:
   *    - Guardar token en localStorage
   *    - Guardar datos del usuario en localStorage
   *    - Redirigir al dashboard
   * 4. Si backend devuelve error:
   *    - Mostrar mensaje de error
   *    - Limpiar el formulario
   */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevenir comportamiento default del formulario (recargar página)
    e.preventDefault();

    // Limpiar errores previos
    setError('');

    // Validación básica en frontend
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    // Indicar que se está procesando
    setIsLoading(true);

    try {
      const data = await apiClient.post<{ access_token: string; user: unknown }>(
        '/api/auth/login',
        {
          email,
          password,
        },
      );

      // PASO 3: Guardar token en localStorage
      // El token se envía en TODAS las peticiones futuras para autenticarse
      localStorage.setItem('access_token', data.access_token);

      // PASO 4: Guardar datos del usuario para acceso rápido
      localStorage.setItem('user', JSON.stringify(data.user));

      // PASO 5: Redirigir al dashboard
      // router.push() envía al usuario a otra página
      router.replace('/dashboard');

      // FEEDBACK: Mostrar mensaje de éxito (opcional)
      console.log('✅ Login exitoso:', data.user);
    } catch (err) {
      // Error de conexión o parsing del JSON
      const errorMessage =
        err instanceof Error ? err.message : 'Error de conexión con el servidor';
      setError(`Error: ${errorMessage}`);
      setPassword('');
    } finally {
      // Siempre se ejecuta, aunque haya error
      setIsLoading(false);
    }
  };

  /**
   * handleRegister - Navega a la página de registro
   */
  const handleRegister = () => {
    router.push('/register');
  };

  // ============================================================
  // RENDERIZADO
  // ============================================================

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#070b14',
        backgroundImage:
          "linear-gradient(160deg, rgba(4, 8, 16, 0.9), rgba(7, 14, 26, 0.82)), radial-gradient(circle at 15% 10%, rgba(45, 212, 191, 0.16), transparent 45%), url('/login-background.jpg')",
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'rgba(15, 22, 38, 0.9)',
          padding: '2rem',
          borderRadius: '20px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(148, 170, 210, 0.16)',
        }}
      >
        {/* ENCABEZADO */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            textAlign: 'center',
            color: 'var(--text-strong)',
          }}
        >
          Clínica Dental
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-soft)',
            marginBottom: '2rem',
            fontSize: '14px',
          }}
        >
          Inicia sesión en tu cuenta
        </p>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div
            style={{
              backgroundColor: 'var(--danger-soft)',
              color: 'var(--danger-text)',
              border: '1px solid rgba(248, 113, 113, 0.32)',
              padding: '0.75rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* CAMPO EMAIL */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: 'var(--text)',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@clinica.com"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid rgba(148, 170, 210, 0.3)',
                borderRadius: '12px',
                backgroundColor: 'rgba(11, 18, 32, 0.72)',
                color: 'var(--text)',
                fontSize: '14px',
                boxSizing: 'border-box',
                opacity: isLoading ? 0.6 : 1,
              }}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '0.25rem' }}>
              Prueba: admin@clinica.com
            </p>
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: 'var(--text)',
              }}
            >
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: '40px',
                  border: '1px solid rgba(148, 170, 210, 0.3)',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(11, 18, 32, 0.72)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  opacity: isLoading ? 0.6 : 1,
                }}
              />
              {/* Botón para mostrar/ocultar contraseña */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: '0.25rem' }}>
              Prueba: admin123
            </p>
          </div>

          {/* BOTÓN DE LOGIN */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '0.75rem',
              background: isLoading
                ? 'rgba(148, 170, 210, 0.24)'
                : 'linear-gradient(145deg, #5eead4, #14b8a6)',
              color: isLoading ? 'var(--text-soft)' : 'var(--on-primary)',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '12px',
              boxShadow: isLoading ? 'none' : '0 12px 28px rgba(20, 184, 166, 0.28)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              transition: 'filter 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.filter = 'brightness(1.07)';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.filter = '';
            }}
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* DIVIDER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.5rem 0',
            gap: '1rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(148, 170, 210, 0.18)' }} />
          <span style={{ color: 'var(--text-soft)', fontSize: '12px' }}>O</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(148, 170, 210, 0.18)' }} />
        </div>

        {/* BOTÓN DE REGISTRO */}
        <button
          onClick={handleRegister}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'rgba(148, 170, 210, 0.1)',
            color: 'var(--text)',
            fontWeight: '500',
            border: '1px solid rgba(148, 170, 210, 0.24)',
            borderRadius: '12px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          Crear nueva cuenta
        </button>

        {/* PIE DE PÁGINA */}
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-soft)',
            marginTop: '1.5rem',
            textAlign: 'center',
            lineHeight: '1.6',
          }}
        >
          Sistema de Gestión para Clínica Dental v2.0 <br />
          Todas tus credenciales están protegidas
        </p>
      </div>
    </div>
  );
}
