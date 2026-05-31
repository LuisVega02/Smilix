import { Module } from '@nestjs/common';
import { ClinicalHistoryController } from './clinical-history.controller';
import { ClinicalHistoryService } from './clinical-history.service';

@Module({
  controllers: [ClinicalHistoryController],
  providers: [ClinicalHistoryService],
})
export class ClinicalHistoryModule {}