import { Module } from '@nestjs/common';
import { OdontogramsController } from './odontograms.controller';
import { OdontogramsService } from './odontograms.service';

/**
 * Odontogramas y sus hallazgos (F5), inspirado en odoo_hms_dental.
 * PrismaService es global (PrismaModule); las rutas quedan protegidas
 * por el JwtAuthGuard global.
 */
@Module({
  controllers: [OdontogramsController],
  providers: [OdontogramsService],
})
export class OdontogramsModule {}
