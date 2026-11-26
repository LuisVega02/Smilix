import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePatientConditionDto {
  @Type(() => Number)
  @IsInt()
  patientId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicalSessionId?: number;

  @Type(() => Number)
  @IsInt()
  medicalConditionId!: number;

  @IsOptional()
  @IsString()
  tooth?: string;

  @IsOptional()
  @IsString()
  face?: string;

  @IsOptional()
  @IsString()
  dentition?: string;

  @IsOptional()
  @IsBoolean()
  cured?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
