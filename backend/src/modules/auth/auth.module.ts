/**
 * Módulo de Autenticación (auth.module.ts)
 * 
 * ¿QUÉ ES UN MÓDULO EN NESTJS?
 * - Agrupa funcionalidades relacionadas
 * - Encapsula controladores, servicios y proveedores
 * - Facilita el reutilización y mantenimiento
 * 
 * ESTRUCTURA DE UN MÓDULO:
 * 1. imports: Módulos externos que necesita (JwtModule)
 * 2. controllers: Controladores del módulo (AuthController)
 * 3. providers: Servicios y otros proveedores (AuthService)
 * 4. exports: Lo que otros módulos pueden usar de este
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  /**
   * IMPORTS: Módulos externos que necesitamos
   * 
   * JwtModule.register():
   * - secret: Clave secreta para firmar tokens
   * - expiresIn: Tiempo de expiración del token
   * 
   * ⚠️ SEGURIDAD EN PRODUCCIÓN:
   * - NO hardcodear el secret aquí
   * - Usar variables de entorno: process.env.JWT_SECRET
   * - La clave debe ser fuerte y larga
   */
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-change-this',
      signOptions: { expiresIn: '7d' }, // Token válido por 7 días
    }),
  ],

  /**
   * CONTROLLERS: Controladores del módulo
   * 
   * NestJS escanea automáticamente @Get, @Post, etc.
   * y crea las rutas basadas en @Controller('auth')
   */
  controllers: [AuthController],

  /**
   * PROVIDERS: Servicios y otras inyecciones
   * 
   * Son los componentes que se inyectan en controladores
   * y otros servicios usando el constructor
   */
  providers: [AuthService],

  /**
   * EXPORTS: Lo que otros módulos pueden importar
   * 
   * Si otro módulo hace:
   *   imports: [AuthModule]
   * Podrá acceder a los servicios exportados
   * 
   * En este caso, exportamos AuthService para que otros
   * módulos puedan usarlo (ej: para proteger rutas)
   */
  exports: [AuthService],
})
export class AuthModule {}
