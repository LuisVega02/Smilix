/**
 * DTO de Registro - Datos necesarios para crear una nueva cuenta
 * 
 * Este DTO extiende LoginDto (hereda email y password)
 * y agrega campos adicionales para el registro
 */

import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  /**
   * Nombre completo del usuario
   * - Debe ser string
   * - Obligatorio
   * - Mínimo 3 caracteres
   */
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  fullName!: string;
}
