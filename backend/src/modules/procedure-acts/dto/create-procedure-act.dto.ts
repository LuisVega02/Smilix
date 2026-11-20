import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateProcedureActDto {
  @Type(() => Number)
  @IsInt()
  treatmentId!: number;

  @Type(() => Number)
  @IsInt()
  procedureCatalogId!: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
