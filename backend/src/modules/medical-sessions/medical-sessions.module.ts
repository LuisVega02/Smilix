import { Module } from '@nestjs/common';
import { MedicalSessionsController } from './medical-sessions.controller';
import { MedicalSessionsService } from './medical-sessions.service';

@Module({
  controllers: [MedicalSessionsController],
  providers: [MedicalSessionsService],
})
export class MedicalSessionsModule {}
