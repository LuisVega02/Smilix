/**
 * Controlador de Autenticación (auth.controller.ts)
 * 
 * ¿QUÉ ES UN CONTROLADOR?
 * - Es la "puerta de entrada" de las peticiones HTTP
 * - Recibe las peticiones, las valida y las pasa al servicio
 * - Devuelve las respuestas al cliente
 * 
 * ENDPOINTS EXPUESTOS:
 * - POST /api/auth/login
 * - POST /api/auth/register
 * - POST /api/auth/verify (verificar token)
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

/**
 * @Controller('auth') crea la ruta base /api/auth
 * (porque en main.ts configuramos setGlobalPrefix('api'))
 */
@Controller('auth')
export class AuthController {
  /**
   * Constructor: Inyectamos el servicio de autenticación
   * Así el controlador accede a los métodos de login, register, etc.
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * ENDPOINT: POST /api/auth/login
   * 
   * Inicia sesión un usuario existente
   * 
   * @Body() loginDto - Los datos que envía el frontend:
   *   {
   *     "email": "admin@clinica.com",
   *     "password": "admin123"
   *   }
   * 
   * @returns
   *   {
   *     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *     "user": {
   *       "id": 1,
   *       "email": "admin@clinica.com",
   *       "fullName": "Administrador",
   *       "role": "admin"
   *     }
   *   }
   * 
   * FLUJO:
   * 1. Frontend envía POST a /api/auth/login con credenciales
   * 2. NestJS valida automáticamente con LoginDto (email, password válidos?)
   * 3. Controlador llama a authService.login()
   * 4. Servicio verifica credenciales y genera JWT
   * 5. Respuesta es 200 OK + token + datos usuario
   * 
   * VALIDACIONES AUTOMÁTICAS (por LoginDto):
   * ✓ Email válido
   * ✓ Password tiene mínimo 6 caracteres
   * ✓ Ambos campos son requeridos
   * 
   * @HttpCode(HttpStatus.OK) = respuesta 200 (no 201)
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    // El servicio se encarga de validar credenciales
    return this.authService.login(loginDto);
  }

  /**
   * ENDPOINT: POST /api/auth/register
   * 
   * Crea un nuevo usuario en el sistema
   * 
   * @Body() registerDto - Los datos que envía el frontend:
   *   {
   *     "email": "nuevousuario@clinica.com",
   *     "password": "miPassword123",
   *     "fullName": "Dr. Carlos López"
   *   }
   * 
   * @returns
   *   {
   *     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *     "user": {...}
   *   }
   * 
   * NOTAS:
   * - El usuario es creado e inmediatamente autenticado (login automático)
   * - Se devuelve un token para no pedir login dos veces
   * - El email debe ser único en el sistema
   * 
   * @HttpCode(HttpStatus.CREATED) = respuesta 201
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    try {
      return this.authService.register(registerDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error en el registro';
      throw new BadRequestException(errorMessage);
    }
  }

  /**
   * ENDPOINT: POST /api/auth/verify
   * 
   * Verifica que un token JWT sea válido
   * Se usa normalmente en el frontend para restaurar la sesión
   * 
   * @Body() body - { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
   * 
   * @returns
   *   {
   *     "valid": true,
   *     "payload": {
   *       "sub": 1,
   *       "email": "admin@clinica.com",
   *       "role": "admin"
   *     }
   *   }
   * 
   * CASOS DE USO:
   * 1. Frontend carga la página → verifica que el token guardado siendo válido
   * 2. Mantener sesión activa sin pedir login nuevamente
   * 3. Refrescar token antes de que expire
   */
  @Post('verify')
  async verify(@Body() body: { token: string }) {
    if (!body.token) {
      throw new BadRequestException('Token requerido');
    }

    try {
      const payload = await this.authService.validateToken(body.token);
      return {
        valid: true,
        payload,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Token inválido';
      return {
        valid: false,
        error: errorMessage,
      };
    }
  }
}
