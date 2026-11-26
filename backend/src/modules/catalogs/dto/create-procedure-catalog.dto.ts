import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateProcedureCatalogDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  treatmentCatalogId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sequence?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  labWaitDays?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
