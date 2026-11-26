import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class QueryPatientAllergyDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  allergyId?: number;
}
