import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePatientPathologyDto {
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
  pathologyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doctorId?: number | null;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  state?: string | null;
}
