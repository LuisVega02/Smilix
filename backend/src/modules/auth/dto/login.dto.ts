/**
 * DTO de Login - Define la estructura de datos que espera el endpoint de login
 * 
 * ¿Qué es un DTO?
 * - Un Data Transfer Object es una clase que define qué datos se esperan recibir
 * - Se usa para validar y documentar las peticiones HTTP
 * - Las validaciones (IsEmail, IsString, etc.) se ejecutan automáticamente
 * 
 * @example
 * POST /api/auth/login
 * {
 *   "email": "usuario@example.com",
 *   "password": "miContraseña123"
 * }
 */

import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  /**
   * Email del usuario
   * - Debe ser un email válido (@ y dominio)
   * - Obligatorio
   * - Ejemplo: doctor@clinica.com
   */
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  /**
   * Contraseña del usuario
   * - Debe ser string
   * - Mínimo 6 caracteres
   * - Obligatorio
   * - Nota: En producción usar mínimo 8-12 caracteres
   */
  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}
