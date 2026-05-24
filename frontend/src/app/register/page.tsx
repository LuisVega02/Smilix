/**
 * Página de Registro (src/app/register/page.tsx)
 *
 * PARA ENTENDER ESTA PÁGINA:
 * 1. Permite crear una nueva cuenta
 * 2. Similar a login pero con validaciones adicionales
 * 3. Verifica que las contraseñas coincidan
 * 4. Después del registro, autentica automáticamente (igual que backend)
 * 5. Guarda token en localStorage y redirige al dashboard
 *
 * FLUJO:
 * 1. Usuario ingresa nombre, email, contraseña y confirmación
 * 2. Frontend valida que las contraseñas coincidan
 * 3. Post a /api/auth/register con los datos
 * 4. Backend crea usuario y devuelve token
 * 5. Frontend guarda token y redirige
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/app/utils/api';

export default function RegisterPage() {
  // ============================================================
  // ESTADO DEL FORMULARIO
  // ============================================================

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errores y estado
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Router para navegación
  const router = useRouter();

  // ============================================================
  // FUNCIONES
  // ============================================================

  /**
   * handleRegister - Procesa el envío del formulario de registro
   *
   * VALIDACIONES:
   * 1. Todos los campos completados
   * 2. Email tenga formato válido (básico)
   * 3. Contraseña tenga mínimo 6 caracteres
   * 4. Las contraseñas coincidan
   *
   * DESPUÉS:
   * 1. Enviar POST a /api/auth/register
   * 2. Si éxito: guardar token y redirigir
   * 3. Si error: mostrar mensaje
   */
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // VALIDACIÓN 1: Campos completos
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    // VALIDACIÓN 2: Formato de email (básico)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    // VALIDACIÓN 3: Longitud de contraseña
    if (password.length < 6) {
      setError('La contraseña debe tener mínimo 6 caracteres');
      return;
    }

    // VALIDACIÓN 4: Contraseñas coinciden
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiClient.post<{ access_token: string; user: unknown }>(
        '/api/auth/register',
        {
          fullName,
          email,
          password,
        },
      );

      // Guardar token y datos
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirigir al dashboard
      router.replace('/dashboard');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error de conexión';
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * handleBackToLogin - Regresa a la página de login
   */
  const handleBackToLogin = () => {
    router.push('/login');
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
        backgroundColor: '#f5f5f5',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '450px',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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
          Crea tu cuenta
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
        <form
          onSubmit={handleRegister}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {/* NOMBRE COMPLETO */}
          <div>
            <label
              htmlFor="fullName"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#333',
              }}
            >
              Nombre completo
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Juan Pérez"
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
          </div>

          {/* EMAIL */}
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
              placeholder="nuevo@clinica.com"
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
          </div>

          {/* CONTRASEÑA */}
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
              Contraseña (mínimo 6 caracteres)
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
          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <div>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#333',
              }}
            >
              Confirmar contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* BOTÓN REGISTRAR */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '0.75rem',
              backgroundColor: isLoading ? '#ccc' : '#10b981',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
            }}
          >
            {isLoading ? 'Registrando...' : 'Crear cuenta'}
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

        {/* BOTÓN VOLVER AL LOGIN */}
        <button
          onClick={handleBackToLogin}
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
          ¿Ya tienes cuenta? Inicia sesión
        </button>

        {/* PIE */}
        <p
          style={{
            fontSize: '12px',
            color: '#999',
            marginTop: '1rem',
            textAlign: 'center',
          }}
        >
          Al registrarte, aceptas nuestros términos de servicio
        </p>
      </div>
    </div>
  );
}
