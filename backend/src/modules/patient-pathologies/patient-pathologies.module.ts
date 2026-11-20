import { Module } from '@nestjs/common';
import { PatientPathologiesController } from './patient-pathologies.controller';
import { PatientPathologiesService } from './patient-pathologies.service';

/**
 * Patologías diagnosticadas al paciente (flujo clínico F4).
 * PrismaService es global (PrismaModule); las rutas quedan protegidas
 * por el JwtAuthGuard global.
 */
@Module({
  controllers: [PatientPathologiesController],
  providers: [PatientPathologiesService],
})
export class PatientPathologiesModule {}
