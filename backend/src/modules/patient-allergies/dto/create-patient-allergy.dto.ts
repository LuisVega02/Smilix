import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePatientAllergyDto {
  @Type(() => Number)
  @IsInt()
  patientId!: number;

  @Type(() => Number)
  @IsInt()
  allergyId!: number;

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
