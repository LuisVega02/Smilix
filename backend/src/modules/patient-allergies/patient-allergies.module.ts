import { Module } from '@nestjs/common';
import { PatientAllergiesController } from './patient-allergies.controller';
import { PatientAllergiesService } from './patient-allergies.service';

/**
 * Alergias registradas por paciente (flujo clínico F4).
 * PrismaService es global (PrismaModule); las rutas quedan protegidas
 * por el JwtAuthGuard global.
 */
@Module({
  controllers: [PatientAllergiesController],
  providers: [PatientAllergiesService],
})
export class PatientAllergiesModule {}
