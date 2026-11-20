import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTreatmentDto {
  @Type(() => Number)
  @IsInt()
  patientId!: number;

  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

  @IsString()
  startDate!: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tooth?: number;

  @IsOptional()
  @IsString()
  procedure?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicalSessionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  treatmentCatalogId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pathologyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  odontogramId?: number;

  @IsOptional()
  @IsString()
  faces?: string;
}
