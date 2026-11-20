import { Module } from '@nestjs/common';
import { TeethController } from './teeth.controller';
import { TeethService } from './teeth.service';

/**
 * Catálogo de piezas dentales (F5).
 * PrismaService es global (PrismaModule); las rutas quedan protegidas
 * por el JwtAuthGuard global.
 */
@Module({
  controllers: [TeethController],
  providers: [TeethService],
})
export class TeethModule {}
