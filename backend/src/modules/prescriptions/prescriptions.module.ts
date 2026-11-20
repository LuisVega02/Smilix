import { Module } from '@nestjs/common';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';

/**
 * Prescripciones / recetas médicas del paciente (flujo clínico F4).
 * PrismaService es global (PrismaModule); las rutas quedan protegidas
 * por el JwtAuthGuard global.
 */
@Module({
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
})
export class PrescriptionsModule {}
