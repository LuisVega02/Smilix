import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ClinicalHistoryModule } from './modules/clinical-history/clinical-history.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  /**
   * IMPORTS: Módulos secundarios del sistema
   * 
   * Al agregar AuthModule aquí:
   * 1. NestJS carga el módulo automáticamente
   * 2. Sus controladore se registran en las rutas
   * 3. Sus servicios están disponibles
   * 
   * CUANDO AGREGAR UN NUEVO MÓDULO:
   * 1. Crear carpeta: backend/src/modules/nuevoModulo/
   * 2. Crear: nuevoModulo.module.ts
   * 3. Importar aquí: imports: [NuevoModulo]
   */
  imports: [PrismaModule, AuthModule, ClinicalHistoryModule],

  /**
   * CONTROLLERS: Controladores globales
   * 
   * AppController es el controlador raíz que responde
   * a GET / y GET /health
   */
  controllers: [AppController],

  /**
   * PROVIDERS: Servicios globales disponibles en toda la app
   * 
   * Si necesitas un servicio compartido por múltiples módulos,
   * decláralo aquí en lugar de en cada módulo
   */
  providers: [],
})
export class AppModule {}
