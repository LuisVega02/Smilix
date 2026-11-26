import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePatientConditionDto {
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
  medicalConditionId?: number;

  @IsOptional()
  @IsString()
  tooth?: string | null;

  @IsOptional()
  @IsString()
  face?: string | null;

  @IsOptional()
  @IsString()
  dentition?: string | null;

  @IsOptional()
  @IsBoolean()
  cured?: boolean;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
