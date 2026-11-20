/**
 * Módulo de Autenticación (auth.module.ts)
 *
 * JwtModule se registra de forma global en AppModule, por lo que aquí
 * basta con declarar el controlador y el servicio. AuthService sigue
 * recibiendo JwtService por inyección de dependencias.
 */

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
