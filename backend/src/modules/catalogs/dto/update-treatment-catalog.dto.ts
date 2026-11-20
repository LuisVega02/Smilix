import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTreatmentCatalogDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  durationMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cie10Id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pathologyId?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
