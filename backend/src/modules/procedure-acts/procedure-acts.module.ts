import { Module } from '@nestjs/common';
import { ProcedureActsController } from './procedure-acts.controller';
import { ProcedureActsService } from './procedure-acts.service';

/**
 * Procedimientos ejecutados sobre un tratamiento (flujo clínico F4).
 * PrismaService es global (PrismaModule); las rutas quedan protegidas
 * por el JwtAuthGuard global.
 */
@Module({
  controllers: [ProcedureActsController],
  providers: [ProcedureActsService],
})
export class ProcedureActsModule {}
