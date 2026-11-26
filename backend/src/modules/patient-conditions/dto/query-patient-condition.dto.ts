import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class QueryPatientConditionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicalSessionId?: number;
}
