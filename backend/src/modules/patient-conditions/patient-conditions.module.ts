import { Module } from '@nestjs/common';
import { PatientConditionsController } from './patient-conditions.controller';
import { PatientConditionsService } from './patient-conditions.service';

/**
 * Condiciones médicas / antecedentes del paciente (flujo clínico F4).
 * PrismaService es global (PrismaModule); las rutas quedan protegidas
 * por el JwtAuthGuard global.
 */
@Module({
  controllers: [PatientConditionsController],
  providers: [PatientConditionsService],
})
export class PatientConditionsModule {}
