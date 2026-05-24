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
        backgroundColor: '#415dc7',
        backgroundImage:
          "linear-gradient(135deg, rgba(18, 44, 122, 0.72), rgba(65, 93, 199, 0.48)), url('/login-background.jpg')",
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
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          padding: '2rem',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.24)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* ENCABEZADO */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}
        >
          Clínica Dental
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: '#666',
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
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '0.75rem',
              borderRadius: '4px',
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
                color: '#333',
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
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
                opacity: isLoading ? 0.6 : 1,
              }}
            />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '0.25rem' }}>
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
                color: '#333',
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
                  border: '1px solid #ddd',
                  borderRadius: '4px',
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
            <p style={{ fontSize: '12px', color: '#999', marginTop: '0.25rem' }}>
              Prueba: admin123
            </p>
          </div>

          {/* BOTÓN DE LOGIN */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '0.75rem',
              backgroundColor: isLoading ? '#ccc' : '#2563eb',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#2563eb';
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
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }} />
          <span style={{ color: '#999', fontSize: '12px' }}>O</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }} />
        </div>

        {/* BOTÓN DE REGISTRO */}
        <button
          onClick={handleRegister}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#f3f4f6',
            color: '#333',
            fontWeight: '500',
            border: '1px solid #ddd',
            borderRadius: '4px',
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
            color: '#999',
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
