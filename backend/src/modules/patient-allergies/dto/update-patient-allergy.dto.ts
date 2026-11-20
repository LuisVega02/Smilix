import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePatientAllergyDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  allergyId?: number;

  @IsOptional()
  @IsString()
  severity?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
