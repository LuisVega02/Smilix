import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePatientPathologyDto {
  @Type(() => Number)
  @IsInt()
  patientId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicalSessionId?: number;

  @Type(() => Number)
  @IsInt()
  pathologyId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doctorId?: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  state?: string;
}
