import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePrescriptionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicalSessionId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicationId?: number | null;

  @IsOptional()
  @IsString()
  medicationName?: string | null;

  @IsOptional()
  @IsString()
  dose?: string | null;

  @IsOptional()
  @IsString()
  frequency?: string | null;

  @IsOptional()
  @IsString()
  duration?: string | null;

  @IsOptional()
  @IsString()
  instructions?: string | null;
}
