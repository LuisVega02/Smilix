import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSaleOrderLineDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pathologyId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  treatmentCatalogId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  treatmentId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  medicalSessionId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  odontogramId?: number | null;

  @IsOptional()
  @IsString()
  tooth?: string;

  @IsOptional()
  @IsString()
  faces?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  unitPrice?: number;
}
