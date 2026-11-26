import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateProcedureActDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  treatmentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  procedureCatalogId?: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  status?: string | null;
}
